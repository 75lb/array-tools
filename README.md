[![view on npm](http://img.shields.io/npm/v/array-ting.svg)](https://www.npmjs.org/package/array-ting)
[![npm module downloads per month](http://img.shields.io/npm/dm/array-ting.svg)](https://www.npmjs.org/package/array-ting)
[![Build Status](https://travis-ci.org/75lb/array-ting.svg?branch=master)](https://travis-ci.org/75lb/array-ting)
[![Dependency Status](https://david-dm.org/75lb/array-ting.svg)](https://david-dm.org/75lb/array-ting)


#array-ting
Useful functions for working with arrays

####Example
```js
var a = require("array-ting");
```



**Contents**
* [pluck(arrayOfObjects, ...property)](#module_array-ting.pluck)
* [arrayify(input)](#module_array-ting.arrayify)
* [exists(array, value)](#module_array-ting.exists)
* [where(arrayOfObjects, query)](#module_array-ting.where)
* [findWhere(arrayOfObjects, query)](#module_array-ting.findWhere)
* [without(input, toRemove)](#module_array-ting.without)
* [union(array1, array2, idKey)](#module_array-ting.union)
* [commonSequence(a, b)](#module_array-ting.commonSequence)
* [unique(array)](#module_array-ting.unique)
* [spliceWhile(array, index, test, ...elementN)](#module_array-ting.spliceWhile)







<a name="module_array-ting.pluck"></a>
###pluck(arrayOfObjects, ...property)
Plucks the value of the specified property from each object in the input array


- arrayOfObjects `Object[]` the input array of objects  
- ...property `string` the property(s) to pluck  


**Returns**: `Array`

####Example
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



<a name="module_array-ting.arrayify"></a>
###arrayify(input)
Takes input and guarantees an array back. Result can be one of three things:

- puts a single scalar in an array
- converts array-like object (e.g. `arguments`) to a real array
- converts `null` or `undefined` to an empty array


- input `*` the input value to convert to an array  


**Returns**: `Array`

####Example
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



<a name="module_array-ting.exists"></a>
###exists(array, value)
returns true if a value, or nested object value exists in an array


- array `Array` the array to search  
- value `*` the value to search for  


**Returns**: `boolean`

####Example
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



<a name="module_array-ting.where"></a>
###where(arrayOfObjects, query)
returns an array containing items from `arrayOfObjects` where key/value pairs 
from `query` are matched identically


- arrayOfObjects `Array` the array to search  
- query `query` an object containing the key/value pairs you want to match  


**Returns**: `Array`

####Example
```js
> dudes = [{ name: "Jim", age: 8}, { name: "Clive", age: 8}, { name: "Hater", age: 9}]
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 },
  { name: 'Hater', age: 9 } ]
> a.where(dudes, { age: 8})
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 } ]
```



<a name="module_array-ting.findWhere"></a>
###findWhere(arrayOfObjects, query)
returns the first item from `arrayOfObjects` where key/value pairs 
from `query` are matched identically


- arrayOfObjects `Array` the array to search  
- query `query` an object containing the key/value pairs you want to match  


**Returns**: `Object`

####Example
```js
> dudes = [{ name: "Jim", age: 8}, { name: "Clive", age: 8}, { name: "Hater", age: 9}]
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 },
  { name: 'Hater', age: 9 } ]
> a.findWhere(dudes, { age: 8})
{ name: 'Jim', age: 8 }
```



<a name="module_array-ting.without"></a>
###without(input, toRemove)
Returns the input minus the specified values.


- input `Array` the input array  
- toRemove `*` a single, or array of values to omit  


**Returns**: `Array`

####Example
```js
> a.without([ 1, 2, 3 ], 2)
[ 1, 3 ]
> a.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]
```



<a name="module_array-ting.union"></a>
###union(array1, array2, idKey)
merge two arrays into a single array of unique values


- array1 `Array` First array  
- array2 `Array` Second array  
- idKey `string` the unique ID property name  


**Returns**: `Array`

####Example
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



<a name="module_array-ting.commonSequence"></a>
###commonSequence(a, b)
Returns the initial elements which both input arrays have in common


- a `Array` first array to compare  
- b `Array` second array to compare  


**Returns**: `Array`

####Example
```js
> a.commonSequence([1,2,3], [1,2,4])
[ 1, 2 ]
```



<a name="module_array-ting.unique"></a>
###unique(array)
reduces an array to unique values


- array `Array` input array  


**Returns**: `Array`

####Example
```js
> n = [1,6,6,7,1]
[ 1, 6, 6, 7, 1 ]
> a.unique(n)
[ 1, 6, 7 ]
```



<a name="module_array-ting.spliceWhile"></a>
###spliceWhile(array, index, test, ...elementN)
splice from `index` until `test` fails


- array `Array` the input array  
- index `number` the position to begin splicing from  
- test `RegExp` the test to continue splicing while true  
- ...elementN `*` the elements to add to the array  


**Returns**: `Array`











