const Discord = require('discord.js');

module.exports.run = async(client, message, args) => {
    let user =  message.mentions.members.first() || message.guild.members.find(x => x.user === message.author);
    let userEmbed = await createInventoryEmbed(client, user);
    message.channel.send(userEmbed);
};

module.exports.aliases = ['inventory', 'i'];
module.exports.permissions = ['SEND_MESSAGES', 'EMBED_LINKS'];

async function createInventoryEmbed(client, member) {
    let inventory = client.getInventoryFor(member.id);
    let inventoryString = Object.keys(inventory).map(key => {
        return key.toString() + 'x' + inventory[key].toString();
    }).join(', ');

    return new Discord.RichEmbed()
        .addField(`Inventory - ${member.user.username}`, `${inventoryString}`)
        .setColor(member.colorRole ? member.colorRole.color : 'BLUE');
}
