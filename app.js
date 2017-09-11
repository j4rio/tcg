/* eslint-env node */
"use strict";

var express = require("express");
var app;

//initialize

function initialize() {
  app = express();

  //enable reverse proxy support in Express. This causes the
  //the "X-Forwarded-Proto" header field to be trusted so its
  //value can be used to determine the protocol. See
  //http://expressjs.com/api#app-settings for more details.
  app.enable("trust proxy");

  //redirect all http requests to https
  app.all("*",function(req,res,next){
    if(req.protocol==="http" && (unitTesting == null||unitTesting == false)) {
      res.redirect("https://" + req.headers["host"] + req.url);
    }
    else {
      next();
    }
  });

  // root handler for route "/" to allow availability monitoring
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
