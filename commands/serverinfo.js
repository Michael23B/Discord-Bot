const Discord = require('discord.js');
const helpers = require('../helpers.js');
const stocks = require('./stocks.js');

module.exports.run = async(client, message, args) => {
    let serverEmbed = await createServerInfoEmbed(client, message);
    message.channel.send(serverEmbed);
};

module.exports.aliases = ['serverinfo', 'server', 'sinfo'];
module.exports.permissions = ['SEND_MESSAGES', 'EMBED_LINKS'];

async function createServerInfoEmbed(client, message) {
    let roles = await helpers.getRolesString(message.guild.roles);

    //Calculate the total net worth of this server, as well as the richest user
    let totalNetWorth = 0;
    let richestUser = {username: "", netWorth: -1};
    let prices = stocks.getCurrentPrices();

    message.channel.members.forEach(member => {
        let inventory = client.getInventoryFor(member.id);
        let netWorth = inventory['💰'];
        Object.keys(inventory).forEach(key => {
            let itemValuation = prices[key] * inventory[key];
            if (!isNaN(itemValuation)) netWorth += itemValuation;
        });

        if (netWorth > richestUser.netWorth) {
            richestUser.username = member.user.username;
            richestUser.netWorth = netWorth;
        }

        totalNetWorth += netWorth;
    });


    return new Discord.RichEmbed()
        .setTitle(`Server info - ${message.guild.name}`)
        .setImage(message.guild.iconURL)
        .setColor('BLUE')
        .addField('Current roles:', `${roles || "None"}`)
        .addField('Server created:', message.guild.createdAt)
        .addField('Current channel topic:', `${message.channel.topic || 'None'}`)
        .addField('Total server net worth:', `${totalNetWorth.toLocaleString('en-US', {style: 'currency', 'currency': 'USD'})}`)
        .addField('Richest user', richestUser.username || 'all poor');
}
