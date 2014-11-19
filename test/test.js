/**
 * Created by Simon on 17/11/2014.
 */
(function(){
    'use strict';

    var mapper = require('../model-mapper');
    var should = require('should');

    mapper.createMap('TestViewModel', {
        test: '='
    });

    var path = require('path');
    var exampleDir = path.join(__dirname, '../example');
    mapper.createMapsFromDir(exampleDir);
    var maps = mapper.getMaps();
    var exampleKey = 'ExampleViewModel';

    describe('view-mapper', function(){
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

        });
    });

})();