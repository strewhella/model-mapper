/**
 * Created by Simon on 17/11/2014.
 */
(function(){
    'use strict';

    var mapper = require('../model-mapper');

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

})();