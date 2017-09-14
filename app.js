//TCG server

/* eslint-env node */
"use strict";

var fs = require("fs");
var path = require("path");
var express = require("express");
var app;
var swaggerTools = require("swagger-tools");
var jsyaml = require("js-yaml");

//swaggerRouter configuration
var options = {
    swaggerUi: path.join(__dirname, "/swagger.json"),
    controllers: path.join(__dirname, "./controllers"),
    useStubs: process.env.NODE_ENV === "development" // Conditionally turn on stubs (mock mode)
};

//The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,"api/tcg.yml"), "utf8");
var swaggerDoc = jsyaml.safeLoad(spec);

//initialize

function initialize() {
  app = express();

  //Initialize the Swagger middleware
  swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());

    // health check url "/"
    app.get("/", function(req,res) {
      res.send("tcg ok").end();
    });

    //the server
    var port = process.env.PORT || 8080;
    app.listen(port, function() {
      console.log("server listening on port: " + port);
    });
  });
}

initialize();

//for mocha
  module.exports = {
      app: app,
      initialize: initialize,
  };
