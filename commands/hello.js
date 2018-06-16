module.exports.run = async(client, message, args) => {
    message.react('👋').catch(console.error);
};
