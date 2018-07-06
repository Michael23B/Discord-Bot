const helpers = require('../helpers.js');

module.exports.run = async(client, message, args) => {
    let target = message.mentions.members.first();

    if (!target) {
        message.reply('you must supply a target using a mention (`@username`).')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    if (target.roles.find(x => x.name === client.botRoleNameDisabled)) {
        await message.reply(`${target.user.username} already has their bot use disabled.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    //Compare permissions for disabling another users bot usage
    if (target !== message.member) {
        if (target.hasPermission('ADMINISTRATOR', false, true, true)
            || target.highestRole.position >= message.member.highestRole.position) {
            message.reply(`${target.user.username} has a power level equal to or greater than yours.`)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
            return;
        }
    }
    else {
        message.reply(`this command disables bot usage, you can't use it on yourself.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let role = await helpers.getNewRole(message, client.botRoleNameDisabled);
    await target.addRole(role).catch(console.error);

    message.reply(`I will not respond to commands from ${target.user.username}.`)
        .catch(console.error);
};

module.exports.aliases = ['disable'];
module.exports.permissions = ['ADMINISTRATOR'];
