const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const helpers = require('../helpers');
const YouTube = require('simple-youtube-api');
const fs = require('fs');
let ApiKey;

if (fs.existsSync('./settings.json')) {
    let { ytApiKey } = require('../settings.json');
    ApiKey = ytApiKey;
}
else {
    ApiKey = process.env.YOUTUBE_API_KEY;
}

let queue = new Map();
const youtube = new YouTube(ApiKey);

let running = false;

module.exports.run = async(client, message, args) => {
    if (running) {
        message.reply('please wait for me to load the current song and then try again.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    const channel = message.member.voiceChannel;
    const serverQueue = queue.get(message.guild.id);

    //If we are creating a new queue, wait before allowing more songs to be added.
    //If we don't do this, users can spam start a song and the result is buggy.
    if (!serverQueue) running = true;

    //We have a current queue, songs, the user supplied no video and we are currently paused -> un-pause
    if (serverQueue && serverQueue.songs.length > 0 && serverQueue.playing === false && !args[0]) {
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        message.channel.send('**Resumed music**').catch(console.error);
        return running = false;
    }

    if (!channel) {
        message.reply('you are not in a voice channel.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return running = false;
    }

    if (!args[0]) {
        message.reply('please provide a youtube video to play. `>play [Youtube video url]`')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return running = false;
    }

    let video;
    let results;
    video = await youtube.getVideo(args[0]).catch(async () => {
        results = await youtube.searchVideos(Array.prototype.join.call(args.slice(), ' ')).catch(() => {
                message.reply('couldn\'t find that video. Make sure your command looks like this: `>play [YouTube search or video URL]`')
                    .then(msg => msg.delete(client.msgLife)).catch(console.error);
            });
        if (!results) return null;
        return await youtube.getVideoByID(results[0].id).catch(() => {
            message.reply('I found a video, but I wasn\'t able to fetch it for some reason.')
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
        });
        //temporary, add vote embed later
    });
    if (!video) return running = false;

    if (!serverQueue) {
        //Don't have a queue for the current server, make one and start playing
        let queueEntry = {
            textChannel: message.channel,
            voiceChannel: channel,
            connection: null,
            songs: [createSongObject(video, message)],
            volume: 5,
            playing: true
        };

        queueEntry.connection = await channel.join()
            .catch(err => {
                message.reply('I couldn\'t join that channel.').then(msg => msg.delete(client.msgLife))
                    .catch(err => console.error(err));
                console.error(err);
            });

        if (!queueEntry.connection) return running = false;

        queue.set(message.guild.id, queueEntry);

        play(message.guild);
    }
    else {
        let songObj = createSongObject(video, message);
        serverQueue.songs.push(songObj);
        message.channel.send(`\`${songObj.title}(${helpers.secondsToHMSString(songObj.duration)})\` added to the queue.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
    running = false;
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

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    message.channel.send('**Stopped music**.').catch(console.error);
};

module.exports.changeVolume = function(client, message, args) {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
        message.reply('there\'s no songs playing right now.')
            .catch(console.error);
        return;
    }

    if (!args[0]) {
        message.reply(`the current volume is ${serverQueue.volume}. You can set the volume with \`>volume [1.0 - 20.0]\``)
            .catch(console.error);
        return;
    }

    let newVolume = helpers.clamp(Number(args[0]), 1, 20);

    serverQueue.volume = newVolume;
    serverQueue.connection.dispatcher.setVolumeLogarithmic(newVolume * 0.1);

    message.reply(`volume set to ${newVolume}.`)
        .catch(console.error);
};

module.exports.nowPlaying = function(client, message, args) {
    const serverQueue = queue.get(message.guild.id);
    const botMember = message.guild.members.find(x => x.id === client.user.id);

    if (!serverQueue) {
        message.reply('there\'s no songs playing right now.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    message.channel.send(createNowPlayingEmbed(serverQueue.songs, botMember.colorRole.color)).catch(console.error);
};

module.exports.pause = function(client, message, args) {
    const serverQueue = queue.get(message.guild.id);
    const botMember = message.guild.members.find(x => x.id === client.user.id);

    if (!serverQueue) {
        message.reply('there\'s no songs playing right now.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    if (!message.member.voiceChannel || message.member.voiceChannel !== botMember.voiceChannel) {
        message.reply('you must send that command from the same channel that I am playing in.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    serverQueue.playing = false;
    serverQueue.connection.dispatcher.pause();
    message.channel.send('**Music paused**').catch(console.error);
};

function play(guild) {
    const serverQueue = queue.get(guild.id);
    serverQueue.playing = true;
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

    dispatcher.setVolumeLogarithmic(serverQueue.volume * 0.1);

    serverQueue.textChannel.send(`Started playing: \`${song.title} (${helpers.secondsToHMSString(song.duration)})\` - *Added by ${song.user}*`)
}

function createSongObject(video, message) {
    return {
        title: video.title,
        url: 'www.youtube.com/watch?v=' + video.id,
        user: message.author.username,
        img: video.thumbnails.default.url,
        description: video.description,
        duration: video.duration.days * 86400 + video.duration.hours * 3600 + video.duration.minutes * 60 + video.duration.seconds
    }
}

function createNowPlayingEmbed(songs, colour) {
    let upcomingString = "";
    songs.forEach((song, i) => {
        if (i !== 0) {
            upcomingString += `\`${song.title} (${helpers.secondsToHMSString(song.duration)})\` - *Added by ${song.user}*\n`;
        }
    });

    return new Discord.RichEmbed()
        .setTitle(`🎶 Playlist 🎶`)
        .setColor(colour || 'DARK_AQUA')
        .addField('Currently playing:', `\`${songs[0].title} (${helpers.secondsToHMSString(songs[0].duration)})\` - *Added by ${songs[0].user}*`)
        .addField('Upcoming songs:', upcomingString || 'No upcoming songs');
}

//TODO: start from timestamp, pause, voting for skip, if channel is deleted, restart queue, recently played in playlist, max length in playlist embed