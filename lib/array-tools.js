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
["filter", "reverse", "sort", "concat", "slice", "map"].forEach(function(method){
    ArrayTools.prototype[method] = function(){
        this._data = Array.prototype[method].apply(this._data, arguments);
        return this;
    };
});

/* Array method chain terminators, return a scalar or undefined */
["join", "every", "some", "forEach"].forEach(function(method){
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
Deep query an array.

@param {object[]} - the array to query
@param {any | any[]} - one or more queries
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

or where NOT the value (prefix the property name with `!`)
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

You can query to any arbitrary depth. So with deeper data, like this:
```js
> deepData = [
    { name: "Dana", favourite: { colour: "light red" } },
    { name: "Yana", favourite: { colour: "dark red" } },
    { name: "Zhana", favourite: { colour: [ "white", "red" ] } }
]
```

get records with `favourite.colour` values matching `/red/`
```js
> a.where(deepData, { favourite: { colour: /red/ } })
[ { name: 'Dana', favourite: { colour: 'light red' } },
  { name: 'Yana', favourite: { colour: 'dark red' } } ]
```
 
if the value you're looking for _maybe_ part of an array, prefix the property name with `+`. Now Zhana is included:
```js
> a.where(deepData, { favourite: { "+colour": /red/ } })
[ { name: 'Dana', favourite: { colour: 'light red' } },
  { name: 'Yana', favourite: { colour: 'dark red' } },
  { name: 'Zhana', favourite: { colour: [ "white", "red" ] } } ]
```

you can combine any of the above by supplying an array of queries. Records will be returned if _any_ of the queries match:
```js
> var nameBeginsWithY = { name: /^Y/ };
> var faveColourIncludesWhite = { favourite: { "+colour": "white" } };

> a.where(deepData, [ nameBeginsWithY, faveColourIncludesWhite ])
[ { name: 'Yana', favourite: { colour: 'dark red' } },
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
Returns a new array with the same content as the input minus the specified values. It accepts the same query syntax as {@link module:array-tools.where}.

@param {Array} - the input array
@param {any | any[]} - one, or more queries
@returns {Array}
@category chainable
@example
> a.without([ 1, 2, 3 ], 2)
[ 1, 3 ]

> a.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]

> data = [
    { name: "Dana", age: 30 },
    { name: "Yana", age: 20 },
    { name: "Zhana", age: 10 }
]
> a.without(data, { name: /ana/ })
[]

@alias module:array-tools.without
*/
function without(array, toRemove){
    toRemove = arrayify(toRemove);
    return array.filter(function(item){
        return !testValue(item, toRemove);
    });
}

/**
@private
@returns boolean
*/
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
Returns an array containing each value plucked from the specified property of each object in the input array.

@param recordset {object[]} - The input recordset
@param property {string|string[]} - Property name, or an array of property names. If an array is supplied, the first existing property will be returned.
@returns {Array}
@category chainable
@static
@example
with this data.. 
```js
> var data = [
    { name: "Pavel", nick: "Pasha" },
    { name: "Richard", nick: "Dick" },
    { name: "Trevor" },
]
```

pluck all the nicknames
```js
> a.pluck(data, "nick")
[ 'Pasha', 'Dick' ]
```

in the case no nickname exists, take the name instead:
```js
> a.pluck(data, [ "nick", "name" ])
[ 'Pasha', 'Dick', 'Trevor' ]
```

the values being plucked can be at any depth:
```js
> var data = [
    { leeds: { leeds: { leeds: "we" } } },
    { leeds: { leeds: { leeds: "are" } } },
    { leeds: { leeds: { leeds: "Leeds" } } }
];

> a.pluck(data, "leeds.leeds.leeds")
[ 'we', 'are', 'Leeds' ]
```
*/
function pluck(recordset, property){
    recordset = arrayify(recordset);
    var properties = arrayify(property);
    
    return recordset
        .map(function(record){
            for (var i = 0; i < properties.length; i++){
                var propValue = o.get(record, properties[i]);
                if (propValue) return propValue;
            }
        })
        .filter(function(record){
            return typeof record !== "undefined";
        });
}

/**
return a copy of the input `recordset` containing objects having only the cherry-picked properties
@param recordset {object[]} - the input
@param property {string|string[]} - the properties to include in the result
@return {object[]}
@category chainable
@static
@example
with this data..
```js
> data = [
    { name: "Dana", age: 30 },
    { name: "Yana", age: 20 },
    { name: "Zhana", age: 10 }
]
```

return only the `"name"` field..
```js
> a.pick(data, "name")
[ { name: 'Dana' }, { name: 'Yana' }, { name: 'Zhana' } ]
```

return both the `"name"` and `"age"` fields
```js
> a.pick(data, [ "name", "age" ])
[ { name: 'Dana', age: 30 },
  { name: 'Yana', age: 20 },
  { name: 'Zhana', age: 10 } ]
```

cherry-picks fields at any depth:
```js
> data = [
    { person: { name: "Dana", age: 30 }},
    { person: { name: "Yana", age: 20 }},
    { person: { name: "Zhana", age: 10 }}
]

> a.pick(data, "person.name")
[ { name: 'Dana' }, { name: 'Yana' }, { name: 'Zhana' } ]

> a.pick(data, "person.age")
[ { age: 30 }, { age: 20 }, { age: 10 } ]
```
*/
function pick(recordset, property){
    recordset = arrayify(recordset);
    var properties = arrayify(property);

    return recordset
        .filter(function(obj){
            return properties.some(function(prop){
                return o.get(obj, prop) !== undefined;
            });
        })
        .map(function(obj){
            var output = {};
            properties.forEach(function(prop){
                var lastProp = last(prop.split("."));
                var value = o.get(obj, prop);
                if (value) output[lastProp] = value;
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
    return where(recordset, query)[0];
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
