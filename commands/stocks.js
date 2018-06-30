const helpers = require('../helpers');

const adjustFrequency = 600000; //Adjust market every ten minutes
let lastAdjustTime;
let nextAdjustTime;

const basePrices = {"🍏": 2, "🍅": 2, "🍇": 3, "🍓": 4, "🍒": 3, "🍆": 5, "🍯": 10, "🥑": 8, "🐟": 5, "🐠": 12,
    "🐡": 15, "🐬": 40, "🐊": 55, "🦑": 72, "🦈": 98, "🐳": 150, "🕶": 20, "💍": 100, "👑": 250, "🛴": 40, "🚲": 46,
    "🛵": 300, "🚗": 800, "🏎": 2200, "🚁": 4555, "✈": 12365, "🚀": 85220};
let prevPrices = {};
let currPrices;

module.exports.run = async(client, message, args) => {
    if (!currPrices) currPrices = basePrices;

    let currTime = new Date().getTime();
    let adjustCount = 0;
    if (!nextAdjustTime || nextAdjustTime <= currTime) {
        adjustCount = lastAdjustTime ? (currTime - lastAdjustTime) / adjustFrequency : 1;
    }

    for (let i = 0; i < adjustCount; ++i) adjustMarketPrices();

    let stockMarketString = Object.keys(currPrices).map(key => {
        return key.toString() + '- $' + currPrices[key];
    }).join(', ');

    message.channel.send(stockMarketString).catch(console.error);
};

module.exports.aliases = ['stocks', 'stockmarket', 'market'];
module.exports.permissions = ['SEND_MESSAGES'];

function adjustMarketPrices() {
    Object.keys(currPrices).map(key => {
        prevPrices[key] = currPrices[key];
        currPrices[key] = adjustPrice(key);
    });
}

function adjustPrice(key) {
    let priceChangeRange = (currPrices[key] / 10) + (basePrices[key] / 10);
    return currPrices[key] + helpers.getRandomInt(priceChangeRange * -1, priceChangeRange + 1)
}
