var $ = require('jquery');
var React = require('react');
require('es6-promise').polyfill();
var Actions = require('../actions/UploaderActions.js');
var UploadConstants = require('../constants/UploadConstants.js');
var PackageStore = require('../stores/PackageStore.js');

module.exports = React.createClass({
  getDefaultProps: function() {
    return {
      name: 'submitForm'
    };
  },

  getInitialState: function() {
    return {
      disabled: true,
      id: null,
      bytes: 0
    }
  },

  componentDidMount: function() {
    PackageStore.addChangeListener(this.onChange);
  },

  componentWillUnmount: function() {
    PackageStore.removeChangeListener(this.onChange);
  },

  onChange: function() {
    var isDisabled = (PackageStore.get('condition') < UploadConstants.UPLOAD_UPLOADED);
    var file = PackageStore.get('file');

    console.log('isDisabled:', isDisabled);
    console.log(PackageStore.getAll());

    this.setState({
      disabled: isDisabled,
      id: PackageStore.get('id'),
      bytes: file.size // XXX required in form, but not used in the backend
    })
  },

  render: function() {
    return (
      <div>
        <input type='hidden' name='updown_id' value={ this.state.id } />
        <input type='hidden' name='binary_filesize' value={ this.state.bytes }/>
        <button type='submit' name={this.props.name} className='b-button'
          disabled = {this.state.disabled}>{ this.props.text }</button>
      </div>
    )
  }
});
