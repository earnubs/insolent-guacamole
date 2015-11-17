var React = require('react');
require('es6-promise').polyfill();
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var UploadConstants = require('../constants/UploadConstants.js');

module.exports = React.createClass({

  propTypes: {
    multiple: React.PropTypes.bool,
    accept: React.PropTypes.string,
    placeholder: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      multiple: false,
      accept: '.snap, .click',
      maxRetries: 1 // retry after error, then fail
    };
  },

  getInitialState: function() {
    return {
      // initial state: ?
      name: null,
      progress: 0,
      retries: 0
    }
  },

  componentDidMount: function() {
    this.xhr = new XMLHttpRequest();

    this.xhr.onload = (e) => {
      // XXX handle bad response
      var response = JSON.parse(e.target.responseText);
      var uploadId = response.upload_id;
      Dispatcher.dispatch({
        actionType: 'package-update',
        state: UploadConstants.PACKAGE_UPLOADED,
        uploadId: uploadId
      });
    };

    this.xhr.upload.onprogress = (e) => {
      this.setState({
        progress: (e.lengthComputable ? (e.loaded / e.total) * 100 | 0 : 0)
      });
      Dispatcher.dispatch({
        actionType: 'package-update',
        state: UploadConstants.PACKAGE_UPLOADING
      });
    };

    this.xhr.upload.onerror = (e) => {
      this.setState(function(previousState, currentProps) {
        return {retries: previousState.retry + 1};
      });
      Dispatcher.dispatch({
        actionType: 'package-update',
        state: UploadConstants.PACKAGE_RETRYING
      });
    }
  },

  change: function(e) {
    var file = e.target.files[0];

    if (!file) {
      return;
    }

    this.setState({
      name: file.name,
      progress: 0
    });

    Dispatcher.dispatch({
      actionType: 'package-update',
      state: UploadConstants.PACKAGE_SELECTED,
      name: file.name,
      size: file.size,
    });

    this.uploadFile(file);
  },

  uploadFile: function(file) {
    var data = new FormData();
    data.append('package', file);

    this.xhr.open('POST', this.props.uploadUrl, true);

    this.xhr.send(data);
  },

  handleClick: function(e) {
    e.stopPropagation();
    var fileInput = this.refs.fileInput;
    fileInput.value = null;
    fileInput.click();
  },

  render: function() {
    return (
      <div onClick={ this.handleClick } style={{ backgroundColor: 'silver'}}>
        <input
        type="file"
        ref="fileInput"
        multiple={ this.props.multiple }
        accept={ this.props.accept }
        onChange={ this.change }
        style={{ display: 'none' }}
        />
        <div>{ this.state.name }</div>
        <div>{ this.state.progress }</div>
      </div>
    )
  }
});
