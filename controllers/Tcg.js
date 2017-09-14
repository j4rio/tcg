'use strict';

var url = require('url');

var Tcg = require('./TcgService');

module.exports.getDomainSEF = function getDomainSEF (req, res, next) {
  Tcg.getDomainSEF(req.swagger.params, res, next);
};
