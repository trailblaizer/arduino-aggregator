export function processArgs() {
  const args = require('args-parser')(process.argv);

  if (!args['port']) {
    throw 'Please specify port on which to run on!';
  }

  if (!args['middleware-config']) {
    throw 'Please provide middlewares configuration file!';
  }

  return args;
}
