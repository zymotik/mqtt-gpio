import rewiremock from 'rewiremock';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import GpioMockLibrary from 'pigpio-mock';
import { expect } from 'chai';

chai.should();
chai.use(sinonChai);

let gpioMode = GpioMockLibrary.Gpio.OUTPUT;

describe('gpio set', function() {
    it('should set gpio pin', function() {
        const rewiredModule = getRewiredGpioModule();
        const gpioPinAddress = 5;
        const gpioState = false;

        rewiredModule.set(gpioPinAddress, gpioState);

        const gpio = rewiredModule.get(gpioPinAddress);

        gpio.theConstructor.should.have.been.calledWith(gpioPinAddress);
        gpio.digitalWrite.should.have.been.calledWith(0);
    });

    it('should switch mode and set gpio pin', function() {
        const rewiredModule = getRewiredGpioModule();
        const gpioPinAddress = 6;
        const gpioState = true;

        gpioMode = GpioMockLibrary.Gpio.INPUT;
        rewiredModule.set(gpioPinAddress, gpioState);

        const gpio = rewiredModule.get(gpioPinAddress);

        gpio.theConstructor.should.have.been.calledWith(gpioPinAddress);
        gpio.mode.should.have.been.calledWith(GpioMockLibrary.Gpio.OUTPUT);
        gpio.getMode.should.have.been.calledWith();
        gpio.digitalWrite.should.have.been.calledWith(1);
    });
});

describe('gpio get', function() {
    it('should get gpio pin state', function() {
        const rewiredModule = getRewiredGpioModule();
        const gpioPinAddress = 3;

        rewiredModule.read(gpioPinAddress);
        const gpio = rewiredModule.get(gpioPinAddress);

        gpio.theConstructor.should.have.been.calledWith(gpioPinAddress);
        gpio.digitalRead.should.have.been.calledWith();
    });

    it('should return list of GPIO\'s in use', () => {
        const rewiredModule = getRewiredGpioModule();
        const gpioPinAddresses = [1, 3, 9, 6];

        gpioPinAddresses.map((address) => {
            rewiredModule.set(address, 1);
        });
        
        const addressesInUse = rewiredModule.getInUse();
       
        expect(gpioPinAddresses.sort()).to.deep.equal(addressesInUse.sort());
    });
});

class GpioMock {
    constructor(gpio, options) {    
        this.theConstructor = sinon.spy();
        this.theConstructor(gpio, options);
        this.digitalRead = sinon.spy();
        this.digitalWrite = sinon.spy();
        this.getMode = sinon.stub().returns(gpioMode);
        this.mode = sinon.spy();
    }
}

Object.defineProperty(GpioMock, 'OUTPUT', {
    value: GpioMockLibrary.Gpio.OUTPUT,
    writable : false,
    enumerable : true,
    configurable : false
});

Object.defineProperty(GpioMock, 'INPUT', {
    value: GpioMockLibrary.Gpio.INPUT,
    writable : false,
    enumerable : true,
    configurable : false
});

function getRewiredGpioModule() {
    const rewiredModule = rewiremock.proxy('../gpio', () => ({
        'pigpio': {
            Gpio: GpioMock
        }
    }));
    
    return rewiredModule;
}
