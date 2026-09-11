const upstream = require('@expo/metro-config/babel-transformer');
const { parse } = require('yaml');
module.exports.transform = (args) => upstream.transform({
  ...args,
  src: /\.ya?ml$/.test(args.filename)
    ? `module.exports = ${JSON.stringify(parse(args.src))};`
    : args.src,
});
