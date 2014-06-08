"use strict";
var t = require("typical"),
    o = require("object-ting");

/**
Useful functions for working with arrays
@module
@alias a
@example
```js
var a = require("array-ting");
```
*/

exports.commonSequence = commonSequence;
exports.arrayify = arrayify;
exports.pluck = pluck;
exports.exists = exists;
exports.without = without;
exports.first = first;
exports.union = union;
exports.where = where;
exports.findWhere = findWhere;
exports.unique = unique;
exports.spliceWhile = spliceWhile;

/** 
Plucks the value of the specified property from each object in the input array
@param {Object[]} arrayOfObjects - the input array of objects
@param {...string} the property to pluck
@returns {Array} 
@example
```js
> var data = [
...     {one: 1, two: 2},
...     {two: "two"},
...     {one: "one", two: "zwei"},
... ];
undefined
> w.pluck(data, "one");
[ 1, 'one' ]
> w.pluck(data, "two");
[ 2, 'two', 'zwei' ]
> w.pluck(data, "one", "two");
[ 1, 'two', 'one' ]
```
*/
function pluck(arrayOfObjects, property, property2, property3){
    return arrayOfObjects
        .filter(function(obj){
            if (property in obj) {
                return true;
            } else if (property2 in obj) {
                return true;
            } else if (property3 in obj) {
                return true;
            }
        })
        .map(function(obj){
            if (property in obj) {
                return obj[property];
            } else if (property2 in obj) {
                return obj[property2];
            } else if (property3 in obj) {
                return obj[property3];
            }
        });
}

/**
Takes input and guarantees an array back. Result can be one of three things:

- puts a single scalar in an array
- converts array-like object (e.g. `arguments`) to a real array
- converts null or undefined to an empty array

@param {*} - the input value to convert to an array
@returns {Array}
@example
```js
> w.arrayify(null)
[]
> w.arrayify(0)
[ 0 ]
> w.arrayify([ 1, 2 ])
[ 1, 2 ]
> function f(){ return w.arrayify(arguments); }
undefined
> f(1,2,3)
[ 1, 2, 3 ]
```
*/
function arrayify(input){
    if (input === null || input === undefined){
        return [];
    } else if (t.isPlainObject(input) && input.length >= 0 && input.length === Math.floor(input.length)){
        return Array.prototype.slice.call(input);
    } else {
        return Array.isArray(input) ? input : [ input ];
    }
}

/**
returns true if a value, or nested object value exists in an array
@param {Array} - the array to search
@param {*} - the value to search for 
@returns {boolean}
@example
```js
> w.exists([ 1, 2, 3 ], 2)
true
> w.exists([ { result: false }, { result: false } ], { result: true })
false
> w.exists([ { result: true }, { result: false } ], { result: true })
true
> w.exists([ { result: true }, { result: true } ], { result: true })
true
```
*/
function exists(array, value){
    if (t.isPlainObject(value)){
        var query = value,
            found = false,
            index = 0,
            item;

        while(!found && (item = array[index++])){
            found = o.queryFoundInObject(item, query);
        }
        return found;
    } else {
        return array.indexOf(value) > -1;
    }
}

/**
returns an array containing items from arrayOfObjects where key/value pairs 
from `query` are matched identically
*/
function where(arrayOfObjects, query){
    return arrayOfObjects.filter(function(item){
        return o.queryFoundInObject(item, query);
    });
}

/**
returns the first item the where key/value pairs from `query` are matched identically
in the input
*/
function findWhere(arrayOfObjects, query){
    var result = where(arrayOfObjects, query);
    return result.length ? result[0] : null;
}


/**
If the input is an array, returns the input minus the specified values.
If the input is an object, it returns a clone of the object minus the specified properties. 
@param {Array|Object} - the input array or object
@param {*} - a single, or array of values to omit
@returns {Array|Object}
@example
```js
> w.without([ 1, 2, 3 ], 2)
[ 1, 3 ]
> w.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]
```
*/
function without(input, toRemove){
    toRemove = arrayify(toRemove);
	if (Array.isArray(input)){
	    return input.filter(function(item){
	        return !exists(toRemove, item);
	    });
	} else {
		var output = o.clone(input);
		toRemove.forEach(function(remove){
			delete output[remove];
		});
		return output;
	}
}

/**
Returns the first object in the input array with `property` set to `value`.
@param {Object[]} - input array of objects
@param {string} - property to inspect
@param {*} - desired value
@returns {Object|undefined}
@example
```js
> w.first([{ product: "egg", stock: true }, { product: "chicken", stock: true }], "stock", true)
{ product: 'egg', stock: true }
> w.first([{ product: "egg", stock: true }, { product: "chicken", stock: true }], "stock", false)
undefined
```
*/
function first(objectArray, prop, val){
    var result = objectArray.filter(function(item){
        return item[prop] ? item[prop] === val : false;
    });
    return result ? result[0] : null;
}

/**
merge two arrays into a single array of unique values
@example
```js
> var array1 = [ 1, 2 ], array2 = [ 2, 3 ];
undefined
> w.union(array1, array2)
[ 1, 2, 3 ]
> var array1 = [ { id: 1 }, { id: 2 } ], array2 = [ { id: 2 }, { id: 3 } ];
undefined
> w.union(array1, array2)
[ { id: 1 }, { id: 2 }, { id: 3 } ]
> var array2 = [ { id: 2, blah: true }, { id: 3 } ]
undefined
> w.union(array1, array2)
[ { id: 1 },
  { id: 2 },
  { id: 2, blah: true },
  { id: 3 } ]
> w.union(array1, array2, "id")
[ { id: 1 }, { id: 2 }, { id: 3 } ]
```
*/
function union(array1, array2, idKey){
    var result = o.clone(array1);
    array2.forEach(function(item){
        if (idKey){
            if (!first(result, idKey, item[idKey])){
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
@example
```js
> w.commonSequence([1,2,3], [1,2,4])
[ 1, 2 ]
```
*/
function commonSequence(a, b){
    var result = [];
    for (var i = 0; i < Math.min(a.length, b.length); i++){
        if (a[i] === b[i]){
            result.push(a[i]);
        }
    }
    return result;
}

/**
docs TODO
*/
function unique(array){
    return array.reduce(function(prev, curr){
        if (prev.indexOf(curr) === -1) prev.push(curr);
        return prev;
    }, []);
}

/**
docs TODO
*/
function spliceWhile(array, test){
    for (var i = 0; i < array.length; i++){
        if (!test.test(array[i])) break;
    }
    return array.splice(0, i);
}
