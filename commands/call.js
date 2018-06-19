const helpers = require('../helpers.js');

module.exports.run = async(client, message, args) => {
    await createVoiceChannel(message, args);
};

module.exports.aliases = ['call', 'createcall'];

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

    //Search for the default Discord category for voice channels; if it doesn't exist, create it
    let category = await message.guild.channels.find(x => x.type === 'category' && x.name === 'Voice Channels')
    || await message.guild.createChannel('Voice Channels', 'category');
    if (category) await channel.setParent(category).catch(console.error);

    //Give mentioned users permissions
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

    let timeToDelete = args[1] && !isNaN(args[1]) ? helpers.clamp(args[1], 0.1, 1441) : 60;

    if (timeToDelete > 1440) {
        message.reply(` channel created. Channels that last longer than a day won't be deleted.`);
        return;
    }

    setTimeout(() => helpers.safeDeleteChannel(message.guild, channel.id), (timeToDelete * 60000));
    message.reply(`I'll delete that channel in ${timeToDelete} minutes unless you're still using it by then.`);
}
