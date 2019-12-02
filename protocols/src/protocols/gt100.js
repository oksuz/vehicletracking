const parser = require('./gt100/messageParser');

const gt100 = {
  id: 'GT100',
  port: 15000,
  parser
};

module.exports = gt100;