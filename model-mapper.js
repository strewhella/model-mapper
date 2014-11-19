/**
 * Created by Simon on 16/11/2014.
 */
(function () {
    'use strict';

    module.exports.createMapsFromDir = createMapsFromDir;
    module.exports.createMap = createMap;
    module.exports.getMaps = getMaps;
    module.exports.map = map;
    module.exports.mapKey = mapKey;

    var _ = require('underscore');
    var fs = require('fs');
    var path = require('path');

    var vm = {
        maps: {}
    };

    function createMapsFromDir(directory) {
        var files = fs.readdirSync(directory);

        files.forEach(function(file) {
            if (path.extname(file) === '.js') {
                var outputName = path.basename(file, '.js');
                var config = require(path.join(directory, file));

                if (!config.expects || config.expects.length === 0) {
                    log('No expected input provided in ' + outputName + '.js');
                }
                else {
                    config.expects.forEach(function (inputName) {
                        if (config.map) {
                            createMap(inputName, outputName, config.map);
                        }
                        else {
                            console.error('No map config provided for ' + inputName + ' to ' + outputName + ' in ' + outputName + '.js');
                        }
                    });
                }
            }
        });
    };

    function createMap(inputName, outputName, map) {
        vm.maps[mapKey(inputName, outputName)] = map;
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

    function map(inputName, outputName, input) {
        var output;

        var mapConfig = vm.maps[mapKey(inputName, outputName)];
        if (mapConfig) {
            if (Array.isArray(input)){
                output = [];
                for (var i = 0, length = input.length; i < length; ++i){
                    output[i] = mapItem(inputName, outputName, input[i]);
                }
            }
            else {
                output = mapItem(inputName, outputName, input);
            }
        }
        else {
            throw new Error('No mapping found for ' + inputName + ' to ' + outputName);
        }

        return output;
    }

    function mapItem(inputName, outputName, input){
        var output = {};
        var config = vm.maps[mapKey(inputName, outputName)];

        var keys = Object.keys(config);
        for (var i = 0, length = keys.length; i < length; ++i){
            var key = keys[i];
            var value = config[key];

            if (_.isFunction(value)){
                try {
                    output[key] = value(input);
                }
                catch (e){}
            }
            else if (value === '='){
                if (!input.hasOwnProperty(key)){
                    continue;
                }
                output[key] = input[key];
            }
            else {
                var props = value.split('.');
                output[key] = getMappedValue(input, props);
            }
        }
        return output;
    }

    function mapKey(inputName, outputName){
        return inputName + outputName;
    }
}());