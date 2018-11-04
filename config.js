const fs = require('fs');

let config = {
    log: false
};

function init() {
    const fileContents = fs.readFileSync('./settings.json');
    const loadedConfig = JSON.parse(fileContents);
    config = Object.assign(config, loadedConfig);
}

init();

module.exports = {
    config: config
};
