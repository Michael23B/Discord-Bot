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
        message.reply('please provide a youtube video to play. `>play [Youtube video url]`')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    const songInfo = await ytdl.getInfo(args[1]).catch(err => {
        message.reply(err.toString())
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    });
    if (!songInfo) return;

    if (!serverQueue) {
        //Don't have a queue for the current server, make one and start playing
        let queueEntry = {
            textChannel: message.channel,
            voiceChannel: channel,
            connection: null,
            songs: [{title: songInfo.title, url: songInfo.video_url}],
            volume: 0.5,
            playing: false
        };

        console.log(queueEntry.songs);

        queueEntry.connection = await channel.join()
            .catch(err => {
                message.reply('I couldn\'t join that channel.').then(msg => msg.delete(client.msgLife))
                    .catch(err => {
                    console.error(err);
                });
                console.error(err);
            });

        if (!queueEntry.connection) return;

        queue.set(message.guild.id, queueEntry);

        play(message.guild);
    }
    else {
        serverQueue.songs.push({title: songInfo.title, url: songInfo.video_url});
        message.channel.send(`${songInfo.title} added to the queue.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
};

module.exports.aliases = ['play'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];

function play(guild) {
    console.log('started playing');

    const serverQueue = queue.get(guild.id);

    if (!serverQueue.songs[0]) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.playStream(ytdl(serverQueue.songs[0].url))
        .on('end', () => {
            serverQueue.songs.shift();
            play(guild);
        })
        .on('error', err => console.error(err));
}

module.exports.skip = function(client, message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) {
        message.reply('no songs to skip.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
    else serverQueue.connection.dispatcher.end();
};

module.exports.stop = function(client, message, args) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) {
        message.reply('there\'s nothing to stop.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

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
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        message.reply('stopped playing.').catch(console.error);
    }
};
//add volume method
//dispatcher.setVolumeLogarithmic(serverQueue.volume);
