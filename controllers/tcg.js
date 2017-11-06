"use strict";

var url = require("url");
var api = require("../api.js");

//get array of domains

module.exports.getDomainArray = function (req, res, next) {
  api.getDomainArray(req.swagger.params, res, next);
};
