module.exports.run = async(client, message, args) => {
    message.react('👋').catch(console.error);
    client.savePlayerInventory(); //just put this here in case I want to put the bot down before the stats save automatically
};

module.exports.aliases = ['hello', 'test', 'bye'];
module.exports.permissions = ['SEND_MESSAGES', 'ADD_REACTIONS'];
