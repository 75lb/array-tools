var test = require("tape");
var a = require("../");

var fixture = {
    num: [ 1, 2, 3, 4 ]
};

test(".without(array, toRemove)", function(t){
    t.deepEqual(a.without(fixture.num, [ 2, 3 ]), [ 1, 4 ]);
    t.end();
});

test(".without does not return the input array", function(t){
    var result = a.without(fixture.num, [ 2, 3 ]);
    t.notStrictEqual(fixture.num, result);
    t.end();
});

test(".without(array, toRemove)", function(t){
    t.deepEqual(a.without(fixture.num, [ 2, 3 ]), [ 1, 4 ]);
    t.end();
});

test(".without(array, regex)", function(t){
    t.deepEqual(a.without(fixture.num, /2|3/), [ 1, 4 ]);
    t.end();
});

test(".without(array, function)", function(t){
    function over3(val){ return val > 3; }
    t.deepEqual(a.without(fixture.num, over3), [ 1, 2, 3 ]);
    t.end();
});

