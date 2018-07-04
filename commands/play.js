const ytdl = require('ytdl-core');

module.exports.run = async(client, message, args) => {
    const channel = message.member.voiceChannel;
    if (!channel) {
        message.reply('you are not in a voice channel.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let connection = await channel.join()
        .catch(err => {
            message.reply('I couldn\'t join that channel.').then(msg => msg.delete(client.msgLife)).catch(console.error);
            console.error(err);
        });

    if (!client.voiceChannel) return;

    const dispatcher = connection.playStream(ytdl(args[0], {}))
        .on('end', () => channel.leave())
        .on('error', err => console.error(err));

    dispatcher.setVolumeLogarithmic(0.5);
};

module.exports.aliases = ['play'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];
