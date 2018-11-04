# MQTT to GPIO node library

Quick and simple library to get a node topic setting state on a Raspberry Pi GPIO pin.

In my use case, I'm using Home Assistant climate app to turn on a heating zone relay. 

Look at my other node packages for code to publish OneWire events to MQTT topics for Home Assistant.

## Developer notes

*Note:* `npm install` will fail on anything but a RaspberryPi. To install and run tests, use `npm run install-none-pi` before `npm run test`.