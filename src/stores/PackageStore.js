var Dispatcher = require('../dispatcher/AppDispatcher.js');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var UploadConstants = require('../constants/UploadConstants.js');

const CHANGE_EVENT = 'change';

var _file = {
  state: null,
  name: null,
  size: null,
  uploadId: null
};

/**
 * PackageStore - data on the the package being uploaded.
 */

var PackageStore = assign({}, EventEmitter.prototype, {

  get: function(key) {
    return _file[key];
  },

  getAll: function() {
    return _file;
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  dispatcherToken: Dispatcher.register(function(payload) {
    var uploadState;

    if (payload.actionType === 'package-update') {

      if (payload.state) {
        for (var prop in UploadConstants) {
          if (UploadConstants[prop] === payload.state) {
            _file.state = UploadConstants[prop];
          }
        }
      }
      if (payload.size) {
        _file.size = payload.size;
      }
      if (payload.name) {
        _file.name = payload.name;
      }
      if (payload.statusUrl) {
        _file.statusUrl = payload.statusUrl;
      }

      PackageStore.emit(CHANGE_EVENT);
    }
  })
});

module.exports = PackageStore;
