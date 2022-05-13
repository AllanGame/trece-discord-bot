import parse from "./parser.js";

// Process when a message is sent to counting channel.
export async function processCountingChannelMessage({
  message,
  guildData,
  guildsData,
  guildId
                                                    }) {
  const input = message.content;
  const result = parse(input);
  const expectedNumber = guildData.counting + 1;
  const streak = guildData.streak;
  const isSoftCounting = guildData.soft;

  if(message.author.id === guildData.lastUserId) {
    if(isSoftCounting) {
      await message.react('961492648902938654');
      return;
    }

    await message.react('🤔')
    await message.reply(`No puedes contar dos veces el mismo número. La cuenta se reinicia a 0.`)
    updateGuildCount(guildId, 0);
    updateGuildLastUserId(guildId, null);
    return;
  }

  if(!result || Math.floor(result) !== expectedNumber) {
    if(isSoftCounting) {
      await message.react('961492648902938654');
      return;
    }

    await message.react(isSoftCounting ? '961492648902938654' : '❌');
    await message.reply(`¡El número era ${expectedNumber}! La cuenta se reinicia a 0.`)
    updateGuildCount(guildId, 0);
    updateGuildLastUserId(guildId, null);
    return;
  }

  await message.react(result > streak ? '☑' : '✅');

  result > streak && updateGuildStreak(guildId, result)
  updateGuildCount(guildId, Math.floor(result));
  updateGuildLastUserId(guildId, message.author.id);

  // this is the fucking same function 3 times wtf
  function updateGuildCount(guild, newValue) {
    const oldValues = guildsData.get(guild);
    guildsData.set(guild, {
      ...oldValues,
      counting: newValue
    });
  }

  function updateGuildStreak(guild, newValue) {
    const oldValues = guildsData.get(guild);
    guildsData.set(guild, {
      ...oldValues,
      streak: newValue
    });
  }

  function updateGuildLastUserId(guild, newValue) {
    const oldValues = guildsData.get(guild);
    guildsData.set(guild, {
      ...oldValues,
      lastUserId: newValue
    });
  }
}
