# Data Store Operations

Since Model class is data store agnostic extending class MUST provide it's own data store related operation code. For example if you invoke the `save` method on an instance its class' `persist` method is going to be invoked. Also the following static methods MUST be implemented;

 - `find`
 - `findById`
 - `existsById`
 - `updateById`
 - `deleteById`

Except those must-implemented static methods there are other static getters and methods that can be overriden.
