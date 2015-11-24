require('es6-promise').polyfill();
var $ = require('jquery');
var React = require('react');
var Actions = require('../actions/UploaderActions.js');
var UploadConstants = require('../constants/UploadConstants.js');

module.exports = React.createClass({

  propTypes: {
    multiple:    React.PropTypes.bool,
    accept:      React.PropTypes.string,
    placeholder: React.PropTypes.string,
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

  componentDidMount: function() {
    var form;
    var data = new FormData();
    if (this.props.packageForm && this.props.uploadFields.length) {
      form = document.getElementById(this.props.packageForm);

      this.props.uploadFields.forEach(function(item) {
        data.append(item, form.elements[item].value);
      });
    }

    this.setState({'uploadData': data});
  },

  handleChange: function(e) {
    var file = e.target.files[0];
    if (!file) {
      return false;
    }
    Actions.setPackageName(file.name);

    var data = this.state.uploadData;

    data.append('package', file);

    Actions.startUpload(this.props.uploadUrl, data);
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
    style   = {{  backgroundColor: 'silver'}}
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
      <div>{ this.props.progress }</div>
    </div>
  }
});
