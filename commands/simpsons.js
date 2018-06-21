const superagent = require('superagent');
const Discord = require('discord.js');

module.exports.run = async(client, message, args) => {
    let query = Array.prototype.join.call(args.slice(0), " ");

    let resultsObj = await superagent.get(`https://frinkiac.com/api/search?q=${query}`)
        .then(res => res.body)
        .catch(console.error);

    let imgUrl1 = `https://frinkiac.com/img/${resultsObj[0].Episode}/${resultsObj[0].Timestamp}.jpg`;
    let imgUrl2 = `https://frinkiac.com/img/${resultsObj[1].Episode}/${resultsObj[1].Timestamp}.jpg`;
    let imgUrl3 = `https://frinkiac.com/img/${resultsObj[2].Episode}/${resultsObj[2].Timestamp}.jpg`;
    let imgUrl4 = `https://frinkiac.com/img/${resultsObj[3].Episode}/${resultsObj[3].Timestamp}.jpg`;

    message.channel.send('test', {files: [imgUrl1,imgUrl2,imgUrl3,imgUrl4]});
};

module.exports.aliases = ['simpsons', 'simpson'];

function extractUrlFromGetResult(result) {
    let stringRes = JSON.stringify(result);
    let obj = JSON.parse(stringRes);
    console.log(obj.text);
    //return obj.req.url;
}
