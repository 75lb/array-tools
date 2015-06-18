#!/usr/bin/env node
"use strict";
var a = require("../");
var tr = require("transform-tools");
var domain = require("domain");
var ansi = require("ansi-escape-sequences");
var util = require("util");

if (process.argv.length < 4){
    console.error("Usage:");
    console.error("$ cat <json array> | array-tools <method> <args...>");
    process.exit(1);
}

process.argv.splice(0, 2);
var method = process.argv.shift();
var args = process.argv.slice(0);
args = args.map(function(arg){
    return arg.replace(/\\n/g, "\n");
});

switch (method){
/* convert map arg to a function */
case "map":
    var funcBody = args.shift();
    var mapFunction = new Function("item", funcBody);
    args.unshift(mapFunction);
    break;
}

function processInput(input){
    var arr = a(input);
    var result = arr[method].apply(arr, args);
    if (result._data) result = result.val();
    
    /* certain methods don't output JSON */
    if (a.contains([ "join" ], method)){
        return result + "\n";
    } else {
        return JSON.stringify(result, null, "  ") + "\n";
    }
}

var d = domain.create();
d.on("error", function(err){
    if (err.code === "EPIPE") return; // don't care 
    console.error(ansi.format("Error: " + err.stack, "red"));
});
d.run(function(){
process.stdin
    .pipe(tr.collectJson({ through: processInput }))
    .pipe(process.stdout);
});
