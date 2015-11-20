var $ = require('jquery');
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var UploadConstants = require('../constants/UploadConstants.js');

const CHANGE_EVENT = 'change';

var _file = {
  status: null,
  progress: 0,
  retries: 0
};

var upload = function(url, data) {
    $.ajax(url, {
      type: 'POST',
      data: data,
      processData: false,
      xhr: function() {
        var req = new XMLHttpRequest();
        req.upload.onprogress = handleUploadProgress;
        return req;
      }.bind(this)
    })
    .done(handleUploadDone)
    .fail(handleUploadFail)
    .always(handleUploadAlways)
}

var handleUploadProgress = function(e) {
  _file.progress = (e.lengthComputable ? (e.loaded / e.total) * 100 | 0 : 0);
  _file.status = UploadConstants.UPLOAD_UPLOADING;
}

var handleUploadDone = function(data, textStatus, jqXHR) {
  if (textStatus === 'success') {
    if (data && data.upload_id) {
      //Actions.setUploadStatus(UploadConstants.UPLOAD_UPLOADED);
      _file.status = UploadConstants.UPLOAD_UPLOADED;
    }
  } else {
    // retry
      // check MAX_RETRIES ...
  }
}

var handleUploadFail = function(jqXHR, textStatus, errorThrown) {
  _file.retries += 1;
  _file.status = UploadConstants.UPLOAD_RETRYING;
}

var handleUploadAlways = function() {
  PackageStore.emit(CHANGE_EVENT);
};

var scan = function(url) {
  $.ajax(url)
  .done(handleScanResultsDone)
  .fail(handleScanResultsFail)
}

var handleScanResultsDone = function(data) {
  // TODO polling, timeout
  console.log('scanning...')
  // XXX handle failure too
  if (data && data.success) {
    _file.status = UploadConstants.UPLOAD_COMPLETE;
    PackageStore.emit(CHANGE_EVENT);
  }
}

var handleScanResultsFail = function(error) {
  console.log('fail')
  console.log(error);
  _file.status = UploadConstants.UPLOAD_FAILED;
  PackageStore.emit(CHANGE_EVENT);
}

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

    switch (payload.actionType) {
      case UploadConstants.PACKAGE_UPDATE_STATUS:
        console.log(payload.status);
        _file.status = payload.status;
        PackageStore.emit(CHANGE_EVENT);
        break;

      case UploadConstants.PACKAGE_START_UPLOAD:
        // XXX don't use bar url prop in case of fall through!
        upload(payload.url, payload.formData);
        _file.status = UploadConstants.UPLOAD_SELECTED;
        PackageStore.emit(CHANGE_EVENT);
        break;

      case UploadConstants.PACKAGE_SCAN:
        scan(payload.url);
        _file.status = UploadConstants.UPLOAD_SCANNING;
        PackageStore.emit(CHANGE_EVENT);
        break;
    }

    return true;
  })
});

module.exports = PackageStore;
