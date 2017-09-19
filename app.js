//TCG server

/* eslint-env node */
"use strict";

var fs = require("fs");
var path = require("path");
var express = require("express");
var swaggerTools = require("swagger-tools");
var jsyaml = require("js-yaml");
var app;
var options = { //swaggerRouter configuration
  swaggerUi: path.join(__dirname, "/swagger.json"),
  controllers: path.join(__dirname, "./controllers"),
  useStubs: process.env.NODE_ENV === "development" // Conditionally turn on stubs (mock mode)
};

//swagger spec
var spec = fs.readFileSync(path.join(__dirname,"api/tcg.yaml"), "utf8");
var swaggerDoc = jsyaml.safeLoad(spec);

//initialize

function initialize() {
  app = express();
  //initialize the swagger
  swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    // swagger processing
    app.use(middleware.swaggerMetadata());
    app.use(middleware.swaggerValidator());
    app.use(middleware.swaggerRouter(options));
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

//for unit testing
module.exports = {
  app: app,
  initialize: initialize,
};
