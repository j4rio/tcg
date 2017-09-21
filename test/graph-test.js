/* eslint-env node, mocha */

//------------------------------------------------------------------------------
//graph test
//------------------------------------------------------------------------------
"use strict";

var chai = require("chai");
var assert = chai.assert;

describe("tcg", function() {
  var graph_under_test;

  //before
  
  before(function(done) {
    graph_under_test = require("../graphDAO.js");
    assert(graph_under_test !== null);
    done();
  });
  
  //after
  
  after(function(done) {
    done();
  });

  context("graph.js", function() {

    // before each test

    beforeEach(function(done) {
      done();
    });

    // after each test

    afterEach(function(done) {
      done();
    });

    // basic

    it( "should make a graph query", function(done) {
      assert(graph_under_test.query !== null);
      graph_under_test.query("MATCH (n:SEF) RETURN n LIMIT 24",function(err,result) {
        assert(err === null);
        assert(result != null);
        console.log("result: " + JSON.stringify(result))
        done();
      });
    });

    it( "should work with a test that always succeed", function(done) {
      assert(true);
      done();
    });

  });
});
