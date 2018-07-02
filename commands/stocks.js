const helpers = require('../helpers');
const Discord = require('discord.js');

const adjustFrequency = 600000; //Adjust market every ten minutes
const adjustVariationRange = 60000;
let lastAdjustTime;
let nextAdjustTime;

const basePrices = {"🍎": 2, "🍅": 2, "🍇": 3, "🍓": 4, "🍒": 3, "🍆": 5, "🍯": 10, "🥑": 8, "🐟": 5, "🐠": 12,
    "🐡": 15, "🐬": 40, "🐊": 55, "🦑": 72, "🦈": 98, "🐳": 150, "🕶": 34, "💍": 100, "👑": 250,
    "🛵": 300, "🚗": 800, "🏎": 2200, "🏠": 5200, "🏡": 9400, "🚁": 4555, "✈": 12365, "🚀": 85220};
let prevPrices = {};
let currPrices;

module.exports.run = async(client, message, args) => {
    updateStockPrices();

    let stockMarketStringArr = Object.keys(currPrices).map(key => {
        let priceString = currPrices[key].toString();
        let trendEmoji = currPrices[key] > prevPrices[key] ? '📈' : currPrices[key] === prevPrices[key] ? '➡' : '📉';
        return trendEmoji + key.toString() + '$' + priceString + '\n';
    });

    message.channel.send(createStockEmbed(stockMarketStringArr)).catch(console.error);
};

module.exports.getCurrentPrices = function() {
    updateStockPrices();
    return currPrices;
};

module.exports.getNextAdjustTime = function() {
    updateStockPrices();
    return nextAdjustTime;
};

module.exports.aliases = ['stocks', 'stockmarket', 'market'];
module.exports.permissions = ['SEND_MESSAGES', 'EMBED_LINKS'];

function updateStockPrices() {
    if (!currPrices) currPrices = basePrices;

    let currTime = new Date().getTime();
    if (!nextAdjustTime || currTime >= nextAdjustTime) {
        let adjustCount = lastAdjustTime ? (currTime - lastAdjustTime) / adjustFrequency : 1;

        lastAdjustTime = currTime;
        nextAdjustTime = currTime + adjustFrequency + helpers.getRandomInt(adjustVariationRange * -1, adjustVariationRange);

        for (let i = 0; i < adjustCount; ++i) adjustMarketPrices();
    }
}

function createStockEmbed(arr) {
    let date = new Date();

    let arrThird = arr.length / 3;
    let col1 = arr.map((key, i) => { return i < arrThird ? key : ''}).join('');
    let col2 = arr.map((key, i) => { return i < (arrThird*2) && i >= arrThird  ? key : ''}).join('');
    let col3 = arr.map((key, i) => { return i >= (arrThird*2) ? key : ''}).join('');

    return new Discord.RichEmbed()
        .setTitle(`Market prices | ${date.toDateString()} - ${date.toLocaleTimeString()}`)
        .addField(`♿ 💲`, col1, true)
        .addField(`💸👨`, col2, true)
        .addField(`🔫👨💰💎`, col3, true)
        .setColor('BLUE')
        .setFooter(`Next stock market shift at ${new Date(nextAdjustTime).toLocaleTimeString()}`);
}

function adjustMarketPrices() {
    Object.keys(currPrices).map(key => {
        prevPrices[key] = currPrices[key];
        currPrices[key] = Math.max(adjustPrice(key), 1);
    });
}

function adjustPrice(key) {
    //Prices can shift up to 5% of their current price + 5% of their base price
    let priceChangeRange = Math.floor((currPrices[key] * 0.05) + (basePrices[key] * 0.05));
    //If a value is too small to get a change from percentages, give it a small chance to shift anyway
    if (priceChangeRange === 0) {
        if (helpers.getRandomBool(0.15 + (basePrices[key] / 100))) priceChangeRange = 1;
    }
    return currPrices[key] + helpers.getRandomInt(priceChangeRange * -1, priceChangeRange + 1)
}
