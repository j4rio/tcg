"use strict";

var url = require("url");
var api = require("../api.js");

//get array of SEFs

module.exports.getSEFArray = function getFragment (req, res, next) {
  api.getSEFArray(req.swagger.params, res, next);
};
