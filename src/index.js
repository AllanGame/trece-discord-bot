import { Client, Intents } from 'discord.js'
import express from 'express'
import fs from "fs";
import path from "path";
import { TOKEN } from './constants.js';
import {saveData} from "./data.manager.js";
import commands from './command.manager.js';
import {processCountingChannelMessage} from "./message.manager.js";

const __dirname = path.resolve(path.dirname(''));
const SAVE_DATA_INTERVAL = 5 * 60 * 1000; // 5 minutes

const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

let guildsData = new Map();

client.once('ready', () => {
  console.log('[INFO] Getting data from data.json');

  try {
    fs.readFile(path.join(__dirname,"./data.json"), 'utf-8', (error, data) => {
      if(error) {
        throw error;
      }

      const entries = Object.entries(JSON.parse(data));
      console.log(`[INFO] Recovered ${entries.length} guilds from data.json`)

      guildsData = new Map(entries);
    })
  } catch (error) {
    console.error(
      '[ERROR] Something went wrong trying to get data from data.json. Check if the file exists, for now the map will be empty.'
    )
  }

  setInterval(() => saveData(guildsData), SAVE_DATA_INTERVAL)
  console.log('[INFO] Bot is ready.');
});

client.on('interactionCreate', async (interaction) => {
  if(!interaction.isCommand()) {
    return;
  }

  const executor = commands.get(interaction.commandName);

  if(!executor) {
    interaction.reply('Unknown command');
    return;
  }

  try {
    await executor(interaction, guildsData);
  } catch (error) {
    console.error(error);
    interaction.reply('Something went wrong while executing the command.');
  }
})

client.on('messageCreate', async (message) => {
  if(!message.author || message.author.bot || message.webhookId) {
    return;
  }

  const guildId = message.guildId;
  const guildData = guildsData.get(guildId);

  if(!guildData) {
    return;
  }

  try {
    (guildData.channel && message.channel.id === guildData.channel) &&
    await processCountingChannelMessage({
      message,
      guildData,
      guildsData,
      guildId
    })
  } catch (error) {
    message.reply('Something went wrong while processing the message. current number (maybe): ' + guildData.counting++);
  }
})

const isProduction = process.argv.splice(2).includes('-p');
// Necessary for Replit
if(isProduction) {
  const app = express();

  app.get('/', (_, res) => {
    res.send('Mamauebo')
  });

  app.listen(3000, () => {
    console.log('server started');
  });
}

client.login(TOKEN).then();
