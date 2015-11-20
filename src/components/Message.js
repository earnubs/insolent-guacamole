require('es6-promise').polyfill();
var React = require('react');
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var UploadConstants = require('../constants/UploadConstants.js');

module.exports = React.createClass({
  render: function() {
    return <div>
    { this.props.message }
    </div>
  }
});
