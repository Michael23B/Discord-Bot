const helpers = require('../helpers.js');

module.exports.run = async(client, message, args) => {
    let target = message.mentions.members.first() || message.member;

    //Compare permissions for setting another members colour
    if (target !== message.member) {
        if (target.hasPermission('ADMINISTRATOR', false, true, true)
            || target.highestRole.position >= message.member.highestRole.position) {
            message.reply(`${target.user.username} has a power level equal to or greater than yours.`)
                .then(msg => msg.delete(5000)).catch(console.error);
            return;
        }
    }

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
module.exports.permissions = ['SEND_MESSAGES'];
