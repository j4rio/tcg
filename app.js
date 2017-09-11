/* eslint-env node */
"use strict";

var express = require("express");
var app;

//initialize

function initialize() {
  app = express();

  // route "/"
  app.get("/", function(req,res) {
    res.send("tcg").end();
  });

  //the server
  var port = process.env.PORT || 8080;
  app.listen(port, function() {
    console.log("server listening on port: " + port);
  });
}

initialize();

//for mocha
module.exports = {
  app: app,
  initialize: initialize,
};
