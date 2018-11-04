# MQTT to GPIO node library

Quick and simple library to get a node topic setting state on a Raspberry Pi GPIO pin.

Quick start:
    
* clone this repo on to a RaspberryPi:

    `git clone https://github.com/zymotik/mqtt-gpio.git`

* switch to the `mqtt-gpio` folder

* install node librarys:

    `npm install`

* edit settings:

    `nano settings.json`

* run library

    `sudo npm run start`

In my use case, I'm using Home Assistant climate app to turn on a heating zone relay.

Look at my other node packages for code to publish OneWire events to MQTT topics for Home Assistant.

## Developer notes

`npm install` will fail on anything but a RaspberryPi. To install and run tests, use `npm run install-none-pi` before `npm run test`.