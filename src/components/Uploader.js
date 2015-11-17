var React = require('react')
var ReactDOM = require('react-dom');
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var Input = React.createFactory(require('./InputTypeFile.js'));
var PackageStore = require('../stores/PackageStore.js');
var FormStore = require('../stores/FormStore.js');
var UploadConstants = require('../constants/UploadConstants.js');

var Uploader = React.createClass({

  getInitialState: function() {
    return PackageStore.getAll();
  },

  componentDidMount: function() {
    this.buttonEl = document.getElementById(this.props.submitButton);
    PackageStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    PackageStore.removeChangeListener(this._onChange);
  },

  disableFormSubmit: function(disable) {
    this.buttonEl.disabled = disable;
  },

  _onChange: function() {
    this.setState({
      package: PackageStore.getAll()
    });

    this.disableFormSubmit(
      !(PackageStore.get('state') >= UploadConstants.PACKAGE_UPLOADED)
    );
  },

  render: function() {
    return (
      <Input
      uploadUrl={this.props.uploadUrl}
      packageForm={this.props.packageForm}
      />
    )
  }

});

module.exports = Uploader;
