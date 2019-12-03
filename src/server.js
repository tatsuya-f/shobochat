'use strict';
exports.__esModule = true;
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
