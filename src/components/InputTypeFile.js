require('es6-promise').polyfill();
var $ = require('jquery');
var React = require('react');
var Actions = require('../actions/UploaderActions.js');
var UploadConstants = require('../constants/UploadConstants.js');

var componentStyle = {
  borderRadius: 3,
  border: '3px dotted #ddd',
  backgroundColor: '#efefef',
  padding: 15,
  position: 'relative'
};

module.exports = React.createClass({

  propTypes: {
    multiple:    React.PropTypes.bool,
    accept:      React.PropTypes.string,
    progress:    React.PropTypes.number,
    name:        React.PropTypes.string,
    uploadUrl:   React.PropTypes.string.isRequired
  },

  getDefaultProps: function() {
    return {
      inputElClass:    'b-uploader__file-input',
      filenameElClass: 'b-uploader__filename',
      multiple:        false,
      accept:          '.snap, .click',
      progress:        0,
      name:            ''
    };
  },

  getProgressBarStyle: function() {
    var p = this.props.progress;

    return {
      position: 'absolute',
      left: 5,
      right: 5,
      bottom: 3,
      backgroundImage: `linear-gradient(to right, #19B6EE 0%,#19B6EE ${p}%,
        transparent ${p}%,transparent ${p}%,transparent 100%)`,
      height:3
    }
  },

  componentDidMount: function() {
    var form;
    var data = {};
    if (this.props.packageForm && this.props.uploadFields.length) {
      form = document.getElementById(this.props.packageForm);
      if (form) {
        this.props.uploadFields.forEach(function(item) {
          data[item] = form.elements[item].value;
        });
      }
    }

    this.setState({'uploadData': data});
  },

  handleChange: function(e) {
    var file = e.target.files[0];
    if (!file) {
      return false;
    }
    Actions.startUpload(this.props.uploadUrl, file, this.state.uploadData);
    return true;
  },

  handleClick: function(e) {
    e.stopPropagation();
    var fileInput = this.refs.fileInput;
    fileInput.value = null;
    fileInput.click();
  },

  render: function() {
    return <div
    onClick = { this.handleClick }
    style   = { componentStyle }
    >
      <input
        type      = "file"
        ref       = "fileInput"
        multiple  = { this.props.multiple }
        accept    = { this.props.accept }
        onChange  = { this.handleChange }
        className = { this.props.inputElClass }
        style     = {{ display: 'none' }}
      />
      <div className={ this.props.filenameElClass }>{ this.props.name }</div>
      <div style={ this.getProgressBarStyle() } ></div>
    </div>
  }
});
