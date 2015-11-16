var Dispatcher = require('../dispatcher/AppDispatcher.js');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

/** TODO
 * raname state to uploadState
 */

const STATES = [
  'selected',
  'uploading',
  'uploaded',
  'retrying',
  'failed',
  'scanning',
  'complete'
];

const CHANGE_EVENT = 'change';

var _file = {
  state: null,
  progress: null,
  name: null,
  size: null,
  lastModifiedDate: null,
  uploadId: null
};

var FileStore = assign({}, EventEmitter.prototype, {

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
    var state;

    console.log(payload);

    if (payload.actionType === 'file-update') {

      if (payload.state) {
        state = STATES.indexOf(payload.state.trim());
        if (state > -1) {
          _file.state = STATES[state];
        } else {
          console.log('Unknown upload state: ' + payload.state);
        }
      }
      if (payload.progress) {
        _file.progress = payload.progress;
      }
      if (payload.name) {
        _file.name = payload.name;
      }

      FileStore.emit(CHANGE_EVENT);
    }
  })
});

module.exports = FileStore;
