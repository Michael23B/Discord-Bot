const { skip } = require('./play.js');

module.exports.run = async(client, message, args) => {
    skip(client, message, args);
};

module.exports.aliases = ['skip', 'next'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];
