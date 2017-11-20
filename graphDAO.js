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

//find all nodes

function findAllNodes(session) {
  var queryString = "MATCH (n) RETURN n";
  return query(session,queryString);
}

//find all relationships

function findAllRelationships(session) {
  var queryString = "MATCH (n)-[r]->(m) RETURN n,r,m";
  return query(session,queryString);
}

//remove node

function removeNode(session,label,name) {
  var queryString = "MATCH (n: " + label + ") WHERE n.name = '" + name + "' DETACH DELETE n";
  return query(session,queryString);
}

//remove all nodes with a label

function removeNodes(session,label) {
  var queryString = "MATCH (n: " + label + ") DETACH DELETE n";
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

//load nodes

function loadNodes(session,obj,position,callback) {
  if(obj != null && obj.hasOwnProperty("nodes") && position in obj.nodes) {
    var node = obj.nodes[position];
    addNode(session,node.label,node.name,node.properties).then(() => {
      loadNodes(session,obj,position+1,callback);
    }).catch(err => {
      callback(err);
    });
  }
  else {
    callback(null);
  }
}

//load nodes

function loadRelationships(session,obj,position,callback) {
  if(obj != null && obj.hasOwnProperty("relationships") && position in obj.relationships) {
    var relationship = obj.relationships[position];
    addRelationship(
        session,
        relationship.label1,relationship.name1,
        relationship.label2,relationship.name2,
        relationship.relationshipLabel,
        relationship.relationshipName,
        relationship.properties).then(() => {
      loadRelationships(session,obj,position+1,callback);
    }).catch((err) => {
      callback(err);
    });
  }
  else  {
    callback(null);
  }
}

//load graph from an object

function loadGraphFromObject(session,obj,callback) {
  // { nodes: [], relations: [] }
  loadNodes(session,obj,0,err => {
    if(err == null) {
      loadRelationships(session,obj,0,err => {
        callback(err);
      });
    }
    else {
      callback(err);
    }
  });
}

// make an object from the graph

function makeObjectFromGraph(session,callback) {
  var obj = {
    nodes: [],
    relations: []
  };
  findAllNodes(session).then(result => {
    console.log("22222222222: " + JSON.stringify(result,null,"\t"));
    for(i in result.records) {
      var r = result.records[i]._fields[0].properties;
      obj.nodes[i] = {
        label: r.labels[0],
        name: r.name,
        properties: r.properties
      };
    }
    findAllRelationships(session).then(result => {
      console.log("333333333333333: " + JSON.stringify(result,null,"\t"));
      for(j in result.records) {
        var r = result.records[i]._fields[0].properties;
        obj.relations[j] = {
          label1: r.label1,
          name1: r.name1,
          label2: r.label2,
          name2: r.name2,
          relationshipLabel: r.relationshipLabel,
          properties: r.properties
        };
      }
      console.log("999999999999999: " + JSON.stringify(obj,null,"\t"));
      callback(null,obj);
    }).catch(err => {
      callback(err);
    });
  }).catch(err => {
    callback(err);
  });
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
    makeObjectFromGraph(session, (err,obj) => {
      if(err == null) {
        fs.writeFile(file,JSON.stringify(obj),"utf8",(err) => {
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
  removeNodes: removeNodes,
  openSession: openSession,
  closeSession: closeSession,
  filterResult: filterResult,
  addRelationship: addRelationship,
  replaceRelationshipProperties: replaceRelationshipProperties,
  serialize: serialize
};
