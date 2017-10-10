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

  context("graphDAO.js", function() {

    // before each test

    beforeEach(function(done) {
      done();
    });

    // after each test

    afterEach(function(done) {
      done();
    });

    // basic

    it.skip( "should be possible to make a simple graph query", function(done) {
      assert(graph_under_test.query !== null);
      var now = new Date();
      graph_under_test.query(session,"MATCH (n) RETURN n LIMIT 2").then(result => {
        assert(result !== null);
        done();
      });
    });

    it.skip( "should be able to add, find and delete a given named node", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        graph_under_test.findNode(session,"TestLabel","testName").then(result => {
          assert(result !== null);
          var filteredResult = graph_under_test.filterResult(result,0,0);
          assert(filteredResult.properties.name == "testName");
          graph_under_test.removeNode(session,"TestLabel","testName").then(result => {
            assert(result !== null);
            done();
          });
        })
      }).catch(error => {
        assert(false);
        done();
      });
    });

    it.skip( "should not be able to add a node twice", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        graph_under_test.addNode(session,"TestLabel","testName").catch(err => {
          assert(err !== null);
          graph_under_test.removeNode(session,"TestLabel","testName").then(result => {
            assert(result !== null);
            done();
          });
        })
      }).catch(error => {
        assert(false);
        done();
      });
    });

    it( "should be able to add a relationship between two given existing nodes", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName1",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.addNode(session,"TestLabel","testName2",{prop1: "pp1", prop2: "pp2"}).then(result => {
          assert(result != null);
          graph_under_test.addRelationship(session,"TestLabel","testName1","TestLabel","testName2","TestRel","testRelName",{ props: "yee"}).then(result => {
            assert(result != null);
            graph_under_test.removeNode(session,"TestLabel","testName1").then(result => {
              assert(result !== null);
              graph_under_test.removeNode(session,"TestLabel","testName2").then(result => {
                done();
              });
            })
          });
        });
      }).catch(error => {
        done(error);
      });
    });

    it( "should be able to add more properties to an existing relationship", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName1",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.addNode(session,"TestLabel","testName2",{prop1: "pp1", prop2: "pp2"}).then(result => {
          assert(result != null);
          graph_under_test.addRelationship(session,"TestLabel","testName1","TestLabel","testName2","TestRel","testRelName",{ base_props: "yee"}).then(result => {
            assert(result != null);
            graph_under_test.updateRelationship(session,"TestLabel","testName1","TestLabel","testName2","TestRel","testRelName",{ moreProps: "yeeyee", stuff: { more: "stuff"}}).then(result => {
              assert(result != null);
              graph_under_test.removeNode(session,"TestLabelz","testName1").then(result => {
                assert(result !== null);
                graph_under_test.removeNode(session,"TestLabelz","testName2").then(result => {
                  done();
                });
              });
            });
          });
        });
      }).catch(error => {
        done(error);
      });
    });

    it( "should be able to add a relationship between a same node (self directed relationship)", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName3",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.addRelationship(session,"TestLabel","testName3","TestLabel","testName3","TestRelSelf","testRelNameSelf",{ props: "yeeyee"}).then(result => {
          assert(result != null);
          graph_under_test.removeNode(session,"TestLabel","testName3").then(result => {
            assert(result !== null);
            done();
          })  ;
        }); 
      }).catch(error => {
        done(error);
      });
    });

    it.skip( "should be possible to try to find something that is not there", function(done) {
      assert(graph_under_test.query !== null);
      graph_under_test.findNode(session,"TestLabelThatisNotThere","UnknownTestName").then(result => {
        assert(result !== null);
        var filteredResult = graph_under_test.filterResult(result,0,0);
        assert(filteredResult === null);
        done();
      });
    });

    it.skip( "should be able to filter results too far", function(done) {
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
            done();
          });
        })
      });
    });

    it.skip( "should work with a test that always succeed", function(done) {
      assert(true);
      done();
    });

  });
});
