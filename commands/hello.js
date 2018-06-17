module.exports.run = async(client, message, args) => {
    message.react('👋').catch(console.error);
};

module.exports.aliases = ['hello', 'test', 'dontusethiscommand'];
