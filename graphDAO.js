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
  var props = JSON.stringify(properties);
  var queryString = "CREATE (n: " + label + " { name: '" + name + "', properties: '" + props + "'}) return n";
  return query(session,queryString);
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

// public functions
module.exports = {
  query: query,
  addNode: addNode,
  findNode: findNode,
  removeNode: removeNode,
  openSession: openSession,
  closeSession: closeSession,
  filterResult: filterResult
};
