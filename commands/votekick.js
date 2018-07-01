const Discord = require('discord.js');

const voteFilter = (reaction) => reaction.emoji.name === '❌' || reaction.emoji.name === '✅';
const cooldown = 600000;
const votingTime = 30000;

module.exports.run = async(client, message, args) => {
    let cd = client.checkCooldown(this.aliases[0], message.author.id);
    if (cd > 0) {
        message.reply(`wait ${cd / 1000} seconds before using this command again.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let target = message.mentions.members.first();

    if (!target) {
        message.reply(`you must mention a user (\`@username\`) to kick them.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    if (!target.kickable) {
        message.reply(`I am not able to kick ${target.user.username}. Their power level is even greater than my own.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }
    //Enable the code block to allow only those with higher privileges to vote-kick lower users
    /*
    let isOwner = message.guild.owner === message.member;

    //Compare permissions to target
    if (target !== message.member) {
        if ((target.hasPermission('ADMINISTRATOR', false, true, true)
            || target.highestRole.position >= message.member.highestRole.position)
            && !isOwner) {
            message.reply(`${target.user.username} has a power level equal to or greater than yours.`)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
            return;
        }
    }
    */
    client.startCooldown(this.aliases[0], message.author.id, new Date().getTime() + cooldown);

    let votesNeeded = (message.guild.memberCount / 2) + 1;
    let embed = getVoteEmbed(target, message.member, votesNeeded, new Date().getTime() + votingTime);
    let voteMessage = await message.channel.send(embed);

    let voteResult = await awaitVotes(voteMessage, votingTime);

    if (voteResult < votesNeeded) {
        message.channel.send(`${target.user.username} did not receive enough votes to be kicked. (${voteResult}/${votesNeeded})`)
            .catch(console.error);
        return;
    }

    await target.kick(`${message.author.username} voted to kick.`).then(() => {
        message.channel.send(`${target.user.username} has been kicked.`).catch(console.error);
    }).catch(() => {
        message.reply(`couldn't kick ${target.user.username}. Their power level is even greater than my own.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    });
};

module.exports.aliases = ['votekick', 'kick'];
module.exports.permissions = ['SEND_MESSAGES', 'ADD_REACTIONS'];

function getVoteEmbed(memberToKick, memberWhoInitiated, votesNeeded, endTime) {
    return new Discord.RichEmbed()
        .setTitle(`Voting to kick ${memberToKick.user.username}`)
        .addField('Votes needed: ', votesNeeded)
        .addField('Votes will be counted at:', new Date(endTime).toLocaleTimeString())
        .setImage(memberToKick.user.displayAvatarURL)
        .setColor('DARK_RED')
        .setFooter(`Vote initiated by ${memberWhoInitiated.user.username}`);
}

async function awaitVotes(voteMessage, timeToWait) {
    await voteMessage.react('❌');
    await voteMessage.react('✅');

    return await voteMessage.awaitReactions(voteFilter, { time: timeToWait })
        .then(collected => countVotes(collected))
        .catch(console.error);
}

function countVotes(collected) {
    let votes = 0;

    collected.forEach(v => {
        //We increment/decrement votes once before counting because the bot reactions only are counted if at least one
        //other person reacted to them. eg. 1 no vote (bot only), 2 yes vote (bot + 1 person) = no vote doesn't get collected.
        if (v._emoji.name === '❌') {
            votes++;
            votes -= v.count;
        }
        if (v._emoji.name === '✅') {
            votes--;
            votes += v.count;
        }
    });

    return votes;
}
