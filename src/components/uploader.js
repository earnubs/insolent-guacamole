var React = require('react')
var ReactDOM = require('react-dom');
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var Input = React.createFactory(require('./InputTypeFile.js'));
var FileStore = require('../stores/FileStore.js');

function toggleSubmit() {
  // activate or deactivate the submit button depending on state of form and upload
}

function checkFormValidity(form) {
  var elements = form.elements;
  var i;
  var isValid = true;

  for(i = elements.length; i--;) {
    if (!elements[i].checkValidity()) {
      isValid = false;
      break;
    }
  }

  return isValid;
}

var Uploader = React.createClass({

  getInitialState: function() {
    return FileStore.getAll();
  },

  componentDidMount: function() {
    if (this.props.formSelector) {
      var formEl = document.getElementById(this.props.formSelector);
      formEl.addEventListener('change', function(e) {
        console.log(checkFormValidity(e.currentTarget));
        // action to update the FormStore
      }, false);
    }
    FileStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    // XXX remove form listener
    FileStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    //console.log('xxx');
    //console.log(FileStore.getAll());
    this.setState(FileStore.getAll());
  },

  render: function() {
    return (
      <Input
      uploadUrl={this.props.uploadUrl}
      />
    )
  }

});

module.exports = Uploader;
