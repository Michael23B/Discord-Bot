const { pause } = require('./play.js');

module.exports.run = async(client, message, args) => {
    pause(client, message, args);
};

module.exports.aliases = ['pause'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];
