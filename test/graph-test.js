/* eslint-env node, mocha */

//------------------------------------------------------------------------------
//graph test
//------------------------------------------------------------------------------
"use strict";

var chai = require("chai");
var assert = chai.assert;

describe("tcg", function() {
  var graph_under_test;
  var session;

  //before

  before(function(done) {
    graph_under_test = require("../graphDAO.js");
    assert(graph_under_test !== null);
    session = graph_under_test.openSession();
    assert(session !== null);
    done();
  });

  //after

  after(function(done) {
    assert(session !== null);
    graph_under_test.closeSession(session);
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

      var now = new Date();
      graph_under_test.query(session,"MERGE (n:SEF {name: 'grunt', time: '" + now + "'}) RETURN n").then((result) => {
        assert(result !== null);
        console.log("result: " + JSON.stringify(result));
        done();
      });
    });

    it( "should work with a test that always succeed", function(done) {
      assert(true);
      done();
    });

  });
});
