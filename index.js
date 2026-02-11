const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ===== SLASH COMMANDS =====
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong 🟢"),

  new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join your voice channel"),

  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music in voice channel")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🔁 Registering slash commands...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered");
  } catch (err) {
    console.error(err);
  }
})();

let connection;
let player;

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // ===== PING =====
  if (interaction.commandName === "ping") {
    return interaction.reply("pong 🟢");
  }

  // ===== JOIN =====
  if (interaction.commandName === "join") {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply({
        content: "❌ Join a voice channel first",
        ephemeral: true
      });
    }

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    return interaction.reply("🔊 Joined voice channel");
  }

  // ===== PLAY =====
  if (interaction.commandName === "play") {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply({
        content: "❌ Join a voice channel first",
        ephemeral: true
      });
    }

    // join if not already connected
    if (!connection) {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
    }

    player = createAudioPlayer();
    const resource = createAudioResource("./sound.mp3");

    connection.subscribe(player);
    player.play(resource);

    interaction.reply("🎵 Playing music!");
  }
});

client.login(process.env.TOKEN);

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered");
  } catch (err) {
    console.error(err);
  }
})();
Routes.applicationCoconsol
