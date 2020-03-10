# Model

Generic, ActiveRecord-like base model class.

## Hooks

Hooks will be called in this order;

1. `beforeCreate` / `beforeUpdate`
1. `beforeSave`
1. `afterSave`
1. `afterCreate` / `afterUpdate`

> Note: `beforeUpdate` and `afterUpdate` hooks MUST be **manually** invoked by the extending class **if** the static method is going to be used to update the instance by it's ID (i.e. `updateById`). This class is the one which implements the data store operations (e.g. `MemoryModel` class from examples) - for other extending classes (e.g. `User`, `Post`, `Tag` classes from examples).
> Other hooks are free from this requirement.

## FAQ

Below you can find error messages and their explanations.

### Cannot create a new Model instance.

Since the Model class is an "abstract" class (abstract in real OOP languages) one cannot instantiate a new Model instance using `new` keyword, e.g.;
```js
const model = new Model(); // throws this error
```

Instead of creating a new instance this way (i.e. using `new` keyword) use `.create()` static method of **a class that extends the Model class** (extending class), e.g.;
```js
// Let's say extending class name is 'User'
const user = User.create({ name: 'Jahn', surname: 'Doe' });
```

then one can set the instance's properties and then save it, like so;
```js
// ...continuing above
user.name = 'John';
await user.save();
```
