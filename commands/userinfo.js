const Discord = require('discord.js');
const helpers = require('../helpers.js');

module.exports.run = async(client, message, args) => {
    let user =  message.mentions.members.first() || message.guild.members.find(x => x.user === message.author);
    let userEmbed = await createUserInfoEmbed(client, user);
    message.channel.send(userEmbed);
};

module.exports.aliases = ['userinfo', 'user', 'uinfo'];
module.exports.permissions = ['SEND_MESSAGES', 'EMBED_LINKS'];

async function createUserInfoEmbed(client, member) {
    let roles = await helpers.getRolesString(member.roles);
    let inventory = client.getInventoryFor(member.id);
    let inventoryString = Object.keys(inventory).map(key => {
        return key.toString() + ' x ' + inventory[key].toString();
    }).join(',');

    return new Discord.RichEmbed()
        .setTitle(`User info - ${member.user.username}`)
        .setImage(member.user.avatarURL)
        .setColor(member.colorRole ? member.colorRole.color : 'BLUE')
        .addField('Full username:', `${member.user.username}#${member.user.discriminator}`)
        .addField('Current roles:', `${roles || "None"}`)
        .addField('Inventory:', `${inventoryString}`)
        .addField('Joined Discord:', member.user.createdAt);
}
