const ytdl = require('ytdl-core');

let queue = new Map();

module.exports.run = async(client, message, args) => {
    const botMember = message.guild.members.find(x => x.id === client.user.id);
    const channel = message.member.voiceChannel;
    const serverQueue = queue.get(message.guild.id);

    if (!channel) {
        message.reply('you are not in a voice channel.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    if (!args[1]) {
        message.reply('please provide a youtube video to play. `>play [youtube video url]`')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    const songInfo = await ytdl.getInfo(args[1]);

    if (!serverQueue) {
        let queueEntry = {
            textChannel: message.channel,
            voiceChannel: channel,
            connection: null,
            songs: [],
            volume: 0.5,
            playing: false
        };
        queue.set(message.guild.id, queueEntry);

        queueEntry.connection = await channel.join()
            .catch(err => {
                message.reply('I couldn\'t join that channel.').then(msg => msg.delete(client.msgLife))
                    .catch(err => {
                    console.error(err);
                    queue.delete(message.guild.id);
                });
                console.error(err);
            });

        play(message.guild, queueEntry.songs[0]);
    }
    else {
        serverQueue.songs.push({title: songInfo.title, url: songInfo.video_url});
        message.channel.send(`${songInfo.title} added to the queue.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
};

module.exports.aliases = ['play'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.channel.leave();
        serverQueue.delete(guild.id);
    }

    const dispatcher = serverQueue.connection.playStream(song.url)
        .on('end', () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', err => console.error(err));

    dispatcher.setVolumeLogarithmic(0.5);
}
