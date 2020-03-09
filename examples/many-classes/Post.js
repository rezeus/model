'use strict';

const MemoryModel = require('../data-store-ops/MemoryModel');

class Post extends MemoryModel {
  /** @type {String} */
  get title() {
    return this.getField('title');
  }

  /** @param {String} newVal */
  set title(newVal) {
    this.setField('title', newVal);
  }

  /** @type {String} */
  get body() {
    return this.getField('body');
  }

  /** @param {String} newVal */
  set body(newVal) {
    this.setField('body', newVal);
  }
}

module.exports = Post;
