[![view on npm](http://img.shields.io/npm/v/array-tools.svg)](https://www.npmjs.org/package/array-tools)
[![npm module downloads per month](http://img.shields.io/npm/dm/array-tools.svg)](https://www.npmjs.org/package/array-tools)
[![Build Status](https://travis-ci.org/75lb/array-tools.svg?branch=master)](https://travis-ci.org/75lb/array-tools)
[![Dependency Status](https://david-dm.org/75lb/array-tools.svg)](https://david-dm.org/75lb/array-tools)

<a name="module_array-tools"></a>
# array-tools
Useful functions for working with arrays. 

```js
> var a = require("array-tools");
> a.exists([ 1, 2, 3 ], 1)
true
```

You can also chain together operations. The process: 

1. Pass your input array to array-tools as an argument. 
2. Chain together your operations. From array-tools, you may use [pluck](#module_array-tools.pluck), [pick](#module_array-tools.pick), [arrayify](#module_array-tools.arrayify), [where](#module_array-tools.where), [without](#module_array-tools.without), [unique](#module_array-tools.unique), [spliceWhile](#module_array-tools.spliceWhile), [extract](#module_array-tools.extract), [flatten](#module_array-tools.flatten), [exists](#module_array-tools.exists) and [sortBy](#module_array-tools.sortBy) in the chain. From core Array methods you may use `filter`, `reverse`, `sort`, `concat`, `slice`, `every`, `some` and `map`.
3. Finally, far all above methods except exists, call .val() to extract the result. 

```js
> var a = require("array-tools");
> a([ 1, 2, 2, 3 ]).exists(1)
true
> a([ 1, 2, 2, 3 ]).without(1).exists(1)
false
> a([ 1, 2, 2, 3 ]).without(1).unique().val()
[ 2, 3 ]
```


* [array-tools](#module_array-tools)
  * _any value in_
    * [.arrayify(any)](#module_array-tools.arrayify) ⇒ <code>Array</code>
  * _multiple arrays in_
    * [.union(array1, array2, idKey)](#module_array-tools.union) ⇒ <code>Array</code>
    * [.commonSequence(a, b)](#module_array-tools.commonSequence) ⇒ <code>Array</code>
  * _record set in_
    * [.pluck(arrayOfObjects, ...property)](#module_array-tools.pluck) ⇒ <code>Array</code>
    * [.pick(arrayOfObjects, ...property)](#module_array-tools.pick) ⇒ <code>Array.&lt;object&gt;</code>
    * [.where(arrayOfObjects, query)](#module_array-tools.where) ⇒ <code>Array</code>
    * [.findWhere(arrayOfObjects, query)](#module_array-tools.findWhere) ⇒ <code>object</code>
    * [.sortBy(arrayOfObjects, columns, customOrder)](#module_array-tools.sortBy) ⇒ <code>Array</code>
  * _single array in_
    * [.exists(array, value)](#module_array-tools.exists) ⇒ <code>boolean</code>
    * [.without(array, toRemove)](#module_array-tools.without) ⇒ <code>Array</code>
    * [.unique(array)](#module_array-tools.unique) ⇒ <code>Array</code>
    * [.spliceWhile(array, index, test, ...elementN)](#module_array-tools.spliceWhile) ⇒ <code>Array</code>
    * [.extract(array, query)](#module_array-tools.extract) ⇒ <code>Array</code>
    * [.flatten()](#module_array-tools.flatten) ⇒ <code>Array</code>

<a name="module_array-tools.arrayify"></a>
## a.arrayify(any) ⇒ <code>Array</code>
Takes input and guarantees an array back. Result can be one of three things:

- puts a single scalar in an array
- converts array-like object (e.g. `arguments`) to a real array
- converts `null` or `undefined` to an empty array

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: any value in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>any</td><td><code>*</code></td><td><p>the input value to convert to an array</p>
</td>
    </tr>  </tbody>
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
> f(1,2,3)
[ 1, 2, 3 ]
```
<a name="module_array-tools.union"></a>
## a.union(array1, array2, idKey) ⇒ <code>Array</code>
merge two arrays into a single array of unique values

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: multiple arrays in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>array1</td><td><code>Array</code></td><td><p>First array</p>
</td>
    </tr><tr>
    <td>array2</td><td><code>Array</code></td><td><p>Second array</p>
</td>
    </tr><tr>
    <td>idKey</td><td><code>string</code></td><td><p>the unique ID property name</p>
</td>
    </tr>  </tbody>
</table>

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
## a.commonSequence(a, b) ⇒ <code>Array</code>
Returns the initial elements which both input arrays have in common

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: multiple arrays in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>a</td><td><code>Array</code></td><td><p>first array to compare</p>
</td>
    </tr><tr>
    <td>b</td><td><code>Array</code></td><td><p>second array to compare</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
> a.commonSequence([1,2,3], [1,2,4])
[ 1, 2 ]
```
<a name="module_array-tools.pluck"></a>
## a.pluck(arrayOfObjects, ...property) ⇒ <code>Array</code>
Plucks the value of the specified property from each object in the input array

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: record set in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>arrayOfObjects</td><td><code>Array.&lt;object&gt;</code></td><td><p>the input array of objects</p>
</td>
    </tr><tr>
    <td>...property</td><td><code>string</code></td><td><p>the property(s) to pluck</p>
</td>
    </tr>  </tbody>
</table>

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
## a.pick(arrayOfObjects, ...property) ⇒ <code>Array.&lt;object&gt;</code>
return a copy of the input `arrayOfObjects` containing objects having only the cherry-picked properties

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: record set in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>arrayOfObjects</td><td><code>Array.&lt;object&gt;</code></td><td><p>the input</p>
</td>
    </tr><tr>
    <td>...property</td><td><code>string</code></td><td><p>the properties to include in the result</p>
</td>
    </tr>  </tbody>
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
<a name="module_array-tools.where"></a>
## a.where(arrayOfObjects, query) ⇒ <code>Array</code>
returns an array containing items from `arrayOfObjects` where key/value pairs
from `query` are matched identically

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: record set in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>arrayOfObjects</td><td><code>Array.&lt;object&gt;</code></td><td><p>the array to search</p>
</td>
    </tr><tr>
    <td>query</td><td><code>query</code></td><td><p>an object containing the key/value pairs you want to match</p>
</td>
    </tr>  </tbody>
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

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: record set in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>arrayOfObjects</td><td><code>Array.&lt;object&gt;</code></td><td><p>the array to search</p>
</td>
    </tr><tr>
    <td>query</td><td><code>object</code></td><td><p>an object containing the key/value pairs you want to match</p>
</td>
    </tr>  </tbody>
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
<a name="module_array-tools.sortBy"></a>
## a.sortBy(arrayOfObjects, columns, customOrder) ⇒ <code>Array</code>
Sort an array of objects by one or more fields

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: record set in  
**Since**: 1.5.0  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>arrayOfObjects</td><td><code>Array.&lt;object&gt;</code></td><td><p>input array</p>
</td>
    </tr><tr>
    <td>columns</td><td><code>string</code> | <code>Array.&lt;string&gt;</code></td><td><p>column name(s) to sort by</p>
</td>
    </tr><tr>
    <td>customOrder</td><td><code>object</code></td><td><p>specific sort orders, per columns</p>
</td>
    </tr>  </tbody>
</table>

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
## a.exists(array, value) ⇒ <code>boolean</code>
returns true if a value, or nested object value exists in an array

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: single array in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>array</td><td><code>Array</code></td><td><p>the array to search</p>
</td>
    </tr><tr>
    <td>value</td><td><code>*</code></td><td><p>the value to search for</p>
</td>
    </tr>  </tbody>
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
<a name="module_array-tools.without"></a>
## a.without(array, toRemove) ⇒ <code>Array</code>
Returns the input minus the specified values.

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: single array in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>array</td><td><code>Array</code></td><td><p>the input array</p>
</td>
    </tr><tr>
    <td>toRemove</td><td><code>*</code></td><td><p>a single, or array of values to omit</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
> a.without([ 1, 2, 3 ], 2)
[ 1, 3 ]
> a.without([ 1, 2, 3 ], [ 2, 3 ])
[ 1 ]
```
<a name="module_array-tools.unique"></a>
## a.unique(array) ⇒ <code>Array</code>
returns an array of unique values

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: single array in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>array</td><td><code>Array</code></td><td><p>input array</p>
</td>
    </tr>  </tbody>
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

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: single array in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>array</td><td><code>Array</code></td><td><p>the input array</p>
</td>
    </tr><tr>
    <td>index</td><td><code>number</code></td><td><p>the position to begin splicing from</p>
</td>
    </tr><tr>
    <td>test</td><td><code>RegExp</code></td><td><p>the test to continue splicing while true</p>
</td>
    </tr><tr>
    <td>...elementN</td><td><code>*</code></td><td><p>the elements to add to the array</p>
</td>
    </tr>  </tbody>
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

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Returns**: <code>Array</code> - the extracted items.  
**Category**: single array in  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>array</td><td><code>Array</code></td><td><p>the input array, modified directly</p>
</td>
    </tr><tr>
    <td>query</td><td><code>function</code> | <code>object</code></td><td><p>Per item in the array, if either the function returns truthy or the exists query is satisfied, the item is extracted</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_array-tools.flatten"></a>
## a.flatten() ⇒ <code>Array</code>
flatten an array of arrays into a single array

**Kind**: static method of <code>[array-tools](#module_array-tools)</code>  
**Category**: single array in  
**Since**: 1.4.0  
**Todo**

- document

**Example**  
```js
> numbers = [ 1, 2, [ 3, 4 ], 5 ]
> a.flatten(numbers)
[ 1, 2, 3, 4, 5 ]
```

* * * 

&copy; 2015 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown).
