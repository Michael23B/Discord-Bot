const helpers = require('../helpers.js');

const cooldown = 180000;

module.exports.run = async(client, message, args) => {
    let cd = client.checkCooldown(this.aliases[0], message.author.id);
    if (cd > 0) {
        message.reply(`wait ${cd / 1000} seconds before using this command again.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    await createVoiceChannel(client, message, args);
};

module.exports.aliases = ['call', 'createcall'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK', 'MANAGE_CHANNELS'];

async function createVoiceChannel(client, message, args) {
    if (!args[0]) {
        message.reply('please provide a name for the channel.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    client.startCooldown(module.exports.aliases[0], message.author.id, new Date().getTime() + cooldown);

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

    let timeToDelete = args[1] && !isNaN(args[1]) ? helpers.clamp(args[1], 0, 10000) : 9999;

    if (timeToDelete >= 9999 || timeToDelete === 0) {
        message.reply(`channel created.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    setTimeout(() => helpers.safeDeleteChannel(message.guild, channel.id), (timeToDelete * 60000));
    message.reply(`I'll delete that channel in ${timeToDelete} minutes unless you're still using it by then.`)
        .then(msg => msg.delete(client.msgLife)).catch(console.error);
}
