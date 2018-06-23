const superagent = require('superagent');
const Discord = require('discord.js');

const filter = (reaction) => reaction.emoji.name === '1⃣'
    || reaction.emoji.name === '2⃣'
    || reaction.emoji.name === '3⃣'
    || reaction.emoji.name === '4⃣';

module.exports.run = async(client, message, args) => {
    let loadingMsg = await message.channel.send('Searching Simpsons database...').catch(console.error);

    let query = Array.prototype.join.call(args.slice(0), " ");
    let url = buildQueryUrl(query);

    let resultsObj = await superagent.get(url)
        .then(res => res.body)
        .catch(console.error);

    if (!resultsObj || resultsObj.length === 0) {
        loadingMsg.edit(`Couldn't find any frames from the query "${query}"`);
        return;
    }

    if (!query) { //If we have no query, we got a random image
        let imgUrl = buildImageUrl(resultsObj.Frame.Episode, resultsObj.Frame.Timestamp);
        await message.channel.send(`Result for random search`, {files: [imgUrl]});
        return;
    }

    //Retrieve information about a few frames from the results object
    let sampleFrames = await getSampleFrameData(resultsObj);
    console.log(sampleFrames);
    return;
    //Create an embed with the sample frame info for users to vote on
    let embed = getSampledFramesEmbed(sampleFrames, query);

    let voteMessage = await message.channel.send(embed);
    loadingMsg.delete();

    let winningIndex = await awaitWinningFrame(voteMessage, 10000).catch(console.error);

    let imgUrl = buildImageUrl(resultsObj[winningIndex].Episode, resultsObj[winningIndex].Timestamp);

    message.channel.send(await getImageEmbed(imgUrl, query, winningIndex));
    voteMessage.delete();
};
module.exports.aliases = ['simpsons', 'simpson'];

function getSampledFramesEmbed(info, query) {
    return new Discord.RichEmbed()
        .setTitle(`Results for "${query}"`)
        .setColor('GOLD')
        .addField(`1. Season ${info[0].Episode.Season} | Episode ${info[0].Episode.EpisodeNumber}`,
            `Title: \`${info[0].Episode.Title}\`\nSubtitles: \`${info[0].Subtitles[0].Content}\``, true)
        .addField(`2. Season ${info[1].Episode.Season} | Episode ${info[1].Episode.EpisodeNumber}`,
            `Title: \`${info[1].Episode.Title}\`\nSubtitles: \`${info[1].Subtitles[0].Content}\``, true)
        .addField(`3. Season ${info[2].Episode.Season} | Episode ${info[2].Episode.EpisodeNumber}`,
            `Title: \`${info[2].Episode.Title}\`\nSubtitles: \`${info[2].Subtitles[0].Content}\``, true)
        .addField(`4. Season ${info[3].Episode.Season} | Episode ${info[3].Episode.EpisodeNumber}`,
            `Title: \`${info[3].Episode.Title}\`\nSubtitles: \`${info[3].Subtitles[0].Content}\``, true)
        .setFooter('React to select image.');
}

function getImageEmbed(imgUrl, query, winningIndex) {
    return new Discord.RichEmbed()
        .setTitle(`Result for "${query}" - Frame ${winningIndex + 1}`)
        .setColor('GOLD')
        .setImage(imgUrl)
        .setFooter('React to go to the next or previous frame.');
}

//Awaits reactions on the voteMessage for timeToWait and then returns an array index for the winning frame
async function awaitWinningFrame(voteMessage, timeToWait) {
    await voteMessage.react('1⃣').catch(console.error);
    await voteMessage.react('2⃣').catch(console.error);
    await voteMessage.react('3⃣').catch(console.error);
    await voteMessage.react('4⃣').catch(console.error);

    return await voteMessage.awaitReactions(filter, { time: timeToWait })
        .then(collected => selectWinningEmoji(collected))
        .catch(console.error);
}

//Returns a number based on the emoji with the most reactions
function selectWinningEmoji(collected) {
    let maxCount = 1;
    let winningEmoji = '1⃣';

    collected.forEach(entry => {
        if (entry.count > maxCount) {
            maxCount = entry.count;
            winningEmoji = entry._emoji.name;
        }
    });

    switch (winningEmoji) {
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

async function getSampleFrameData(results) {
    let episodeFrameMap = {};
    //Find up to 3 frames from distinct episodes
    for (let i = 0; i < results.length; ++i) {
        if (Object.keys(episodeFrameMap).length === 3) break;

        //Property name = episode, property value = timestamp
        if (!episodeFrameMap.hasOwnProperty(results[i].Episode)) {
            let entryName = results[i].Episode;
            episodeFrameMap[entryName] = results[i].Timestamp;
        }
    }

    let frameData = [];

    //Get the frame data for each episodes chosen frame, as well as two nearby frames
    await Object.keys(episodeFrameMap).forEach(async key => {
        frameData.push(await getFrameData(key, episodeFrameMap[key]));

        let nearbyFrame1 = frameData[frameData.length - 1].Nearby.first();
        let nearbyFrame2 = frameData[frameData.length - 1].Nearby.last();

        frameData.push(await getFrameData(key, nearbyFrame1));
        frameData.push(await getFrameData(key, nearbyFrame2));
    });

    return frameData;
}

async function getFrameData(episode, frame) {
    let url = buildFrameUrl(episode, frame);

    return await superagent.get(url)
        .then(res => res.body)
        .catch(console.error);
}

function buildImageUrl(episode, frame) {
    return `https://frinkiac.com/img/${episode}/${frame}.jpg`;
}

function buildQueryUrl(query) {
    return query ? `https://frinkiac.com/api/search?q=${query}` : 'https://frinkiac.com/api/random';
}

function buildFrameUrl(episode, frame) {
    return `https://frinkiac.com/api/caption?e=${episode}&t=${frame}`;
}

//First get each unique episode based on the given quote
//Next generate a result object for each episodes frame
//Then get the image at that frame using this url - https://frinkiac.com/api/caption?e=S05E03&t=512110
//Using that object we can move forward and backwards a few frames at a time using react emojis
