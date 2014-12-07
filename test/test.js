/**
 * Created by Simon on 17/11/2014.
 */
'use strict';

var mapper = require('../model-mapper');
var should = require('should');
var _ = require('underscore');

mapper.createMap('TestViewModel', {
    test: '='
});

var path = require('path');
var exampleDir = path.join(__dirname, '../example');
mapper.createMapsFromDir(exampleDir);
var maps = mapper.getMaps();
var exampleKey = 'ExampleViewModel';

describe('model-mapper', function(){
    describe('when creating maps directly', function(){
        it('should create map configuration', function(){
            should.exist(mapper.getMaps());
        });

        var maps = mapper.getMaps();
        var testKey = 'TestViewModel';

        it('should contain correct config', function(){
            maps.should.have.property(testKey);
        });

        it('should contain config with correct property', function(){
            maps[testKey].should.have.property('test');
        });
    });

    describe('when mapping using directly created maps', function(){
        var Test = {
            test: 'simple'
        };
        var result = mapper.map('TestViewModel', Test);

        it('should create a result', function(){
            should.exist(result);
        });

        it('should contain the correct property', function(){
            result.should.have.property('test');
        });

        it('should have the correct value', function(){
            result.test.should.equal('simple');
        });
    });

    describe('when creating maps from directory', function(){
        it('should create mapping from file', function(){
            maps.should.have.property(exampleKey);
        });

        it('should contain correct map object', function(){
            var exampleMap = maps[exampleKey];
            exampleMap.should.have.property('number');
            exampleMap.should.have.property('mapping');
            exampleMap.number.should.equal('=');
        });
    });

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

    describe('when mapping complex maps', function(){
        var result = mapper.map('ExampleViewModel', Example);

        it('should create a result', function () {
            should.exist(result);
        });

        it('should contain specified "number" property', function () {
            result.should.have.property('number');
        });

        it('should contain specified "date" property', function () {
            result.should.have.property('date');
        });

        it('should contain specified "method" property', function () {
            result.should.have.property('method');
        });

        it('should contain specified "object" property', function () {
            result.should.have.property('object');
        });

        it('should contain specified "array" property', function () {
            result.should.have.property('array');
        });

        it('should contain specified "deepnest" property', function () {
            result.should.have.property('deepnest');
        });

        it('should contain specified "nested" property', function () {
            result.should.have.property('nested');
        });

        it('should have copied number type correctly', function () {
            result.number.should.be.type('number');
        });

        it('should have copied number property correctly', function () {
            result.number.should.be.exactly(5);
        });

        it('should have copied string type correctly', function () {
            result.string.should.be.type('string');
        });

        it('should have copied string property correctly', function () {
            result.string.should.equal('string');
        });

        it('should have copied date type correctly', function () {
            result.date.should.be.an.instanceOf(Date);
        });

        it('should have copied date property correctly', function () {
            result.date.should.eql(new Date(2014, 1, 1));
        });

        it('should have copied method type correctly', function () {
            result.method.should.be.type('function');
        });

        it('should have copied method property correctly', function () {
            result.method().should.equal('method');
        });

        it('should have copied object type correctly', function () {
            result.object.should.be.type('object');
        });

        it('should have copied object property correctly', function () {
            result.object.member.should.equal('member');
        });

        it('should have copied array type correctly', function () {
            result.array.should.be.an.instanceOf(Array);
        });

        it('should have copied array property correctly', function () {
            result.array.should.eql(['array']);
        });

        it('should have copied nested string type correctly', function () {
            result.deepnest.should.be.type('string');
        });

        it('should have copied nested object property correctly', function () {
            result.deepnest.should.equal('nested');
        });

        it('should have created func property correctly', function(){
            result.should.have.property('func');
        });

        it('should have executed func property correctly', function(){
            result.func.should.equal('method');
        });

        it('should contain property from nested mapping', function(){
            result.mapping.should.have.property('nestedMapping');
        });

        it('should contain property value from nested mapping', function(){
            result.mapping.nestedMapping.should.equal('nestedMapping');
        });
    });

    describe('when mapping arrays of objects', function(){
        var array = [Example, Example];
        var result = mapper.map('ExampleViewModel', array);

        it('should create result', function(){
            should.exist(result);
        });

        it('should have created array', function(){
            result.should.be.an.instanceOf(Array);
        });

        it('should contain two entries', function(){
            result.length.should.equal(2);
        });
    });

    describe('when passed invalid mappings', function(){
        it('should ignore props that don\'t exist', function(){
            var BadExample = {
                noprop: '='
            };
            var result = mapper.map('ExampleViewModel', BadExample);
            should.exist(result);
        });

        it('should ignore nested props that don\'t exist', function(){
            var BadExample = {
                badnest: 'props.dont.exist'
            };
            var result = mapper.map('ExampleViewModel', BadExample);
            should.exist(result);
        });

        it('should ignore functions that don\'t exist', function(){
            var BadExample = {
                evilfunc: function(){
                    return 'evilfunc';
                }
            };
            var result = mapper.map('ExampleViewModel', BadExample);
            should.exist(result);
        });

        it('should throw an error when mappings don\'t exist', function(){
            (function(){mapper.map('MoreNone', {})}).should.throw(/MoreNone/);
        });

        it('should throw an error when passed null input', function(){
            (function(){mapper.map('ExampleViewModel', null)}).should.throw(/null/);
        });

        it('should throw an error when passed undefined input', function(){
            (function(){mapper.map('ExampleViewModel', undefined)}).should.throw(/undefined/);
        });

        it('should return null for direct mapping fields with no value', function(){
            var result = mapper.map('ExampleViewModel', {});
            _.isNull(result.object).should.eql(true);
        });

        it('should return null for object fields with no value', function(){
            var result = mapper.map('ExampleViewModel', {});
            _.isNull(result.nested).should.eql(true);
        });

        it('should return null for function fields with no value', function(){
            var result = mapper.map('ExampleViewModel', {});
            _.isNull(result.func).should.eql(true);
        });

    });

    describe('when mapping async functions', function(){
        it('should map values', function(done){
            mapper.map('AsyncExample', {}, function(err, asyncResult) {
                asyncResult.should.have.property('async');
                done();
            });
        });

        it('should map values correctly', function(done){
            mapper.map('AsyncExample', {}, function(err, asyncResult) {
                asyncResult.async.should.eql(5);
                done();
            });
        });

        it('should populate error messages', function(done){
            mapper.map('AsyncExample', { error: true }, function(err){
                err.length.should.eql(1);
                done();
            });
        });

        it('should populate error messages correctly', function(done){
            mapper.map('AsyncExample', { error: true }, function(err){
                err.should.eql(['ERROR']);
                done();
            });
        });

        it('should not populate properties with errors', function(done){
            mapper.map('AsyncExample', { error: true }, function(err, asyncResult){
                (_.isUndefined(asyncResult.async)).should.eql(true);
                done();
            });
        });

        it('should map arrays of objects', function(done){
            mapper.map('AsyncExample', [{}, {}], function(err, asyncResult){
                asyncResult.length.should.eql(2);
                done();
            });
        });

        it('should map arrays of objects with correct values', function(done){
            mapper.map('AsyncExample', [{}, {}], function(err, asyncResult){
                asyncResult.should.eql([{async:5, sync: 'success'},{async:5, sync: 'success'}]);
                done();
            });
        });

        it('should still work for synchronous functions', function(done){
            mapper.map('AsyncExample', [{}, {}], function(err, asyncResult){
                asyncResult[0].should.have.property('sync');
                asyncResult[0].sync.should.eql('success');
                done();
            });
        });
    });

    describe('when mapping constants', function(){
        var constantResult = mapper.map('ConstantsExample', {});

        it('should create number properties', function(){
            constantResult.should.have.property('number');
            constantResult.should.have.property('double');
        });
        
        it('should create string properties', function(){
            constantResult.should.have.property('string');
        });

        it('should create empty string properties', function(){
            constantResult.should.have.property('emptyString');
        });

        it('should create array properties', function(){
            constantResult.should.have.property('array');
        });

        it('should create object properties', function(){
            constantResult.should.have.property('object');
        });
        
        it('should create null properties', function(){
            constantResult.should.have.property('nullValue');
        });

        it('should create undefined properties', function(){
            constantResult.should.have.property('undefinedValue');
        });

        it('should copy number properties', function(){
            constantResult.number.should.eql(5);
            constantResult.double.should.eql(4.1);
        });

        it('should copy string properties', function(){
            constantResult.string.should.eql('whatever');
        });

        it('should copy empty string properties', function(){
            constantResult.emptyString.should.eql('');
        });

        it('should copy array properties', function(){
            constantResult.array.should.eql(['array']);
        });

        it('should copy object properties', function(){
            constantResult.object.should.have.property('property');
            constantResult.object.property.should.eql('copied');
        });

        it('should copy null properties', function(){
            _.isNull(constantResult.nullValue).should.eql(true);
        });

        it('should copy undefined properties', function(){
            _.isUndefined(constantResult.undefinedValue).should.eql(true);
        });
    });

    describe('when aliasing maps in files', function(){
        it('should have created a map by the alias name', function(){
            mapper.getMaps().should.have.property('MyAlias');
        });

        it('should map an aliased map correctly', function(){
            var aliased = mapper.map('MyAlias', {});
            aliased.should.have.property('placeholder');
            _.isNull(aliased.placeholder).should.eql(true);
        });
    });

    describe('when using metadata', function(){
        it('when getting metadata for map that doesn\'t exist', function(){
            (function(){mapper.getMetadata('Blah')}).should.throw(/Cannot/);
        });

        it('when getting metadata that doesn\'t exist for map that does', function(){
            should.not.exist(mapper.getMetadata('ExampleViewModel'));
        });

        it('when getting metadata that does exist', function(){
            should.exist(mapper.getMetadata('MetadataExample'));
        });

        it('when setting metadata to non existent map', function(){
            (function(){mapper.setMetadata('Blah', 'metadata')}).should.throw(/Cannot/);
        });

        it('when setting metadata directly to existing map', function(){
            mapper.setMetadata('ExampleViewModel', 'metadata');
            mapper.getMetadata('ExampleViewModel').should.eql('metadata');
        });

        it('when setting metadata from directory file', function(){
            mapper.getMetadata('MetadataExample').should.have.property('data');
            mapper.getMetadata('MetadataExample').data.should.eql('my metadata');
        });

        it('when mapping item with metadata', function(){
            var vm = mapper.map('MetadataExample', {});
            vm.should.not.have.property('metadata');
        });
    });

    describe.only('when using auto functions', function(){
        var goodOutput, badOutput;
        before(function(){
            var goodInput = {
                autofunc: {}
            };
            goodInput.autofunc.execautofunc = function(){
                return 'Success!';
            };
            mapper.addAutoFunction('autofunc', 'execautofunc');
            goodOutput = mapper.map('AutoFuncExample', goodInput);

            var badInput = {
                autofunc: {}
            };
            badInput.autofunc.execautofunc = 'not a function!!';
            badOutput = mapper.map('AutoFuncExample', badInput);
        });

        it('should execute auto functions', function(){
            goodOutput.output.should.eql('Success!');
        });

        it('should ignore auto functions that are not functions', function(){
            _.isNull(badOutput.output).should.eql(true);
        });
    });
});