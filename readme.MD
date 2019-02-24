# MQTT to GPIO node library

Quick and simple library to get a node topic setting state on a Raspberry Pi GPIO pin.

Quick start:
    
* clone this repo on to a RaspberryPi:

    `git clone https://github.com/zymotik/mqtt-gpio.git`

* switch to the `mqtt-gpio` folder

* install node libraries:

    `npm install`

* edit settings:

    * Copy: 
        `copy settings.sample.json settings.json`
    * Edit:
        `nano settings.json`

* run library

    `sudo npm run start`

In my use case, I'm using Home Assistant climate app to turn on a heating zone relay.

Look at my other node packages for code to publish OneWire events to MQTT topics for Home Assistant.

## Setting up as a service on a RaspberryPi

Install forever and forever-service on the RaspberryPi

`sudo npm install forever -g`

`sudo npm install forever-service -g`

Then run in the source directory (where this `readme.md` file is):

`sudo npm run service-install`

And to remove:

`sudo npm run service-remove`

To view service logs use the command:

`sudo npm run view-log`

## Developer notes

`npm install` will fail on anything but a RaspberryPi. To install and run tests, use `npm run install-none-pi` before `npm run test`.
