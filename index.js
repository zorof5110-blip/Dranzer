const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType
} = require("discord.js");
require("dotenv").config();

const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  entersState,
  VoiceConnectionStatus
} = require("@discordjs/voice");

const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("ffmpeg-static");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const prefix = "?";
let connection;
let player;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ?ping
  if (command === "ping") {
    return message.reply("Pong 🟢");
  }

  // ?join (24/7 stay)
  if (command === "join") {
    if (!message.member.voice.channel)
      return message.reply("Join a voice channel first!");

    connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    message.reply("Joined and staying 24/7 🔊");

    connection.on("stateChange", async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        try {
          await entersState(connection, VoiceConnectionStatus.Connecting, 5000);
        } catch {
          connection.destroy();
        }
      }
    });
  }

  // ?play <youtube link>
  if (command === "play") {
    if (!message.member.voice.channel)
      return message.reply("Join a voice channel first!");

    if (!args[0]) return message.reply("Provide a YouTube link!");

    if (!connection) {
      connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });
    }

    player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
      }
    });

    const stream = ytdl(args[0], {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25
    });

    const resource = createAudioResource(stream);

    connection.subscribe(player);
    player.play(resource);

    message.reply("Playing music 🎵");
  }

  // ?leave
  if (command === "leave") {
    if (connection) {
      connection.destroy();
      connection = null;
      message.reply("Left voice channel ❌");
    }
  }
});

client.login(process.env.TOKEN);
