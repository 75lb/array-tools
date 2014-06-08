var test = require("tape"),
    w = require("../");

test(".pluck", function(t){
    var data = [
        {one: 1, two: 2},
        {two: "two"},
        {one: "one", two: "zwei"},
    ];
    
    t.deepEqual(w.pluck(data, "one"), [ 1, "one" ]);
    t.deepEqual(w.pluck(data, "two"), [ 2, "two", "zwei" ]);
    t.deepEqual(w.pluck(data, "one", "two"), [ 1, "two", "one" ]);

    t.end();
});
