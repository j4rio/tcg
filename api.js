"use strict";

//get sef array

function getSEFArray(args, res) {
  /**
   * Request a code fragment from TCG
   * Request a code fragment from TCG
   *
   * state String state
   * domain String domain for the side-effect
   * sef String side-effect
   * returns SEF
   **/
  var examples = {};
  examples["application/json"] = {
    "initialState": "something first",
    "triggers": [ "s1","s2","s3","s4"],
    "explain" : "one possible explanation",
    "quaternion": [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
    "fragment": "console.log(\"hello, world!\");",
    "nextState" : "something next"
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

//exported functions

module.exports = {
  getSEFArray: getSEFArray
};
