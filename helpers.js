//Discord related functions


//Standard functions
module.exports.getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

module.exports.clamp = function(n, min, max) {
    return Math.min(Math.max(n, min), max);
};
