var $ = require('jquery');
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
    var pkg = PackageStore.getAll();
    this.setState({
      package: pkg
    });

    if (pkg.state === UploadConstants.PACKAGE_SCANNING) {
      console.log('start scanning!');
      console.log(pkg.statusUrl);
      this.packageScan(pkg.statusUrl);
    }
  },

  packageScan: function(url) {
    $.get(url)
    .done(function(data) {
      console.log('scanning...')
      console.log(data);
    })
    .fail(function(err) {
      console.log('fail')
      console.log(err);
    })
    .always(function() {
      console.log('always')
    })
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
