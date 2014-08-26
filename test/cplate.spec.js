var _ = require('lodash')
    , expect = require('chai').expect
    , CPlate = require('../index');

describe('CPlate', function() {
    var cplate = null;

    beforeEach(function() {
        cplate = new CPlate();
    });

    it('should instanciates', function() {
        expect(cplate).to.be.an.instanceof(CPlate);
    });

    it('should register a new filter function', function() {
        expect(cplate.registerFilter('echo', function(value) { return value; })).to.be.an.instanceof(CPlate);
        expect(cplate.filters['echo']).to.be.a('function');
    });

    it('should format a string', function() {
        var str = cplate.format('{{value|filterA|filterB}}', {value: 43});
        expect(str).to.be.equal('43');

        cplate.registerFilter('filterA', function(value) {
            return value - 1;
        });
        cplate.registerFilter('filterB', function(value) {
            return 'Meaning of Life = ' + value;
        });

        str = cplate.format('{{value|filterA|filterB}}', {value: 43});
        expect(str).to.be.equal('Meaning of Life = 42');
    });

    it('should format a string with argumented filter', function() {
        cplate.registerFilter('filterA', function(value, opts, param) {
            param = parseInt(param);
            return value + param;
        });

        var str = '{{value|filterA:-1}}';
        expect(cplate.format(str, {value: 43})).to.be.equal('42');
    });

    it('should format a string with multiple argumented filters', function() {
        cplate.registerFilter('filterA', function(value, opts, param) {
            return opts['add'].apply(null, [value, param]);
        }).registerFilter('filterB', function(value, opts, param) {
            param = parseInt(param);
            return value / param;
        });

        var str = 'Is the Meaning of Life {{life|filterB:2}} or {{inge|filterA:6|filterB:7}}?';
        expect(cplate.format(str, {life: 84, inge: 43, add: function(a, b) { return a + b; }}))
            .to.be.equal('Is the Meaning of Life 42 or 7?');
    });

    it('should unregister a filter', function() {
        cplate.registerFilter('echo', function(value) { return value; });
        expect(cplate.unregisterFilter('echo')).to.be.an.instanceof(CPlate);
        expect(cplate.filters['echo']).to.be.not.ok;
    });

    it('should format an array of strings', function() {
        expect(cplate.formatArray([
            '{{value}} is the Meaning of Life!',
            'The Meaning of Life is {{value}}!'
        ], {value: 42})).to.be.deep.equal([
            '42 is the Meaning of Life!',
            'The Meaning of Life is 42!'
        ]);
    });
});

describe('CPlate:Errors', function() {
    var cplate = null;

    beforeEach(function() {
        cplate = new CPlate();
    });

    it('registerFilter: should throw on invalid arguments', function() {
        expect(cplate.registerFilter.bind(cplate, 'filterA', 'no function')).to.throw(TypeError);
        expect(cplate.registerFilter.bind(cplate)).to.throw(TypeError);
    });

    it('unregisterFilter: should throw on invalid arguments', function() {
        expect(cplate.unregisterFilter.bind(cplate, 123)).to.throw(TypeError);
    });

    it('format: should throw on invalid arguments', function() {
        expect(cplate.format.bind(cplate, '')).to.throw(TypeError);
    });

    it('formatArray: should throw on invalid arguments', function() {
        expect(cplate.formatArray.bind(cplate, '', {})).to.throw(TypeError);
    });
});

describe('CPlate:Filters', function() {
    var cplate = null;

    beforeEach(function() {
        cplate = new CPlate();
    });

    it('should right align text', function() {
        expect(cplate.format('{{value|rightalign:5}}', {value: 43})).to.be.equal('   43');
        expect(cplate.format('{{value|rightalign:2}}', {value: 2743})).to.be.equal('2743');
    });
});
