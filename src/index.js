import { Client, Intents } from 'discord.js' 
import { TOKEN } from './constants.js';
import parse from './parser.js';
import path from 'path';
import fs from 'fs';

const FIVE_MINUTES = 1000 * 60 * 5;
const __dirname = path.resolve(path.dirname(''));

const client = new Client({ 
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
 });

let guildsData = new Map();

function saveData() {
	const data = JSON.stringify(Object.fromEntries(guildsData));
	fs.writeFileSync(path.join(__dirname, "./data.json"), data, (error) => {
		if(error) {
			throw error;
		}
	})
	console.log('[INFO] Data was saved.');
}


client.once('ready', () => {
	console.log('[INFO] Getting data from data.json');
	try {
		fs.readFile(path.join(__dirname,"./data.json"), 'utf-8', (error, data) => {	
			if(error) {
				throw error;
			}

			const entries = Object.entries(JSON.parse(data));
			guildsData = new Map(entries);
			console.log(`[INFO] Recovered ${entries.length} guilds from data.json`)
		})
	} catch (error) {
		console.error(
			'[ERROR] Something went wrong trying to get data from data.json. Check if the file exists, for now the map will be empty.'
			)
	}

	setInterval(saveData, FIVE_MINUTES)
	console.log('[INFO] Bot is ready.');
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