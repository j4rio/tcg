/* eslint-env node, mocha */

//------------------------------------------------------------------------------
//app test
//------------------------------------------------------------------------------
"use strict";

var chai = require("chai");
var assert = chai.assert;

describe("tcg", () => {
  var app_under_test;

  //before
  
  before(done => {
    app_under_test = require("../app.js");
    assert(app_under_test !== null);
    done();
  });
  
  //after
  
  after(done => {
    done();
  });

  context("app.js", () => {

    // before each test

    beforeEach(done => {
      done();
    });

    // after each test

    afterEach(done => {
      done();
    });

    it( "REST API call '/tcg/v1/' should return as response an array of domains", done => {
      var http = require("http");
      http.get("http://127.0.0.1:8080/tcg/v1/", (res) => {
        const { statusCode } = res;
        assert(statusCode === 200);
        const contentType = res.headers["content-type"];
        assert(contentType === "application/json");
        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", (chunk) => { 
          rawData += chunk; 
        });
        res.on("end", () => {
          try {
            const parsedData = JSON.parse(rawData);
            console.log("doing: " + JSON.stringify(parsedData));
            done();
          } catch (e) {
            done(e);
          }
        });
      }).on("error", (e) => {
        done(e);
      });
    });

    // basic

    it( "a test that should always succeed", done => {
      assert(true);
      done();
    });

  });
});
