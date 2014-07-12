var test = require("tape"),
    a = require("../");

test(".pick", function(t){
    var data = [
        { one: 1, two: 2, three: 3 },
        { two: "two", one: "one" },
        { four: "quattro" },
        { two: "zwei" }
    ];
    
    t.deepEqual(a.pick(data, "one"), [
        { one: 1 },
        { one: "one" }
    ]);

    t.deepEqual(a.pick(data, "one", "two"), [
        { one: 1, two: 2 },
        { two: "two", one: "one" },
        { two: "zwei" },
    ]);

    t.end();
});

