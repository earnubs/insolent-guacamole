var $ = require('jquery');
require('es6-promise').polyfill();
var Dispatcher = require('./dispatcher/AppDispatcher.js');
var UploadConstants = require('./constants/UploadConstants.js');

module.exports = (function() {

  var form = $('#upload-form');

  form.on('submit', sendForm);

  function sendForm(e) {
    e.preventDefault();
    $.post('/upload', $(this).serialize())
    .done(function(data) {
      //  can start polling scan results...
      console.log(data);
      Dispatcher.dispatch({
        actionType: 'package-update',
        state: UploadConstants.PACKAGE_SCANNING,
        statusUrl: data.status_url
      });
    })
    .fail(function(data) {
      // show error
      console.log('fail');
      console.log(data);
    });
  };

})();
