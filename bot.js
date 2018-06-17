const settings = require('./settings.json');
const Discord = require('discord.js');
const fs = require('fs');

//Setup bot
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.botRoleName = '^-^';
client.prefix = settings.prefix;

client.on('ready', async () => {
    console.log(client.user.username + ' ready for deployment sir.\n');
    //let link = await client.generateInvite(['ADMINISTRATOR']).catch(console.error);
    //console.log(`To add me to a server, go here sir:\n ${link}`);
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return; //TODO: allow some commands in dm channel (like help)
    if (!message.content.startsWith(client.prefix)) return;

    let args = message.content.split(' ');
    let command = args[0];
    args = args.splice(1);

    let cmd = client.commands.get(command.slice(client.prefix.length));
    if (cmd) cmd.run(client, message, args);
    else message.reply(`${command} is not a recognized command!`);
});

//Read commands from files
fs.readdir('./commands/', (err, files) => {
    if (err) console.error(err);

    if (files.length === 0) {
        console.log('No commands in ./commands/');
        return;
    }
    console.log(`Commands found (${files.length}):`);
    files.forEach((file, number) => {
        let cmdName = file.split('.')[0];
        let props = require(`./commands/${file}`);
        client.commands.set(cmdName, props);
        console.log(`${number + 1}. ${client.prefix}${cmdName} | Located "./commands/${file}"`);
    });
});

client.login(settings.token).catch(console.error);

//TODO: check for permissions before allowing some commands
//TODO: add reasons to commands to log who called the command
//TODO: add alias for some commands. like typing >q instead of >question
