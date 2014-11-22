/**
* Created by Simon on 16/11/2014.
*/
'use strict';

module.exports.createMapsFromDir = createMapsFromDir;
module.exports.createMap = createMap;
module.exports.getMaps = getMaps;
module.exports.map = map;

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var async = require('async');

var vm = {
    maps: {},
    errors: null
};

function addError(err){
    if (!vm.errors){
        vm.errors = [];
    }
    vm.errors.push(err);
}

//TODO: Add aliasing ability for maps
function createMapsFromDir(directory) {
    var files = fs.readdirSync(directory);

    files.forEach(function(file) {
        if (path.extname(file) === '.js') {
            var outputName = path.basename(file, '.js');
            var config = require(path.join(directory, file));

            if (config.map) {
                createMap(outputName, config.map);
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
            break;
        }
        input = input[props[i]];
    }

    return input;
}

function getMaps(){
    return vm.maps;
}

function map(outputName, input, callback) {
    vm.errors = [];

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
        catch (e){}
    }
    else if (value === '='){
        if (!input.hasOwnProperty(key)){
            callback();
        }
        callback(null, input[key]);
    }
    else if (_.isString(value)){
        if (value.length > 0 && value[0] !== '=') {
            var props = value.split('.');
            callback(null, getMappedValue(input, props));
        }
        else {
            callback(null, value.substring(1));
        }
    }
    else {
        callback(null, value);
    }
}