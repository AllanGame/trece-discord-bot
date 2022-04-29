import { Client, Intents } from 'discord.js' 
import { TOKEN } from './constants.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log('Ready!');
});

client.login(TOKEN);