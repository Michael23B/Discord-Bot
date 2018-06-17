const helpers = require('../helpers.js');

module.exports.run = async(client, message, args) => {
    if (!message.member.colorRole) {
        //No colorRole, create a new role
        let role = await helpers.getNewRole(message, client.botRoleName);
        await message.member.addRole(role).catch(console.error);
    }
    await message.member.colorRole.setColor(helpers.getColour(args))
        .then(updated => message.reply(`colour set to ${updated.hexColor}`))
        .catch(console.error);
};
