'use strict';

var url = require('url');

var Tcg = require('./TcgService');

module.exports.getFragment = function getFragment (req, res, next) {
  Tcg.getFragment(req.swagger.params, res, next);
};
