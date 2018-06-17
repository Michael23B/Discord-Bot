module.exports.run = async(client, message, args) => {
    await createVoiceChannel(message, args);
};

async function createVoiceChannel(message, args) {
    if (!args[0]) {
        message.reply('please provide a name for the channel!');
        return;
    }
    //TODO: check this earlier before any guild-related commands are chosen
    if (!message.guild.available) {
        message.reply('I can\'t do that');
        return;
    }

    //Disable all permissions for users, enable them for author
    //Stored in a bitfield so we negate 0 for all 1s
    let channel = await message.guild.createChannel(args[0], 'voice', [
        { id: message.guild.id, deny: ~0},
        { id: message.author.id, allow: ~0 }
    ]).catch(console.error);
    //and mentions
    message.mentions.members.forEach(async mention => {
            await channel.overwritePermissions(mention, {
                CONNECT: true,
                VIEW_CHANNEL: true,
                SPEAK: true
            }).catch(console.error);
        }
    );

    if (message.mentions.everyone) {
        await channel.overwritePermissions(message.guild.id, {
            CONNECT: true,
            VIEW_CHANNEL: true,
            SPEAK: true
        }).catch(console.error);
    }
    //FIXME: category permissions get synced which ruins the private call
    let category = await message.guild.channels.find(x => x.type === 'category' && x.name === 'Voice Channels');
    if (category) channel.setParent(category).catch(console.error);
}
