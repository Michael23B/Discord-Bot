module.exports.run = async(client, message, args) => {
    const botMember = message.guild.members.find(x => x.id === client.user.id);

    if (!message.member.voiceChannel || message.member.voiceChannel !== botMember.voiceChannel) {
        message.reply('you must send that command from the same channel that I am playing in.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }
    if (!botMember.voiceChannel) {
        message.reply('I am not in a voice channel sir.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
    else {
        botMember.voiceChannel.leave();
        message.reply('stopped playing.').catch(console.error);
    }
};

module.exports.aliases = ['stop'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];
