var test = require("tape");
var a = require("../");

test("findWhere", function(t){
    var arr = [
        { result: false, number: 1 },
        { result: false, number: 2 }
    ];
    t.deepEqual(a.findWhere(arr, { result: true }), null);
    t.deepEqual(a.findWhere(arr, { result: false }), { result: false, number: 1 });
    t.deepEqual(a.findWhere(arr, { result: false, number: 3 }), null);
    t.deepEqual(a.findWhere(arr, { result: false, number: 2 }), { result: false, number: 2 });
    t.end();
});

test(".findWhere deep query", function(t){
    var arr = [
        { one: { number: 1, letter: "a" } },
        { one: { number: 2, letter: "b" } }
    ];
    t.deepEqual(a.findWhere(arr, { one: { number: 1 } }), { one: { number: 1, letter: "a" } });
    t.deepEqual(a.findWhere(arr, { one: { number: 2 } }), { one: { number: 2, letter: "b" } });
    t.deepEqual(a.findWhere(arr, { one: { letter: "b" } }), { one: { number: 2, letter: "b" } });
    t.deepEqual(a.findWhere(arr, { one: { number: 3 } }), null);
    t.end();
});
