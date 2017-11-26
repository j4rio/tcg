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

// add a directed relation between two named nodes and add properties to this relation

function addRelation(session,label1,name1,label2,name2,relationLabel,relationName,properties) {
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
            "MERGE (n)-[ r: " + relationLabel + " { name: '" + relationName + "', properties: '" + props + "'}]->(m) return n,r,m";
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

//replace old properties with new properties for a directed relation between two named nodes

function replaceRelationProperties(session,label1,name1,label2,name2,relationLabel,relationName,updated_properties) {
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
            "[ r: " + relationLabel + " { name: '" + relationName + "'}]->" +
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

//find all relations

function findAllRelations(session) {
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

function loadRelation(session,obj,position,callback) {
  if(obj != null && obj.hasOwnProperty("relations") && position in obj.relations) {
    var relation = obj.relations[position];
    addRelation(
      session,
      relation.label1,relation.name1,
      relation.label2,relation.name2,
      relation.relationLabel,
      relation.relationName,
      relation.properties).then(() => {
      loadRelation(session,obj,position+1,callback);
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
      loadRelation(session,obj,0,err => {
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
  console.log("0000");
  let obj = {
    nodes: [],
    relations: []
  };
  findAllNodes(session).then(result => {
    console.log("0001");
    for(let i in result.records) {
      let r = filterResult(result,i,0);
      if(r == null) {
        break;
      }
      obj.nodes[i] = {
        label: r.labels[0],
        name: r.properties.name,
        properties: JSON.parse(r.properties.properties)
      };
    }
    console.log("0002");
    findAllRelations(session).then(result => {
      console.log("0003");
      for(let j in result.records) {
        console.log("0004/" + j);
        let r1 = filterResult(result,j,0);
        let r2 = filterResult(result,j,1);
        let r3 = filterResult(result,j,2);
        obj.relations[j] = {
          label1: r1.labels[0],
          name1: r1.properties.name,
          label2: r3.labels[0],
          name2: r3.properties.name,
          relationLabel: r2.type,
          relationName: r2.properties.name,
          properties: JSON.parse(r2.properties.properties)
        };
      }
      console.log("0005");
      callback(null,obj);
    }).catch(err => {
      console.log("pokspoks1: "+err);
      callback(err);
    });
  }).catch(err => {
    console.log("pokspoks2: "+err);
    callback(err);
  });
}

//serialize the graph db to a file or load from a file

function serialize(session,file,read,callback) {
  console.log("000");
  var fs = require("fs");
  if(read) { // serialize from a json file
    console.log("001");
    var obj = JSON.parse(fs.readFileSync(file,"utf8"));
    loadGraphFromObject(session,obj,callback);
  }
  else { // serialize to a json file
    console.log("002");
    makeObjectFromGraph(session, (err,obj) => {
      if(err == null) {
        console.log("003");
        fs.writeFileSync(file,JSON.stringify(obj),"utf8");
        console.log("004");
        callback(null);
      }
      else {
        console.log("005");
        callback(err);
      }
    });
  }
  console.log("006");
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
  addRelation: addRelation,
  replaceRelationProperties: replaceRelationProperties,
  serialize: serialize,
  makeObjectFromGraph: makeObjectFromGraph
};
