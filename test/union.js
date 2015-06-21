var test = require("tape");
var a = require("../");

var f = {
    arr1: [ 1, 2, 3 ],
    arr2: [ 3, 4, 5 ],
    arr3: [ { id: 1 }, { id: 2 }, { id: 3 } ],
    arr4: [ { id: 3 }, { id: 4 }, { id: 5 } ],
    arr5: [ { id: 3, blah: true }, { id: 4 }, { id: 5 } ]
};

test(".union(array, array)", function(t){
    t.deepEqual(a.union(f.arr1, f.arr2), [ 1, 2, 3, 4, 5 ]);
    t.end();
});

test(".union(recordset, recordset, idKey)", function(t){
    t.deepEqual(a.union(f.arr3, f.arr4), [ 
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } 
    ]);

    t.deepEqual(a.union(f.arr3, f.arr5, "id"), [ 
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } 
    ]);

    t.end();
});
