[![view on npm](http://img.shields.io/npm/v/array-tools.svg)](https://www.npmjs.org/package/array-tools)
[![npm module downloads per month](http://img.shields.io/npm/dm/array-tools.svg)](https://www.npmjs.org/package/array-tools)
[![Build Status](https://travis-ci.org/75lb/array-tools.svg?branch=master)](https://travis-ci.org/75lb/array-tools)
[![Dependency Status](https://david-dm.org/75lb/array-tools.svg)](https://david-dm.org/75lb/array-tools)

<a name="module_array-tools"></a>
# array-tools
Useful functions for working with arrays

**Example**  
```js
var a = require("array-tools");
```

* [array-tools](#module_array-tools)
  * [.pluck(arrayOfObjects, ...property)](#module_array-tools.pluck) ⇒ <code>Array</code>
  * [.pick(arrayOfObjects, ...property)](#module_array-tools.pick) ⇒ <code>Array.&lt;object&gt;</code>
  * [.arrayify(input)](#module_array-tools.arrayify) ⇒ <code>Array</code>
  * [.exists(array, value)](#module_array-tools.exists) ⇒ <code>boolean</code>
  * [.where(arrayOfObjects, query)](#module_array-tools.where) ⇒ <code>Array</code>
  * [.findWhere(arrayOfObjects, query)](#module_array-tools.findWhere) ⇒ <code>object</code>
  * [.without(input, toRemove)](#module_array-tools.without) ⇒ <code>Array</code>
  * [.union(array1, array2, idKey)](#module_array-tools.union) ⇒ <code>Array</code>
  * [.commonSequence(a, b)](#module_array-tools.commonSequence) ⇒ <code>Array</code>
  * [.unique(array)](#module_array-tools.unique) ⇒ <code>Array</code>
  * [.spliceWhile(array, index, test, ...elementN)](#module_array-tools.spliceWhile) ⇒ <code>Array</code>
  * [.extract(array, query)](#module_array-tools.extract) ⇒ <code>Array</code>
  * [.flatten()](#module_array-tools.flatten) ⇒ <code>Array</code>

<a name="module_array-tools.pluck"></a>
## a.pluck(arrayOfObjects, ...property) ⇒ <code>Array</code>
Plucks the value of the specified property from each object in the input array

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>arrayOfObjects</td><td><code>Array.&lt;object&gt;</code></td><td>the input array of objects</td>
    </tr><tr>
    <td>...property</td><td><code>string</code></td><td>the property(s) to pluck</td>
    </tr>
  </tbody>
</table>

**Example**  
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
<a name="module_array-tools.pick"></a>
## a.pick(arrayOfObjects, ...property) ⇒ <code>Array.&lt;object&gt;</code>
return a copy of the input `arrayOfObjects` containing objects having only the cherry-picked properties

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>arrayOfObjects</td><td><code>Array.&lt;object&gt;</code></td><td>the input</td>
    </tr><tr>
    <td>...property</td><td><code>string</code></td><td>the properties to include in the result</td>
    </tr>
  </tbody>
</table>

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
## a.arrayify(input) ⇒ <code>Array</code>
Takes input and guarantees an array back. Result can be one of three things:

- puts a single scalar in an array
- converts array-like object (e.g. `arguments`) to a real array
- converts `null` or `undefined` to an empty array

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>input</td><td><code>\*</code></td><td>the input value to convert to an array</td>
    </tr>
  </tbody>
</table>

**Example**  
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
<a name="module_array-tools.exists"></a>
## a.exists(array, value) ⇒ <code>boolean</code>
returns true if a value, or nested object value exists in an array

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>array</td><td><code>Array</code></td><td>the array to search</td>
    </tr><tr>
    <td>value</td><td><code>\*</code></td><td>the value to search for</td>
    </tr>
  </tbody>
</table>

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
<a name="module_array-tools.where"></a>
## a.where(arrayOfObjects, query) ⇒ <code>Array</code>
returns an array containing items from `arrayOfObjects` where key/value pairs 
from `query` are matched identically

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>arrayOfObjects</td><td><code>Array</code></td><td>the array to search</td>
    </tr><tr>
    <td>query</td><td><code>query</code></td><td>an object containing the key/value pairs you want to match</td>
    </tr>
  </tbody>
</table>

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
<a name="module_array-tools.findWhere"></a>
## a.findWhere(arrayOfObjects, query) ⇒ <code>object</code>
returns the first item from `arrayOfObjects` where key/value pairs 
from `query` are matched identically

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>arrayOfObjects</td><td><code>Array</code></td><td>the array to search</td>
    </tr><tr>
    <td>query</td><td><code>query</code></td><td>an object containing the key/value pairs you want to match</td>
    </tr>
  </tbody>
</table>

**Example**  
```js
> dudes = [{ name: "Jim", age: 8}, { name: "Clive", age: 8}, { name: "Hater", age: 9}]
[ { name: 'Jim', age: 8 },
  { name: 'Clive', age: 8 },
  { name: 'Hater', age: 9 } ]
> a.findWhere(dudes, { age: 8})
{ name: 'Jim', age: 8 }
```
<a name="module_array-tools.without"></a>
## a.without(input, toRemove) ⇒ <code>Array</code>
Returns the input minus the specified values.

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>input</td><td><code>Array</code></td><td>the input array</td>
    </tr><tr>
    <td>toRemove</td><td><code>\*</code></td><td>a single, or array of values to omit</td>
    </tr>
  </tbody>
</table>

**Example**  
```js
> a.without([ 1, 2, 3 ], 2)
[ 1, 3 ]
> a.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]
```
<a name="module_array-tools.union"></a>
## a.union(array1, array2, idKey) ⇒ <code>Array</code>
merge two arrays into a single array of unique values

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>array1</td><td><code>Array</code></td><td>First array</td>
    </tr><tr>
    <td>array2</td><td><code>Array</code></td><td>Second array</td>
    </tr><tr>
    <td>idKey</td><td><code>string</code></td><td>the unique ID property name</td>
    </tr>
  </tbody>
</table>

**Example**  
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
<a name="module_array-tools.commonSequence"></a>
## a.commonSequence(a, b) ⇒ <code>Array</code>
Returns the initial elements which both input arrays have in common

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>a</td><td><code>Array</code></td><td>first array to compare</td>
    </tr><tr>
    <td>b</td><td><code>Array</code></td><td>second array to compare</td>
    </tr>
  </tbody>
</table>

**Example**  
```js
> a.commonSequence([1,2,3], [1,2,4])
[ 1, 2 ]
```
<a name="module_array-tools.unique"></a>
## a.unique(array) ⇒ <code>Array</code>
reduces an array to unique values

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>array</td><td><code>Array</code></td><td>input array</td>
    </tr>
  </tbody>
</table>

**Example**  
```js
> n = [1,6,6,7,1]
[ 1, 6, 6, 7, 1 ]
> a.unique(n)
[ 1, 6, 7 ]
```
<a name="module_array-tools.spliceWhile"></a>
## a.spliceWhile(array, index, test, ...elementN) ⇒ <code>Array</code>
splice from `index` until `test` fails

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>array</td><td><code>Array</code></td><td>the input array</td>
    </tr><tr>
    <td>index</td><td><code>number</code></td><td>the position to begin splicing from</td>
    </tr><tr>
    <td>test</td><td><code>RegExp</code></td><td>the test to continue splicing while true</td>
    </tr><tr>
    <td>...elementN</td><td><code>\*</code></td><td>the elements to add to the array</td>
    </tr>
  </tbody>
</table>

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
## a.extract(array, query) ⇒ <code>Array</code>
Removes items from `array` which satisfy the query. Modifies the input array, returns the extracted.

**Returns**: <code>Array</code> - the extracted items.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <td>array</td><td><code>Array</code></td><td>the input array, modified directly</td>
    </tr><tr>
    <td>query</td><td><code>function</code> | <code>object</code></td><td>Per item in the array, if either the function returns truthy or the exists query is satisfied, the item is extracted</td>
    </tr>
  </tbody>
</table>

<a name="module_array-tools.flatten"></a>
## a.flatten() ⇒ <code>Array</code>
flatten an array of arrays into a single array

**Since**: 1.4.0  
**Todo**

- document

**Example**  
```js
> numbers = [ 1, 2, [ 3, 4 ], 5 ]
[ 1,
  2,
  [ 3, 4 ],
  5 ]
> a.flatten(numbers)
[ 1, 2, 3, 4, 5 ]
```


*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*.

&copy; 2015 Lloyd Brookes <75pound@gmail.com>
