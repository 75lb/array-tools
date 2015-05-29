[![view on npm](http://img.shields.io/npm/v/array-tools.svg)](https://www.npmjs.org/package/array-tools)
[![npm module downloads per month](http://img.shields.io/npm/dm/array-tools.svg)](https://www.npmjs.org/package/array-tools)
[![Build Status](https://travis-ci.org/75lb/array-tools.svg?branch=master)](https://travis-ci.org/75lb/array-tools)
[![Dependency Status](https://david-dm.org/75lb/array-tools.svg)](https://david-dm.org/75lb/array-tools)
[![Coverage Status](https://coveralls.io/repos/75lb/array-tools/badge.svg?branch=master)](https://coveralls.io/r/75lb/array-tools?branch=master)

# array-tools
Lightweight tool-kit for working with array data.

```js
> var a = require("array-tools");
```

There are four ways to use it. As a standard library, passing the input array on each invocation:

```js
> var remainder = a.without([ 1, 2, 3, 4, 5 ], 1)
> a.exists(remainder, 1)
false
```

As a chainable method, passing the input array once then chaining from there:

```js
> a([ 1, 2, 3, 4, 5 ]).without(1).exists(1);
false
```

As a base class.
```js
var util = require("util");
var ArrayTools = require("array-tools");

function CarCollection(cars){
  ArrayTools.call(this, cars);
}
util.inherits(CarCollection, ArrayTools);

var cars = new CarCollection([ 
  { owner: "Me", model: "Citreon Xsara" }, 
  { owner: "Floyd", model: "Bugatti Veyron" } 
]);

cars.findWhere({ owner: "Floyd" });
// returns { owner: "Floyd", model: "Bugatti Veyron" }
```

As a command-line tool. 
```sh
$ curl -s "https://api.github.com/users/75lb/repos?page=1&per_page=100" | array-tools pick full_name description
[
  {
    "full_name": "75lb/ansi-escape-sequences",
    "description": "A simple library containing all known terminal ansi escape codes and sequences."
  },
  {
    "full_name": "75lb/baldrick",
    "description": "Your own private dogsbody. Does the shitty work you can't be arsed to do."
  },
  etc,
  etc
]
```

#### More on chaining
Each methods returning an `Array` (e.g. `where`, `without`) can be chained. Each method returning a scalar (`exists`, `contains`) cannot be chained. If the final operation is chainable, append `.val()` to terminate the chain and retrieve the output data. 

```js
> a([ 1, 2, 2, 3 ]).exists(1)
true
> a([ 1, 2, 2, 3 ]).without(1).exists(1)
false
> a([ 1, 2, 2, 3 ]).without(1).unique().val()
[ 2, 3 ]
```

## API Reference

* [array-tools](#module_array-tools)
  * _chainable_
    * [.pluck(arrayOfObjects, ...property)](#module_array-tools.pluck) ⇒ <code>Array</code>
    * [.pick(arrayOfObjects, ...property)](#module_array-tools.pick) ⇒ <code>Array.&lt;object&gt;</code>
    * [.arrayify(any)](#module_array-tools.arrayify) ⇒ <code>Array</code>
    * [.where(arrayOfObjects, query)](#module_array-tools.where) ⇒ <code>Array</code>
    * [.without(array, toRemove)](#module_array-tools.without) ⇒ <code>Array</code>
    * [.union(array1, array2, idKey)](#module_array-tools.union) ⇒ <code>Array</code>
    * [.commonSequence(a, b)](#module_array-tools.commonSequence) ⇒ <code>Array</code>
    * [.unique(array)](#module_array-tools.unique) ⇒ <code>Array</code>
    * [.spliceWhile(array, index, test, ...elementN)](#module_array-tools.spliceWhile) ⇒ <code>Array</code>
    * [.extract(array, query)](#module_array-tools.extract) ⇒ <code>Array</code>
    * [.flatten(array)](#module_array-tools.flatten) ⇒ <code>Array</code>
    * [.sortBy(arrayOfObjects, columns, customOrder)](#module_array-tools.sortBy) ⇒ <code>Array</code>
  * _not chainable_
    * [.exists(array, value)](#module_array-tools.exists) ⇒ <code>boolean</code>
    * [.findWhere(arrayOfObjects, query)](#module_array-tools.findWhere) ⇒ <code>object</code>
    * [.last(arr)](#module_array-tools.last) ⇒ <code>\*</code>
    * [.remove(arr, toRemove)](#module_array-tools.remove) ⇒ <code>\*</code>
    * [.contains(arr, value)](#module_array-tools.contains) ⇒

<a name="module_array-tools.pluck"></a>
### a.pluck(arrayOfObjects, ...property) ⇒ <code>Array</code>
Plucks the value of the specified property from each object in the input array

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| arrayOfObjects | <code>Array.&lt;object&gt;</code> | the input array of objects |
| ...property | <code>string</code> | the property(s) to pluck |

**Example**  
```js
> var data = [
    {one: 1, two: 2},
    {two: "two"},
    {one: "one", two: "zwei"},
];
> a.pluck(data, "one");
[ 1, 'one' ]
> a.pluck(data, "two");
[ 2, 'two', 'zwei' ]
> a.pluck(data, "one", "two");
[ 1, 'two', 'one' ]
```
<a name="module_array-tools.pick"></a>
### a.pick(arrayOfObjects, ...property) ⇒ <code>Array.&lt;object&gt;</code>
return a copy of the input `arrayOfObjects` containing objects having only the cherry-picked properties

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| arrayOfObjects | <code>Array.&lt;object&gt;</code> | the input |
| ...property | <code>string</code> | the properties to include in the result |

**Example**  
```js
> data = [
    { one: "un", two: "deux", three: "trois" },
    { two: "two", one: "one" },
    { four: "quattro" },
    { two: "zwei" }
]
> a.pick(data, "two")
[ { two: 'deux' },
  { two: 'two' },
  { two: 'zwei' } ]
```
<a name="module_array-tools.arrayify"></a>
### a.arrayify(any) ⇒ <code>Array</code>
Takes input and guarantees an array back. Result can be one of three things:

- puts a single scalar in an array
- converts array-like object (e.g. `arguments`) to a real array
- converts `null` or `undefined` to an empty array

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| any | <code>\*</code> | the input value to convert to an array |

**Example**  
```js
> a.arrayify(null)
[]
> a.arrayify(0)
[ 0 ]
> a.arrayify([ 1, 2 ])
[ 1, 2 ]
> function f(){ return a.arrayify(arguments); }
> f(1,2,3)
[ 1, 2, 3 ]
```
<a name="module_array-tools.where"></a>
### a.where(arrayOfObjects, query) ⇒ <code>Array</code>
returns an array containing items from `arrayOfObjects` where key/value pairs
from `query` are matched identically

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| arrayOfObjects | <code>Array.&lt;object&gt;</code> | the array to search |
| query | <code>query</code> | an object containing the key/value pairs you want to match |

**Example**  
```js
> dudes = [{ name: "Jim", age: 8}, { name: "Clive", age: 8}, { name: "Hater", age: 9}]
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 },
  { name: 'Hater', age: 9 } ]
> a.where(dudes, { age: 8})
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 } ]
```
<a name="module_array-tools.without"></a>
### a.without(array, toRemove) ⇒ <code>Array</code>
Returns the input minus the specified values.

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array</code> | the input array |
| toRemove | <code>\*</code> | a single, or array of values to omit |

**Example**  
```js
> a.without([ 1, 2, 3 ], 2)
[ 1, 3 ]
> a.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]
```
<a name="module_array-tools.union"></a>
### a.union(array1, array2, idKey) ⇒ <code>Array</code>
merge two arrays into a single array of unique values

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| array1 | <code>Array</code> | First array |
| array2 | <code>Array</code> | Second array |
| idKey | <code>string</code> | the unique ID property name |

**Example**  
```js
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
```
<a name="module_array-tools.commonSequence"></a>
### a.commonSequence(a, b) ⇒ <code>Array</code>
Returns the initial elements which both input arrays have in common

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>Array</code> | first array to compare |
| b | <code>Array</code> | second array to compare |

**Example**  
```js
> a.commonSequence([1,2,3], [1,2,4])
[ 1, 2 ]
```
<a name="module_array-tools.unique"></a>
### a.unique(array) ⇒ <code>Array</code>
returns an array of unique values

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array</code> | input array |

**Example**  
```js
> n = [1,6,6,7,1]
[ 1, 6, 6, 7, 1 ]
> a.unique(n)
[ 1, 6, 7 ]
```
<a name="module_array-tools.spliceWhile"></a>
### a.spliceWhile(array, index, test, ...elementN) ⇒ <code>Array</code>
splice from `index` until `test` fails

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array</code> | the input array |
| index | <code>number</code> | the position to begin splicing from |
| test | <code>RegExp</code> | the test to continue splicing while true |
| ...elementN | <code>\*</code> | the elements to add to the array |

**Example**  
```js
> letters = ["a", "a", "b"]
[ 'a', 'a', 'b' ]
> a.spliceWhile(letters, 0, /a/, "x")
[ 'a', 'a' ]
> letters
[ 'x', 'b' ]
```
<a name="module_array-tools.extract"></a>
### a.extract(array, query) ⇒ <code>Array</code>
Removes items from `array` which satisfy the query. Modifies the input array, returns the extracted.

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Returns**: <code>Array</code> - the extracted items.  
**Category**: chainable  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array</code> | the input array, modified directly |
| query | <code>function</code> &#124; <code>object</code> | Per item in the array, if either the function returns truthy or the exists query is satisfied, the item is extracted |

<a name="module_array-tools.flatten"></a>
### a.flatten(array) ⇒ <code>Array</code>
flatten an array of arrays into a single array

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  
**Since**: 1.4.0  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array</code> | the input array |

**Example**  
```js
> numbers = [ 1, 2, [ 3, 4 ], 5 ]
> a.flatten(numbers)
[ 1, 2, 3, 4, 5 ]
```
<a name="module_array-tools.sortBy"></a>
### a.sortBy(arrayOfObjects, columns, customOrder) ⇒ <code>Array</code>
Sort an array of objects by one or more fields

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: chainable  
**Since**: 1.5.0  

| Param | Type | Description |
| --- | --- | --- |
| arrayOfObjects | <code>Array.&lt;object&gt;</code> | input array |
| columns | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> | column name(s) to sort by |
| customOrder | <code>object</code> | specific sort orders, per columns |

**Example**  
```js
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
```
<a name="module_array-tools.exists"></a>
### a.exists(array, value) ⇒ <code>boolean</code>
returns true if a value, or nested object value exists in an array

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: not chainable  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array</code> | the array to search |
| value | <code>\*</code> | the value to search for |

**Example**  
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
<a name="module_array-tools.findWhere"></a>
### a.findWhere(arrayOfObjects, query) ⇒ <code>object</code>
returns the first item from `arrayOfObjects` where key/value pairs
from `query` are matched identically

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: not chainable  

| Param | Type | Description |
| --- | --- | --- |
| arrayOfObjects | <code>Array.&lt;object&gt;</code> | the array to search |
| query | <code>object</code> | an object containing the key/value pairs you want to match |

**Example**  
```js
> dudes = [{ name: "Jim", age: 8}, { name: "Clive", age: 8}, { name: "Hater", age: 9}]
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 },
  { name: 'Hater', age: 9 } ]
> a.findWhere(dudes, { age: 8})
{ name: 'Jim', age: 8 }
```
<a name="module_array-tools.last"></a>
### a.last(arr) ⇒ <code>\*</code>
Return the last item in an array.

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: not chainable  
**Since**: 1.7.0  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array</code> | the input array |

<a name="module_array-tools.remove"></a>
### a.remove(arr, toRemove) ⇒ <code>\*</code>
**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: not chainable  
**Since**: 1.8.0  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array</code> | the input array |
| toRemove | <code>\*</code> | the item to remove |

<a name="module_array-tools.contains"></a>
### a.contains(arr, value) ⇒
**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Returns**: boolean  
**Category**: not chainable  
**Since**: 1.8.0  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array</code> | the input array |
| value | <code>\*</code> | the value to look for |


## Install
As a library:

```
$ npm install array-tools --save
```

As a command-line tool:
```
$ npm install -g array-tools
```

* * * 

&copy; 2015 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown).
