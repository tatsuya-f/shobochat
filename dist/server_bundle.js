(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
// @ts-ignore
var a = ['\x22,\x20\x22', 'Database', 'sqlite3.db', 'CREATE\x20TABLE\x20IF\x20NOT\x20EXISTS\x20messages\x20(id\x20INTEGER\x20PRIMARY\x20KEY\x20AUTOINCREMENT,\x20time\x20INTEGER\x20NOT\x20NULL,\x20name\x20TEXT\x20NOT\x20NULL,\x20message\x20TEXT\x20NOT\x20NULL)', 'run', 'SELECT\x20time,\x20name,\x20message\x20FROM\x20messages\x20ORDER\x20BY\x20time\x20DESC', 'all', 'close', 'now', 'name', 'message', 'INSERT\x20INTO\x20messages\x20(time,\x20name,\x20message)\x20VALUES(\x22'];
(function (c, d) { var e = function (f) { while (--f) {
    c['push'](c['shift']());
} }; e(++d); }(a, 0x145));
var b = function (c, d) { c = c - 0x0; var e = a[c]; return e; };
'use strict';
var c = require("sqlite3");
function initializeDB() { return new Promise(function (d, e) { var f = new c[(b('0x0'))](b('0x1')); var g = b('0x2'); f[b('0x3')](g, function (h) { if (h) {
    e();
    return;
} d(); }); }); }
exports.initializeDB = initializeDB;
function getAllMessages() { return new Promise(function (i, j) { var k = new c[(b('0x0'))](b('0x1')); var l = b('0x4'); k[b('0x5')](l, function (m, n) { k[b('0x6')](); if (m) {
    j(m);
    return;
} i(n); }); }); }
exports.getAllMessages = getAllMessages;
function insertMessage(o) { return new Promise(function (p, q) { var r = new c[(b('0x0'))](b('0x1')); var s = Date[b('0x7')](); var t = o[b('0x8')]; var u = o[b('0x9')]; var v = b('0xa') + s + b('0xb') + t + '\x22,\x20\x22' + u + '\x22)'; r[b('0x3')](v, function (w) { r[b('0x6')](); if (w) {
    q(w);
    return;
} p(); }); }); }
exports.insertMessage = insertMessage;

},{"sqlite3":undefined}],2:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var database_1 = require("./database");
var app = express();
app.use(express.static("public"));
app.use(express.json());
app.get("/messages", function (req, res) {
    database_1.getAllMessages()
        .then(function (messages) {
        res.json(messages);
    });
});
app.post("/messages", function (req, res) {
    database_1.insertMessage(req.body)
        .then(function () {
        res.end();
    });
});
database_1.initializeDB()
    .then(function () {
    app.listen(8000, function () {
        console.log("listening on port 8000");
    });
});

},{"./database":1,"express":undefined}]},{},[2]);
