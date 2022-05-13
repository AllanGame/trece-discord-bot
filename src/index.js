import { Client, Intents } from 'discord.js'
import express from 'express'
import fs from "fs";
import path from "path";

import { TOKEN } from './constants.js';
import parse from './parser.js';
import {saveData} from "./data.manager.js";
import commands from './command.manager.js';

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

  if(guildData.channel && message.channel.id === guildData.channel) {
    const input = message.content;
    const result = parse(input);
    const expectedNumber = guildData.counting + 1;
    const streak = guildData.streak;
    const isSoftCounting = guildData.soft;

    if(message.author.id === guildData.lastUserId) {
      if(isSoftCounting) {
        await message.react('961492648902938654');
        return;
      }

      await message.react('🤔')
      await message.reply(`No puedes contar dos veces el mismo número. La cuenta se reinicia a 0.`)
      updateGuildCount(guildId, 0);
      updateGuildLastUserId(guildId, null);
      return;
    }

    if(!result || Math.floor(result) !== expectedNumber) {
      if(isSoftCounting) {
        await message.react('961492648902938654');
        return;
      }

      await message.react(isSoftCounting ? '961492648902938654' : '❌');
      await message.reply(`¡El número era ${expectedNumber}! La cuenta se reinicia a 0.`)
      updateGuildCount(guildId, 0);
      updateGuildLastUserId(guildId, null);
      return;
    }

    await message.react(result > streak ? '☑' : '✅');

    result > streak && updateGuildStreak(guildId, result)
    updateGuildCount(guildId, Math.floor(result));
    updateGuildLastUserId(guildId, message.author.id);
  }
})


// this is the fucking same function 3 times wtf
function updateGuildCount(guild, newValue) {
  const oldValues = guildsData.get(guild);
  guildsData.set(guild, {
    ...oldValues,
    counting: newValue
  });
}

function updateGuildStreak(guild, newValue) {
  const oldValues = guildsData.get(guild);
  guildsData.set(guild, {
    ...oldValues,
    streak: newValue
  });
}

function updateGuildLastUserId(guild, newValue) {
  const oldValues = guildsData.get(guild);
  guildsData.set(guild, {
    ...oldValues,
    lastUserId: newValue
  });
}

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
