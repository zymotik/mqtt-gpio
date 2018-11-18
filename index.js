const gpio = require('./gpio');
const mqtt = require('./mqtt');
const { config } = require('./config');
const { log } = require('./logger');

function init(){
    log(`Configuration loaded:`, true);
    log(JSON.stringify(config, null, 2), true)
    if (!config.loadError) {
        if (config.username && config.password) {
            log(`Connect MQTT server with credentials`);
            mqtt.connect(config.server, config.username, config.password);
        } else {
            log(`Connect MQTT server`);
            mqtt.connect(config.server);
        }
        
        mqtt.subscribe(config.subscriptionTopic, responseToMqttMessage);
        
        setInterval(getStates, config.statusPollingPeriod * 1000);
    }
}

function getStates() {
    gpio.getInUse().map((gpioAddress) => {
        state = gpio.read(gpioAddress);
        publishState(gpioAddress, state);
    });
}

function publishState(gpioAddress, state){
    mqtt.publish(`${config.publishTopic}${gpioAddress}/STATE`, 
        JSON.stringify({
            'GPIO': gpioAddress,
            'State': state ? 1 : 0
        }));
}

function responseToMqttMessage(topic, message) {
    log(`Received topic: ${topic} message: ${message}`, true);
    const gpioAddress = parseGpioFromTopic(topic);
    const state = isSwitchOnState(message);
    const newState = gpio.set(gpioAddress, state);
    publishState(gpioAddress, newState);
}

function parseGpioFromTopic(topic){
    const regex = new RegExp(config.topicToGpioRegex);
    const results = regex.exec(topic);
    if (results && results.length === 2) {
        try {
            return parseInt(results[1]);
        } catch(e) {
            console.error('Could not parse integer value for GPIO address');
        }
    } else {
        console.error('Could not find integer value for GPIO address, check regex and/or topic');
    }
}

function isSwitchOnState(input){
    const test = input.toString().toLowerCase();
    return test.indexOf('true') >= 0 
            || test.indexOf('1') >= 0
            || test.indexOf('on') >= 0;
}

init();
