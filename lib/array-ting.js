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
@param arrayOfObjects {Object[]} - the input array of objects
@param property {...string} - the property(s) to pluck
@returns {Array} 
@example
```js
> var data = [
...     {one: 1, two: 2},
...     {two: "two"},
...     {one: "one", two: "zwei"},
... ];
undefined
> a.pluck(data, "one");
[ 1, 'one' ]
> a.pluck(data, "two");
[ 2, 'two', 'zwei' ]
> a.pluck(data, "one", "two");
[ 1, 'two', 'one' ]
```
*/
exports.pluck = function pluck(arrayOfObjects, property, property2, property3){
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
- converts `null` or `undefined` to an empty array

@param input {*} - the input value to convert to an array
@returns {Array}
@example
```js
> a.arrayify(null)
[]
> a.arrayify(0)
[ 0 ]
> a.arrayify([ 1, 2 ])
[ 1, 2 ]
> function f(){ return a.arrayify(arguments); }
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
> a.exists([ 1, 2, 3 ], 2)
true
> a.exists([ { result: false }, { result: false } ], { result: true })
false
> a.exists([ { result: true }, { result: false } ], { result: true })
true
> a.exists([ { result: true }, { result: true } ], { result: true })
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
returns an array containing items from `arrayOfObjects` where key/value pairs 
from `query` are matched identically
@param {Array} - the array to search
@param {query} - an object containing the key/value pairs you want to match
@returns {Array}
@example
```js
> dudes = [{ name: "Jim", age: 8}, { name: "Clive", age: 8}, { name: "Hater", age: 9}]
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 },
  { name: 'Hater', age: 9 } ]
> a.where(dudes, { age: 8})
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 } ]
```
*/
function where(arrayOfObjects, query){
    return arrayOfObjects.filter(function(item){
        return o.queryFoundInObject(item, query);
    });
}

/**
returns the first item from `arrayOfObjects` where key/value pairs 
from `query` are matched identically
@param {Array} - the array to search
@param {query} - an object containing the key/value pairs you want to match
@returns {Object}
@example
```js
> dudes = [{ name: "Jim", age: 8}, { name: "Clive", age: 8}, { name: "Hater", age: 9}]
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 },
  { name: 'Hater', age: 9 } ]
> a.findWhere(dudes, { age: 8})
{ name: 'Jim', age: 8 }
```
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
@example
```js
> a.without([ 1, 2, 3 ], 2)
[ 1, 3 ]
> a.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]
```
*/
function without(input, toRemove){
    toRemove = arrayify(toRemove);
    return input.filter(function(item){
        return !exists(toRemove, item);
    });
}

/**
Returns the first object in the input array with `property` set to `value`.
@param {Object[]} - input array of objects
@param {string} - property to inspect
@param {*} - desired value
@returns {Object|undefined}
@example
```js
> a.first([{ product: "egg", stock: true }, { product: "chicken", stock: true }], "stock", true)
{ product: 'egg', stock: true }
> a.first([{ product: "egg", stock: true }, { product: "chicken", stock: true }], "stock", false)
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
> a.union(array1, array2)
[ 1, 2, 3 ]
> var array1 = [ { id: 1 }, { id: 2 } ], array2 = [ { id: 2 }, { id: 3 } ];
undefined
> a.union(array1, array2)
[ { id: 1 }, { id: 2 }, { id: 3 } ]
> var array2 = [ { id: 2, blah: true }, { id: 3 } ]
undefined
> a.union(array1, array2)
[ { id: 1 },
  { id: 2 },
  { id: 2, blah: true },
  { id: 3 } ]
> a.union(array1, array2, "id")
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
> a.commonSequence([1,2,3], [1,2,4])
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
