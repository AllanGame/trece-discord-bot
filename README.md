# Trece

Trece is a counting bot for discord.

# Run
## Enviorment variables
First, you have to create a .env file with the next properties:
```env
TOKEN=
DEVELOPMENT_GUILD_ID=
APPLICATION_ID= # Or client id, is the same thing.
```

## Deploying commands
Then, you can deploy the slash commands.

Use this command to run the deploy script
```bash
npm run deploy-commands
```

This command will deploy the registered commands to the development guild that you wrote in the .env file.

If you want to deploy the commands to every guild use the `-p` flag, for production.
```bash 
npm run deploy-commands -- -p
```
