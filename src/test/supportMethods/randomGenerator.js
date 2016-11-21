function randomGenerator(len, type) {
    'use strict';
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    if (type === 'int') {
        var randomInt = Math.floor(Math.random() * len);
        return randomInt;
    } else if (type === 'double') {
        var randomDouble = (Math.random() * len).toPrecision(2);
        return randomDouble;
    } else if (type === 'boolean') {
        var bool = (Math.random() <= 0.5) ? false : true;
        return bool;
    } else {
        var randomString = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }
}

exports.randomGenerator = randomGenerator;
