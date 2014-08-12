var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/auto.grid/demo');
});

router.get('/license', function(req, res) {
  res.render('license', {tab:'license'});
});

router.get('/faq', function(req, res) {
  res.render('faq', {tab:'faq'});
});

router.get('/download', function(req, res) {
  var pkg = require('../package.json');

  res.render('download', {
    version: pkg.version,
    tab: 'download'
  });
});

router.get('/auto.grid/demo', function(req, res) {
  res.render('auto.grid/demo.jade', {tab:'grid'});
});

router.get('/auto.modal/demo', function(req, res) {
  res.render('auto.modal/demo.jade', {tab:'modal'});
});

router.get('/auto.dropdown/demo', function(req, res) {
  res.render('auto.dropdown/demo.jade', {tab:'dropdown'});
});

router.get('/auto.tabs/demo', function(req, res) {
  res.render('auto.tabs/demo.jade', {tab:'tabs'});
});

router.get('/auto.popover/demo', function(req, res) {
  res.render('auto.popover/demo.jade', {tab:'popover'});
});

module.exports = router;
