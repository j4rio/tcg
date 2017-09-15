'use strict';

module.exports.getFragment = function(args, res, next) {
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
  examples['application/json'] = {
  "explain" : "aeiou",
  "fragment": "asdas",
  "nextState" : "aeiou"
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}
