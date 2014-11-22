node-model-mapper
=================

You can use this tool to copy data from nested models into a flattened view model.


You tell the mapper how to create the view models by creating maps. This can be done with the `createMap` function. You can also `createMapsFromDir` and point the mapper at a directory with your maps. The actual mapping is done with the `map` function.

`createMap(outputName, map)`

`outputName` can be anything, this is simply the key used to reference the map later. It makes sense however, to name this as the type of object you expect to map to.

`map` is an object containing the configuration of your view model. Each property of this object will be in your resultant view model.

`createMapsFromDir(directory)`

`directory` is the full path to the directory you have your map files in. These files just need to export a `map` object containing the configuration for your view model. The name of the file (minus the .js) will be used as the `outputName`

The `map` config object

An example configuration file from the example folder in the project (`ExampleViewModel.js`):
```
var mapper = require('model-mapper');

module.exports.map = {
    number: '=',
    string: '=',
    date: '=',
    method: '=',
    object: '=',
    array: '=',
    nested: 'object.member',
    deepnest: 'a.b.c.d.e',
    func: function(example){
        return example.method();
    },
    mapping: function(example){
        return mapper.map('NestedViewModel', example.nested);
    }
};
```

An example input object for this configuration might be:

```
var Nested = {
    nestedMapping: 'nestedMapping'
};

var Example = {
    number: 5,
    string: 'string',
    date: new Date(2014, 1, 1),
    method: function(){
        return 'method';
    },
    object: {
        member: 'member'
    },
    array: ['array'],
    a: {
        b: {
            c: {
                d: {
                    e: 'nested'
                }
            }
        }
    }
};
Example.nested = Nested;
```

This object can then be mapped using `map('ExampleViewModel', Example);`. You can also use the same call to map an array of objects, by simply passing in the array of Example objects.

You can create mappings of your properties in 3 ways:

`"="` specifies a direct mapping. The mapper will look for a property of the same name on the input object and copy the property directly

`"some.property.list"` indicates some nested property path in the input object

`function`s can be specfied as configuration properties and these will be executed by the mapper, with the current input object passed in to the function. This enables you to nest mappings as above in the example. It also allows you to add calculated fields to your resultant view models.

*Update 1.1*
Added support for asynchronous mapping functions. A callback can now be optionally passed to `map`, causing the function to be treated asyncronously.

For example, using the following map definition containing an async function:

```
module.exports.map = {
    async: function(example, done){
        setTimeout(function(){
            if (example.error){
                done('ERROR');
            }
            else {
                done(null, 5);
            }
        }, 200);
    }
}
```

Call the mapping function on an empty object:

```
mapper.map('AsyncExample', {}, function(err, result) {
`    // Access result here
`});
```

The callback follows the Node convention of error then result, and will contain an array of any errors generated during asynchronous calls. For example, any database accesses that resulted in errors will have the error propagated to this callback. If no callback is supplied to `map`, the call will be treated synchronously and the result will be returned as usual.