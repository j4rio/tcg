//graph data access object; underlying graph db is neo4j
// you need to set up three environment variables; one for URI: e.g. "bolt://server.com"
// and username and password

const neo4j = require("neo4j-driver").v1;
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME,process.env.NEO4J_PASSWORD)
);

//open session

function openSession() {
  const session = driver.session();
  return session;
}

//close session

function closeSession(session) {
  session.close();
}

//query

function query(session,query,queryParam) {
  return session.run(query,queryParam);
}

//add node

function addNode(session,label,name,properties) {
  return findNode(session,label,name).then(result => {
    var filteredResult = filterResult(result,0,0);
    // already added?
    if(filteredResult != null && "properties" in filteredResult && "name" in filteredResult.properties && filteredResult.properties.name == name) {
      return Promise.reject(new Error("node already exists"));
    }
    else {
      var props = JSON.stringify(properties);
      var queryString = "CREATE (n: " + label + " { name: '" + name + "', properties: '" + props + "'}) return n";
      return query(session,queryString);
    }
  }).catch(error => {
    return Promise.reject(error);
  });
}

// add a directed relationship between two named nodes and add properties to this relationship

function addRelationship(session,label1,name1,label2,name2,relationshipLabel,relationshipName,properties) {
  return findNode(session,label1,name1).then(result => {
    var filteredResult = filterResult(result,0,0);
    // node1 exists?
    if(filteredResult != null && "properties" in filteredResult && "name" in filteredResult.properties && filteredResult.properties.name == name1) {
      return findNode(session,label2,name2).then(result => {
        var filteredResult = filterResult(result,0,0);
        // node2 exists?
        if(filteredResult != null && "properties" in filteredResult && "name" in filteredResult.properties && filteredResult.properties.name == name2) {
          var props = JSON.stringify(properties);
          var queryString = 
            "MATCH (n: " + label1 + " { name: '" + name1 + "'})," +
                  "(m: " + label2 + " { name: '" + name2 + "'}) " +
            "MERGE (n)-[ r: " + relationshipLabel + " { name: '" + relationshipName + "', properties: '" + props + "'}]->(m) return n,r,m";
          return query(session,queryString);
        }
        else {
          return Promise.reject(new Error("node2 not found"));
        }
      });
    }
    else {
      return Promise.reject(new Error("node1 not found"));
    }
  }).catch(error => {
    return Promise.reject(error);
  });
}

//replace old properties with new properties for a directed relationship between two named nodes

function replaceRelationshipProperties(session,label1,name1,label2,name2,relationshipLabel,relationshipName,updated_properties) {
  return findNode(session,label1,name1).then(result => {
    var filteredResult = filterResult(result,0,0);
    // node1 exists?
    if(filteredResult != null && "properties" in filteredResult && "name" in filteredResult.properties && filteredResult.properties.name == name1) {
      return findNode(session,label2,name2).then(result => {
        var filteredResult = filterResult(result,0,0);
        // node2 exists?
        if(filteredResult != null && "properties" in filteredResult && "name" in filteredResult.properties && filteredResult.properties.name == name2) {
          var props = JSON.stringify(updated_properties);
          var queryString = 
            "MATCH (n: " + label1 + " { name: '" + name1 + "'})-" +
            "[ r: " + relationshipLabel + " { name: '" + relationshipName + "'}]->" +
                  "(m: " + label2 + " { name: '" + name2 + "'}) " +
            "SET r.properties = '" + props + "' return n,r,m";
          return query(session,queryString);
        }
        else {
          return Promise.reject(new Error("node2 not found"));
        }
      });
    }
    else {
      return Promise.reject(new Error("node1 not found"));
    }
  }).catch(error => {
    return Promise.reject(error);
  });
}

//find node

function findNode(session,label,name) {
  var queryString = "MATCH (n: " + label + ") WHERE n.name = '" + name + "' RETURN n";
  return query(session,queryString);
}

//remove node

function removeNode(session,label,name) {
  var queryString = "MATCH (n: " + label + ") WHERE n.name = '" + name + "' DETACH DELETE n";
  return query(session,queryString);
}

//result

function filterResult(result,pos,field) {
  var ret = null;
  if(result && "records" in result && pos in result.records) {
    var record = result.records[pos];
    if(record !== null && "_fields" in record && field in record._fields) {
      ret = record._fields[field];
    }
  }
  return ret;
}

//load graph from an object

function loadGraphFromObject(session,obj,callback) {
  // { nodes: [], relations: [] }
  console.log("obj: " + JSON.stringify(obj,null,"\t"));
  callback("not yet implemented");
}

// make an object from the graph

function makeObjectFromGraph(session,callback) {
  //
  // {
  //   nodes:
  //   [
  //     {
  //       label: "label",
  //       name: "name",
  //       properties: {...}
  //     }
  //   ],
  //   relations: 
  //   [
  //     {
  //       label1: "l1",
  //       name1: "n1",
  //       label2: "l2",
  //       name2: "n2",
  //       relationshipLabel: "rsl",
  //       properties: {}
  //     }
  //   ]
  // }
  callback("not yet implemented");
}

//serialize the graph db to a file or load from a file

function serialize(session,file,read,callback) {
  var fs = require("fs");
  if(read) { // serialize from a json file
    var obj;
    fs.readFile(file,"utf8", (err,data) => {
      if(err) {
        throw(err);
      }
      obj = JSON.parse(data);
      loadGraphFromObject(session,obj,callback);
    });
  }
  else { // serialize to a json file
    var obj = makeObjectFromGraph(session, (err) => {
      if(err !== null) {
        fs.writeFile(file,"utf8",JSON.stringify(obj),(err) => {
          callback(err);
        });
      }
      else {
        callback(err);
      }
    });
    
  }
}

// public functions

module.exports = {
  query: query,
  addNode: addNode,
  findNode: findNode,
  removeNode: removeNode,
  openSession: openSession,
  closeSession: closeSession,
  filterResult: filterResult,
  addRelationship: addRelationship,
  replaceRelationshipProperties: replaceRelationshipProperties,
  serialize: serialize
};
