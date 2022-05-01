import { Client, Intents } from 'discord.js'
import { TOKEN } from './constants.js';
import parse from './parser.js';
import {saveData} from "./data.manager.js";
import fs from "fs";
import path from "path";
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

  if (interaction.commandName === 'set') {
    if(!interaction.member.permissions.has('ADMINISTRATOR')) {
      interaction.reply('No tienes permisos para usar este comando.');
      return;
    }

    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guildId;
    const guildData = guildsData.get(guildId);

    if(!channel.isText()) {
      await interaction.reply('El conteo solo puede ser configurado en un canal de texto.');
      return;
    }

    guildsData.set(guildId, {
      channel: channel.id,
      counting: guildData?.counting ?? 0,
      lastUserId: guildData?.lastUserId ?? null,
      streak: guildData?.streak ?? 0,
      soft: false
    })

    await interaction.reply(`Ahora puedes contar en ${channel.toString()}`);
  }

  if(interaction.commandName === 'supported') {
    await interaction.reply(
      `
        \`\`\`
        +       Operador de suma ej. 2+3 resulta en 5
        -       Operador de resta ej. 2-3 resulta en -1
        /       Operador de divisón ej 3/2 resulta en 1.5 
        \\       Operador de multiplicación ej. 23 resulta en 6
        Mod     Modulus Operator eg. 3 Mod 2 results 1
        (       Opening Parenthesis
        )       Closing Parenthesis
        Sigma   Summation eg. Sigma(1,100,n) results 5050
        Pi      Product eg. Pi(1,10,n) results 3628800
        n       Variable for Summation or Product
        pi      Math constant pi returns 3.14
        e       Math constant e returns 2.71
        C       Combination operator eg. 4C2 returns 6
        P       Permutation operator eg. 4P2 returns 12
        !       factorial operator eg. 4! returns 24
        log     logarithmic function with base 10 eg. log 1000 returns 3
        ln      natural log function with base e eg. ln 2 returns .3010 
        pow     power function with two operator pow(2,3) returns 8
        ^       power operator eg. 2^3 returns 8
        root    underroot function root 4 returns 2  
        \`\`\`
      `
    )
  }

  if(interaction.commandName === 'soft') {
    if(!interaction.member.permissions.has('ADMINISTRATOR')) {
      interaction.reply('No tienes permisos para usar este comando.');
      return;
    }

    const isSoft = interaction.options.getBoolean('set-soft');
    const guildId = interaction.guildId;
    const guildData = guildsData.get(guildId);

    guildsData.set(guildId, {
      ...guildData,
      soft: isSoft
    })

    await interaction.reply(`Ahora el conteo está en dificultad ${
      isSoft ?
        'soft. Lo que significa que si alguien falla en el conteo, el conteo no se reinicia y solo se ignora.'
        :
        'normal. Lo que significa que si alguien falla en el conteo, el conteo se reinicia.'}
      `);
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

    updateGuildStreak(guildId, result)
    updateGuildCount(guildId, Math.floor(result));
    updateGuildLastUserId(guildId, message.author.id);
  }
})

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

client.login(TOKEN);
