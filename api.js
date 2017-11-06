"use strict";

//get domain array

function getDomainArray(args, res) {
  var examples = {};
  examples["application/json"] = [{
    "name": "testDomain",
    "explain" : "test domain only"
  }];
  if (Object.keys(examples).length > 0) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

//exported functions

module.exports = {
  getDomainArray: getDomainArray
};
