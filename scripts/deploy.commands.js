import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { ChannelType } from 'discord-api-types/payloads/v9/channel';
import { Routes } from 'discord-api-types/v9';
import { APPLICATION_ID, DEVELOPMENT_GUILD_ID, TOKEN } from '../src/constants.js';

const commands = [
	new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start the count on a specific channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('the counting channel')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)),
    
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(TOKEN);

rest.put(Routes.applicationGuildCommands(APPLICATION_ID, DEVELOPMENT_GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);