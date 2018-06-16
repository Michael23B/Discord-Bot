const Discord = require('discord.js');

module.exports.run = async(client, message, args) => {
    let user =  message.mentions.members.first() || message.guild.members.find(x => x.user === message.author);
    let userEmbed = await createUserInfoEmbed(user);
    message.channel.send(userEmbed);
};

async function createUserInfoEmbed(member) {
    let roles = await getRolesString(member.roles);
    return new Discord.RichEmbed()
        .setTitle(`User info - ${member.user.username}`)
        .setImage(member.user.avatarURL)
        .setColor(member.colorRole ? member.colorRole.color : 'BLUE')
        .addField('Full username:', `${member.user.username}#${member.user.discriminator}`)
        .addField('Current roles:', `${roles || "None"}`)
        .addField('Joined Discord:', member.user.createdAt);
}

async function getRolesString(rolesCollection) {
    let roles = "";
    await rolesCollection.forEach(entry => {
        roles += entry;
        roles += ', ';
    });
    return roles = roles.slice(0, -2); //Remove trailing comma and space
}
