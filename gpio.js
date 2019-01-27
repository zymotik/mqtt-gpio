
const Gpio = require('pigpio').Gpio;
const gpios = {};
const { log } = require('./logger');

module.exports = {
    set: set,
    get: get,
    getInUse: getInUse,
    read: read
}

/**
 * Set the gpio state
 * @param {number} gpioAddress 
 * @param {boolean} state 
 */
function set(gpioAddress, state) {
    log(`Set gpio '${gpioAddress}' to '${state}'`, true);
    const io = get(gpioAddress, Gpio.OUTPUT);
    io.digitalWrite(state ? 1 : 0);
    return read(gpioAddress);
}

function get(gpioAddress, mode = Gpio.OUTPUT) {
    log(`Get gpio '${gpioAddress}'`, true);
    const io = gpios[gpioAddress];
    if (io){
        if (io.getMode() !== mode) {
            log(`Set gpio '${gpioAddress}' mode to ${ mode === Gpio.OUTPUT ? 'OUTPUT' : 'INPUT' }`);
            io.mode(mode);
        }
        return io;
    }
    gpios[gpioAddress] = new Gpio(gpioAddress, { mode: mode });
    return gpios[gpioAddress];
}

function read(gpioAddress) {
    log(`Read gpio '${gpioAddress}' state`, true);
    const io = get(gpioAddress);
    const state = io.digitalRead();
    log(`Gpio '${gpioAddress}' state '${state}'`, true);
    return state === 1;
}

/**
 * @description get a list of gpios in use
 * @returns {Array[string]}
 */
function getInUse(){
    return Object.keys(gpios).map(gpio => parseInt(gpio));
}
