const Discord = require('discord.js');

const cooldown = 25000;

module.exports.run = async(client, message, args) => {
    if (args[0] === 'detailed' || args[0] === 'true') {
        let helpEmbed = await createDetailedHelpEmbed(client, message, args).catch(console.error);
        message.author.createDM().then(dm => dm.send(helpEmbed))
            .catch(console.error)
            .then(() => message.reply('I\'ve sent you some information')
                .then(msg => msg.delete(client.msgLife)).catch(console.error));
        return;
    }
    //Cooldown only for channel help embed, since it's large, it may be annoying
    let cd = client.checkCooldown(this.aliases[0], message.author.id);
    if (cd > 0) {
        message.reply(`wait ${cd / 1000} seconds before using this command again.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let helpEmbed = await createHelpEmbed(client, message, args).catch(console.error);
    message.channel.send(helpEmbed);
    client.startCooldown(this.aliases[0], message.author.id, new Date().getTime() + cooldown);
};

module.exports.aliases = ['help', 'h', 'commands'];
module.exports.permissions = ['SEND_MESSAGES'];

async function createHelpEmbed(client, message, args) {
    let colorRole = message.guild.members.find(x => x.user.username === client.user.username).colorRole;
    return new Discord.RichEmbed()
        .setTitle(`Commands for ${client.user.username}`)
        .setThumbnail(`${client.user.avatarURL}`)
        .setColor(colorRole ? colorRole.color : 'BLUE')
        .addField('Cleanup:', '```>cleanup messages [amount to search] [@username]\n' +
            '>cleanup roles [role name]\n' +
            '>cleanup calls [call name]```')
        .addField('Information:', '```>help [detailed?]\n' +
            '>userinfo [@username]\n' +
            '>serverinfo```')
        .addField('Colour:', '```>colour [0-255] [0-255] [0-255] [@username]```')
        .addField('Call:', '```>call [call name] [lifetime (minutes)] [@users to allow]```')
        .addField('Questions:', '```>question add [question]? [answer] (attach image)\n' +
            '>question ask\n' +
            '>answer [your answer]\n' +
            '>question get\n' +
            '>question remove [index]```')
        .addField('Images:', '```>cat\n' +
            '>dog\n' +
            '>simpsons [Simpsons quote]```')
        .addField('Moderation:', '```>votekick [@username]\n' +
            '>disable [@username]```')
        .addField('Money:', '```>inventory [@username]\n' +
            '>daily\n' +
            '>hourly\n' +
            '>stocks\n' +
            '>buy [item to buy] [amount]\n' +
            '>sell [item to sell] [amount]\n' +
            '>give [item to give] [amount] [@username]\n' +
            '>gamble [amount to gamble]```')
        .setFooter(`[Arguments] are mostly optional. Type ${client.prefix}help detailed for more info.`);
}

async function createDetailedHelpEmbed(client, message, args) {
    let colorRole = message.guild.members.find(x => x.user.username === client.user.username).colorRole;
    return new Discord.RichEmbed()
        .setAuthor(`Commands for ${client.user.username} (Detailed)`,`${client.user.avatarURL}`)
        .setColor(colorRole ? colorRole.color : 'BLUE')
        .addField('Cleanup:', '```>cleanup messages [amount to search] [@username]```' +
            'Defaults to fetching the last 10 messages in that channel and removes them all.' +
            ' Adding a user mention will delete messages from only that user, however,' +
            ' the amount to search still includes all messages.\n' +
            '```>cleanup roles [role name]```' +
            `Removes all roles with the specified name.\n` +
            '```>cleanup calls [call name]```' +
            'Removes all voice channels with the specified name.\n' +
            '`>cleanup, >clean, >remove, >delete`\n')
        .addField('Information:', '```>help [detailed?]```' +
            'Sends a message in the current channel displaying the commands available.' +
            ' If `true` or `detailed` is supplied, a direct message with command descriptions is sent instead.\n' +
            '```>userinfo [@username]```' +
            'Sends a message in the current channel displaying information about the the current user.' +
            ' If a mention `@username` is supplied, information about that user is sent instead.\n' +
            '```>serverinfo```' +
            'Sends a message in the current channel displaying information about the current server.\n' +
            '`>help, >h, >userinfo, >user, >serverinfo, >server`\n')
        .addField('Colour:', '```>colour [0-255] [0-255] [0-255] [@username]```' +
            'Gives the user a colour using supplied red, green and blue values. If none are supplied,' +
            ' the values are randomized. Target user defaults to yourself. If the user has a role which controls their colour,' +
            '  that role is changed. If not, a role is created and given to them.\n' +
            '`>colour, >color, >rgb`\n')
        .addField('Call:', '```>call [call name] [lifetime (minutes)] [@users to allow]```' +
            'Creates a private voice channel with the specified name. All permissions are ' +
            ' disabled for everyone but the user that requested the call. If other users are mentioned (`@username`)' +
            ' they will also be given permissions. If you want a call to be public, use the `@everyone` mention.' +
            ' Calls with lifetime of 0 or 9999 are permanent, otherwise they are deleted after that amount of minutes.\n' +
            '`>call, >createcall`\n')
        .addField('Questions:', '```>question add [question]? [answer] (attach image)```' +
            'All fields required. Creates a question with the text preceding the \'?\', the text after is the answer' +
            ' and the attached image will be shown when the question is asked.\n' +
            '```>question ask```' +
            'Asks a random question from the saved list.\n' +
            '```>answer [your answer]```' +
            'Answers an asked question.\n' +
            '```>question get```' +
            'Fetches all saved questions.\n' +
            '```>question remove [index]```' +
            'Removes the question at the index provided. You can see question indexes using `>question get`\n' +
            '`>question, >q, >answer, >a`')
        .addField('Images:', '```>cat```' +
            'Sends an image/gif/video of a cat in the current channel.\n' +
            '```>dog```' +
            'Sends an image of a dog in the current channel.\n' +
            '```>simpsons [simpsons quote]```' +
            'Searches for a Simpsons frame based on the quote provided. If more than one result is found, starts a vote' +
            ' to select the frame. After a frame is selected, you can changes frames. Once the frame' +
            ' is left for a few seconds without changing, that ability is lost for that frame. If no quote' +
            ' is supplied, a random frame is chosen and you cannot change frames.\n' +
            '`>cat, >cate, >🐱, >dog, >doggo, >🐶, >simpsons`')
        .addField('Moderation:', '```>votekick [@username]```' +
            'Begins a vote to kick the mentioned user. Requires a majority vote to succeed.\n' +
            '```>disable [@username]```' +
            'Prevents the user from using bot commands. Works as long as the user has the \'bot use disabled\'' +
            ' role. If they have the MANAGE_ROLES privilege or a higher role than the \'bot use disabled\', this command won\'t stop them.\n' +
            '`>votekick, >kick, >disable`')
        .addField('Money:', '```>inventory [@username]```' +
            'Displays the current inventory and net worth of the targeted user or yourself if no mention is supplied.\n' +
            '```>daily```' +
            'Gives you a random amount of 💰 and poor-tier items. Can be performed once every 24 hours.\n' +
            '```>hourly```' +
            'Gives you a random amount of 💰. Can be performed once every hour.\n' +
            '```>stocks```' +
            'Presents the current stock market price of each item. Stocks are updated about every ten minutes.\n' +
            '```>buy [item to buy] [amount]```' +
            'Purchases the requested amount of an item at the current market price. Max of 1000 item purchases every stock adjustment.\n' +
            '```>sell [item to sell] [amount]```' +
            'Sells the requested amount of an item that you own at the current market price. [amount] can be `all`.\n' +
            '```>give [item to give] [amount] [@username]```' +
            'Gives the target user the requested amount of an item that you own. [amount] can be `all`.\n' +
            '```>gamble [amount to gamble]```' +
            'Gambles your money (not a scam). [amount] can be `all`.\n' +
            '`>inventory, >i, >daily, >hourly, >stocks, >buy, >sell, >give, >gamble`')
}
