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
        )
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async() => {
    if(isProduction) {
        await rest.put(
            Routes.applicationCommand(APPLICATION_ID),
            { body: commands }
        );
    } else {
        await rest.put(
            Routes.applicationGuildCommands(APPLICATION_ID, DEVELOPMENT_GUILD_ID),
            { body: commands }
        )
    }
})()
