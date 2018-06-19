const helpers = require('../helpers.js');

module.exports.run = async(client, message, args) => {
    let target = message.mentions.members.first() || message.member;
    let newCol = [];
    if (!target.colorRole) {
        //No colorRole, create a new role
        let role = await helpers.getNewRole(message, client.botRoleName);
        await target.addRole(role).catch(console.error);
    }
    await target.colorRole.setColor(newCol = helpers.getColour(args))
        .then(message.channel.send(`colour set to [${newCol[0]},${newCol[1]},${newCol[2]}]`, {reply: target }))
        .catch(console.error);
};

module.exports.aliases = ['colour', 'color', 'rgb'];
