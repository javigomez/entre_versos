const { parse } = require('yaml');

module.exports = {
  process(src) {
    return { code: `module.exports = ${JSON.stringify(parse(src))};` };
  },
};
