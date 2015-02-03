var path = require('path');
var express = require('express');
var router = express.Router();

router.get('*', function(req, res){
  res.sendfile(path.resolve('public/index.html'));
});

module.exports = router;
