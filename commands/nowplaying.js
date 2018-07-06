const { nowPlaying } = require('./play.js');

module.exports.run = async(client, message, args) => {
    nowPlaying(client, message, args);
};

module.exports.aliases = ['nowplaying', 'np', 'songs', 'playlist'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];
