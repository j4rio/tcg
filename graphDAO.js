//graph data access object; underlying graph db is neo4j
// you need to set up three environment variables; one for URI: e.g. "bolt://server.com"
// and username and password

const neo4j = require("neo4j-driver").v1;
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME,process.env.NEO4J_PASSWORD)
);

// create node
function query(query,callback) {
  const session = driver.session();
  const resultPromise = session.run(query);
  resultPromise.then(result => {
    session.close();
    callback(null,result);
  });
}

// public functions
module.exports = {
  query: query
};
