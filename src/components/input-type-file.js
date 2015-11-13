var React = require('react');
require('es6-promise').polyfill();
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var FileStore = require('../stores/FileStore.js');

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
      placeholder: 'click or drop to upload package',
      maxRetry: 1 // retry after error, then fail
    };
  },

  getInitialState: function() {
    return {
      name: null,
      progress: 0,
      state: false,
      retry: 0
    }
  },

  componentDidMount: function() {
    FileStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    FileStore.removeChangeListener(this._onChange);
  },

  _onChange: function(e) {
    console.log(FileStore.getAll());
    this.setState(FileStore.getAll());
  },

  change: function(e) {
    var file = e.target.files[0];
    //this.setState({file: file});

    Dispatcher.dispatch({
      actionType: 'file-update',
      state: 'selected',
      name: file.name,
      size: file.size,
      lastModified: file.lastModifiedDate
    });

    this.uploadFile(file);
  },

  uploadFile: function(file) {
    var data = new FormData();
    data.append('package', file);

    var xhr = new XMLHttpRequest();

    xhr.open('POST', this.props.uploadUrl, true);

    xhr.onload = function() {
      Dispatcher.dispatch({
        actionType: 'file-update',
        state: 'uploaded'
      });
    };

    xhr.upload.onprogress = function(e) {
      Dispatcher.dispatch({
        actionType: 'file-update',
        state: 'uploading',
        progress: (e.lengthComputable ? (e.loaded / e.total) * 100 | 0 : 0)
      });
    }

    xhr.upload.onerror = function() {
      this.setState(function(previousState, currentProps) {
        return {retry: previousState.retry + 1};
      });
      Dispatcher.dispatch({
        actionType: 'file-update',
        state: 'retrying'
      });
    }

    xhr.onreadystatechange = function() {
      console.log(xhr.readyState)
    }

    xhr.send(data);
  },

  handleClick: function(e) {
    e.stopPropagation();
    var fileInput = this.refs.fileInput;
    fileInput.value = null;
    fileInput.click();
  },

  render: function() {
    return (
      <div onClick={ this.handleClick } style={{ backgroundColor: 'silver', height:20}}>
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
        <div>{ this.state.state }</div>
      </div>
    )
  }
});
