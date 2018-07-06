module.exports.run = async(client, message, args) => {
    if (message.author.id !== '84156418692780032') return; //Developer only command

    client.guilds.forEach(guild => {
        guild.channels.find(ch => ch.type === 'text').send(`${Array.prototype.join.call(args.slice(0), " ")}`)
            .catch(console.error);
    });
};

module.exports.aliases = ['announce'];
module.exports.permissions = ['SEND_MESSAGES'];
