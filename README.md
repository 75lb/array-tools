[![view on npm](http://img.shields.io/npm/v/array-ting.svg)](https://www.npmjs.org/package/array-ting)
[![npm module downloads per month](http://img.shields.io/npm/dm/array-ting.svg)](https://www.npmjs.org/package/array-ting)
[![Build Status](https://travis-ci.org/75lb/array-ting.svg?branch=master)](https://travis-ci.org/75lb/array-ting)
[![Dependency Status](https://david-dm.org/75lb/array-ting.svg)](https://david-dm.org/75lb/array-ting)
![Analytics](https://ga-beacon.appspot.com/UA-27725889-6/array-ting/README.md?pixel)


#array-ting
Useful functions for working with arrays

####Example
```js
var a = require("array-ting");
```









<a name="module_array-ting.pluck"></a>
###a.pluck(arrayOfObjects, the)
Plucks the value of the specified property from each object in the input array


- arrayOfObjects `Object[]` the input array of objects  
- the `string` property to pluck  


**Returns**: `Array`

####Example
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



<a name="module_array-ting.arrayify"></a>
###a.arrayify(input)
Takes input and guarantees an array back. Result can be one of three things:

- puts a single scalar in an array
- converts array-like object (e.g. `arguments`) to a real array
- converts null or undefined to an empty array


- input `*` the input value to convert to an array  


**Returns**: `Array`

####Example
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



<a name="module_array-ting.exists"></a>
###a.exists(array, value)
returns true if a value, or nested object value exists in an array


- array `Array` the array to search  
- value `*` the value to search for  


**Returns**: `boolean`

####Example
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



<a name="module_array-ting.where"></a>
###a.where()
returns an array containing items from arrayOfObjects where key/value pairs 
from `query` are matched identically








<a name="module_array-ting.findWhere"></a>
###a.findWhere()
returns the first item the where key/value pairs from `query` are matched identically
in the input








<a name="module_array-ting.without"></a>
###a.without(input, toRemove)
If the input is an array, returns the input minus the specified values.
If the input is an object, it returns a clone of the object minus the specified properties.


- input `Array | Object` the input array or object  
- toRemove `*` a single, or array of values to omit  


**Returns**: `Array | Object`

####Example
```js
> w.without([ 1, 2, 3 ], 2)
[ 1, 3 ]
> w.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]
```



<a name="module_array-ting.first"></a>
###a.first(objectArray, prop, val)
Returns the first object in the input array with `property` set to `value`.


- objectArray `Object[]` input array of objects  
- prop `string` property to inspect  
- val `*` desired value  


**Returns**: `Object | undefined`

####Example
```js
> w.first([{ product: "egg", stock: true }, { product: "chicken", stock: true }], "stock", true)
{ product: 'egg', stock: true }
> w.first([{ product: "egg", stock: true }, { product: "chicken", stock: true }], "stock", false)
undefined
```



<a name="module_array-ting.union"></a>
###a.union()
merge two arrays into a single array of unique values





####Example
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



<a name="module_array-ting.commonSequence"></a>
###a.commonSequence(a, b)
Returns the initial elements which both input arrays have in common


- a `Array` first array to compare  
- b `Array` second array to compare  


**Returns**: `Array`

####Example
```js
> w.commonSequence([1,2,3], [1,2,4])
[ 1, 2 ]
```










