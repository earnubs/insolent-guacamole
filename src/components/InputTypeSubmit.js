var React = require('react');
require('es6-promise').polyfill();
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var UploadConstants = require('../constants/UploadConstants.js');
var PackageStore = require('../stores/PackageStore.js');

module.exports = React.createClass({
  getDefaultProps: function() {
    return {
      name: 'submitForm'
    };
  },

  getInitialState: function() {
    return {
      disabled: true,
      text: 'Submit'
    }
  },

  componentDidMount: function() {
    PackageStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    PackageStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState({disabled:
      (PackageStore.get('packageUpload.state') < UploadConstants.PACKAGE_UPLOADED)
    })
  },

  render: function() {
    return (
      <button
      type = 'submit'
      name = {this.props.name}
      disabled = {this.state.disabled}>
        {this.state.text}
      </button>
    )
  }
});
