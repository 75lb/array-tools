(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.arrayTools = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* set module.exports above the requires: necessary to avoid circular reference issues with object-tools */
module.exports = ArrayTools;

var t = require("typical");
var o = require("object-tools");

/**
@module
@typicalname a
*/
ArrayTools.pluck = pluck;
ArrayTools.pick = pick;
ArrayTools.commonSequence = commonSequence;
ArrayTools.arrayify = arrayify;
ArrayTools.exists = exists;
ArrayTools.without = without;
ArrayTools.union = union;
ArrayTools.where = where;
ArrayTools.findWhere = findWhere;
ArrayTools.unique = unique;
ArrayTools.spliceWhile = spliceWhile;
ArrayTools.extract = extract;
ArrayTools.flatten = flatten;
ArrayTools.sortBy = sortBy;
ArrayTools.last = last;
ArrayTools.remove = remove;
ArrayTools.contains = contains;

function ArrayTools(input){
    if (!(this instanceof ArrayTools)) return new ArrayTools(input);
	this._data = input;
}

ArrayTools.prototype.val = function(){
    return this._data;
};

/* Array methods which return the chainable */
["filter", "reverse", "sort", "concat", "slice", "every", "some", "map"].forEach(function(method){
    ArrayTools.prototype[method] = function(){
        this._data = Array.prototype[method].apply(this._data, arguments);
        return this;
    };
});

/* Array method chain terminators, return a scalar */
["join"].forEach(function(method){
    ArrayTools.prototype[method] = function(){
        return Array.prototype[method].apply(this._data, arguments);
    };
});


/* array-tools methods which return the chainable */
["pluck", "pick", "arrayify", "where", "without", "unique", "spliceWhile", "extract", "flatten", "sortBy"].forEach(function(method){
    ArrayTools.prototype[method] = function(){
        var args = arrayify(arguments);
        args.unshift(this._data);
        this._data = ArrayTools[method].apply(null, args);
        return this;
    };
});

/* array-tools method chain terminators, return a scalar or non-array */
["exists", "findWhere", "last", "remove", "contains"].forEach(function(method){
    ArrayTools.prototype[method] = function(){
        var args = arrayify(arguments);
		args.unshift(this._data);
		return ArrayTools[method].apply(null, args);
    };
});

/**
Takes any input and guarantees an array back.

- converts array-like objects (e.g. `arguments`) to a real array
- converts `undefined` to an empty array
- converts any another other, singular value (including `null`) into an array containing that value
- ignores input which is already an array

@param {*} - the input value to convert to an array
@returns {Array}
@category chainable
@static
@example
> a.arrayify(undefined)
[]

> a.arrayify(null)
[ null ]

> a.arrayify(0)
[ 0 ]

> a.arrayify([ 1, 2 ])
[ 1, 2 ]

> function f(){ return a.arrayify(arguments); }
> f(1,2,3)
[ 1, 2, 3 ]
*/
function arrayify(any){
    if (any === undefined){
        return [];
    } else if (t.isArrayLike(any)){
        return Array.prototype.slice.call(any);
    } else {
        return Array.isArray(any) ? any : [ any ];
    }
}

/**
Query an array, at any depth..

@param {object[]} - the array to query
@param {query} - the query definition
@returns {Array}
@category chainable
@static
@example
Say you have a recordset:
```js
> data = [
    { name: "Dana", age: 30 },
    { name: "Yana", age: 20 },
    { name: "Zhana", age: 10 }
]
```

You can return records with properties matching an exact value:
```js
> a.where(data, { age: 10 })
[ { name: 'Zhana', age: 10 } ]
```

All query expressions can be negated (where NOT the value). Prefix the property name with `!`:
```js
> a.where(data, { "!age": 10 })
[ { name: 'Dana', age: 30 }, { name: 'Yana', age: 20 } ]
```

match using a function:
```js
> function over10(age){ return age > 10; }
> a.where(data, { age: over10 })
[ { name: 'Dana', age: 30 }, { name: 'Yana', age: 20 } ]
```

match using a regular expression
```js
> a.where(data, { name: /ana/ })
[ { name: 'Dana', age: 30 },
  { name: 'Yana', age: 20 },
  { name: 'Zhana', age: 10 } ]
```

You can query to any arbitrary depth. So with deeper data, like:
```js
> deepData = [
    { name: "Dana", favourite: { colour: "light red" } },
    { name: "Yana", favourite: { colour: "dark red" } },
    { name: "Zhana", favourite: { colour: [ "white", "red" ] } }
]
```

return records containing `favourite.colour` values matching the regex `/red/`
```js
> a.where(deepData, { favourite: { colour: /red/ } })
[ { name: 'Dana', favourite: { colour: 'light red' } },
  { name: 'Yana', favourite: { colour: 'dark red' } } ]
```

Prefix the property name with `+` if the value you want to match could be singular _or_ a member of an array.
```js
> a.where(deepData, { favourite: { "+colour": /red/ } })
[ { name: 'Dana', favourite: { colour: 'light red' } },
  { name: 'Yana', favourite: { colour: 'dark red' } },
  { name: 'Zhana', favourite: { colour: [ "white", "red" ] } } ]
```

*/
function where(array, query){
    array = arrayify(array);
    return array.filter(function(item){
        return testValue(item, query);
    });
}

/**
Returns a new array with the same content as the input minus the specified values.

@param {Array} - the input array
@param {*} - a single, or array of values to omit
@returns {Array}
@category chainable
@example
> a.without([ 1, 2, 3 ], 2)
[ 1, 3 ]

> a.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]
@alias module:array-tools.without
*/
function without(array, toRemove){
    toRemove = arrayify(toRemove);
    return array.filter(function(item){
        return !testValue(item, toRemove);
    });
}

function testValue(value, test){
    if (t.isPlainObject(test)){
        return o.exists(value, test);
    } else if (Array.isArray(test)){
        var tests = test;
        return tests.some(function(test){
            return testValue(value, test);
        });    
    } else if (test instanceof RegExp){
        return test.test(value);
    } else if (typeof test === "function"){
        return test(value);
    } else {
        return test === value;
    }
}

/**
returns true if a value, or nested object value exists in an array.. If value is a plain object, it is considered to be a query. If `value` is a plain object and you want to search for it by reference, use `.contains`.

@param {Array} - the array to search
@param {*} - the value to search for
@returns {boolean}
@category not chainable
@static
@example
> a.exists([ 1, 2, 3 ], 2)
true

> a.exists([ 1, 2, 3 ], [ 2, 3 ])
true

> a.exists([ { result: false }, { result: false } ], { result: true })
false

> a.exists([ { result: true }, { result: false } ], { result: true })

> a.exists([ { n: 1 }, { n: 2 }, { n: 3 } ], [ { n: 1 }, { n: 3 } ])
true
*/
function exists(array, query){
    return array.some(function(item){
        return testValue(item, query);
    });
}

/**
Plucks the value of the specified property from each object in the input array

@param recordset {object[]} - The input recordset
@param property {...string} - Up to three property names - the first one found will be returned.
@returns {Array}
@category chainable
@static
@example
> var data = [
    { a: "Lionel", b: "Roger" },
    { a: "Luis", b: "Craig" },
    { b: "Peter" },
]

> a.pluck(data, "a")
[ 'Lionel', 'Luis' ]

> a.pluck(data, "a", "b")
[ 'Lionel', 'Luis', 'Peter' ]
*/
function pluck(recordset, property, property2, property3){
    if (!Array.isArray(recordset)) throw new Error(".pluck() input must be an array");

    return recordset
        .filter(function(obj){
            var one = eval("obj." + property);
            var two = eval("obj." + property2);
            var three = eval("obj." + property3);
            return one || two || three;
        })
        .map(function(obj){
            var one = eval("obj." + property);
            var two = eval("obj." + property2);
            var three = eval("obj." + property3);
            return one || two || three;
        });
}

/**
return a copy of the input `recordset` containing objects having only the cherry-picked properties
@param recordset {object[]} - the input
@param property {...string} - the properties to include in the result
@return {object[]}
@category chainable
@example
> data = [
    { name: "Dana", age: 30 },
    { name: "Yana", age: 20 },
    { name: "Zhana", age: 10 }
]

> a.pick(data, "name")
[ { name: 'Dana' }, { name: 'Yana' }, { name: 'Zhana' } ]

> a.pick(data, "name", "age")
[ { name: 'Dana', age: 30 },
  { name: 'Yana', age: 20 },
  { name: 'Zhana', age: 10 } ]
@alias module:array-tools.pick
*/
function pick(){
    var args = arrayify(arguments);
    var recordset = args.shift();
    var properties = args;

    if (!Array.isArray(recordset)) throw new Error(".pick() input must be an array");

    return recordset
        .filter(function(obj){
            return properties.some(function(prop){
                return obj[prop] !== undefined;
            });
        })
        .map(function(obj){
            var output = {};
            properties.forEach(function(prop){
                if (obj[prop] !== undefined){
                    output[prop] = obj[prop];
                }
            });
            return output;
        });
}

/**
returns the first item from `recordset` where key/value pairs
from `query` are matched identically
@param {object[]} - the array to search
@param {object} - an object containing the key/value pairs you want to match
@returns {object}
@category not chainable
@example
> dudes = [{ name: "Jim", age: 8}, { name: "Clive", age: 8}, { name: "Hater", age: 9}]
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 },
  { name: 'Hater', age: 9 } ]

> a.findWhere(dudes, { age: 8})
{ name: 'Jim', age: 8 }
@alias module:array-tools.findWhere
*/
function findWhere(recordset, query){
    var result = where(recordset, query);
    return result.length ? result[0] : null;
}

/**
merge two arrays into a single array of unique values
@param {Array} - First array
@param {Array} - Second array
@param {string} - the unique ID property name
@returns {Array}
@category chainable
@example
> var array1 = [ 1, 2 ], array2 = [ 2, 3 ];
> a.union(array1, array2)
[ 1, 2, 3 ]

> var array1 = [ { id: 1 }, { id: 2 } ], array2 = [ { id: 2 }, { id: 3 } ];
> a.union(array1, array2)
[ { id: 1 }, { id: 2 }, { id: 3 } ]

> var array2 = [ { id: 2, blah: true }, { id: 3 } ]
> a.union(array1, array2)
[ { id: 1 },
  { id: 2 },
  { id: 2, blah: true },
  { id: 3 } ]
> a.union(array1, array2, "id")
[ { id: 1 }, { id: 2 }, { id: 3 } ]
@alias module:array-tools.union
*/
function union(array1, array2, idKey){
    var result = o.clone(array1);
    array2.forEach(function(item){
        if (idKey){
            var query = {};
            query[idKey] = item[idKey];
            if (!findWhere(result, query)){
                result.push(item);
            }
        } else if (!exists(result, item)){
            result.push(item);
        };
    });
    return result;
}

/**
Returns the initial elements which both input arrays have in common
@param {Array} - first array to compare
@param {Array} - second array to compare
@returns {Array}
@category chainable
@example
> a.commonSequence([1,2,3], [1,2,4])
[ 1, 2 ]
@alias module:array-tools.commonSequence
*/
function commonSequence(a, b){
    var result = [];
    for (var i = 0; i < Math.min(a.length, b.length); i++){
        if (a[i] === b[i]){
            result.push(a[i]);
        } else {
            break;
        }
    }
    return result;
}

/**
returns an array of unique values
@param {Array} - input array
@returns {Array}
@category chainable
@example
> n = [1,6,6,7,1]
[ 1, 6, 6, 7, 1 ]

> a.unique(n)
[ 1, 6, 7 ]
@alias module:array-tools.unique
*/
function unique(array){
    return array.reduce(function(prev, curr){
        if (prev.indexOf(curr) === -1) prev.push(curr);
        return prev;
    }, []);
}

/**
splice from `index` until `test` fails
@param {Array} - the input array
@param {number} - the position to begin splicing from
@param {RegExp} - the test to continue splicing while true
@param ...elementN {*} - the elements to add to the array
@returns {Array}
@category chainable
@example
> letters = ["a", "a", "b"]
[ 'a', 'a', 'b' ]

> a.spliceWhile(letters, 0, /a/, "x")
[ 'a', 'a' ]

> letters
[ 'x', 'b' ]
@alias module:array-tools.spliceWhile
*/
function spliceWhile(array, index, test){
    for (var i = 0; i < array.length; i++){
        if (!test.test(array[i])) break;
    }
    var spliceArgs = [ index, i ];
    spliceArgs = spliceArgs.concat(arrayify(arguments).slice(3));
    return array.splice.apply(array, spliceArgs);
}

/**
Removes items from `array` which satisfy the query. Modifies the input array, returns the extracted.
@param {Array} - the input array, modified directly
@param {function | object} - Per item in the array, if either the function returns truthy or the exists query is satisfied, the item is extracted
@returns {Array} the extracted items.
@category chainable
@alias module:array-tools.extract
*/
function extract(array, query){
    var result = [];
    var toSplice = [];
    arrayify(array).forEach(function(item, index){
        if (t.isPlainObject(query)){
            if(o.exists(item, query)){
                result.push(item);
                toSplice.push(index);
            }
        } else {
            if (query(item)){
                result.push(item);
                toSplice.push(index);
            }
        }
    });
    for (var i = 0; i < toSplice.length; i++){
        array.splice(toSplice[i] - i, 1);
    }
    return result;
}

/**
flatten an array of arrays into a single array
@static
@since 1.4.0
@param {Array} - the input array
@returns {Array}
@category chainable
@example
> numbers = [ 1, 2, [ 3, 4 ], 5 ]
> a.flatten(numbers)
[ 1, 2, 3, 4, 5 ]
*/
function flatten(array){
    return arrayify(array).reduce(function(prev, curr){
        return prev.concat(curr);
    }, []);
}

/**
Sort an array of objects by one or more fields
@static
@param {object[]} - input array
@param {string|string[]} - column name(s) to sort by
@param {object} - specific sort orders, per columns
@returns {Array}
@category chainable
@since 1.5.0
@example
>  var fixture = [
    { a: 4, b: 1, c: 1},
    { a: 4, b: 3, c: 1},
    { a: 2, b: 2, c: 3},
    { a: 2, b: 2, c: 2},
    { a: 1, b: 3, c: 4},
    { a: 1, b: 1, c: 4},
    { a: 1, b: 2, c: 4},
    { a: 3, b: 3, c: 3},
    { a: 4, b: 3, c: 1}
];
> a.sortBy(fixture, ["a", "b", "c"])
[ { a: 1, b: 1, c: 4 },
  { a: 1, b: 2, c: 4 },
  { a: 1, b: 3, c: 4 },
  { a: 2, b: 2, c: 2 },
  { a: 2, b: 2, c: 3 },
  { a: 3, b: 3, c: 3 },
  { a: 4, b: 1, c: 1 },
  { a: 4, b: 3, c: 1 },
  { a: 4, b: 3, c: 1 } ]
*/
function sortBy(recordset, columns, customOrder){
    return recordset.sort(sortByFunc(arrayify(columns), customOrder));
}

function  sortByFunc(properties, customOrder){
    var props = properties.slice(0);
    var property = props.shift();
    return function tryIt(a, b){
        var result;
        var x = a[property];
        var y = b[property];

        if (typeof x === "undefined" && typeof y !== "undefined"){
            result = -1;
        } else if (typeof x !== "undefined" && typeof y === "undefined"){
            result = 1;
        } else if (typeof x === "undefined" && typeof y === "undefined"){
            result = 0;
        } else if (customOrder && customOrder[property]){
            result = customOrder[property].indexOf(x) - customOrder[property].indexOf(y);
        } else {
            result = x < y ? -1 : x > y ? 1 : 0;
        }

        if (result === 0){
            if (props.length){
                property = props.shift();
                return tryIt(a, b);
            } else {
                return 0;
            }
        } else {
            props = properties.slice(0);
            property = props.shift();
            return result;
        }
        return 0;
    };
}

/**
Return the last item in an array.
@param {Array} - the input array
@category not chainable
@return {*}
@static
@since 1.7.0
*/
function last(arr){
    return arr[arr.length - 1];
}

/**
@param {Array} - the input array
@param {*} - the item to remove
@category not chainable
@return {*}
@static
@since 1.8.0
*/
function remove(arr, toRemove){
	return arr.splice(arr.indexOf(toRemove), 1)[0];
}

/**
Searches the array for the exact value supplied (strict equality). To query for value existance using an expression or function, use {@link module:array-tools.exists}. If you pass an array of values, contains will return true if they _all_ exist. (note: `exists` returns true if _some_ of them exist).

@param {Array} - the input array
@param {*} - the value to look for
@category not chainable
@return boolean
@static
@since 1.8.0
*/
function contains(array, value){
    if (Array.isArray(array) && !Array.isArray(value)){
    	return array.indexOf(value) > -1;
    } else if (Array.isArray(array) && Array.isArray(value)) {
        return value.every(function(item){
            return contains(array, item);
        });
    } else {
        return array === value;
    }
}

},{"object-tools":6,"typical":12}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":3,"inherits":2}],6:[function(require,module,exports){
"use strict";
var a = require("array-tools");
var t = require("typical");

/**
Useful functions for working with objects
@module object-tools
@typicalname o
@example
var o = require("object-tools");
*/
exports.extend = extend;
exports.clone = clone;
exports.every = every;
exports.each = each;
exports.exists = exists;
exports.without = without;
exports.extract = extract;
exports.where = where;
exports.select = select;
exports.get = get;

/**
Merge a list of objects, left to right, into one - to a maximum depth of 10.

@param {...object} object - a sequence of object instances to be extended
@returns {object}
@static
@example
> o.extend({ one: 1, three: 3 }, { one: "one", two: 2 }, { four: 4 });
{ one: 'one',
  three: 3,
  two: 2,
  four: 4 }
*/
function extend(){
    var depth = 0;
    var args = a.arrayify(arguments);
    if (!args.length) return {};
    var last = a(args).last();
    if (t.isPlainObject(last) && "__depth" in last){
        depth = last.__depth;
        args.pop();
    }
    return args.reduce(function(prev, curr){
        if (typeof curr !== "object") return prev;
        for (var prop in curr){
            var value = curr[prop];
            if (t.isObject(value) && !Array.isArray(value) && depth < 10){
                if (!prev[prop]) prev[prop] = {};
                prev[prop] = extend(prev[prop], value, { __depth: ++depth });
            } else {
                prev[prop] = value;
            }
        }
        return prev;
    }, {});
}

/**
Clones an object or array
@param {object|array} input - the input to clone
@returns {object|array}
@static
@example
> date = new Date()
Fri May 09 2014 13:54:34 GMT+0200 (CEST)
> o.clone(date)
{}  // a Date instance doesn't own any properties
> date.clive = "hater"
'hater'
> o.clone(date)
{ clive: 'hater' }
> array = [1,2,3]
[ 1, 2, 3 ]
> newArray = o.clone(array)
[ 1, 2, 3 ]
> array === newArray
false
*/
function clone(input){
    var output;
    if (typeof input === "object" && !Array.isArray(input) && input !== null){
        output = {};
        for (var prop in input){
            output[prop] = input[prop];
        }
        return output;
    } else if (Array.isArray(input)){
        output = [];
        input.forEach(function(item){
            output.push(clone(item));
        });
        return output;
    } else {
        return input;
    }
}

/**
Returns true if the supplied iterator function returns true for every property in the object
@param {object} - the object to inspect
@param {Function} - the iterator function to run against each key/value pair, the args are `(value, key)`.
@returns {boolean}
@static
@example
> function aboveTen(input){ return input > 10; }
> o.every({ eggs: 12, carrots: 30, peas: 100 }, aboveTen)
true
> o.every({ eggs: 6, carrots: 30, peas: 100 }, aboveTen)
false
*/
function every(object, iterator){
    var result = true;
    for (var prop in object){
        result = result && iterator(object[prop], prop);
    }
    return result;
}

/**
Runs the iterator function against every key/value pair in the input object
@param {object} - the object to iterate
@param {Function} - the iterator function to run against each key/value pair, the args are `(value, key)`.
@static
@example
> var total = 0;
> function addToTotal(n){ total += n; }
> o.each({ eggs: 3, celery: 2, carrots: 1 }, addToTotal)
> total
6
*/
function each(object, callback){
    for (var prop in object){
        callback(object[prop], prop);
    }
}

/**
returns true if the key/value pairs in `query` also exist identically in `object`.
Also supports RegExp values in `query`. If the `query` property begins with `!` then test is negated.

@param {object} - the object to examine
@param {object} - the key/value pairs to look for
@returns {boolean}
@static
@example
> o.exists({ a: 1, b: 2}, {a: 0})
false
> o.exists({ a: 1, b: 2}, {a: 1})
true
> o.exists({ a: 1, b: 2}, {"!a": 1})
false
> o.exists({ name: "clive hater" }, { name: /clive/ })
true
> o.exists({ name: "clive hater" }, { "!name": /ian/ })
true
> o.exists({ a: 1}, { a: function(n){ return n > 0; } })
true
> o.exists({ a: 1}, { a: function(n){ return n > 1; } })
false
*/
function exists(object, query){
    if (arguments.length !== 2) throw Error("expecting two args");
    if (!t.isObject(object)) throw Error("input object must be an object: " + object);
    if (!t.isObject(query)) throw Error("query must be an object: " + query);

    return Object.keys(query).every(function(prop){
        var queryValue = query[prop];
        var isNegated = false;
        var isContains = false;

        if (prop.charAt(0) === "!"){
            isNegated = true;
        } else if (prop.charAt(0) === "+") {
            isContains = true;
        }
        var propertyValue = object[(isNegated || isContains) ? prop.slice(1) : prop];
        if (isContains){
            queryValue = a.arrayify(queryValue);
            propertyValue = a.arrayify(propertyValue);
        }

        /* querying a property which doesn't exist, or match the query */
        if (typeof propertyValue === "undefined" && propertyValue !== queryValue){
            return isNegated;

        /* query value is an array */
        } else if (Array.isArray(queryValue)){
            return negate(a.exists(propertyValue, queryValue), isNegated);

        /* query value is a regex */
        } else if (queryValue instanceof RegExp){
            if ([ "boolean", "string", "number" ].indexOf(typeof propertyValue)  === -1){
                return isNegated;
            } else {
                return negate(queryValue.test(propertyValue), isNegated);
            }

        /* query value is a function */
        } else if (typeof queryValue === "function"){
            return negate(queryValue(propertyValue), isNegated);

        /* query and property value are objects */
        } else if (t.isObject(propertyValue) && t.isObject(queryValue)){
            return negate(exists(propertyValue, queryValue), isNegated);

        /* query value is a primitive */
        } else {
            return negate(queryValue === propertyValue, isNegated);
        }
    });
}

function negate(value, isNegated){
    return isNegated ? !value : value;
}

/**
Returns a clone of the object minus the specified properties. See also {@link module:object-tools.select}.
@param {object} - the input object
@param {string|string[]} - a single property, or array of properties to omit
@returns {object}
@static
@example
> o.without({ a: 1, b: 2, c: 3}, "b")
{ a: 1, c: 3 }
> o.without({ a: 1, b: 2, c: 3}, ["b", "a"])
{ c: 3 }
*/
function without(object, toRemove){
    toRemove = a.arrayify(toRemove);
    var output = clone(object);
    toRemove.forEach(function(remove){
        delete output[remove];
    });
    return output;
}

/**
Returns a new object containing the key/value pairs which satisfy the query
@param {object} - The input object
@param {string[]|function(*, string)} - Either an array of property names, or a function. The function is called with `(value, key)` and must return `true` to be included in the output.
@returns {object}
@static
@example
> object = { a: 1, b: 0, c: 2 }
{ a: 1, b: 0, c: 2 }
> o.where(object, function(value, key){
      return value > 0;
  });
{ a: 1, c: 2 }
> o.where(object, [ "b" ]);
{ b: 0 }
> object
{ a: 1, b: 0, c: 2 }
@since 1.2.0
*/
function where(object, query){
    var output = {};
    if (typeof query === "function"){
        for (var prop in object){
            if (query(object[prop], prop) === true) output[prop] = object[prop];
        }
    } else if (Array.isArray(query)){
        for (var prop in object){
            if (query.indexOf(prop) > -1) output[prop] = object[prop];
        }
    }
    return output;
}

/**
identical to `o.where(object, query)` with one exception - the found properties are removed from the input `object`
@param {object} - The input object
@param {string[]|function(*, string)} - Either an array of property names, or a function. The function is called with `(value, key)` and must return `true` to be included in the output.
@returns {object}
@static
@example
> object = { a: 1, b: 0, c: 2 }
{ a: 1, b: 0, c: 2 }
> o.where(object, function(value, key){
      return value > 0;
  });
{ a: 1, c: 2 }
> object
{ b: 0 }
@since 1.2.0
*/
function extract(object, query){
    var output = where(object, query);
    for (var prop in output){
        delete object[prop];
    }
    return output;
}

/**
Returns a new object containing only the selected fields. See also {@link module:object-tools.without}.
@param {object} - the input object
@param {array} - a list of fields to return
@returns {object}
@static
*/
function select(object, fields){
    return fields.reduce(function(prev, curr){
        prev[curr] = object[curr];
        return prev;
    }, {});
}

/**
Returns the value at the given property.
@param {object} - the input object
@param {string} - the property accessor expression
@returns {*}
@static
@since 1.4.0
*/
function get(object, expression){
    return expression.trim().split(".").reduce(function(prev, curr){
        return prev && prev[curr];
    }, object);
}

function set(object, expression, value){
}

},{"array-tools":7,"typical":11}],7:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1,"object-tools":8,"typical":11}],8:[function(require,module,exports){
"use strict";
var a = require("array-tools");
var t = require("typical");
var util = require("util");

/**
Useful functions for working with objects
@module object-tools
@typicalname o
@example
var o = require("object-tools");
*/
exports.extend = extend;
exports.clone = clone;
exports.every = every;
exports.each = each;
exports.exists = exists;
exports.without = without;
exports.extract = extract;
exports.where = where;
exports.select = select;
exports.get = get;

/**
Merge a list of objects, left to right, into one - to a maximum depth of 10.

@param {...object} object - a sequence of object instances to be extended
@returns {object}
@static
@example
> o.extend({ one: 1, three: 3 }, { one: "one", two: 2 }, { four: 4 });
{ one: 'one',
  three: 3,
  two: 2,
  four: 4 }
*/
function extend(){
    var depth = 0;
    var args = a.arrayify(arguments);
    if (!args.length) return {};
    var last = a(args).last();
    if (t.isPlainObject(last) && "__depth" in last){
        depth = last.__depth;
        args.pop();
    }
    return args.reduce(function(prev, curr){
        if (typeof curr !== "object") return prev;
        for (var prop in curr){
            var value = curr[prop];
            if (t.isObject(value) && !Array.isArray(value) && depth < 10){
                if (!prev[prop]) prev[prop] = {};
                prev[prop] = extend(prev[prop], value, { __depth: ++depth });
            } else {
                prev[prop] = value;
            }
        }
        return prev;
    }, {});
}

/**
Clones an object or array
@param {object|array} input - the input to clone
@returns {object|array}
@static
@example
> date = new Date()
Fri May 09 2014 13:54:34 GMT+0200 (CEST)
> o.clone(date)
{}  // a Date instance doesn't own any properties
> date.clive = "hater"
'hater'
> o.clone(date)
{ clive: 'hater' }
> array = [1,2,3]
[ 1, 2, 3 ]
> newArray = o.clone(array)
[ 1, 2, 3 ]
> array === newArray
false
*/
function clone(input){
    var output;
    if (typeof input === "object" && !Array.isArray(input) && input !== null){
        output = {};
        for (var prop in input){
            output[prop] = input[prop];
        }
        return output;
    } else if (Array.isArray(input)){
        output = [];
        input.forEach(function(item){
            output.push(clone(item));
        });
        return output;
    } else {
        return input;
    }
}

/**
Returns true if the supplied iterator function returns true for every property in the object
@param {object} - the object to inspect
@param {Function} - the iterator function to run against each key/value pair, the args are `(value, key)`.
@returns {boolean}
@static
@example
> function aboveTen(input){ return input > 10; }
> o.every({ eggs: 12, carrots: 30, peas: 100 }, aboveTen)
true
> o.every({ eggs: 6, carrots: 30, peas: 100 }, aboveTen)
false
*/
function every(object, iterator){
    var result = true;
    for (var prop in object){
        result = result && iterator(object[prop], prop);
    }
    return result;
}

/**
Runs the iterator function against every key/value pair in the input object
@param {object} - the object to iterate
@param {Function} - the iterator function to run against each key/value pair, the args are `(value, key)`.
@static
@example
> var total = 0;
> function addToTotal(n){ total += n; }
> o.each({ eggs: 3, celery: 2, carrots: 1 }, addToTotal)
> total
6
*/
function each(object, callback){
    for (var prop in object){
        callback(object[prop], prop);
    }
}

/**
returns true if the key/value pairs in `query` also exist identically in `object`.
Also supports RegExp values in `query`. If the `query` property begins with `!` then test is negated.

@param {object} - the object to examine
@param {object} - the key/value pairs to look for
@returns {boolean}
@static
@example
> o.exists({ a: 1, b: 2}, {a: 0})
false
> o.exists({ a: 1, b: 2}, {a: 1})
true
> o.exists({ a: 1, b: 2}, {"!a": 1})
false
> o.exists({ name: "clive hater" }, { name: /clive/ })
true
> o.exists({ name: "clive hater" }, { "!name": /ian/ })
true
> o.exists({ a: 1}, { a: function(n){ return n > 0; } })
true
> o.exists({ a: 1}, { a: function(n){ return n > 1; } })
false
*/
function exists(object, query){
    if (arguments.length !== 2) throw Error("expecting two args");
    if (!t.isObject(object)) throw Error("input object must be an object: " + object);
    if (!t.isObject(query)) throw Error("query must be an object: " + query);

    return Object.keys(query).every(function(prop){
        var queryValue = query[prop];
        var isNegated = false;
        var isContains = false;

        if (prop.charAt(0) === "!"){
            isNegated = true;
        } else if (prop.charAt(0) === "+") {
            isContains = true;
        }
        var propertyValue = object[(isNegated || isContains) ? prop.slice(1) : prop];
        if (isContains){
            queryValue = a.arrayify(queryValue);
            propertyValue = a.arrayify(propertyValue);
        }

        /* querying a property which doesn't exist, or match the query */
        if (typeof propertyValue === "undefined" && propertyValue !== queryValue){
            return isNegated;

        /* query value is an array */
        } else if (Array.isArray(queryValue)){
            return negate(a.exists(propertyValue, queryValue), isNegated);

        /* query value is a regex */
        } else if (queryValue instanceof RegExp){
            if ([ "boolean", "string", "number" ].indexOf(typeof propertyValue)  === -1){
                return isNegated;
            } else {
                return negate(queryValue.test(propertyValue), isNegated);
            }

        /* query value is a function */
        } else if (typeof queryValue === "function"){
            return negate(queryValue(propertyValue), isNegated);

        /* query and property value are objects */
        } else if (t.isObject(propertyValue) && t.isObject(queryValue)){
            return negate(exists(propertyValue, queryValue), isNegated);

        /* query value is a primitive */
        } else {
            return negate(queryValue === propertyValue, isNegated);
        }
    });
}

function negate(value, isNegated){
    return isNegated ? !value : value;
}

/**
Returns a clone of the object minus the specified properties. See also {@link module:object-tools.select}.
@param {object} - the input object
@param {string|string[]} - a single property, or array of properties to omit
@returns {object}
@static
@example
> o.without({ a: 1, b: 2, c: 3}, "b")
{ a: 1, c: 3 }
> o.without({ a: 1, b: 2, c: 3}, ["b", "a"])
{ c: 3 }
*/
function without(object, toRemove){
    toRemove = a.arrayify(toRemove);
    var output = clone(object);
    toRemove.forEach(function(remove){
        delete output[remove];
    });
    return output;
}

/**
Returns a new object containing the key/value pairs which satisfy the query
@param {object} - The input object
@param {string[]|function(*, string)} - Either an array of property names, or a function. The function is called with `(value, key)` and must return `true` to be included in the output.
@returns {object}
@static
@example
> object = { a: 1, b: 0, c: 2 }
{ a: 1, b: 0, c: 2 }
> o.where(object, function(value, key){
      return value > 0;
  });
{ a: 1, c: 2 }
> o.where(object, [ "b" ]);
{ b: 0 }
> object
{ a: 1, b: 0, c: 2 }
@since 1.2.0
*/
function where(object, query){
    var output = {};
    if (typeof query === "function"){
        for (var prop in object){
            if (query(object[prop], prop) === true) output[prop] = object[prop];
        }
    } else if (Array.isArray(query)){
        for (var prop in object){
            if (query.indexOf(prop) > -1) output[prop] = object[prop];
        }
    }
    return output;
}

/**
identical to `o.where(object, query)` with one exception - the found properties are removed from the input `object`
@param {object} - The input object
@param {string[]|function(*, string)} - Either an array of property names, or a function. The function is called with `(value, key)` and must return `true` to be included in the output.
@returns {object}
@static
@example
> object = { a: 1, b: 0, c: 2 }
{ a: 1, b: 0, c: 2 }
> o.where(object, function(value, key){
      return value > 0;
  });
{ a: 1, c: 2 }
> object
{ b: 0 }
@since 1.2.0
*/
function extract(object, query){
    var output = where(object, query);
    for (var prop in output){
        delete object[prop];
    }
    return output;
}

/**
Returns a new object containing only the selected fields. See also {@link module:object-tools.without}.
@param {object} - the input object
@param {array} - a list of fields to return
@returns {object}
@static
*/
function select(object, fields){
    return fields.reduce(function(prev, curr){
        prev[curr] = object[curr];
        return prev;
    }, {});
}

/**
Returns the value at the given property.
@param {object} - the input object
@param {string} - the property accessor expression
@returns {*}
@static
@since 1.4.0
*/
function get(object, expression){
    return expression.trim().split(".").reduce(function(prev, curr){
        return prev && prev[curr];
    }, object);
}

},{"array-tools":9,"typical":11,"util":5}],9:[function(require,module,exports){
"use strict";

/* set module.exports above the requires: necessary to avoid circular reference issues with object-tools */
module.exports = ArrayTools;

var t = require("typical");
var o = require("object-tools");
var util = require("util");

/**
@module
@typicalname a
*/
ArrayTools.pluck = pluck;
ArrayTools.pick = pick;
ArrayTools.commonSequence = commonSequence;
ArrayTools.arrayify = arrayify;
ArrayTools.exists = exists;
ArrayTools.without = without;
ArrayTools.union = union;
ArrayTools.where = where;
ArrayTools.findWhere = findWhere;
ArrayTools.unique = unique;
ArrayTools.spliceWhile = spliceWhile;
ArrayTools.extract = extract;
ArrayTools.flatten = flatten;
ArrayTools.sortBy = sortBy;
ArrayTools.last = last;
ArrayTools.remove = remove;
ArrayTools.contains = contains;

function ArrayTools(input){
    if (!(this instanceof ArrayTools)) return new ArrayTools(input);
	this._data = input;
}

ArrayTools.prototype.val = function(){
    return this._data;
};

/* Array methods which return the chainable */
["filter", "reverse", "sort", "concat", "slice", "every", "some", "map"].forEach(function(method){
    ArrayTools.prototype[method] = function(){
        this._data = Array.prototype[method].apply(this._data, arguments);
        return this;
    };
});

/* Array method chain terminators, return a scalar */
["join"].forEach(function(method){
    ArrayTools.prototype[method] = function(){
        return Array.prototype[method].apply(this._data, arguments);
    };
});


/* array-tools methods which return the chainable */
["pluck", "pick", "arrayify", "where", "without", "unique", "spliceWhile", "extract", "flatten", "sortBy"].forEach(function(method){
    ArrayTools.prototype[method] = function(){
        var args = arrayify(arguments);
        args.unshift(this._data);
        this._data = ArrayTools[method].apply(null, args);
        return this;
    };
});

/* array-tools method chain terminators, return a scalar or non-array */
["exists", "findWhere", "last", "remove", "contains"].forEach(function(method){
    ArrayTools.prototype[method] = function(){
        var args = arrayify(arguments);
		args.unshift(this._data);
		return ArrayTools[method].apply(null, args);
    };
});

/**
Takes any input and guarantees an array back.

- converts array-like objects (e.g. `arguments`) to a real array
- converts `null` or `undefined` to an empty array
- converts any another other, singular value into an array containing that value
- ignores input which is already an array

@param {*} - the input value to convert to an array
@returns {Array}
@category chainable
@static
@example
> a.arrayify(null)
[]

> a.arrayify(0)
[ 0 ]

> a.arrayify([ 1, 2 ])
[ 1, 2 ]

> function f(){ return a.arrayify(arguments); }
> f(1,2,3)
[ 1, 2, 3 ]
*/
function arrayify(any){
    if (any === null || any === undefined){
        return [];
    } else if (t.isArrayLike(any)){
        return Array.prototype.slice.call(any);
    } else {
        return Array.isArray(any) ? any : [ any ];
    }
}

/**
Query a recordset, at any depth.. 

@param {object[]} - the recordset to query
@param {query} - the query definition
@returns {Array}
@category chainable
@static
@example
> data = [
    { name: "Dana", age: 30 },
    { name: "Yana", age: 20 },
    { name: "Zhana", age: 10 }
]

> // match on an exact value
> a.where(data, { age: 10 })
[ { name: 'Zhana', age: 10 } ]

> // match records which satisfy the function testing the value of the `age` field
> a.where(data, { age: function(ageValue){ return ageValue > 10; }  })
[ { name: 'Dana', age: 30 }, { name: 'Yana', age: 20 } ]

> // match if NOT the value
> a.where(data, { "!age": 10 })
[ { name: 'Dana', age: 30 }, { name: 'Yana', age: 20 } ]

> // match on regular expression
> a.where(data, { name: /ana/ })
[ { name: 'Dana', age: 30 },
  { name: 'Yana', age: 20 },
  { name: 'Zhana', age: 10 } ]

> // you can perform deep queries 
> deepData = [
    { name: "Dana", favourite: { colour: "light red" } },
    { name: "Yana", favourite: { colour: "dark red" } },
    { name: "Zhana", favourite: { colour: [ "white", "red" ] } }
]

> // match values of `person.favourite.colour` which match the regex `/red/`
> a.where(deepData, { favourite: { colour: /red/ } })
[ { name: 'Dana', favourite: { colour: 'light red' } },
  { name: 'Yana', favourite: { colour: 'dark red' } } ]

> // if there are one or more values for colour (i.e. the field may contain a singular
> // or array of values) then search inside arrays too 
> a.where(deepData, { favourite: { "+colour": /red/ } })
[ { name: 'Dana', favourite: { colour: 'light red' } },
  { name: 'Yana', favourite: { colour: 'dark red' } },
  { name: 'Zhana', favourite: { colour: [ "white", "red" ] } } ]
*/
function where(arrayOfObjects, query){
    return arrayify(arrayOfObjects).filter(function(item){
        return o.exists(item, query);
    });
}

/**
Plucks the value of the specified property from each object in the input array

@param arrayOfObjects {object[]} - The input recordset
@param property {...string} - Up to three property names - the first one found will be returned.
@returns {Array}
@category chainable
@static
@example
> var data = [
    { a: "Lionel", b: "Roger" },
    { a: "Luis", b: "Craig" },
    { b: "Peter" },
]

> a.pluck(data, "a")
[ 'Lionel', 'Luis' ]

> a.pluck(data, "a", "b")
[ 'Lionel', 'Luis', 'Peter' ]
*/
function pluck(arrayOfObjects, property, property2, property3){
    if (!Array.isArray(arrayOfObjects)) throw new Error(".pluck() input must be an array");

    return arrayOfObjects
        .filter(function(obj){
            var one = eval("obj." + property);
            var two = eval("obj." + property2);
            var three = eval("obj." + property3);
            return one || two || three;
        })
        .map(function(obj){
            var one = eval("obj." + property);
            var two = eval("obj." + property2);
            var three = eval("obj." + property3);
            return one || two || three;
        });
}

/**
return a copy of the input `arrayOfObjects` containing objects having only the cherry-picked properties
@param arrayOfObjects {object[]} - the input
@param property {...string} - the properties to include in the result
@return {object[]}
@category chainable
@example
> data = [
    { name: "Dana", age: 30 },
    { name: "Yana", age: 20 },
    { name: "Zhana", age: 10 }
]

> a.pick(data, "name")
[ { name: 'Dana' }, { name: 'Yana' }, { name: 'Zhana' } ]

> a.pick(data, "name", "age")
[ { name: 'Dana', age: 30 },
  { name: 'Yana', age: 20 },
  { name: 'Zhana', age: 10 } ]
@alias module:array-tools.pick
*/
function pick(){
    var args = arrayify(arguments);
    var arrayOfObjects = args.shift();
    var properties = args;

    if (!Array.isArray(arrayOfObjects)) throw new Error(".pick() input must be an array");

    return arrayOfObjects
        .filter(function(obj){
            return properties.some(function(prop){
                return obj[prop] !== undefined;
            });
        })
        .map(function(obj){
            var output = {};
            properties.forEach(function(prop){
                if (obj[prop] !== undefined){
                    output[prop] = obj[prop];
                }
            });
            return output;
        });
}

/**
returns true if a value, or nested object value exists in an array
@param {Array} - the array to search
@param {*} - the value to search for
@returns {boolean}
@category not chainable
@static
@example
> a.exists([ 1, 2, 3 ], 2)
true

> a.exists([ { result: false }, { result: false } ], { result: true })
false

> a.exists([ { result: true }, { result: false } ], { result: true })
true

> a.exists([ { result: true }, { result: true } ], { result: true })
true
*/
function exists(array, value){
    if (t.isPlainObject(value)){
        var query = value;
        var found = false;
        var index = 0;
        var item;

        while(!found && (item = array[index++])){
            found = o.exists(item, query);
        }
        return found;
    } else {
        return array.indexOf(value) > -1;
    }
}

/**
returns the first item from `arrayOfObjects` where key/value pairs
from `query` are matched identically
@param {object[]} - the array to search
@param {object} - an object containing the key/value pairs you want to match
@returns {object}
@category not chainable
@example
> dudes = [{ name: "Jim", age: 8}, { name: "Clive", age: 8}, { name: "Hater", age: 9}]
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 },
  { name: 'Hater', age: 9 } ]

> a.findWhere(dudes, { age: 8})
{ name: 'Jim', age: 8 }
@alias module:array-tools.findWhere
*/
function findWhere(arrayOfObjects, query){
    var result = where(arrayOfObjects, query);
    return result.length ? result[0] : null;
}


/**
Returns the input minus the specified values.
@param {Array} - the input array
@param {*} - a single, or array of values to omit
@returns {Array}
@category chainable
@example
> a.without([ 1, 2, 3 ], 2)
[ 1, 3 ]

> a.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]
@alias module:array-tools.without
*/
function without(array, toRemove){
    toRemove = arrayify(toRemove);
    return array.filter(function(item){
        return !exists(toRemove, item);
    });
}

/**
merge two arrays into a single array of unique values
@param {Array} - First array
@param {Array} - Second array
@param {string} - the unique ID property name
@returns {Array}
@category chainable
@example
> var array1 = [ 1, 2 ], array2 = [ 2, 3 ];
> a.union(array1, array2)
[ 1, 2, 3 ]

> var array1 = [ { id: 1 }, { id: 2 } ], array2 = [ { id: 2 }, { id: 3 } ];
> a.union(array1, array2)
[ { id: 1 }, { id: 2 }, { id: 3 } ]

> var array2 = [ { id: 2, blah: true }, { id: 3 } ]
> a.union(array1, array2)
[ { id: 1 },
  { id: 2 },
  { id: 2, blah: true },
  { id: 3 } ]
> a.union(array1, array2, "id")
[ { id: 1 }, { id: 2 }, { id: 3 } ]
@alias module:array-tools.union
*/
function union(array1, array2, idKey){
    var result = o.clone(array1);
    array2.forEach(function(item){
        if (idKey){
            var query = {};
            query[idKey] = item[idKey];
            if (!findWhere(result, query)){
                result.push(item);
            }
        } else if (!exists(result, item)){
            result.push(item);
        };
    });
    return result;
}

/**
Returns the initial elements which both input arrays have in common
@param {Array} - first array to compare
@param {Array} - second array to compare
@returns {Array}
@category chainable
@example
> a.commonSequence([1,2,3], [1,2,4])
[ 1, 2 ]
@alias module:array-tools.commonSequence
*/
function commonSequence(a, b){
    var result = [];
    for (var i = 0; i < Math.min(a.length, b.length); i++){
        if (a[i] === b[i]){
            result.push(a[i]);
        } else {
            break;
        }
    }
    return result;
}

/**
returns an array of unique values
@param {Array} - input array
@returns {Array}
@category chainable
@example
> n = [1,6,6,7,1]
[ 1, 6, 6, 7, 1 ]

> a.unique(n)
[ 1, 6, 7 ]
@alias module:array-tools.unique
*/
function unique(array){
    return array.reduce(function(prev, curr){
        if (prev.indexOf(curr) === -1) prev.push(curr);
        return prev;
    }, []);
}

/**
splice from `index` until `test` fails
@param {Array} - the input array
@param {number} - the position to begin splicing from
@param {RegExp} - the test to continue splicing while true
@param ...elementN {*} - the elements to add to the array
@returns {Array}
@category chainable
@example
> letters = ["a", "a", "b"]
[ 'a', 'a', 'b' ]

> a.spliceWhile(letters, 0, /a/, "x")
[ 'a', 'a' ]

> letters
[ 'x', 'b' ]
@alias module:array-tools.spliceWhile
*/
function spliceWhile(array, index, test){
    for (var i = 0; i < array.length; i++){
        if (!test.test(array[i])) break;
    }
    var spliceArgs = [ index, i ];
    spliceArgs = spliceArgs.concat(arrayify(arguments).slice(3));
    return array.splice.apply(array, spliceArgs);
}

/**
Removes items from `array` which satisfy the query. Modifies the input array, returns the extracted.
@param {Array} - the input array, modified directly
@param {function | object} - Per item in the array, if either the function returns truthy or the exists query is satisfied, the item is extracted
@returns {Array} the extracted items.
@category chainable
@alias module:array-tools.extract
*/
function extract(array, query){
    var result = [];
    var toSplice = [];
    arrayify(array).forEach(function(item, index){
        if (t.isPlainObject(query)){
            if(o.exists(item, query)){
                result.push(item);
                toSplice.push(index);
            }
        } else {
            if (query(item)){
                result.push(item);
                toSplice.push(index);
            }
        }
    });
    for (var i = 0; i < toSplice.length; i++){
        array.splice(toSplice[i] - i, 1);
    }
    return result;
}

/**
flatten an array of arrays into a single array
@static
@since 1.4.0
@param {Array} - the input array
@returns {Array}
@category chainable
@example
> numbers = [ 1, 2, [ 3, 4 ], 5 ]
> a.flatten(numbers)
[ 1, 2, 3, 4, 5 ]
*/
function flatten(array){
    return arrayify(array).reduce(function(prev, curr){
        return prev.concat(curr);
    }, []);
}

/**
Sort an array of objects by one or more fields
@static
@param {object[]} - input array
@param {string|string[]} - column name(s) to sort by
@param {object} - specific sort orders, per columns
@returns {Array}
@category chainable
@since 1.5.0
@example
>  var fixture = [
    { a: 4, b: 1, c: 1},
    { a: 4, b: 3, c: 1},
    { a: 2, b: 2, c: 3},
    { a: 2, b: 2, c: 2},
    { a: 1, b: 3, c: 4},
    { a: 1, b: 1, c: 4},
    { a: 1, b: 2, c: 4},
    { a: 3, b: 3, c: 3},
    { a: 4, b: 3, c: 1}
];
> a.sortBy(fixture, ["a", "b", "c"])
[ { a: 1, b: 1, c: 4 },
  { a: 1, b: 2, c: 4 },
  { a: 1, b: 3, c: 4 },
  { a: 2, b: 2, c: 2 },
  { a: 2, b: 2, c: 3 },
  { a: 3, b: 3, c: 3 },
  { a: 4, b: 1, c: 1 },
  { a: 4, b: 3, c: 1 },
  { a: 4, b: 3, c: 1 } ]
*/
function sortBy(arrayOfObjects, columns, customOrder){
    return arrayOfObjects.sort(sortByFunc(arrayify(columns), customOrder));
}

function  sortByFunc(properties, customOrder){
    var props = properties.slice(0);
    var property = props.shift();
    return function tryIt(a, b){
        var result;
        var x = a[property];
        var y = b[property];

        if (typeof x === "undefined" && typeof y !== "undefined"){
            result = -1;
        } else if (typeof x !== "undefined" && typeof y === "undefined"){
            result = 1;
        } else if (typeof x === "undefined" && typeof y === "undefined"){
            result = 0;
        } else if (customOrder && customOrder[property]){
            result = customOrder[property].indexOf(x) - customOrder[property].indexOf(y);
        } else {
            result = x < y ? -1 : x > y ? 1 : 0;
        }

        if (result === 0){
            if (props.length){
                property = props.shift();
                return tryIt(a, b);
            } else {
                return 0;
            }
        } else {
            props = properties.slice(0);
            property = props.shift();
            return result;
        }
        return 0;
    };
}

/**
Return the last item in an array.
@param {Array} - the input array
@category not chainable
@return {*}
@static
@since 1.7.0
*/
function last(arr){
    return arr[arr.length - 1];
}

/**
@param {Array} - the input array
@param {*} - the item to remove
@category not chainable
@return {*}
@static
@since 1.8.0
*/
function remove(arr, toRemove){
	return arr.splice(arr.indexOf(toRemove), 1)[0];
}

/**
Searches the array for the exact value supplied (strict equality). To query for value existance using an expression or function, use {@link module:array-tools.exists}.

@param {Array} - the input array
@param {*} - the value to look for
@category not chainable
@return boolean
@static
@since 1.8.0
*/
function contains(arr, value){
	return arr.indexOf(value) > -1;
}

},{"object-tools":10,"typical":11,"util":5}],10:[function(require,module,exports){
"use strict";
var a = require("array-tools");
var t = require("typical");
var util = require("util");

/**
Useful functions for working with objects
@module
@typicalname o
@example
var o = require("object-tools");
*/
exports.extend = extend;
exports.clone = clone;
exports.defined = defined;
exports.every = every;
exports.each = each;
exports.omit = omit;
exports.exists = exists;
exports.without = without;
exports.extract = extract;
exports.where = where;
exports.select = select;
exports.get = get;

/**
Merge a list of objects, left to right, into one.
@param {...object} object - a sequence of object instances to be extended
@returns {object}
@static
@example
> o.extend({ one: 1, three: 3 }, { one: "one", two: 2 }, { four: 4 });
{ one: 'one',
  three: 3,
  two: 2,
  four: 4 }
*/
function extend(){
    var depth = 0;
    var args = a.arrayify(arguments);
    if (!args.length) return {};
    var last = a(args).last();
    if (t.isPlainObject(last) && "__depth" in last){
        depth = last.__depth;
        args.pop();
    }
    return args.reduce(function(prev, curr){
        if (typeof curr !== "object") return prev;
        for (var prop in curr){
            var value = curr[prop];
            if (t.isObject(value) && !Array.isArray(value) && depth < 10){
                if (!prev[prop]) prev[prop] = {};
                prev[prop] = extend(prev[prop], value, { __depth: ++depth });
            } else {
                prev[prop] = value;
            }
        }
        return prev;
    }, {});
}

/**
Clones an object or array
@param {object|array} input - the input to clone
@returns {object|array}
@static
@example
> date = new Date()
Fri May 09 2014 13:54:34 GMT+0200 (CEST)
> o.clone(date)
{}  // a Date instance doesn't own any properties
> date.clive = "hater"
'hater'
> o.clone(date)
{ clive: 'hater' }
> array = [1,2,3]
[ 1, 2, 3 ]
> newArray = o.clone(array)
[ 1, 2, 3 ]
> array === newArray
false
*/
function clone(input){
    var output;
    if (typeof input === "object" && !Array.isArray(input) && input !== null){
        output = {};
        for (var prop in input){
            output[prop] = input[prop];
        }
        return output;
    } else if (Array.isArray(input)){
        output = [];
        input.forEach(function(item){
            output.push(clone(item));
        });
        return output;
    } else {
        return input;
    }
}

/**
Returns a clone of the input object, minus the specified properties
@param {object} - the object to clone
@param {string[]} - an array of property names to omit from the clone
@returns {object}
@static
@deprecated Replaced by `o.without`
@example
> o.omit({ one: 1, two: 2, three: 3, four: 4 }, [ "two", "four" ]);
{ one: 1, three: 3 }
*/
function omit(object, toOmit){
    toOmit = a.arrayify(toOmit);
    var output = clone(object);
    toOmit.forEach(function(omit){
        delete output[omit];
    });
    return output;
}

/**
Returns true if the supplied iterator function returns true for every property in the object
@param {object} - the object to inspect
@param {Function} - the iterator function to run against each key/value pair, the args are `(value, key)`.
@returns {boolean}
@static
@example
> function aboveTen(input){ return input > 10; }
undefined
> o.every({ eggs: 12, carrots: 30, peas: 100 }, aboveTen)
true
> o.every({ eggs: 6, carrots: 30, peas: 100 }, aboveTen)
false
*/
function every(object, iterator){
    var result = true;
    for (var prop in object){
        result = result && iterator(object[prop], prop);
    }
    return result;
}

/**
Runs the iterator function against every key/value pair in the input object
@param {object} - the object to iterate
@param {Function} - the iterator function to run against each key/value pair, the args are `(value, key)`.
@static
@example
> var total = 0;
undefined
> function addToTotal(n){ total += n; }
undefined
> o.each({ eggs: 3, celery: 2, carrots: 1 }, addToTotal)
undefined
> total
6
*/
function each(object, callback){
    for (var prop in object){
        callback(object[prop], prop);
    }
}

/**
returns true if the key/value pairs in `query` also exist identically in `object`.
Also supports RegExp values in `query`. If the `query` property begins with `!` then test is negated.
@param {object} - the object to examine
@param {object} - the key/value pairs to look for
@returns {boolean}
@static
@example
> o.exists({ a: 1, b: 2}, {a: 0})
false
> o.exists({ a: 1, b: 2}, {a: 1})
true
> o.exists({ a: 1, b: 2}, {"!a": 1})
false
> o.exists({ name: "clive hater" }, { name: /clive/ })
true
> o.exists({ name: "clive hater" }, { "!name": /ian/ })
true
> o.exists({ a: 1}, { a: function(n){ return n > 0; } })
true
> o.exists({ a: 1}, { a: function(n){ return n > 1; } })
false
*/
function exists(object, query){
    if (arguments.length !== 2) throw Error("expecting two args");
    if (typeof query !== "object") throw Error("query must be an object");
    object = object || {};
    var found = true, queryValue, objectValue;
    for (var prop in query){
        var isNegated = false;
        var isContains = false;
        
        if (prop.charAt(0) === "!"){
            isNegated = true;
        } else if (prop.charAt(0) === "+") {
            isContains = true;
        }
        var queryValue = query[prop];
        var objectValue = object[(isNegated || isContains) ? prop.slice(1) : prop];
        if (isContains){
            queryValue = a.arrayify(queryValue);
            objectValue = a.arrayify(objectValue);
        }
        
        if (Array.isArray(queryValue)){
            objectValue = objectValue || [];
            found = queryValue.every(function(query, index){
                return exists(objectValue[index], query);
            });
            
        } else if (queryValue instanceof RegExp){
            if (!(typeof objectValue === "boolean" || typeof objectValue === "string" || typeof objectValue === "number")){
                found = isNegated;
            } else {
                found = isNegated
                    ? !queryValue.test(objectValue)
                    : queryValue.test(objectValue);
            }
            
        } else if (typeof queryValue === "function"){
            found = isNegated
                ? !queryValue(objectValue)
                : queryValue(objectValue);

        } else if (t.isObject(objectValue) && t.isObject(queryValue)){
            found = exists(objectValue, queryValue);
            
        } else {
            found = isNegated
                ? queryValue !== objectValue
                : queryValue === objectValue;
        }
        if (!found) break;
    }
    return found;
}

/**
Returns a clone of the object minus the specified properties. See also {@link module:object-tools.select}.
@param {object} - the input object
@param {string|string[]} - a single property, or array of properties to omit
@returns {object}
@static
@example
> o.without({ a: 1, b: 2, c: 3}, "b")
{ a: 1, c: 3 }
> o.without({ a: 1, b: 2, c: 3}, ["b", "a"])
{ c: 3 }
*/
function without(object, toRemove){
    toRemove = a.arrayify(toRemove);
    var output = clone(object);
    toRemove.forEach(function(remove){
        delete output[remove];
    });
    return output;
}

/**
@ignore
@todo deprecate this
*/
function defined(object){
    var output = {};
    for (var prop in object){
        if (object[prop] !== undefined) output[prop] = object[prop];
    }
    return output;
}

/**
Returns a new object containing the key/value pairs which satisfy the query
@param {object} - The input object
@param {string[]|function(*, string)} - Either an array of property names, or a function. The function is called with `(value, key)` and must return `true` to be included in the output.
@returns {object}
@static
@example
> object = { a: 1, b: 0, c: 2 }
{ a: 1, b: 0, c: 2 }
> o.where(object, function(value, key){
      return value > 0;
  });
{ a: 1, c: 2 }
> o.where(object, [ "b" ]);
{ b: 0 }
> object
{ a: 1, b: 0, c: 2 }
@since 1.2.0
*/
function where(object, query){
    var output = {};
    if (typeof query === "function"){
        for (var prop in object){
            if (query(object[prop], prop) === true) output[prop] = object[prop];
        }
    } else if (Array.isArray(query)){
        for (var prop in object){
            if (query.indexOf(prop) > -1) output[prop] = object[prop];
        }
    }
    return output;
}

/**
identical to `o.where(object, query)` with one exception - the found properties are removed from the input `object`
@param {object} - The input object
@param {string[]|function(*, string)} - Either an array of property names, or a function. The function is called with `(value, key)` and must return `true` to be included in the output.
@returns {object}
@static
@example
> object = { a: 1, b: 0, c: 2 }
{ a: 1, b: 0, c: 2 }
> o.where(object, function(value, key){
      return value > 0;
  });
{ a: 1, c: 2 }
> object
{ b: 0 }
@since 1.2.0
*/
function extract(object, query){
    var output = where(object, query);
    for (var prop in output){
        delete object[prop];
    }
    return output;
}

/**
Returns a new object containing only the selected fields. See also {@link module:object-tools.without}.
@param {object} - the input object
@param {array} - a list of fields to return
@returns {object}
@static
*/
function select(object, fields){
    return fields.reduce(function(prev, curr){
        prev[curr] = object[curr];
        return prev;
    }, {});
}

/**
Returns the value at the given property.
@param {object} - the input object
@param {string} - the property accessor expression
@returns {*}
@static
@since 1.4.0
*/
function get(object, expression){
    return expression.trim().split(".").reduce(function(prev, curr){
        return prev && prev[curr];
    }, object);
}

},{"array-tools":9,"typical":11,"util":5}],11:[function(require,module,exports){
"use strict";

/**
For type-checking Javascript values.
@module typical
@typicalname t
@example
var t = require("typical");
*/
exports.isNumber = isNumber;
exports.isPlainObject = isPlainObject;
exports.isArrayLike = isArrayLike;
exports.isObject = isObject;

/**
Returns true if input is a number
@param {*} - the input to test
@returns {boolean}
@static
@example
> t.isNumber(0)
true
> t.isNumber(1)
true
> t.isNumber(1.1)
true
> t.isNumber(0xff)
true
> t.isNumber(0644)
true
> t.isNumber(6.2e5)
true
> t.isNumber(NaN)
false
> t.isNumber(Infinity)
false
*/
function isNumber(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
Returns true if input `typeof` is `object` and directly decends from `Object` (and not `Array`, `RegExp` etc.)
@param {*} - the input to test
@returns {boolean}
@static
@example
> t.isPlainObject({ clive: "hater" })
true
> t.isPlainObject(new Date())
false
> t.isPlainObject([ 0, 1 ])
false
> t.isPlainObject(1)
false
> t.isPlainObject(/test/)
false
*/
function isPlainObject(input){
    return input !== null && typeof input === "object" && input.constructor === Object;
}

/**
returns true if this object can be treated like an Array. 
@param {*} - the input to test
@returns {boolean}
@static
*/
function isArrayLike(input){
	return isObject(input) && typeof input.length === "number";
}

/**
returns true if the typeof input is `"object"`, but not null! 
@param {*} - the input to test
@returns {boolean}
@static
*/
function isObject(input){
    return typeof input ==="object" && input !== null;
}

},{}],12:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11}]},{},[1])(1)
});