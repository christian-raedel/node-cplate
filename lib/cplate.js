var _ = require('lodash')
    , util = require('util')
    , sprintf = util.format
    , debug = require('debug')('cplate');

function CPlate(opts) {
    this.filters = {};
}

CPlate.prototype.__defineGetter__('classname', function() { return 'CPlate'; });

CPlate.prototype.registerFilter = function(name, fn) {
    if (_.isString(name) && _.isFunction(fn)) {
        var filters = this.filters;
        if (_.isFunction(filters[name])) {
            throw new Error(sprintf('A filter named [%s] is already registered!', name));
        } else {
            filters[name] = fn;
            debug('Successfully registered a filter named [%s]...', name);
        }
    } else {
        throw new TypeError(sprintf('%s.registerFilter accepts only a string and a function as arguments!', this.classname));
    }

    return this;
};

CPlate.prototype.unregisterFilter = function(name) {
    if (_.isString(name)) {
        var filters = this.filters;
        if (filters[name]) {
            delete filters[name];
            debug('Successfully unregistered a filter named [%s]...', name);
        } else {
            debug('Cannot unregister filter named [%s]!', name);
        }
    } else {
        throw new TypeError(sprintf('%s.unregisterFilter accepts only a string as argument!', this.classname));
    }

    return this;
};

CPlate.prototype.format = function(str, opts, context) {
    if (_.isString(str) && _.isObject(opts)) {
        debug('Format string [%s] with options [%j]...', str, opts);
        var filters = this.filters;

        _.forEach(str.match(/\{\{.*?\}\}/g), function(field) {
            var placeholders = field.replace(/\{\{|\}\}/g, '').split('|')
                .map(function(value) {
                    return value.trim();
                });
            debug('placeholders: %j', placeholders);

            var placeholder = placeholders.shift()
                , value = opts[placeholder];
            if (_.isUndefined(value)) {
                debug('No value for placeholder [%s] given!', placeholder);
            } else {
                _.forEach(placeholders, function(placeholder) {
                    placeholder = placeholder.split(':').map(function(value) {
                        if (_.isNaN(parseInt(value))) {
                            return value.trim();
                        } else {
                            return parseInt(value);
                        }
                    });

                    if (_.isFunction(filters[placeholder[0]])) {
                        value = filters[placeholder[0]].apply(context, [value, opts].concat(placeholder.slice(1)));
                    } else {
                        debug('No filter function with name [%s] registered!', placeholder);
                    }
                }, this);

                str = str.replace(field, value);
            }
        }, this);
    } else {
        throw new TypeError(sprintf('%s.format accepts only a string an an object as arguments!', this.classname));
    }

    return str;
};

CPlate.prototype.formatArray = function(array, opts) {
    if (_.isArray(array) && _.isObject(opts)) {
        _.forEach(array, function(str, idx, array) {
            array[idx] = this.format(str, opts);
        }, this);
    } else {
        throw new TypeError(sprintf('%s.formatArray accepts only an array and an object as arguments!', this.classname));
    }

    return array;
};

module.exports = CPlate;
