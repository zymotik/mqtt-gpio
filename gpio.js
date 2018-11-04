
const Gpio = require('pigpio').Gpio;
const gpios = {};

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
    const io = get(gpioAddress, Gpio.OUTPUT);
    io.digitalWrite(state ? 1 : 0);
}

function get(gpioAddress, mode = Gpio.OUTPUT) {
    const io = gpios[gpioAddress];
    if (io){
        if (io.getMode() !== mode) {
            io.mode(mode);
        }
        return io;
    }
    gpios[gpioAddress] = new Gpio(gpioAddress, { mode: mode });
    return gpios[gpioAddress];
}

function read(gpio) {
    const io = get(gpio);
    return io.digitalRead() === 1;
}

/**
 * @description get a list of gpios in use
 * @returns {Array[string]}
 */
function getInUse(){
    return Object.keys(gpios).map(gpio => parseInt(gpio));
}
