const Discord = require('discord.js');
const fs = require('fs');
const helpers = require('./helpers.js');
const settings = {};
const path = require("path");
const dataDir = path.join(process.cwd(), 'data/');
const Cloud = require('./googleCloud.js');
const ignoredServerIds = process.env.IGNORED_SERVER_IDS ? JSON.parse(process.env.IGNORED_SERVER_IDS) : {};

if (fs.existsSync('./settings.json')) {
    let settingsFile = require('./settings.json');
    Object.keys(settingsFile).forEach(key => {
        settings[key] = settingsFile[key];
    });
}
else {
    console.log('Couldn\'t find settings.json. Attempting to find environment variables...');

    settings.token = process.env.BOT_API_TOKEN;
    settings.prefix = process.env.BOT_PREFIX;
    settings.messageLifeTime = process.env.BOT_MESSAGE_LIFETIME;

    if (!settings) console.log('Couldn\'t find necessary environment variables.');
}

//If we can't find our data files, create them
if (!fs.existsSync(dataDir))
    fs.mkdirSync(dataDir);
if (!fs.existsSync('./data/questions.json'))
    fs.writeFileSync('./data/questions.json', JSON.stringify([], null, 4), () => console.error);
if (!fs.existsSync('./data/inventories.json'))
    fs.writeFileSync('./data/inventories.json', JSON.stringify({}, null, 4), () => console.error);

//Setup bot
const client = new Discord.Client();
setupBotProperties();

client.on('ready', async () => {
    console.log(client.user.username + ' ready for deployment sir.\n');
    let link = await client.generateInvite(['ADMINISTRATOR']).catch(console.error);
    console.log(`To add me to a server, go here sir:\n ${link}`);
});

client.on('guildCreate', async guild => {
    guild.channels.find(channel => channel.type === 'text')
        .send('Hello sirs, you may type `>help` if you want to know the full extent of my power.').catch(console.error);
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return; //TODO: allow some commands in dm channel (like help)
    if (!message.content.startsWith(client.prefix)) return;

    if (ignoredServerIds[message.guild.id]) return;

    let args = message.content.split(' ');
    let command = args[0].toLowerCase();
    args = args.splice(1);

    let cmd = client.commands.get(command.slice(client.prefix.length));

    if (!cmd) {
        await message.reply(`${command} is not a recognized command!`).then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    if (!message.member.hasPermission(cmd.permissions, false, true, true)) {
        let reqCommands = '[' + cmd.permissions.join(', ') + ']';

        await message.reply(`your power level is too low to use that command.` +
            ` You require all of the following commands: ${reqCommands}.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    if (message.member.roles.find(x => x.name === client.botRoleNameDisabled)) {
        await message.reply(`you're not allowed to use bot commands.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    cmd.run(client, message, args);
});

//Read commands from files
//Command files are .js files that export a 'run(client, message, args)' and 'aliases[]'
fs.readdir('./commands/', (err, files) => {
    if (err) console.error(err);

    if (files.length === 0) {
        console.log('No commands in ./commands/');
        return;
    }

    console.log(`${files.length} command files found:`);
    files.forEach((file, number) => {
        let cmdName = file.split('.')[0];
        let props = require(`./commands/${file}`);

        //Allow access to the command through each alias
        props.aliases.forEach(alias => {
            client.commands.set(alias, props);
        });

        console.log(`${number + 1}. ${client.prefix}${cmdName} -> [${props.aliases}]`);
    });
});

client.login(settings.token).catch(console.error);

function setupBotProperties() {
    client.commands = new Discord.Collection();
    client.botRoleName = '^-^';
    client.botRoleNameDisabled = 'bot use disabled';
    client.prefix = settings.prefix;
    client.msgLife = settings.messageLifeTime;

    //Command cooldowns
    client.cooldowns = {};
    //If there is no cooldown for that command, creates one then starts a cooldown for the requested player
    client.startCooldown = function(cmdName, userId, endDate) {
        if (!client.cooldowns.hasOwnProperty(cmdName)) client.cooldowns[cmdName] = [];
        client.cooldowns[cmdName].push({userId: userId, endDate: endDate})
    };
    client.checkCooldown = function(cmdName, userId) {
        if (!client.cooldowns.hasOwnProperty(cmdName) || client.cooldowns[cmdName].count === 0) return 0;

        let index = client.cooldowns[cmdName].findIndex(x => x.userId === userId);
        if (index === -1) return 0;
        else {
            let currDate = new Date().getTime();
            let endDate = client.cooldowns[cmdName][index].endDate;
            if (currDate >= endDate) {
                client.cooldowns[cmdName].splice(index, 1);
                return 0;
            }
            else return endDate - currDate;
        }
    };

    //Player statistics
    client.inventories = (() => {
        let raw = fs.readFileSync('./data/inventories.json');
        return JSON.parse(raw);
    })();
    client.savePlayerInventory = async function() {
        await fs.writeFile("./data/inventories.json", JSON.stringify(client.inventories, null, 4), () => console.error);
        if (Cloud.ACTIVE) Cloud.uploadDataFilesToGoogleCloud(true, false).catch(console.error);
    };
    //Creates a new inventory for the player if one doesn't already exist, then returns the inventory of that player
    client.getInventoryFor = function(userId) {
        if (!client.inventories.hasOwnProperty(userId)) {
            client.inventories[userId] = helpers.updateInventory({});
        }
        return client.inventories[userId];
    };
    client.setInventoryFor = function(userId, inventory) {
        client.inventories[userId] = inventory;
    };
    client.changeItemAmountFor = function(userId, item, amount) {
        let inventory = client.getInventoryFor(userId);
        inventory[item] += amount;
        client.setInventoryFor(userId, inventory);
    };

    //Save player stats every so often in case the bot goes down (25 min)
    setInterval(client.savePlayerInventory, 1500000);
    //Updates the inventories of each player, in case the items array has changed (found in the helpers.js file)
    Object.keys(client.inventories).forEach(id => {
        client.inventories[id] = helpers.updateInventory(client.inventories[id]);
    });

    if (Cloud.ACTIVE) Cloud.getDataFilesFromGoogleCloud(client).catch(console.error);
}

//TODO: add reasons to commands to log who called the command
//TODO: check own permissions before trying commands
