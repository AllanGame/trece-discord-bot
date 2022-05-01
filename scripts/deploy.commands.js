import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { APPLICATION_ID, DEVELOPMENT_GUILD_ID, TOKEN } from '../src/constants.js';

const isProduction = process.argv.splice(2).includes('-p');

const commands = [
  new SlashCommandBuilder()
    .setName('set')
    .setDescription('Set the count on a specific channel')
    .addChannelOption(option => option
      .setName('channel')
      .setDescription('the new counting channel')
      .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('supported')
    .setDescription('List of supported operations'),
  new SlashCommandBuilder()
    .setName('soft')
    .setDescription('Set the count in soft mode')
    .addBooleanOption(option => option
      .setName('set-soft')
      .setDescription('whether to set the count in soft mode or not')
      .setRequired(true)
    ),
]
  .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async() => {
  if(isProduction) {
    await rest.put(
      Routes.applicationCommands(APPLICATION_ID),
      { body: commands }
    );
  } else {
    await rest.put(
      Routes.applicationGuildCommands(APPLICATION_ID, DEVELOPMENT_GUILD_ID),
      { body: commands }
    )
  }
})()
