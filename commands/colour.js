const helpers = require('../helpers.js');

module.exports.run = async(client, message, args) => {
    let target = message.mentions.members.first() || message.member;
    let isOwner = message.guild.owner === message.member;
    //Compare permissions for setting another members colour
    if (target !== message.member) {
        if ((target.hasPermission('ADMINISTRATOR', false, true, true)
            || target.highestRole.position >= message.member.highestRole.position)
            && !isOwner) {
            message.reply(`${target.user.username} has a power level equal to or greater than yours.`)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
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
        .then(message.channel.send(`setting colour to [${newCol[0]},${newCol[1]},${newCol[2]}]`, {reply: target }))
        .catch(err => {
            message.reply(`${target.colorRole} is too powerful for me to change.` +
                ` Adjust role positions in the server settings or remove your current colour role and I can give you a new one.`)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
            console.error(err);
        });
};

module.exports.aliases = ['colour', 'color', 'rgb'];
module.exports.permissions = ['SEND_MESSAGES'];
