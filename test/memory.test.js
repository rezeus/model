'use strict';

const { assert } = require('chai');

const MemoryModel = require('../examples/data-store-ops/MemoryModel');

const mem = MemoryModel.mem;

describe('Example Memory Model Tests', function () {
  it('should throw error when trying to create a new MemoryModel (without args) instance outside of a model class', function () {
    function createANewInstance() {
      // eslint-disable-next-line no-unused-vars
      const memoryModel = new MemoryModel();
    }

    assert.throws(createANewInstance, 'Cannot create a new MemoryModel instance.');
  });

  it('1', function () {
    const val = MemoryModel.findById('id3');

    debugger;
  });

  it('2', function () {
    const val = MemoryModel.find({ baz: 'qux' });

    debugger;
  });

  describe.only('Extending Class 1 (User) Tests', function () {
    class User extends MemoryModel {
      /** @type {String} */
      get email() {
        return this.getField('email');
      }

      /** @param {String} newVal */
      set email(newVal) {
        this.setField('email', newVal);
      }
    }

    let lastCreatedId;

    it('0', function () {
      const john = new User();

      john.email = 'john@does.co';

      const changesBeforeSave = john.getChanges();
      john.save();
      const changesAfterSave = john.getChanges();

      assert(changesBeforeSave.length === 1 && changesBeforeSave[0] === 'email', 'Changes was not calculated correctly.');
      assert(changesAfterSave.length === 0, 'Changes was not reset.');

      assert(john.id);
      assert(mem.has(john.id));

      lastCreatedId = john.id;
    });

    it('1', function () {
      const john = User.findById(lastCreatedId);

      john.email = 'john@does.co';

      const changesBeforeSave = john.getChanges();
      john.save();
      const changesAfterSave = john.getChanges();

      assert(changesBeforeSave.length === 1 && changesBeforeSave[0] === 'email', 'Changes was not calculated correctly.');
      assert(changesAfterSave.length === 0, 'Changes was not reset.');

      // Ensure that it's ID wasn't changed after save
      assert.equal(lastCreatedId, john.id);

      assert(john.updatedAt > john.createdAt);
    });
  });

  // it('2', function () {});
  //
});
