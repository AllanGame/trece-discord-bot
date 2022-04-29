import { Client, Intents } from 'discord.js' 
import { TOKEN } from './constants.js';

const client = new Client({ 
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
 });

const guildsData = new Map();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if(!interaction.isCommand()) {
		return;
	}

	if (interaction.commandName === 'set') {
		const channel = interaction.options.getChannel('channel');
		const guildId = interaction.guildId;
		if(!channel.isText()) {
			await interaction.reply('Counting can only be set in text channels!')
			return;
		}

		const guildData = guildsData.get(guildId);
		
		guildsData.set(guildId, {
			channel: channel.id,
			counting: guildData?.counting ?? 0
		})

		await interaction.reply(`Now you can count in ${channel.toString()}`);
	} else {
		await interaction.reply('mi bro como sucedió esto')
	}
})

client.on('messageCreate', (message) => {
	if(!message.author || message.author.bot || message.webhookId) {
		return;
	}

	const guildId = message.guildId;
	const guildData = guildsData.get(guildId);

	if(!guildData) {
		return;
	}

	if(guildData.channel && message.channel.id === guildData.channel) {
		console.log(message.content);
	}
})

client.login(TOKEN);