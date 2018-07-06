const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const helpers = require('../helpers');

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

    if (!args[0]) {
        message.reply('please provide a youtube video to play. `>play [Youtube video url]`')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    const songInfo = await ytdl.getInfo(args[0]).catch(err => {
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
            songs: [createSongObject(songInfo, message)],
            volume: 0.5,
            playing: false
        };

        console.log(queueEntry.songs);

        queueEntry.connection = await channel.join()
            .catch(err => {
                message.reply('I couldn\'t join that channel.').then(msg => msg.delete(client.msgLife))
                    .catch(err => console.error(err));
                console.error(err);
            });

        if (!queueEntry.connection) return;

        queue.set(message.guild.id, queueEntry);

        play(message.guild);
    }
    else {
        serverQueue.songs.push(createSongObject(songInfo, message));
        message.channel.send(`\`${songInfo.title}(${helpers.secondsToHMSString(songInfo.length_seconds)})\` added to the queue.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
};

module.exports.aliases = ['play'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];

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

module.exports.changeVolume = function(client, message, args) {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
        message.reply('there\'s no songs playing right now.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    if (!args[0]) {
        message.reply(`the current volume is ${serverQueue.volume}. You can set the volume with \`>volume [0.1 - 2.0]\``)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }
    let newVolume = helpers.clamp(Number(args[0]), 0.1, 2.0);

    serverQueue.volume = newVolume;
    serverQueue.connection.dispatcher.setVolumeLogarithmic(newVolume);

    message.reply(`volume set to ${newVolume}.`)
        .then(msg => msg.delete()).catch(console.error);
};

module.exports.nowPlaying = function(client, message, args) {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
        message.reply('there\'s no songs playing right now.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    message.channel.send(createNowPlayingEmbed(serverQueue.songs)).catch(console.error);
};

function play(guild) {
    const serverQueue = queue.get(guild.id);
    let song = serverQueue.songs[0];

    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', () => {
            serverQueue.songs.shift();
            play(guild);
        })
        .on('error', err => console.error(err));

    dispatcher.setVolumeLogarithmic(serverQueue.volume);

    serverQueue.textChannel.send(`🎶Started playing: \`${song.title} (${helpers.secondsToHMSString(song.duration)})\`. Added by ${song.user}.🎶`)
}

function createSongObject(songInfo, message) {
    return {
        title: songInfo.title,
        url: songInfo.video_url,
        user: message.author.username,
        img: songInfo.thumbnail_url,
        duration: songInfo.length_seconds
    }
}

function createNowPlayingEmbed(songs) {
    let upcomingString = "";
    songs.forEach((song, i) => {
        if (i !== 0) {
            upcomingString += `\`${song.title} (${helpers.secondsToHMSString(song.duration)})\`. Added by ${song.user}\n`;
        }
    });

    return new Discord.RichEmbed()
        .setTitle(`🎶Current Playlist🎶`)
        .setColor('RANDOM')
        .addField('Currently playing:', `\`${songs[0].title} (${helpers.secondsToHMSString(songs[0].duration)})\`. Added by ${songs[0].user}.`)
        .addField('Upcoming songs:', upcomingString || 'No upcoming songs');
}

//TODO: start from timestamp, pause, voting for skip, if channel is deleted, restart queue
