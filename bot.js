import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

dotenv.config()



// Configuration
const DISCORD_TOKEN = process.env.BOT_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const YOUR_USER_ID = process.env.DISCORD_USER_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Optional: Only trigger for your messages
  if (message.author.id !== YOUR_USER_ID) return;

  // Prepare payload for n8n
  const payload = {
    content: message.content,
    author: {
      id: message.author.id,
      username: message.author.username,
      tag: message.author.tag,
    },
    channel: {
      id: message.channel.id,
      name: message.channel.name,
    },
    guild: message.guild ? {
      id: message.guild.id,
      name: message.guild.name,
    } : null,
    timestamp: message.createdAt,
    messageId: message.id,
  };

  // Send to n8n webhook
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Message forwarded: "${message.content.substring(0, 50)}..."`);
    } else {
      console.error('Failed to forward message:', response.statusText);
    }
  } catch (error) {
    console.error('Error forwarding to n8n:', error);
  }
});

client.login(DISCORD_TOKEN);
