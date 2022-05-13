export default {
  executor: SetCommand,
  name: 'set',
}

async function SetCommand(interaction, guildsData) {
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
