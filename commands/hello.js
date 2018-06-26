module.exports.run = async(client, message, args) => {
    message.react('👋').catch(console.error);
};

module.exports.aliases = ['hello', 'test', 'dontusethiscommand'];
module.exports.permissions = ['SEND_MESSAGES', 'ADD_REACTIONS'];
