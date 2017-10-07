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

    it( "should be possible to make a simple graph query", function(done) {
      assert(graph_under_test.query !== null);
      var now = new Date();
      graph_under_test.query(session,"MATCH (n) RETURN n LIMIT 2").then(result => {
        assert(result !== null);
        console.log("result: " + JSON.stringify(result));
        done();
      });
    });

    it( "should be able to add, find and delete a given named node", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        graph_under_test.findNode(session,"TestLabel","testName").then(result => {
          assert(result !== null);
          var filteredResult = graph_under_test.filterResult(result,0,0);
          assert(filteredResult.properties.name == "testName");
          graph_under_test.removeNode(session,"TestLabel","testName").then(result => {
            assert(result !== null);
            console.log("result: " + JSON.stringify(result));
            done();
          });
        })
      }).catch(error => {
        console.log("Poks: " + error);
      });
    });

    it( "should be able to add a connection between two given existing nodes", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName1",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.addNode(session,"TestLabel","testName2",{prop1: "pp1", prop2: "pp2"}).then(result => {
          assert(result != null);
          done();
        });
      });
    });

    it( "should be possible to try to find something that is not found", function(done) {
      assert(graph_under_test.query !== null);
      graph_under_test.findNode(session,"TestLabelThatisNotThere","UnknownTestName").then(result => {
        assert(result !== null);
        console.log("result: " + JSON.stringify(result));
        var filteredResult = graph_under_test.filterResult(result,0,0);
        assert(filteredResult === null);
        done();
      });
    });

    it( "should be able to filter results too far", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        graph_under_test.findNode(session,"TestLabel","testName").then(result => {
          assert(result !== null);
          var filteredResult = graph_under_test.filterResult(result,100,0); // going too far...
          assert(filteredResult === null);
          var filteredResult = graph_under_test.filterResult(result,0,100); // going too far...
          assert(filteredResult === null);
          var filteredResult = graph_under_test.filterResult(result,100,100); // going too far...
          assert(filteredResult === null);
          graph_under_test.removeNode(session,"TestLabel","testName").then(result => {
            assert(result !== null);
            console.log("result: " + JSON.stringify(result));
            done();
          });
        })
      });
    });

    it( "should work with a test that always succeed", function(done) {
      assert(true);
      done();
    });

  });
});
