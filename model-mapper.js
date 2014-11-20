/**
 * Created by Simon on 16/11/2014.
 */
(function () {
    'use strict';

    module.exports.createMapsFromDir = createMapsFromDir;
    module.exports.createMap = createMap;
    module.exports.getMaps = getMaps;
    module.exports.map = map;

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

    function map(outputName, input) {
        var output;

        var mapConfig = vm.maps[outputName];
        if (mapConfig) {
            if (input === null || _.isUndefined(input)){
                throw new Error(input + ' passed as input for ' + outputName + ' mapping');
            }

            if (Array.isArray(input)){
                output = [];
                for (var i = 0, length = input.length; i < length; ++i){
                    output[i] = mapItem(outputName, input[i]);
                }
            }
            else {
                output = mapItem(outputName, input);
            }
        }
        else {
            throw new Error('No mapping found for ' + outputName);
        }

        return output;
    }

    function mapItem(outputName, input){
        var output = {};
        var config = vm.maps[outputName];

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
}());