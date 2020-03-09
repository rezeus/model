'use strict';

// NOTE Note that this file is testing purposes only

const assert = require('assert');

const MemoryModel = require('./examples/data-store-ops/MemoryModel');

const User = require('./examples/many-classes/User');
const Post = require('./examples/many-classes/Post');
const Tag = require('./examples/many-classes/Tag');

const mem = MemoryModel.mem;

(async () => {
  const userFields = {
    firstname: 'Jöhn',
    lastname: 'Döe',
    email: 'john@does.co',
    password: 'john@does.co',

    foo: 'this should not be exist on instance',
  };

  /** @type {User} */
  const john = await User.create(userFields);

  let johnFromStore = mem.get(john.id);

  // assert(!john.foo); // FIXME
  assert(!Object.prototype.hasOwnProperty.call(johnFromStore, 'foo'));
  assert(john.id, 'Model instance should have identifier field.');
  assert(john.password !== userFields.password, 'Password was not hashed.');
  assert(johnFromStore.password !== userFields.password, 'Password was not hashed.');
  assert(john.isPasswordValid(userFields.password), 'Valid password treated as not valid.');
  assert(!john.isPasswordValid(`${userFields.password}_invalid`), 'Invalid password treated as valid.');


  john.name = 'John Doe';
  await john.save();

  johnFromStore = mem.get(john.id);

  assert(john.firstname === 'John', 'Virtual field for User.name is invalid.');
  assert(johnFromStore.firstname === 'John', 'Virtual field for User.name is invalid.');
  assert(john.lastname === 'Doe', 'Virtual field for User.name is invalid.');
  assert(johnFromStore.lastname === 'Doe', 'Virtual field for User.name is invalid.');

  //
})();
