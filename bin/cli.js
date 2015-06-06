#!/usr/bin/env node
"use strict";

var a = require("../");
var tr = require("transform-tools");

if (process.argv.length < 4){
    console.error("Usage:");
    console.error("$ cat <json array> | array-tools <method> <args...>");
    process.exit(1);
}

process.argv.splice(0, 2);
var method = process.argv.shift();
var args = process.argv.slice(0);

function processInput(array){
    args.unshift(array);
    var result = a[method].apply(null, args);
    return JSON.stringify(result, null, "  ") + "\n";
}

process.stdin
    .pipe(tr.collectJson({ transform: processInput }))
    .pipe(process.stdout);
