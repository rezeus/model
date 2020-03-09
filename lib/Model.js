'use strict';

const NotImplementedError = require('./errors/NotImplementedError');

const PRIV = Symbol('Model.priv');

class Model {
  constructor() {
    const Clazz = this.constructor;

    if (Clazz.name === Model.name) {
      throw new Error('Cannot create a new Model instance.');
    }

    this[PRIV] = {
      isNew: true,
      isDirty: false,
      id: undefined, // NOTE This is mandatory - so do NOT remove this (see `inst.id` and fields.id)
      changes: new Set(), // changed key names on `fields` object below for instance
      fields: {
        // NOTE See below for its children
      },
      //
    };
    Object.defineProperty(this[PRIV].fields, Clazz.idFieldName, {
      get: () => this[PRIV].id,
      enumerable: true,
    });
    if (Clazz.createdAtFieldName) {
      this[PRIV].fields[Clazz.createdAtFieldName] = undefined;

      Object.defineProperty(this, Clazz.createdAtFieldName, {
        get: () => this[PRIV].fields[Clazz.createdAtFieldName],
      });
    }
    if (Clazz.updatedAtFieldName) {
      this[PRIV].fields[Clazz.updatedAtFieldName] = undefined;

      Object.defineProperty(this, Clazz.updatedAtFieldName, {
        get: () => this[PRIV].fields[Clazz.updatedAtFieldName],
      });
    }
    //

    Object.defineProperty(this, Clazz.idFieldName, {
      get: () => this[PRIV].id,
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

  /**
   * Get the field value by it's name. It is adviced to use
   * this method only on getters of the extending class.
   *
   * @param {String} fieldName
   */
  getField(fieldName) {
    return this[PRIV].fields[fieldName];
  }

  /**
   * Set value of the field by it's name. It is adviced to use
   * this method only on setters of the extending class. It
   * also keeps track of changes.
   *
   * @param {String} fieldName
   */
  setField(fieldName, newVal) {
    this[PRIV].fields[fieldName] = newVal;

    this[PRIV].changes.add(fieldName);
    if (!this[PRIV].isNew) {
      this[PRIV].isDirty = true;
    }
  }

  getChanges() {
    return [...this[PRIV].changes.values()];
  }

  save() {
    // TODO Mutates `this` when necessary (via PRIV)
    // TODO Returns true or throws error (instance of ModelError)
    // TODO Reset changes

    /** @type {Model} */
    const Clazz = this.constructor;

    if (this.isNew) {
      const id = Clazz.getIdFieldValue();
      // TODO if `id` is `undefined` let the data store assign one
      if (id) {
        this[PRIV].id = id;
        this[PRIV].changes.add(Clazz.idFieldName);
      }

      const createdAtFieldName = Clazz.createdAtFieldName;
      if (createdAtFieldName) {
        this[PRIV].fields[createdAtFieldName] = Clazz.getCreatedAtValue();
        this[PRIV].changes.add(createdAtFieldName);
      }
      const updatedAtFieldName = Clazz.updatedAtFieldName;
      if (updatedAtFieldName) {
        this[PRIV].fields[updatedAtFieldName] = Clazz.getUpdatedAtValue();
        this[PRIV].changes.add(updatedAtFieldName);
      }
    } else if (this.isDirty) { // NOTE An instance cannot be new and dirty at the same time
      const updatedAtFieldName = Clazz.updatedAtFieldName;
      if (updatedAtFieldName) {
        this[PRIV].fields[updatedAtFieldName] = Clazz.getUpdatedAtValue();
        this[PRIV].changes.add(updatedAtFieldName);
      }
    }

    // TODO 'beforeSave' Hook

    this.persist();

    this[PRIV].isNew = false;
    this[PRIV].isDirty = false;
    this[PRIV].changes.clear();

    // TODO 'afterSave' Hook
  }

  persist() {
    throw new NotImplementedError(this.constructor.name, 'persist');
  }

  toJSON() {
    return { ...this[PRIV].fields };
  }

  static fromJSON(json) {
    const idFieldName = this.idFieldName;
    if (idFieldName && !Object.prototype.hasOwnProperty.call(json, idFieldName)) {
      throw new Error(`Identifier field ('${idFieldName}') has not been found on the JSON.`);
    }

    const { [idFieldName]: id, ...otherFields } = json;

    const inst = new this();

    inst[PRIV].isNew = false;
    // inst[PRIV].isDirty = false;
    inst[PRIV].id = id;
    // inst[PRIV].changes = new Set();
    // inst[PRIV].fields = { ...json }; // NOTE This overrides the ID getter on fields
    inst[PRIV].fields = {
      ...inst[PRIV].fields,
      ...otherFields,
    };

    //

    return inst;
  }

  /** @returns {string} */
  static get idFieldName() {
    return 'id';
  }

  /**
   * When saving a new content this value is going to
   * be used as the instance identifier
   * (see `idFieldName`).
   */
  static getIdFieldValue() {
    return Math.floor(Date.now() / 1000).toString(10);
  }

  /**
   * If `false` or empty string (`''`) returned then
   * created at field is not going to be used.
   *
   * @returns {string}
   */
  static get createdAtFieldName() {
    return 'createdAt';
  }

  /**
   * When it's about to set created at field (see `createdAtFieldName`)
   * this static method is going to be used to get the value
   * to be stored in data store. It can return any type
   * as long as the data store supports it as value.
   */
  static getCreatedAtValue() {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * If `false` or empty string (`''`) returned then
   * updated at field is not going to be used.
   *
   * @returns {string}
   */
  static get updatedAtFieldName() {
    return 'updatedAt';
  }

  /**
   * When it's about to set updated at field (see `updatedAtFieldName`)
   * this static method is going to be used to get the value
   * to be stored in data store. It can return any type
   * as long as the data store supports it as value.
   */
  static getUpdatedAtValue() {
    return Math.floor(Date.now() / 1000);
  }

  static find(predicates = {}) {
    throw new NotImplementedError(this.name, 'find', true);
  }

  static findById(id) {
    throw new NotImplementedError(this.name, 'findById', true);
    // return <ExtendingClass>.find({ id });
  }

  static updateById(id) {
    throw new NotImplementedError(this.name, 'updateById', true);
  }

  static deleteById(id) {
    throw new NotImplementedError(this.name, 'deleteById', true);
  }

  //
}

module.exports = Model;
