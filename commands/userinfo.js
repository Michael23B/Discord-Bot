const Discord = require('discord.js');
const helpers = require('../helpers.js');

module.exports.run = async(client, message, args) => {
    let user =  message.mentions.members.first() || message.guild.members.find(x => x.user === message.author);
    let userEmbed = await createUserInfoEmbed(user);
    message.channel.send(userEmbed);
};

module.exports.aliases = ['userinfo', 'user', 'uinfo'];

async function createUserInfoEmbed(member) {
    let roles = await helpers.getRolesString(member.roles);
    return new Discord.RichEmbed()
        .setTitle(`User info - ${member.user.username}`)
        .setImage(member.user.avatarURL)
        .setColor(member.colorRole ? member.colorRole.color : 'BLUE')
        .addField('Full username:', `${member.user.username}#${member.user.discriminator}`)
        .addField('Current roles:', `${roles || "None"}`)
        .addField('Joined Discord:', member.user.createdAt);
}
