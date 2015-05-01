"use strict";
var test = require("tape");
var a = require("../");

test("instantiate", function(t){
	var arr = ObservableArray(1,2,3);
	t.ok(Array.isArray(arr), "is correct type");
	t.deepEqual(arr, [ 1,2,3 ]);
	t.end();
});

test("'change' event", function(t){
	t.plan(6);
	var arr = ObservableArray(1,2,3);
	
	/* should fire 'change' on splice */
	arr.once("change", function(item){
		t.strictEqual(arr.length, 2, "correct length");
		t.deepEqual(arr, [ 1,2 ], "correct content");
		t.strictEqual(item, 3, "correct item");
	});
	arr.splice(2, 1);

	/* should fire 'change' on push */
	arr.once("change", function(item){
		t.strictEqual(arr.length, 3);
		t.deepEqual(arr, [ 1,2,4 ]);
		t.strictEqual(item, 4, "correct item");
	});
	arr.push(4);
});

test("'add' event", function(t){
	t.plan(6);
	var arr = ObservableArray(1, 2, 3);

	/* should fire 'add' on push */
	arr.once("add", function(item, index){
		t.strictEqual(arr.length, 4, "correct length");
		t.deepEqual(arr, [ 1, 2, 3, 10 ], "correct content");
		t.strictEqual(item, 10, "correct item");
		t.strictEqual(index, 3, "correct index");
	});
	arr.push(10);

	/* passes an array if multiple items pushed */
	arr.once("add", function(item, index){
		t.strictEqual(arr.length, 6, "correct length");
		t.deepEqual(arr, [ 1, 2, 3, 10, 20, 30 ], "correct content");
		t.deepEqual(item, [20, 30], "correct item");
		t.strictEqual(index, 5, "correct index");
	});
	arr.push(20, 30);
});
