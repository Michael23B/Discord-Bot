const ytdl = require('ytdl-core');

module.exports.run = async(client, message, args) => {
    if (!message.member.voiceChannel || !message.member.voiceChannel !== client.voiceChannel) {
        message.reply('we need to be in the same voice channel for you to stop me.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
    if (!client.voiceChannel) {
        message.reply('I am not in a voice channel sir.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
    else {
        client.voiceChannel.leave();
        message.reply('👋 bye sir').catch(console.error);
    }
};

module.exports.aliases = ['stop'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];
