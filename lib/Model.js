'use strict';

const { omit } = require('underscore');

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
      changedFieldNames: new Set(), // changed key names on `fields` object below for instance
      fields: {
        // NOTE See below for its children
      },
      setterNames: [],
      ownProperties: {}, // This includes setters
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

    // Introspection
    //
    const ownProperties = Object.getOwnPropertyDescriptors(this.constructor.prototype);
    this[PRIV].ownProperties = ownProperties;
    let ownProperty;
    this[PRIV].setterNames = Object.keys(ownProperties).filter((propName) => {
      ownProperty = ownProperties[propName];

      return (
        Object.prototype.hasOwnProperty.call(ownProperty, 'set')
        && typeof ownProperty.set === 'function'
      );
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
   * also keeps track of changed field names.
   *
   * @param {String} fieldName
   */
  setField(fieldName, newVal) {
    if (this[PRIV].fields[fieldName] !== newVal) {
      this[PRIV].fields[fieldName] = newVal;

      // DOC Underscore prefixed field names are not going to be stored into the data store
      if (fieldName[0] !== '_') {
        this[PRIV].changedFieldNames.add(fieldName);
        if (!this[PRIV].isNew) {
          this[PRIV].isDirty = true;
        }
      }
    }
  }

  setFields(obj) {
    const fieldNames = Object.keys(obj);

    let newVal;
    // Field names that were changed
    const setFieldNames = fieldNames.map((fieldName) => {
      newVal = obj[fieldName];

      if (this[PRIV].fields[fieldName] !== newVal) {
        this[PRIV].fields[fieldName] = newVal;

        return fieldName;
      }

      return undefined;
    }).filter((v) => (v !== undefined || v[0] === '_'));

    if (setFieldNames.length > 0) {
      // Add array items to set
      setFieldNames.forEach(this[PRIV].changedFieldNames.add, this[PRIV].changedFieldNames);
      if (!this[PRIV].isNew) {
        this[PRIV].isDirty = true;
      }
    }
  }

  getChangedFieldNames() {
    return [...this[PRIV].changedFieldNames.values()];
      // // FIXME Decide; either this (filtering after adding) OR do NOT add to changed field names if starts with underscore
      // .filter((fieldName) => fieldName[0] !== '_'); // NOTE Do NOT store underscore prefixed fields to the data store
  }

  async save() {
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
        this[PRIV].changedFieldNames.add(Clazz.idFieldName);
      }

      const createdAtFieldName = Clazz.createdAtFieldName;
      if (createdAtFieldName) {
        this[PRIV].fields[createdAtFieldName] = Clazz.getCreatedAtValue();
        this[PRIV].changedFieldNames.add(createdAtFieldName);
      }
      const updatedAtFieldName = Clazz.updatedAtFieldName;
      if (updatedAtFieldName) {
        this[PRIV].fields[updatedAtFieldName] = Clazz.getUpdatedAtValue();
        this[PRIV].changedFieldNames.add(updatedAtFieldName);
      }
    } else if (this.isDirty) { // NOTE An instance cannot be new and dirty at the same time
      const updatedAtFieldName = Clazz.updatedAtFieldName;
      if (updatedAtFieldName) {
        this[PRIV].fields[updatedAtFieldName] = Clazz.getUpdatedAtValue();
        this[PRIV].changedFieldNames.add(updatedAtFieldName);
      }
    } else {
      debugger;
      throw new Error('DEV: The instance trying to save should either new or dirty, which isn\'t the case this time. If set some fields before save, please check that setters for those fields exists.');
    }

    // Invoke the hook
    if (this.isDirty) {
      this.beforeUpdate();
    }
    this.beforeSave();

    await this.persist();

    this[PRIV].isNew = false;
    this[PRIV].isDirty = false;
    const changedFieldNames = [...this[PRIV].changedFieldNames.values()];
    this[PRIV].changedFieldNames.clear();

    // Invoke the hook
    this.afterSave();
    if (this.isDirty) { // TODO TR BURADA KALDIM - debug et ve MemoryModel'deki `afterUpdate` hook'unu niye çağırmıyor BUL
      this.afterUpdate(changedFieldNames);
    }
  }

  persist() {
    throw new NotImplementedError(this.constructor.name, 'persist');
  }

  toJSON(useExcludedFieldNames = true) {
    const doExclusion = (useExcludedFieldNames === '' || !!useExcludedFieldNames);

    const rawFields = this[PRIV].fields;
    const processedFields = Object.keys(rawFields)
    // DOC Underscore prefixed field names are not going to be returned in the JSON
      .filter((fieldName) => fieldName[0] !== '_')
      .reduce((obj, fieldName) => {
        // TODO MAYBE Might as well use Object.defineProperty here
        // eslint-disable-next-line no-param-reassign
        obj[fieldName] = rawFields[fieldName];

        return obj;
      }, {});

    if (doExclusion && this.constructor.jsonExcludedFieldNames.length > 0) {
      return Object.freeze(omit(processedFields, this.constructor.jsonExcludedFieldNames));
    }

    return Object.freeze(processedFields);
  }

  /** @returns {Model} */
  static create(fields) {
    return new Promise((resolve, reject) => {
      // NOTE To create and save an instance from body

      // Create a new instance and reset necessary fields
      //
      const inst = new this();

      Object.keys(fields).forEach((fieldName) => {
        inst[fieldName] = fields[fieldName];
      });

      // Invoke the hook
      inst.beforeCreate();

      inst.save()
        .then(() => {
          resolve(inst);

          // Invoke the hook
          inst.afterCreate();
        })
        .catch((err) => { reject(err); });
    });
  }

  static fromJSON(json) {
    // NOTE To create an instance from data store

    const idFieldName = this.idFieldName;
    if (idFieldName && !Object.prototype.hasOwnProperty.call(json, idFieldName)) {
      throw new Error(`Identifier field ('${idFieldName}') has not been found on the JSON.`);
    }

    const { [idFieldName]: id, ...otherFields } = json;

    // Create a new instance and reset necessary fields
    //
    const inst = new this();

    inst[PRIV].isNew = false;
    inst[PRIV].id = id;

    // Assign fields
    //
    let val;
    Object.keys(otherFields).forEach((fieldName) => {
      val = otherFields[fieldName];

      if (inst[PRIV].setterNames.includes(fieldName)) {
        // Use the setter
        inst[PRIV].ownProperties[fieldName].set.call(inst, val);
      } else {
        // TODO What to do here? - for now add the fields that has no setter to private fields
        // createdAt etc. falls here
        inst[PRIV].fields[fieldName] = val;
      }
    });

    inst[PRIV].changedFieldNames.clear();
    inst[PRIV].isDirty = false;

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
   * Returned array keys are going to be excluded
   * from JSON output of the `toJSON`method.
   *
   * @returns {Array<String>}
   */
  static get jsonExcludedFieldNames() {
    return [];
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
  }

  /** @returns {Boolean} */
  static existsById(id) {
    throw new NotImplementedError(this.name, 'existsById', true);
  }

  static updateById(id) {
    throw new NotImplementedError(this.name, 'updateById', true);
  }

  static deleteById(id) {
    throw new NotImplementedError(this.name, 'deleteById', true);
  }

  // Hooks
  //
  /* eslint-disable class-methods-use-this */
  beforeCreate() {
    // This method to be overriden, no-op otherwise
  }

  afterCreate() {
    // This method to be overriden, no-op otherwise
  }

  beforeSave() {
    // This method to be overriden, no-op otherwise
  }

  afterSave() {
    // This method to be overriden, no-op otherwise
  }

  beforeUpdate() {
    // This method to be overriden, no-op otherwise
  }

  /**
   * @param {Array<String>} changedFieldNames
   */
  afterUpdate(changedFieldNames) {
    // This method to be overriden, no-op otherwise
  }

  // TODO MAYBE beforeFind hook to manipulate the query (query builder or smth similar needed for this)

  /* eslint-enable class-methods-use-this */
}

module.exports = Model;
