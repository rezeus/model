'use strict';

const fs = require('fs');
const path = require('path');

const Mocha = require('mocha');

// const TESTS_DIR = path.join(__dirname, 'unit');
const TESTS_DIR = __dirname;

const mocha = new Mocha({
  timeout: '999999s',
  useColors: true,
  // bail: true, // TODO Uncomment this line after necessary tests are red
});

fs.readdirSync(TESTS_DIR)
  .filter((filepath) => filepath.substr(-8) === '.test.js')
  .forEach((filepath) => mocha.addFile(path.join(TESTS_DIR, filepath)));

mocha.run((failures) => {
  process.exit(failures ? 1 : 0);
});
