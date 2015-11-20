var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var Input = React.createFactory(require('./InputTypeFile.js'));
var Message = React.createFactory(require('./Message.js'));
var PackageStore = require('../stores/PackageStore.js');
var UploadConstants = require('../constants/UploadConstants.js');
var StringConstants = require('../constants/StringConstants.js');


function getUploaderState() {
  return {
    // assertion: AssertionStore.get(),
    packageUpload: PackageStore.getAll(),
    message: StringConstants.SELECT_PACKAGE // messageStore
  }
};

var Uploader = React.createClass({

  getInitialState: function() {
    return getUploaderState();
  },

  componentDidMount: function() {
    PackageStore.addChangeListener(this.handlePackageStoreChange);
  },

  componentWillUnmount: function() {
    PackageStore.removeChangeListener(this.handlePackageStoreChange);
  },

  handlePackageStoreChange: function() {

  },


  render: function() {
    return <div>
    <Input
    uploadFields = {['upload_id', 'timestamp', 'signature']}
    packageForm = {this.props.packageForm}
    uploadUrl = {this.props.packageUploadUrl}
    uploadData = {this.state.packageUploadData}
    />
    <Message
    message = {this.state.message}
    />
    </div>
  }

});

module.exports = Uploader;
