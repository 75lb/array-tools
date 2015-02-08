var test = require("tape");
var a = require("../");

test("sortBy", function(t){
    var fixture = [
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
    var expected = [
        { a: 1, b: 1, c: 4},
        { a: 1, b: 2, c: 4},
        { a: 1, b: 3, c: 4},
        { a: 2, b: 2, c: 2},
        { a: 2, b: 2, c: 3},
        { a: 3, b: 3, c: 3},
        { a: 4, b: 1, c: 1},
        { a: 4, b: 3, c: 1},
        { a: 4, b: 3, c: 1}
    ];
    t.deepEqual(a.sortBy(fixture, "a", "b", "c"), expected);
    t.end();
});
