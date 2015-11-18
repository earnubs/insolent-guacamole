var React = require('react')
var ReactDOM = require('react-dom');
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var Input = React.createFactory(require('./InputTypeFile.js'));
var PackageStore = require('../stores/PackageStore.js');
var UploadConstants = require('../constants/UploadConstants.js');

var Uploader = React.createClass({

  getInitialState: function() {
    return PackageStore.getAll();
  },

  componentDidMount: function() {
    PackageStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    PackageStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState({
      package: PackageStore.getAll()
    });
  },

  render: function() {
    return (
      <Input
      stateValue={this.state.state}
      uploadUrl={this.props.uploadUrl}
      statusUrl={this.state.statusUrl}
      packageForm={this.props.packageForm} // XXX packageFormID
      />
    )
  }

});

module.exports = Uploader;
