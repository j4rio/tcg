/* eslint-env node, mocha */

//------------------------------------------------------------------------------
//graph test
//------------------------------------------------------------------------------
"use strict";

var chai = require("chai");
var assert = chai.assert;

describe("tcg", function() {
  this.timeout(120000);
  var graph_under_test;
  var session;

  //before

  before(function(done) {
    graph_under_test = require("../graphDAO.js");
    assert(graph_under_test !== null);
    session = graph_under_test.openSession();
    assert(session !== null);
    graph_under_test.removeNodes(session,"UnitTest").then(() => {
      done();
    }).catch(err => {
      done(err);
    });
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

    it( "should be possible to make a simple graph query", function(done) {
      assert(graph_under_test.query !== null);
      graph_under_test.query(session,"MATCH (n) RETURN n LIMIT 2").then(result => {
        assert(result !== null);
        done();
      });
    });

    it( "should be able to add, find and delete a given named node", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.findNode(session,"TestLabel","testName").then(result => {
          assert(result !== null);
          var filteredResult = graph_under_test.filterResult(result,0,0);
          assert(filteredResult.properties.name == "testName");
          graph_under_test.removeNode(session,"TestLabel","testName").then(result => {
            assert(result !== null);
            done();
          });
        });
      }).catch(error => {
        assert(error !== null);
        assert(false);
        done();
      });
    });

    it( "should not be able to add a node twice", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.addNode(session,"TestLabel","testName").catch(err => {
          assert(err !== null);
          graph_under_test.removeNode(session,"TestLabel","testName").then(result => {
            assert(result !== null);
            done();
          });
        });
      }).catch(error => {
        assert(error !== null);
        assert(false);
        done();
      });
    });

    it( "should be able to add a relation between two given existing nodes", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName1",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.addNode(session,"TestLabel","testName2",{prop1: "pp1", prop2: "pp2"}).then(result => {
          assert(result != null);
          graph_under_test.addRelation(session,"TestLabel","testName1","TestLabel","testName2","TestRel","testRelName",{ props: "yee"}).then(result => {
            assert(result != null);
            graph_under_test.removeNode(session,"TestLabel","testName1").then(result => {
              assert(result !== null);
              graph_under_test.removeNode(session,"TestLabel","testName2").then(result => {
                assert(result !== null);
                done();
              });
            });
          });
        });
      }).catch(error => {
        done(error);
      });
    });

    it( "should be able to replace properties for an existing relation", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName1",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.addNode(session,"TestLabel","testName2",{prop1: "pp1", prop2: "pp2"}).then(result => {
          assert(result != null);
          graph_under_test.addRelation(session,"TestLabel","testName1","TestLabel","testName2","TestRel","testRelName",{ base_props: "yee"}).then(result => {
            assert(result != null);
            graph_under_test.replaceRelationProperties(session,"TestLabel","testName1","TestLabel","testName2","TestRel","testRelName",{ moreProps: "yeeyee", stuff: { more: "replaced stuff"}}).then(result => {
              assert(result != null);
              graph_under_test.removeNode(session,"TestLabel","testName1").then(result => {
                assert(result !== null);
                graph_under_test.removeNode(session,"TestLabel","testName2").then(result => {
                  assert(result !== null);
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

    it( "should be able to add a relation between a same node (self directed relation)", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName3",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.addRelation(session,"TestLabel","testName3","TestLabel","testName3","TestRelSelf","testRelNameSelf",{ props: "yeeyee"}).then(result => {
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

    it( "should be possible to try to find something that is not there", function(done) {
      assert(graph_under_test.query !== null);
      graph_under_test.findNode(session,"TestLabelThatisNotThere","UnknownTestName").then(result => {
        assert(result !== null);
        var filteredResult = graph_under_test.filterResult(result,0,0);
        assert(filteredResult === null);
        done();
      });
    });

    it( "should be able to filter results too far", function(done) {
      this.timeout(20000);
      assert(graph_under_test.addNode !== null);
      graph_under_test.addNode(session,"TestLabel","testName",{ prop1: "p1", prop2: "p2", sub: { sub: "sub"}}).then(result => {
        assert(result !== null);
        graph_under_test.findNode(session,"TestLabel","testName").then(result => {
          assert(result !== null);
          var filteredResult = graph_under_test.filterResult(result,100,0); // going too far...
          assert(filteredResult === null);
          filteredResult = graph_under_test.filterResult(result,0,100); // going too far...
          assert(filteredResult === null);
          filteredResult = graph_under_test.filterResult(result,100,100); // going too far...
          assert(filteredResult === null);
          graph_under_test.removeNode(session,"TestLabel","testName").then(result => {
            assert(result !== null);
            done();
          });
        });
      });
    });

    it( "should be able to read a graph from a JSON file", function (done) {
      this.timeout(30000);
      graph_under_test.serialize(session,"test/test1.json",true,(err) => {
        assert(err == null,"what? err: " + err);
        var fs = require("fs");
        assert(fs != null);
        var objFile = JSON.parse(fs.readFileSync("test/test1.json", "utf8"));
        assert(objFile != null);
        graph_under_test.makeObjectFromGraph(session,(err,objGraph) => {
          assert(err == null);
          assert(objGraph != null);
          done();
        });
      });
    });

    it( "should be able to write graph to a JSON file", function(done) {
      this.timeout(60000);
      graph_under_test.serialize(session,"test/test2.json",false,(err) => {
        assert(err == null,"what? err: "+ err);
        done();
      });
    });

    it( "should work with a test that always succeed", (done) => {
      assert(true);
      done();
    });

  });
});
