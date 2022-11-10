const config = require('@flocon-trpg/rollup-config');
const external = Object.keys(require('./package.json').dependencies);

module.exports = config({ external });
