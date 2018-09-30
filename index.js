const mqtt = require('mqtt');
const gpio = require('rpi-gpio');
const fs = require('fs');

let settings = {};
let mqttClient;

function init(){
    loadSettings();

    if (settings.server) {
        mqttClient = mqtt.connect(`mqtt://${settings.server}`);
        mqttClient.subscribe(settings.subscriptionTopic, function (err) {
            if (err){
                console.error(err);
            }
        });

        mqttClient.on('message', responseToMqttMessage);
    }
}

function loadSettings(){
    settings = fs.readFile('./settings.json', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        settings = JSON.parse(data);
    });
}

function responseToMqttMessage(topic, message) {
    const gpioAddress = parseGpioFromTopic(topic);
    log(`received topic: ${topic} message: ${message}`);
    setGpioStatus(gpioAddress, message);
}

function parseGpioFromTopic(topic){
    const regex = new RegExp(settings.topicToGpioRegex);
    const results = regex.exec(topic);
    if (results.length === 2) {
        return results[1];
    }    
}

function setGpioStatus(gpioAddress, state){
    gpio.promise.setup(gpioAddress, gpio.DIR_OUT).then((err) => {
        if (err) {
            console.error(err);
            return;
        }
        gpio.promise.write(gpioAddress, !!state).then((err) => {
            if (err) {
                console.error(err);
                return;
            }
            log(`${gpioAddress} set to state '${!!state.toString()}'`);
        });
    });
}

function log(message){
    const now = new Date();
    const strNow = `${pad(now.getDay())}/${pad(now.getMonth())}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    console.log(`${strNow} ${message}`);
}

function pad(number){
    return number.toString().padStart(2,0);
}

init();