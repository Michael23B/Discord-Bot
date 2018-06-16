const settings = require('./settings.json');
const Discord = require('discord.js');
const fs = require('fs');
const util = require('util');

const client = new Discord.Client();
const prefix = settings.prefix;
const botRole = '^-^';

const readFile = util.promisify(fs.readFile);

//TODO: move these along with the question commands
let askingQuestion = false;
let currAsker = "";
let currAnswer = "";

client.on('ready', async () => {
    console.log(client.user.username + ' ready for deployment sir.\n');
    //let link = await client.generateInvite(['ADMINISTRATOR']).catch(console.error);
    //console.log(`To add me to a server, go here sir:\n ${link}`);
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (!message.content.startsWith(settings.prefix)) return;

    await executeCommand(message);
});

client.login(settings.token).catch(console.error);
//TODO: move command definitions to another file, check for permissions before allowing some commands
async function executeCommand(message) {
    let args = message.content.split(' ');
    let command = args[0];
    args = args.splice(1);

    switch (command) {
        case `${prefix}help`:
            if (args[0] === 'detailed' || args[0] === 'true') {
                let helpEmbed = await createDetailedHelpEmbed(message).catch(console.error);
                message.author.createDM().then(dm => dm.send(helpEmbed))
                    .catch(console.error)
                    .then(message.reply('I\'ve sent you some information'));
            }
            else {
                let helpEmbed = await createHelpEmbed(message).catch(console.error);
                message.channel.send(helpEmbed);
            }
            break;
        case `${prefix}hello`:
            message.react('👋');
            break;
        case `${prefix}userinfo`:
            let user =  message.mentions.members.first() || message.guild.members.find(x => x.user === message.author);
            let userEmbed = await createUserInfoEmbed(user);
            message.channel.send(userEmbed);
            break;
        case `${prefix}serverinfo`:
            let serverEmbed = await createServerInfoEmbed(message);
            message.channel.send(serverEmbed);
            break;
        case `${prefix}colour`:
            if (!message.member.colorRole) {
                //No colorRole, create a new role
                let role = await getNewRole(message);
                await message.member.addRole(role).catch(console.error);
            }
            await message.member.colorRole.setColor(getColour(args))
                .then(updated => message.reply(`colour set to ${updated.hexColor}`))
                .catch(console.error);
            break;
        case `${prefix}call`:
            await createVoiceChannel(message, args);
            break;
        case `${prefix}cleanup`:
            cleanUp(message, args).catch(console.error);
            break;
        case `${prefix}question`:
            //TODO: obviously needs to be cleaned up and moved
            let questions = await getQuestionsObject() || [];

            if (args[0] === 'get') {
                console.log(questions);
                return;
            }

            if (args[0] === 'ask') {
                if (askingQuestion) {
                    message.reply(`please wait for ${currAsker} to answer first.`);
                    return;
                }

                let randIndex = Math.floor(Math.random() * questions.length);
                await createQuestionEmbed(message, questions[randIndex])
                    .then(embed => message.channel.send(embed).catch(console.error))
                    .catch(console.error);

                askingQuestion = true;
                currAnswer = questions[randIndex].answer;
                currAsker = message.author.username;

                return;
            }

            if (args[0] === 'answer') {
                if (!askingQuestion) {
                    message.reply('please ask a question first!');
                }
                else if (Array.prototype.join.call(args.slice(1), " ") === currAnswer) {
                    message.reply('^-^ yaaay~ you did it senpai! :)))');
                }
                else message.reply('v-v wrong answer sir.....:(.......');
                askingQuestion = false;
                return;
            }

            let newQuestion = await {
                question: args[0],
                image: await message.attachments.first().url,
                answer: Array.prototype.join.call(args.slice(1), " ")
            };

            questions.push(newQuestion);
            fs.writeFile("./data/questions.json", JSON.stringify(questions, null, 4), () => console.error);
            break;
        default:
            message.reply(`${command} is not a recognized command!`);
    }
}

//Discord-related helper functions
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

async function createServerInfoEmbed(message) {
    let roles = await getRolesString(message.guild.roles);
    return new Discord.RichEmbed()
        .setTitle(`Server info - ${message.guild.name}`)
        .setImage(message.guild.iconURL)
        .setColor('BLUE')
        .addField('Current roles:', `${roles || "None"}`)
        .addField('Server created:', message.guild.createdAt)
        .addField('Current channel topic:', `${message.channel.topic || 'None'}`);
}

async function createHelpEmbed(message) {
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
        .setFooter(`[Arguments] are mostly optional. Type ${prefix}help detailed for more info.`);
}

async function createDetailedHelpEmbed(message) {
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
            `Defaults to removing all roles named ${botRole} (bot-created role name).` +
            ' Otherwise removes all roles with the specified name.\n' +
            '```>cleanup calls [call name]```' +
            'Call name is required. Removes all voice channels with the specified name.\n')
        .addField('Information:', '```>help [detailed?]```' +
            'Sends a message in the current channel displaying the commands available.' +
            ' If `true` or `detailed` is supplied, a direct message with command descriptions is sent instead.\n' +
            '```>userinfo [@username]```' +
            'Sends a message in the current channel displaying information about the the current user.' +
            ' If a mention `@username` is supplied, information about that user is sent instead.\n' +
            '```>serverinfo```' +
            'Sends a message in the current channel displaying information about the current server.\n')
        .addField('Colour:', '```>colour [0-255] [0-255] [0-255]```' +
            'Gives the user a colour using supplied red, green and blue values. If none are supplied,' +
            ' the values are randomized. If the user has a role which controls their colour, that role is changed.' +
            ' If not, a role is created and given to them.\n')
        .addField('Call:', '```>call [call name] [@users to allow]```' +
            'Call name is required. Creates a private voice channel with the specified name. All permissions are ' +
            ' disabled for everyone but the user that requested the call. If other users are mentioned (`@username`)' +
            ' they will also be given permissions. If you want a call to be public, use the `@everyone` mention.\n')
        .setFooter('Not complete yet. This will have more info later.');
}

async function createQuestionEmbed(message, question) {
    let member = await message.guild.members.find(x => x.user === message.author);
    return new Discord.RichEmbed()
        .setTitle(`Question for ${message.author.username}`)
        .setImage(question.image)
        .setColor(member.colorRole ? member.colorRole.color : 'BLUE')
        .addField('Question:', `${question.question}`);
}

async function getRolesString(rolesCollection) {
    let roles = "";
    await rolesCollection.forEach(entry => {
        roles += entry;
        roles += ', ';
    });
    return roles = roles.slice(0, -2); //Remove trailing comma and space
}

async function createVoiceChannel(message, args) {
    if (!args[0]) {
        message.reply('please provide a name for the channel!');
        return;
    }
    //TODO: check this earlier before any guild-related commands are chosen
    if (!message.guild.available) {
        message.reply('I can\'t do that');
        return;
    }

    //Disable all permissions for users, enable them for author
    //Stored in a bitfield so we negate 0 for all 1s
    let channel = await message.guild.createChannel(args[0], 'voice', [
        { id: message.guild.id, deny: ~0},
        { id: message.author.id, allow: ~0 }
        ]).catch(console.error);
    //and mentions
    message.mentions.members.forEach(async mention => {
            await channel.overwritePermissions(mention, {
                CONNECT: true,
                VIEW_CHANNEL: true,
                SPEAK: true
            }).catch(console.error);
        }
    );

    if (message.mentions.everyone) {
        await channel.overwritePermissions(message.guild.id, {
            CONNECT: true,
            VIEW_CHANNEL: true,
            SPEAK: true
        }).catch(console.error);
    }

    let category = await message.guild.channels.find(x => x.type === 'category' && x.name === 'Voice Channels');
    if (category) channel.setParent(category).catch(console.error);
}

function getColour(args) {
    let colour = [];
    //User supplied rgb values
    if (!isNaN(args[0]) && !isNaN(args[1]) && !isNaN(args[2])) {
        colour[0] = clamp(args[0], 1, 255);
        colour[1] = clamp(args[1], 1, 255);
        colour[2] = clamp(args[2], 1, 255);
    }
    //Otherwise generate a random colour
    else {
        colour[0] = getRandomInt(1,256);
        colour[1] = getRandomInt(1,256);
        colour[2] = getRandomInt(1,256);
    }
    return colour;
}

async function getNewRole(message) {
    return await message.guild.createRole({
        name: botRole,
        color: 'GREY',
        permission: [],
    }).catch(console.error);
}

async function cleanUp(message, args) {
    if (args[0] === 'roles') {
        let roleToDelete = Array.prototype.join.call(args.slice(1), " ") || botRole;

        message.guild.roles.forEach(entry => {
            if (entry.name === roleToDelete) entry.delete().catch(() => {
                message.reply(`couldn't remove the ${entry.name} role for some reason >:(`);
            });
        });
        message.reply(`cleaning up roles named ${roleToDelete}`);
    }
    else if (args[0] === 'messages') {
        let messages = await message.channel.fetchMessages({limit: args[1] || 10}).catch(console.error);
        let user = message.mentions ? message.mentions.members.first() : null;

        if (user) messages = messages.filter(x => x.author.id === user.id);

        await message.channel.bulkDelete(messages);
        message.reply(`I searched through the last ${args[1] || 10}` +
            ` messages and deleted ${messages.size} messages by ${user || 'everyone'}`);
    }
    else if (args[0] === 'calls') {
        if (!args[1]) {
            message.reply('please enter a channel name.');
            return;
        }
        let channelName = Array.prototype.join.call(args.slice(1), " ");
        let channels = message.guild.channels.filter(x => x.name === channelName && x.type === 'voice');
        channels.forEach(entry => {
            entry.delete();
        });
        message.reply(`removed ${channels ? channels.size : 0} channels named ${channelName}`);
    }
    else {
        message.reply('I don\'t know how to clean that up');
        return;
    }

    message.reply('all done');
}

async function getQuestionsObject() {
    return await readFile('./data/questions.json').then(data => JSON.parse(data)).catch(console.error);
}

//Helper functions
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}

//TODO: add reasons to commands to log who called the command
