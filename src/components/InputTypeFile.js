require('es6-promise').polyfill();
var $ = require('jquery');
var React = require('react');
var Actions = require('../actions/UploaderActions.js');
var UploadConstants = require('../constants/UploadConstants.js');

module.exports = React.createClass({

  propTypes: {
    multiple: React.PropTypes.bool,
    accept: React.PropTypes.string,
    placeholder: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      multiple:   false,
      accept:     '.snap, .click',
      maxRetries: 1, // retry after error, then fail
      progress:   0
    };
  },

  getInitialState: function() {
    return {
      fileName: null,
      uploadProgress: 0
    }
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
    var data = this.state.uploadData;

    data.append('package', file);

    if (!file) {
      // XXX error
      return;
    }

    this.setState({
      fileName: file.name
    });

    Actions.startUpload(this.props.uploadUrl, data);
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
        type     = "file"
        ref      = "fileInput"
        multiple = { this.props.multiple }
        accept   = { this.props.accept }
        onChange = { this.handleChange }
        style    = {{ display: 'none' }}
      />
      <div>{ this.state.fileName }</div>
      <div>{ this.state.uploadProgress }</div>
    </div>
  }
});
