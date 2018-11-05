import rewiremock from 'rewiremock';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { expect } from 'chai';

chai.should();
chai.use(sinonChai);

describe('settings', function() {
    it('should load settings', function() {
        const settingsJson = `{
            "server": "192.168.0.1",
            "username": "someusername",
            "password": "biglongpa55",
            "subscriptionTopic": "cmnd/topic/+",
            "publishTopic": "tele/topic/gpio-",
            "topicToGpioRegex": "(?:cmnd/topic/gpio-)([0-9]*)",
            "statusPollingPeriod": 300
        }`;
        const fsMock = { readFileSync: sinon.fake(() => settingsJson) };

        const configRewired = rewiremock.proxy('../config', () => ({
            'fs': fsMock
        }));
        
        fsMock.readFileSync.should.have.been.calledWith('./settings.json');
        expect(configRewired.config.server).to.equal('192.168.0.1');
        expect(configRewired.config.username).to.equal('someusername');
        expect(configRewired.config.password).to.equal('biglongpa55');
        expect(configRewired.config.subscriptionTopic).to.equal('cmnd/topic/+');
        expect(configRewired.config.publishTopic).to.equal('tele/topic/gpio-');
        expect(configRewired.config.topicToGpioRegex).to.equal('(?:cmnd/topic/gpio-)([0-9]*)');
        expect(configRewired.config.statusPollingPeriod).to.equal(300);
        expect(configRewired.config.debug).to.equal(false);
    });

    it('should load enable logging', function() {
        const settingsJson = `{
            "debug": true
        }`;
        const fsMock = { readFileSync: sinon.fake(() => settingsJson) };

        const configRewired = rewiremock.proxy('../config', () => ({
            'fs': fsMock
        }));
        
        fsMock.readFileSync.should.have.been.calledWith('./settings.json');
        expect(configRewired.config.debug).to.equal(true);
    });
});