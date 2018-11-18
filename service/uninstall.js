const Service = require('node-service-linux').Service;
const serviceDetails = require('./service-details');

var svc = new Service(serviceDetails);

svc.on('uninstall', function(){
    console.log(`${serviceDetails.name}: uninstall complete.`);
});

try {
    svc.uninstall();
} catch (e) {
    console.error(e);
    console.log(colors.red('Could be permissions related, try running with sudo.'))
}
