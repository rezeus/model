# Many Classes

Implement setters on the extending classes to define class' fields. For example the `User` class in this example has `email`, `firstname`, `lastname`, `password` fields. Those fields are going to be persisted on the data store.

In addition to aforementioned fields there is one virtual field exists for `User` class, namely `name`. In its setter it is going to set `firstname` and `lastname` fields, therefore they are going to be saved.

While setters are way to define which fields are going to be persisted, getters are going to be used for the code. For example the `email` field of a `User` class instance can be read via; `user.email`.
