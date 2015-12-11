var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var Actions = require('../actions/UploaderActions.js');
var Input = React.createFactory(require('./InputTypeFile.js'));
var Message = React.createFactory(require('./Message.js'));
var PackageStore = require('../stores/PackageStore.js');
var UploadConstants = require('../constants/UploadConstants.js');
var StringConstants = require('../constants/StringConstants.js');


function getUploaderState() {
  return PackageStore.getAll();
};

var Uploader = React.createClass({

  getInitialState: function() {
    return getUploaderState();
  },

  componentDidMount: function() {
    if (this.props.packageUploadSignatureUrl) {
      Actions.setUpload({
        signatureURL: this.props.packageUploadSignatureUrl
      });
    } else {
      console.error('packageUploadSignatureUrl must be set.');
    }
    PackageStore.addChangeListener(this.handlePackageStoreChange);
  },

  componentWillUnmount: function() {
    PackageStore.removeChangeListener(this.handlePackageStoreChange);
  },

  handlePackageStoreChange: function() {
    this.setState(getUploaderState());
  },

  render: function() {
    return <div>
    <Input
    uploadFields = {['upload_id', 'timestamp', 'signature']} // XXX set
    packageForm = {this.props.packageForm}
    uploadUrl = {this.props.packageUploadUrl}
    uploadData = {this.state.packageUploadData}
    name = {this.state.name || 'No file selected' }
    progress = {this.state.progress}
    />
    <Message message = {this.state.condition} />
    </div>
  }

});

module.exports = Uploader;
