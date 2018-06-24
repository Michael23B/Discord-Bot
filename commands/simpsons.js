const superagent = require('superagent');
const Discord = require('discord.js');

const numberFilter = (reaction) => reaction.emoji.name === '1⃣' || reaction.emoji.name === '2⃣'
    || reaction.emoji.name === '3⃣' || reaction.emoji.name === '4⃣'
    || reaction.emoji.name === '5⃣' || reaction.emoji.name === '6⃣';

const nextPrevFilter = (reaction) => reaction.emoji.name === '⏮' || reaction.emoji.name === '⏭';

const voteReactions = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣'];

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
        await message.channel.send(``, {files: [imgUrl]});
        loadingMsg.delete();
        return;
    }

    //Retrieve information about a few frames from the results object
    let sampleFrames = await getSampleFrameData(resultsObj);

    //Create an embed with the sample frame info for users to vote on
    let embed = getSampledFramesEmbed(sampleFrames, query);

    loadingMsg.delete();
    let voteMessage = null;
    let winningIndex;

    //If there are multiple frames, we wait for users to vote
    if (embed) {
        voteMessage = await message.channel.send(embed);
        winningIndex = await awaitWinningFrame(voteMessage, 10000, sampleFrames.length).catch(console.error);
    }
    else winningIndex = 0;

    let imgUrl = buildImageUrl(sampleFrames[winningIndex].Frame.Episode, sampleFrames[winningIndex].Frame.Timestamp);

    let frameMessage = await message.channel.send(await getImageEmbed(imgUrl, query, sampleFrames[winningIndex].Frame.Timestamp));
    if (voteMessage) voteMessage.delete();

    //TODO: put all this in it's own function
    //start loop of waiting for next and prev reactions
    //if none are chosen remove the reactions and stop checking
    let frameChange;
    let nearbyIndex = 3;
    let nearby;

    while (true) {
        frameChange = await awaitFrameChange(frameMessage, 6500);
        if (!frameChange) break;

        if (frameChange === 'next') {
            nearby = sampleFrames[winningIndex].Nearby;
            nearbyIndex++;
            //Reached the final nearby frame, get the info for that last frame so we get a new set of nearby frames
            if (nearbyIndex >= nearby.length) {
                sampleFrames[winningIndex] = await getFrameData(nearby[nearby.length - 1].Episode,
                                                                nearby[nearby.length - 1].Timestamp);
                nearbyIndex = 4;
                nearby = sampleFrames[winningIndex].Nearby;
            }
            imgUrl = await buildImageUrl(nearby[nearbyIndex].Episode, nearby[nearbyIndex].Timestamp);
        }
        else {
            nearby = sampleFrames[winningIndex].Nearby;
            nearbyIndex--;

            if (nearbyIndex < 0) {
                sampleFrames[winningIndex] = await getFrameData(nearby[0].Episode,
                    nearby[0].Timestamp);
                nearbyIndex = 2;
                nearby = sampleFrames[winningIndex].Nearby;
            }
            imgUrl = await buildImageUrl(nearby[nearbyIndex].Episode, nearby[nearbyIndex].Timestamp);
        }

        await frameMessage.delete();
        frameMessage = await message.channel.send(await getImageEmbed(imgUrl, query, nearby[nearbyIndex].Timestamp));
    }

    frameMessage.clearReactions().catch(console.error);
};

module.exports.aliases = ['simpsons', 'simpson'];

function getSampledFramesEmbed(info, query) {
    if (info.length === 1) return null;

    let embed = new Discord.RichEmbed()
        .setTitle(`Results for "${query}"`)
        .setColor('GOLD')
        .setFooter('React to select image.');

    for (let i = 0; i < info.length; ++i) {
        embed.addField(`${i+1}. Season ${info[i].Episode.Season} | Episode ${info[i].Episode.EpisodeNumber}`,
            `Title: \`${info[i].Episode.Title}\`\nSubtitles: \`${info[i].Subtitles[0].Content}\``)
    }

    return embed;
}
//TODO: find the Subtitles[].Content that matches the timestamp most closely instead of using [0]

function getImageEmbed(imgUrl, query, timeStamp) {
    return new Discord.RichEmbed()
        .setTitle(`Result for "${query}" - Frame ${timeStamp}`)
        .setColor('GOLD')
        .setImage(imgUrl)
        .setFooter('React to go to the next or previous frame.');
}

//Awaits reactions on the voteMessage for timeToWait and then returns an array index for the winning frame
async function awaitWinningFrame(voteMessage, timeToWait, count) {
    for (let i = 0; i < count; ++i) {
        await voteMessage.react(voteReactions[i]).catch(console.error);
    }

    return await voteMessage.awaitReactions(numberFilter, { time: timeToWait })
        .then(collected => selectWinningEmoji(collected))
        .catch(console.error);
}

//Await next/prev reactions and returns a url to the selected frame or null if none are chosen
async function awaitFrameChange(message, timeToWait) {
    await message.react('⏮').catch(console.error);
    await message.react('⏭').catch(console.error);

    return await message.awaitReactions(nextPrevFilter, { time: timeToWait })
        .then(collected => determineNextOrPrev(collected))
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
        case '5⃣':
            return 4;
        case '6⃣':
            return 5;
        default:
            return 0;
    }
    //TODO: Could probably extract the number out of this instead of the switch case, same deal with the voteReactions[]
}

function determineNextOrPrev(collected) {
    let maxCount = 1;
    let result = null;

    collected.forEach(entry => {
        if (entry.count > maxCount) {
            maxCount = entry.count;
            if (entry._emoji.name === '⏮') result = 'prev';
            else if (entry._emoji.name === '⏭') result = 'next';
        }
    });

    return result;
}

async function getSampleFrameData(results) {
    let episodeFrameMap = [];
    //Find up to 4 frames from distinct episodes
    for (let i = 0; i < results.length; ++i) {
        if (episodeFrameMap.length === 4) break;

        //If we don't have a frame from this episode, add this episode/frame pair
        if (!episodeFrameMap.find(x => x.Episode === results[i].Episode)) {
            episodeFrameMap.push({Episode: results[i].Episode, Timestamp: results[i].Timestamp});
        }
    }

    let frameData = [];

    //Get the frame data for each episodes chosen frame
    for (let i = 0; i < episodeFrameMap.length; ++i) {
        await frameData.push(await getFrameData(episodeFrameMap[i].Episode, episodeFrameMap[i].Timestamp));
    }

    return frameData;
}

//Gets the json object for this episode/frame pair
async function getFrameData(episode, frame) {
    let url = buildFrameUrl(episode, frame);

    return await superagent.get(url)
        .then(res => res.body)
        .catch(console.error);
}

//Frinkiac URLs
function buildImageUrl(episode, frame) {
    return `https://frinkiac.com/img/${episode}/${frame}.jpg`;
}

function buildQueryUrl(query) {
    return query ? `https://frinkiac.com/api/search?q=${query}` : 'https://frinkiac.com/api/random';
}

function buildFrameUrl(episode, frame) {
    return `https://frinkiac.com/api/caption?e=${episode}&t=${frame}`;
}
