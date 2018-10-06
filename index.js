const mqtt = require('mqtt');
const gpio = require('rpi-gpio');
const fs = require('fs');

let settings = {};
let mqttClient;

async function init(){
    gpio.setMode('mode_bcm'); // refer to GPIO's rather than pin numbers
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

        mqttClient.on('message', responseToMqttMessage);
    }
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
    
    setupGpioAddressAndSetState(gpioAddress, message);
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

function setupGpioAddressAndSetState(gpioAddress, state){
    gpio.promise.setup(gpioAddress, gpio.DIR_OUT).then((err) => {
        if (err) {
            console.error(err);
            return;
        }
        log(`GPIO ${gpioAddress} setup`);

        setGpioState(gpioAddress, state);
    });
}

function setGpioState(gpioAddress, state) {
    const switchOn = isSwitchOnState(state);
    gpio.promise.write(gpioAddress, switchOn).then((err) => {
        if (err) {
            console.error(err);
            return;
        }
        log(`${gpioAddress} set to state '${switchOn}'`);
    });
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

init();