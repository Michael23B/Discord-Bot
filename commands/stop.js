const { stop } = require('./play.js');

module.exports.run = async(client, message, args) => {
    stop(client, message, args);
};

module.exports.aliases = ['stop'];
module.exports.permissions = ['SEND_MESSAGES', 'CONNECT', 'SPEAK'];
