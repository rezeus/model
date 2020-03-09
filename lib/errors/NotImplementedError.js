'use strict';

const ModelError = require('./ModelError');

class NotImplementedError extends ModelError {
  constructor(modelName, methodName, isStatic = false) {
    super(`Extending model '${modelName}' has not implemented this${isStatic ? ' static' : ''} method '${methodName}'.`);
  }
}

module.exports = NotImplementedError;
