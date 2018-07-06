const { changeVolume } = require('./play.js');

module.exports.run = async(client, message, args) => {
    changeVolume(client, message, args);
};

module.exports.aliases = ['volume', 'setvolume', 'v'];
module.exports.permissions = ['SEND_MESSAGES'];
