const mqtt = require('mqtt');
const { Gpio } = require('onoff');
const fs = require('fs');

let settings = {};
let mqttClient;
const gpios = {};
let poller;

async function init(){
    settings = await loadSettings();

    if (settings && settings.server) {
        log(`Init server: ${settings.server}`);
        mqttClient = mqtt.connect({host: `${settings.server}`, username: settings.username, password: settings.password});
        mqttClient.subscribe(settings.subscriptionTopic, function (err) {
            if (err){
                console.error(err);
            }
            log(`Subscription to topic: ${settings.subscriptionTopic} started`);
        });

        poller = setInterval(getStates, 10000);
        mqttClient.on('message', responseToMqttMessage);
    }
}

function getStates() {
    getGpios.map((gpioAddress) => {
        try {
            io = getGpio(gpioAddress, 'in'); // shouldn't matter with RaspberryPi
            state = io.readSync();
            publishState(gpioAddress, value);
        } catch(e) {
            log(`Problem reading state from ${gpioAddress}`);
            console.error(err);
        }
    });
}

function publishState(gpioAddress, value){
    console.log('GPIO ' + gpioAddress + ' value is now ' + value);
    mqttClient.publish(`${settings.publishTopic}${gpioAddress}/STATE`, JSON.stringify({
        'GPIO': gpioAddress,
        'Value': value
    }));
}

function loadSettings(){
    return new Promise((resolve, reject) => {
        fs.readFile('./settings.json', (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(JSON.parse(data));
        });
    
    });
}

function responseToMqttMessage(topic, message) {
    log(`Received topic: ${topic} message: ${message}`);
    const gpioAddress = parseGpioFromTopic(topic);
    const state = isSwitchOnState(message);
    setGpioState(gpioAddress, state);
}

function parseGpioFromTopic(topic){
    const regex = new RegExp(settings.topicToGpioRegex);
    const results = regex.exec(topic);
    if (results.length === 2) {
        try {
            return parseInt(results[1]);
        } catch(e) {
            console.error('Could not parse integer value for GPIO address');
        }
    }
}

function setGpioState(gpioAddress, state) {
    try {
        const io = getGpio(gpioAddress);
        io.writeSync(state ? 1 : 0);
    } catch (e) {
        console.error(err);
        return;
    }

    log(`${gpioAddress} set to state '${switchOn}'`);
}

function getGpio(gpioAddress, direction) {
    const io = gpios[gpioaddress];
    if (io){
        if (io.direction !== direction) {
            io.setDirection(direction);    
        }
        return io;
    }
    gpios[gpioAddress] = new Gpio(gpioAddress, direction);
    return gpios[gpioAddress];
}

function log(message){
    const now = new Date();
    const strNow = `${pad(now.getDate())}/${pad(now.getMonth())}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    console.log(`${strNow} ${message}`);
}

function pad(number){
    return number.toString().padStart(2,0);
}

function isSwitchOnState(input){
    const test = input.toString().toLowerCase();
    return test.indexOf('true') >= 0 
            || test.indexOf('1') >= 0
            || test.indexOf('on') >= 0;
}

function getGpios(){
    return Object.keys(gpios);
}

process.on('SIGINT', () => {
    getGpios.map((key) => {
        gpios[key].unexport();
        log(`Unexported: GPIO ${key}`);
    });
    clearInterval(poller);
});

init();