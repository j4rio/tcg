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

// create node
function query(session,query) {
  return session.run(query);
}

// public functions
module.exports = {
  query: query,
  openSession: openSession,
  closeSession: closeSession
};
