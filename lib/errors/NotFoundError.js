'use strict';

const ModelError = require('./ModelError');

class NotFoundError extends ModelError {
  constructor(modelName, modelIdFieldName, modelIdFieldValue) {
    super(`${modelName} model has not found a record where '${modelIdFieldName} = ${modelIdFieldValue}'.`);
  }
}

module.exports = NotFoundError;
