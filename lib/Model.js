'use strict';

const PRIV = Symbol('Model.priv');

class Model {
  constructor() {
    if (this.constructor.name === Model.name) {
      throw new Error('Cannot create a new Model instance.');
    }

    this[PRIV] = {
      isNew: true,
      isDirty: false,
      id: undefined,
      //
    };

    Object.defineProperty(this, this.constructor.idField, {
      value: this[PRIV].id,
      configurable: false,
      writable: false,
    });

    //
  }

  /** @returns {boolean} */
  get isNew() {
    return this[PRIV].isNew;
  }

  /** @returns {boolean} */
  get isDirty() {
    return this[PRIV].isDirty;
  }

  /** @returns {string} */
  static get idField() {
    return 'id';
  }

  static findById(id) {
    // NOTE `findById` static method MUST be overriden by the extending class
  }

  //
}

module.exports = Model;
