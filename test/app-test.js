/* eslint-env node, mocha */

//------------------------------------------------------------------------------
//app test
//------------------------------------------------------------------------------
"use strict";

var chai = require("chai");
var assert = chai.assert;

describe("tcg", function() {
  var app_under_test;

  //before
  
  before(function(done) {
    app_under_test = require("../app.js");
    assert(app_under_test !== null);
    done();
  });
  
  //after
  
  after(function(done) {
    done();
  });

  context("app.js", function() {

    // before each test

    beforeEach(function(done) {
      done();
    });

    // after each test

    afterEach(function(done) {
      done();
    });

    // basic

    it( "a test that should always succeed", function(done) {
      assert(true);
      done();
    });

  });
});
