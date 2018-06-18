const Discord = require('discord.js');

module.exports.run = async(client, message, args) => {
    if (args[0] === 'detailed' || args[0] === 'true') {
        let helpEmbed = await createDetailedHelpEmbed(client, message, args).catch(console.error);
        message.author.createDM().then(dm => dm.send(helpEmbed))
            .catch(console.error)
            .then(message.reply('I\'ve sent you some information'));
    }
    else {
        let helpEmbed = await createHelpEmbed(client, message, args).catch(console.error);
        message.channel.send(helpEmbed);
    }
};

module.exports.aliases = ['help', 'h', 'commands'];

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
        .addField('Colour:', '```>colour [0-255] [0-255] [0-255]```')
        .addField('Call:', '```>call [call name] [@users to allow]```')
        .addField('Questions:', '```>question add [question]? [answer] (attach image)\n' +
            '>question ask\n' +
            '>answer [your answer]\n' +
            '>question get\n' +
            '>question remove [index]```')
        .setFooter(`[Arguments] are mostly optional. Type ${client.prefix}help detailed for more info.`);
}

async function createDetailedHelpEmbed(client, message, args) {
    let colorRole = message.guild.members.find(x => x.user.username === client.user.username).colorRole;
    return new Discord.RichEmbed()
        .setTitle(`Commands for ${client.user.username} (Detailed)`)
        .setThumbnail(`${client.user.avatarURL}`)
        .setColor(colorRole ? colorRole.color : 'BLUE')
        .addField('Cleanup:', '```>cleanup messages [amount to search] [@username]```' +
            'Defaults to fetching the last 10 messages in that channel and removes them all.' +
            ' Adding a user mention will delete messages from only that user, however,' +
            ' the amount to search still includes all messages.\n' +
            '```>cleanup roles [role name]```' +
            `Defaults to removing all roles named ${client.botRoleName} (bot-created role name).` +
            ' Otherwise removes all roles with the specified name.\n' +
            '```>cleanup calls [call name]```' +
            'Call name is required. Removes all voice channels with the specified name.\n' +
            '`>cleanup, >clean, >remove, >delete`\n')
        .addField('Information:', '```>help [detailed?]```' +
            'Sends a message in the current channel displaying the commands available.' +
            ' If `true` or `detailed` is supplied, a direct message with command descriptions is sent instead.\n' +
            '```>userinfo [@username]```' +
            'Sends a message in the current channel displaying information about the the current user.' +
            ' If a mention `@username` is supplied, information about that user is sent instead.\n' +
            '```>serverinfo```' +
            'Sends a message in the current channel displaying information about the current server.\n' +
            '`>userinfo, >user, >uinfo, >serverinfo, >server, >sinfo`\n')
        .addField('Colour:', '```>colour [0-255] [0-255] [0-255]```' +
            'Gives the user a colour using supplied red, green and blue values. If none are supplied,' +
            ' the values are randomized. If the user has a role which controls their colour, that role is changed.' +
            ' If not, a role is created and given to them.\n' +
            '`>colour, >color, >rgb`\n')
        .addField('Call:', '```>call [call name] [@users to allow]```' +
            'Call name is required. Creates a private voice channel with the specified name. All permissions are ' +
            ' disabled for everyone but the user that requested the call. If other users are mentioned (`@username`)' +
            ' they will also be given permissions. If you want a call to be public, use the `@everyone` mention.\n' +
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
            'Removes the question at the index provided. You see question indexes using `>question get`\n' +
            '`>question, >q, >answer, >a`')
        .setFooter('Not complete yet. This will have more info later.');
}

//TODO: add examples to help
