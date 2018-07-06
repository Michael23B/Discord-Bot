module.exports.run = async(client, message, args) => {
    cleanUp(client, message, args).catch(console.error);
};

module.exports.aliases = ['cleanup', 'clean', 'remove', 'delete'];
module.exports.permissions = ['SEND_MESSAGES', 'READ_MESSAGE_HISTORY'];

async function cleanUp(client, message, args) {
    let deleteCount = 0;

    if (args[0] === 'roles') {
        if (!message.member.hasPermission('MANAGE_ROLES', false, true, true)) {
            message.reply(`you can't cleanup roles without the MANAGE_ROLES permission.`)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
            return;
        }
        let roleToDelete = Array.prototype.join.call(args.slice(1), " ");
        if (!roleToDelete) {
            message.reply(`you need to provide the name of the role. \`>cleanup roles [name of role]\``)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
            return;
        }

        message.guild.roles.forEach(entry => {
            if (entry.name === roleToDelete) {
                entry.delete().catch(() => {
                    message.reply(`couldn't remove the ${entry.name} role for some reason >:(`)
                        .then(msg => msg.delete(client.msgLife)).catch(console.error);
                });
                deleteCount++;
            }
        });
        message.reply(`found ${deleteCount} roles named ${roleToDelete}. Getting rid of them now.`)
            .catch(console.error);
    }
    else if (args[0] === 'messages') {
        if (!message.member.hasPermission('MANAGE_MESSAGES', false, true, true)) {
            message.reply(`you can't cleanup messages without the MANAGE_MESSAGES permission.`)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
            return;
        }
        deleteCount = (args[1] && !isNaN(args[1])) ? Math.min(args[1], 100) : 10;
        let messages = await message.channel.fetchMessages({limit: deleteCount}).catch(console.error);
        let user = message.mentions ? message.mentions.members.first() : null;

        if (user) messages = messages.filter(x => x.author.id === user.id);

        await message.channel.bulkDelete(messages);
        message.reply(`I searched through the last ${deleteCount}` +
            ` messages and deleted ${messages.size} messages by ${user || 'everyone'}.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
    else if (args[0] === 'calls') {
        if (!message.member.hasPermission('MANAGE_CHANNELS', false, true, true)) {
            message.reply(`you can't cleanup calls without the MANAGE_CHANNELS  permission.`)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
            return;
        }
        if (!args[1]) {
            message.reply(`you need to provide the name of the call. \`>cleanup calls [name of call]\``)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
            return;
        }
        let channelName = Array.prototype.join.call(args.slice(1), " ");
        let channels = message.guild.channels.filter(x => x.name === channelName && x.type === 'voice');
        channels.forEach(entry => {
            entry.delete();
        });
        message.reply(`removed ${channels ? channels.size : 0} channels named ${channelName}`)
            .catch(console.error);
    }
    else {
        message.reply('I don\'t know how to clean that up. Try: `>clean messages [amount]`, `>clean roles [role name]` or `>clean calls [call name]`')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }
}
