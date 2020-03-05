'use strict';

const { assert } = require('chai');

const Model = require('../lib/Model');

describe('Model Tests', function () {
  it.only('should have static methods', function () {
    assert.typeOf(Model.find, 'function'); // TODO Those are unimplemented - So extending classes should return an instance of this class
    assert.typeOf(Model.findById, 'function'); // TODO Those are unimplemented - So extending classes should return an instance of this class
    assert.typeOf(Model.updateById, 'function');
    assert.typeOf(Model.deleteById, 'function');
    //
  });


  it('should throw error when trying to create a new Model (without args) instance outside of a model class', function () {
    function createANewInstance() {
      // eslint-disable-next-line no-unused-vars
      const model = new Model();
    }

    assert.throws(createANewInstance, 'Cannot create a new Model instance.');
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

    assert.throws(createANewInstance, 'Cannot create a new Model instance.');
  });

  it('should create a new extending class (User)', function () {
    class User extends Model {}

    // eslint-disable-next-line no-unused-vars
    const user = new User();
  });

  describe.only('Extending Class 1 (User) Tests', function () {
    class User extends Model {
      //
    }

    it('should create a new Model instance with necessary properties', function () {
      const user = new User();

      assert(user.isNew === true);
      assert(user.isDirty === false);
      assert.property(user, User.idField);
      //
    });

    //
  });

  // TODO Write tests
});
