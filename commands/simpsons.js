const superagent = require('superagent');
const Discord = require('discord.js');

const filter = (reaction) => reaction.emoji.name === '1⃣'
    || reaction.emoji.name === '2⃣'
    || reaction.emoji.name === '3⃣'
    || reaction.emoji.name === '4⃣';

module.exports.run = async(client, message, args) => {
    let loadingMsg = await message.channel.send('Searching Simpsons database...').catch(console.error);

    let query = Array.prototype.join.call(args.slice(0), " ");
    let url = query ? `https://frinkiac.com/api/search?q=${query}` : 'https://frinkiac.com/api/random';

    let resultsObj = await superagent.get(url)
        .then(res => res.body)
        .catch(console.error);

    if (!query) {
        let imgUrl = `https://frinkiac.com/img/${resultsObj.Frame.Episode}/${resultsObj.Frame.Timestamp}.jpg`;
        await message.channel.send(`Result for random search`, {files: [imgUrl]});
        return;
    }

    let info = await generateDetails(resultsObj);

    let embed = getResultsSampleEmbed(info, query);

    let msg = await message.channel.send(embed);
    loadingMsg.delete();

    await msg.react('1⃣').catch(console.error);
    await msg.react('2⃣').catch(console.error);
    await msg.react('3⃣').catch(console.error);
    await msg.react('4⃣').catch(console.error);

    let winningIndex = await msg.awaitReactions(filter, { time: 7500 })
        .then(collected => selectWinningEmoji(collected))
        .catch(console.error);

    let imgUrl = `https://frinkiac.com/img/${resultsObj[winningIndex].Episode}/${resultsObj[winningIndex].Timestamp}.jpg`;

    message.channel.send(await getImageEmbed(imgUrl, query, winningIndex));
    msg.delete();
};
module.exports.aliases = ['simpsons', 'simpson'];

function getResultsSampleEmbed(info, query) {
    return new Discord.RichEmbed()
        .setTitle(`Results for "${query}"`)
        .setColor('GOLD')
        .addField(`1.`, `**Title**: ${info[0].Episode.Title}\n**Subtitle**: ${info[0].Subtitles[0].Content}\n**Frame**: ${info[0].Frame.Timestamp}`)
        .addField(`2.`, `**Title**: ${info[1].Episode.Title}\n**Subtitle**: ${info[1].Subtitles[0].Content}\n**Frame**: ${info[1].Frame.Timestamp}`)
        .addField(`3.`, `**Title**: ${info[2].Episode.Title}\n**Subtitle**: ${info[2].Subtitles[0].Content}\n**Frame**: ${info[2].Frame.Timestamp}`)
        .addField(`4.`, `**Title**: ${info[3].Episode.Title}\n**Subtitle**: ${info[3].Subtitles[0].Content}\n**Frame**: ${info[3].Frame.Timestamp}`)
        .setFooter('React to select image.');
}

function getImageEmbed(imgUrl, query, winningIndex) {
    return new Discord.RichEmbed()
        .setTitle(`Result for "${query}" - Frame ${winningIndex + 1}`)
        .setColor('GOLD')
        .setImage(imgUrl)
        .setFooter('React to go to the next or previous frame.');
}


function selectWinningEmoji(collected) {
    let maxCount = 0;
    let maxEmoji = '1⃣';

    collected.forEach(entry => {
        if (entry.count > maxCount) {
            maxCount = entry.count;
            maxEmoji = entry._emoji.name;
        }
    });

    switch (maxEmoji) {
        case '1⃣':
            return 0;
        case '2⃣':
            return 1;
        case '3⃣':
            return 2;
        case '4⃣':
            return 3;
    }
}

async function generateDetails(results) {
    let frameData = [];

    for (let i = 0; i < 4; ++i) {
        frameData[i] = await getFrameInfo(results[i].Episode, results[i].Timestamp);
    }

    return frameData;
}

async function getFrameInfo(episode, frame) {
    let url = `https://frinkiac.com/api/caption?e=${episode}&t=${frame}`;

    return await superagent.get(url)
        .then(res => res.body)
        .catch(console.error);
}

//TODO: clean up the urls everywhere and replace with variables
