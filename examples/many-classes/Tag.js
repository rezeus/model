'use strict';

const MemoryModel = require('../data-store-ops/MemoryModel');

class Tag extends MemoryModel {
  /** @type {String} */
  get name() {
    return this.getField('name');
  }

  /** @param {String} newVal */
  set name(newVal) {
    this.setField('name', newVal);
  }
}

module.exports = Tag;
