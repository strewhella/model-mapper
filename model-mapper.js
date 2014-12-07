/**
* Created by Simon on 16/11/2014.
*/
'use strict';

module.exports.addAutoFunction = addAutoFunction;
module.exports.setMetadata = setMetadata;
module.exports.createMapsFromDir = createMapsFromDir;
module.exports.createMap = createMap;
module.exports.getMaps = getMaps;
module.exports.getMetadata = getMetadata;
module.exports.map = map;

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var async = require('async');

var vm = {
    maps: {},
    errors: null,
    autoFunctions: {}
};

function addAutoFunction(property, functionName){
    vm.autoFunctions[property] = functionName;
}

function addError(err){
    if (!vm.errors){
        vm.errors = [];
    }
    vm.errors.push(err);
}

function setMetadata(outputName, metadata){
    if (vm.maps[outputName]){
        vm.maps[outputName].metadata = metadata;
    }
    else {
        throw new Error('Cannot add metadata to non existent map - ' + outputName);
    }
}

function createMapsFromDir(directory) {
    var files = fs.readdirSync(directory);

    files.forEach(function(file) {
        if (path.extname(file) === '.js') {
            var outputName = path.basename(file, '.js');
            var config = require(path.join(directory, file));

            if (config.map) {
                if (config.alias && _.isString(config.alias)){
                    outputName = config.alias;
                }

                createMap(outputName, config.map);

                if (config.metadata){
                    setMetadata(outputName, config.metadata);
                }
            }
            else {
                console.error('No map config exported in ' + outputName + '.js');
            }
        }
    });
};

function createMap(outputName, map) {
    vm.maps[outputName] = map;
}

function getMappedValue(input, props) {
    for (var i = 0, length = props.length; i < length; ++i) {
        if (!input || !input.hasOwnProperty(props[i])){
            input = null;
            break;
        }
        input = input[props[i]];

        // If there's an auto function for this prop, execute it if its actually a function, otherwise set null
        var autoFunc = vm.autoFunctions[props[i]];
        if (autoFunc){
            if (_.isFunction(input[autoFunc])) {
                input = input[autoFunc]();
            }
            else {
                input = null;
            }
        }
    }

    return input;
}

function getMaps(){
    return vm.maps;
}

function getMetadata(outputName){
    var map = vm.maps[outputName];
    if (map){
        return map.metadata;
    }
    else {
        throw new Error('Cannot retrieve metadata for non existent map - ' + outputName);
    }
}

function map(outputName, input, callback) {
    vm.errors = null;

    var mapConfig = vm.maps[outputName];
    if (mapConfig) {
        if (input === null || _.isUndefined(input)){
            throw new Error(input + ' passed as input for ' + outputName + ' mapping');
        }

        var calls = [];
        if (Array.isArray(input)){
            for (var i = 0, length = input.length; i < length; ++i){
                calls.push({
                    outputName: outputName,
                    input: input[i]
                });
            }
        }
        else {
            calls.push({
                outputName: outputName,
                input: input
            });
        }

        if (callback) {
            async.map(calls, mapObject, function (err, results) {
                if (!Array.isArray(input)){
                    callback(vm.errors, results[0]);
                    return;
                }
                callback(vm.errors, results);
            });
        }
        else {
            if (calls.length === 1){
                return mapObject(calls[0]);
            }
            var output = [];
            calls.forEach(function(call){
                output.push(mapObject(call));
            });
            return output;
        }
    }
    else {
        throw new Error('No mapping found for ' + outputName);
    }
}

function mapObject(params, callback){
    var outputName = params.outputName;
    var input = params.input;
    var output = {};
    var config = vm.maps[outputName];

    var keys = Object.keys(config);
    var calls = [];
    for (var i = 0, length = keys.length; i < length; ++i){
        if (keys[i] === 'metadata'){
            continue;
        }

        calls.push({
            input: input,
            key: keys[i],
            value: config[keys[i]]
        });
    }

    if (callback) {
        async.map(calls, mapProperty, function (err, results) {
            for (var j = 0, callsLength = calls.length; j < callsLength; ++j) {
                var propName = calls[j].key;
                output[propName] = results[j];
            }
            callback(null, output);
        });
    }
    else {
        for (var j = 0, callsLength = calls.length; j < callsLength; ++j){
            (function(index){
                mapProperty(calls[index], function(err, result){
                    output[calls[index].key] = result;
                });
            })(j);
        }
        return output;
    }
}

function mapProperty(params, callback){
    var input = params.input;
    var key = params.key;
    var value = params.value;

    // Map a function
    if (_.isFunction(value)){
        try {
            var result = value(input, function(err, result){
                if (err){
                    addError(err);
                    callback();
                }
                else {
                    callback(null, result);
                }
            });

            if (!_.isUndefined(result)){
                callback(null, result);
            }
        }
        catch (e){
            callback(null, null);
        }
    }
    // Map a direct mapping
    else if (value === '='){
        if (!input.hasOwnProperty(key)){
            callback(null, null);
        }
        else {
            callback(null, input[key]);
        }
    }
    // Map a string field
    else if (_.isString(value)){
        // Map a property chain
        if (value.length > 0 && value[0] !== '=') {
            var props = value.split('.');
            callback(null, getMappedValue(input, props));
        }
        // Map a constant string
        else if (value.length > 0 && value[0] === '='){
            callback(null, value.substring(1));
        }
        // Map an empty string
        else if (value.length === 0){
            callback(null, value);
        }
        else {
            callback(null, null);
        }
    }
    // Map a constant
    else {
        callback(null, value);
    }
}