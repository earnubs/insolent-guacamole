var $ = require('jquery');
require('es6-promise').polyfill();
var Actions = require('./actions/UploaderActions.js');
var UploadConstants = require('./constants/UploadConstants.js');

module.exports = function() {

  var form = $('#form-upload');

  form.submit(function(e) { 
    e.preventDefault();

    $.post($(this).baseURI, $(this).serialize())
    .done(function(data) {
      //  can start polling scan results...
      Actions.packageScan(data.status_url);
    })
    .fail(function(data) {
      // show error
      console.log('fail');
      console.log(data);
    });
  });

};
