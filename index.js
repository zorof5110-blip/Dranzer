
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* ===== READY ===== */
client.once("ready", () => {
  console.log(`🟢 Bot online as ${client.user.tag}`);
});

/* ===== MESSAGE HANDLER ===== */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "ping") {
    await message.reply("pong 🟢");
  }
});

/* ===== ERROR SAFETY (IMPORTANT FOR 24/7) ===== */
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

/* ===== LOGIN ===== */
client.login(process.env.TOKEN);
