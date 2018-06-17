const Discord = require('discord.js');
const helpers = require('../helpers.js');

module.exports.run = async(client, message, args) => {
    let serverEmbed = await createServerInfoEmbed(message);
    message.channel.send(serverEmbed);
};

async function createServerInfoEmbed(message) {
    let roles = await helpers.getRolesString(message.guild.roles);
    return new Discord.RichEmbed()
        .setTitle(`Server info - ${message.guild.name}`)
        .setImage(message.guild.iconURL)
        .setColor('BLUE')
        .addField('Current roles:', `${roles || "None"}`)
        .addField('Server created:', message.guild.createdAt)
        .addField('Current channel topic:', `${message.channel.topic || 'None'}`);
}
