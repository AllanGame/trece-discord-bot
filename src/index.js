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
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guildId;
    const guildData = guildsData.get(guildId);

    if(!channel.isText()) {
      await interaction.reply('Counting can only be set in text channels!')
      return;
    }

    guildsData.set(guildId, {
      channel: channel.id,
      counting: guildData?.counting ?? 0
    })

    await interaction.reply(`Now you can count in ${channel.toString()}`);
  }

  if(interaction.commandName === 'supported') {
    await interaction.reply(
      `
        \`\`\`
        +       Addition Operator eg. 2+3 results 5
        -       Subtraction Operator eg. 2-3 results -1
        /       Division operator eg 3/2 results 1.5 
        \\       Multiplication Operator eg. 23 results 6
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
    if(!result || Math.floor(result) !== expectedNumber) {
      await message.react('❌')
      await message.reply(`La cagaste mi pana, el número era \`${expectedNumber}\`. La cuenta se reinicia a 0.`)
      updateGuildCount(guildId, 0);
      return;
    }

    await message.react('✅')
    updateGuildCount(guildId, Math.floor(result));
  }
})

function updateGuildCount(guild, newValue) {
  const oldValues = guildsData.get(guild);
  guildsData.set(guild, {
    channel: oldValues.channel,
    counting: newValue
  });
}

client.login(TOKEN);
