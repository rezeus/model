'use strict';

const Model = require('../../lib/Model');

// Memory data store. [idFieldName] -> record
/** @type {Map<String, Object>} */
const mem = new Map();

mem.set('id1', { id: 'id1', foo: 'bar' });
mem.set('id2', false);
mem.set('id3', { id: 'id3', baz: 'qux' });
mem.set('id4', { id: 'id4', quux: false });

class MemoryModel extends Model {
  constructor() {
    super();

    if (this.constructor.name === MemoryModel.name) {
      throw new Error('Cannot create a new MemoryModel instance.');
    }
  }

  persist() {
    if (this.isNew) {
      const json = this.toJSON();
      mem.set(this.id, json);
    } else if (this.isDirty) {
      const changes = this.getChanges();

      // TODO
    }
  }

  static find(predicates = {}) {
    const predicateKeys = Object.keys(predicates);

    if (predicateKeys.length === 1 && predicateKeys[0] === this.idFieldName) {
      const foundFields = mem.get(predicates[this.idFieldName]);
      return this.fromJSON(foundFields);
    }

    // let id;
    // [...mem.entries()].findIndex(([cid, cval]) => {
    //   if (cval.baz === 'qux') {
    //     id = cid;
    //     return true;
    //   }
    //   return false;
    // });

    // if (!id) {
    //   return undefined;
    // }

    // return mem.get(id);

    return undefined;
  }

  static findById(id) {
    return this.find({ id });
  }

  static updateById(id, updates) {
    let combined;

    if (mem.has(id)) {
      combined = {
        ...mem.get(id),
        ...updates,
      };
    } else {
      combined = { ...updates };
    }

    mem.set(id, combined);
  }

  static deleteById(id) {
    // TODO
  }
}

// NOTE This is for testing purposes only
MemoryModel.mem = mem;

module.exports = MemoryModel;
