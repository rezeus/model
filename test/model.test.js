'use strict';

const { assert } = require('chai');

const Model = require('../lib/Model');

describe('Model Tests', function () {
  it('should throw error when trying to create a new Model (without args) instance outside of a model class', function () {
    function createANewInstance() {
      // eslint-disable-next-line no-unused-vars
      const model = new Model();
    }

    assert.throws(createANewInstance, 'Cannot create a new Model instance. Please see http://tiny.cc/rzus-mdl-faq.');
  });

  it('should throw error when trying to create a new Model (with args) instance outside of a model class', function () {
    function createANewInstance() {
      // eslint-disable-next-line no-unused-vars
      const model = new Model({
        foo: 'bar',
        bar: 42,
        baz: {
          qux: false,
          quux: true,
        },
      });
    }

    assert.throws(createANewInstance, 'Cannot create a new Model instance. Please see http://tiny.cc/rzus-mdl-faq.');
  });

  // TODO Write tests
});
