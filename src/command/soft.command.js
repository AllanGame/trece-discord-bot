export default {
  executor: SoftCommand,
  name: 'soft',
}


async function SoftCommand(interaction, guildsData) {
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
