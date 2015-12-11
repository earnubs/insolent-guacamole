var $ = require('jquery');
var _ = require('lodash');
var Actions = require('../actions/UploaderActions.js');
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var UploadConstants = require('../constants/UploadConstants.js');

const CHANGE_EVENT = 'change';
const MAX_RETRIES = 1;
const POLL_INTERVAL = 1000;
const MAX_POLL = 250; // ~ 5 mins

var _packageUpload = {
  id: null,
  condition: null,
  progress: 0,
  retries: 0,
  polls: 0,
  name: '',
  uploadURL: null,
  signatureUrl: null,
  file: null
};

var parseJSONError = function(data) {
  if (data && data.errors) {
    for (var err in data.errors) {
      data.errors[err].forEach(logErrorMessage);
    }
  }
};

var logErrorMessage = function(message) {
  // XXX do we want to send this to the user?
  console.error(message);
};

var upload = function(url, file, data) {

  var formData = new FormData();

  if (!file) {
    console.warn('upload called with no file');
    return;
  }

  formData.append('binary', file);

  if (data) {
    for (var prop in data) {
      formData.append(prop, data[prop]);
    }
  }

  $.ajax(url, {
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
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
  var progress = (e.lengthComputable ? (e.loaded / e.total) * 100 | 0 : 0)
  progress = Math.min(Math.max(progress, 0), 100);
  Actions.setUpload({
    progress: progress,
    condition: UploadConstants.UPLOAD_UPLOADING
  });

  return _packageUpload;
}

var handleUploadDone = function(data, textStatus, jqXHR) {
//{"successful": false, "errors": {"timestamp": ["Timestamp is expired."]}}
// GET upload-signature
// upload again
// concat to log ?

  if (textStatus === 'success') {
    if (data && data.upload_id) {
      _packageUpload.condition = UploadConstants.UPLOAD_UPLOADED;
      Actions.setUpload({
        id: data.upload_id
      });
    }
  } else {
    // XXX require('config.js') CONFIG FOR MAX_RETRIES
    if (_packageUpload.retries < MAX_RETRIES) {
      getUploadSignature(_packageUpload.signatureUrl);
    } else {
      // XXX send message to user: try again
      // XXX ravenjs throw exception
    }
  }

  return _packageUpload;
}

var handleUploadFail = function(jqXHR, textStatus, errorThrown) {
  console.warn('handleUploadFail: ', errorThrown);
  parseJSONError(jqXHR.responseJSON);

  if (_packageUpload.retries < MAX_RETRIES) {
    _packageUpload.condition = UploadConstants.UPLOAD_RETRYING;
    getUploadSignature(_packageUpload.signatureUrl);
  } else {
    // XXX message to user
    console.warn('Upload failed, please try again.')
    _packageUpload.condition = UploadConstants.UPLOAD_FAILED;
  }

  return _packageUpload;
}

var handleUploadAlways = function() {
  PackageStore.emit(CHANGE_EVENT);
};

var getUploadSignature = function(url) {
  $.ajax(url)
  .done(handleGetUploadSignatureDone)
  .fail(handleGetUploadSignatureFail)
}

var handleGetUploadSignatureDone = function(data, textStatus, jqXHR) {
  Actions.setUpload({
    id: data.upload_id
  });
  _packageUpload.retries++; // XXX use action
  upload(_packageUpload.uploadURL, _packageUpload.file, data); // XXX use action
}

var handleGetUploadSignatureFail = function(data, textStatus, jqXHR) {
  // XXX message to user
  console.log(textStatus, data);
}

var scan = function(url) {
  $.ajax(url)
  .done(handleScanResultsDone)
  .fail(handleScanResultsFail)
  .always(handleScanResultsAlways)
}

var handleScanResultsDone = function(data) {
  // XXX examine api results, message, url, etc...

  _packageUpload.polls++;

  if (data && data.completed) {
    _packageUpload.condition = UploadConstants.UPLOAD_COMPLETE;

    if (data.application_url) {
      window.location.replace(data.application_url);
    } else {
      // XXX action et message
      console.log(data.message);
    }

  } else if (_packageUpload.polls < MAX_POLL) {
    if (data && data.message) {
      // XXX action set message
      console.log(data.message);
    }
    _.delay(scan, POLL_INTERVAL, _packageUpload.scanURL);
  } else {
    // XXX 'pollScanResultsSuccess:poll-timeout'
    console.log('poll timeout');
  }

  return _packageUpload;
}

var handleScanResultsFail = function(error) {
  // we could try asking for the page again, though probably better to fail
  // and ask the user to upload again
  console.log('fail')
  console.log(error);
  _packageUpload.condition = UploadConstants.UPLOAD_FAILED;

  return _packageUpload;
}

var handleScanResultsAlways = function(error) {
  PackageStore.emit(CHANGE_EVENT);
}

/**
 * PackageStore - data on the the package being uploaded.
 */

var PackageStore = assign({}, EventEmitter.prototype, {

  get: function(key) {
    if (key in _packageUpload) {
      return _packageUpload[key];
    }

    throw new Error('KeyError: ' + key + ' not found in PackageStore');
  },

  getAll: function() {
    return _packageUpload;
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },


  dispatcherToken: Dispatcher.register(function(payload) {

    switch (payload.actionType) {

      case UploadConstants.UPLOAD_UPDATE:
        var obj = payload.upload;
        // assign only if _file has that property
        _.assign(_packageUpload, _.pick(obj, _.keys(_packageUpload)));

        PackageStore.emit(CHANGE_EVENT);
        break;

      case UploadConstants.UPLOAD_POLL:
        _packageUpload.polls++;

        PackageStore.emit(CHANGE_EVENT);
        break;

      case UploadConstants.UPLOAD_RETRY:
        _packageUpload.retries++;

        PackageStore.emit(CHANGE_EVENT);
        break;

      case UploadConstants.PACKAGE_START_UPLOAD:
        upload(payload.uploadURL, payload.file, payload.data);
        _packageUpload.condition = UploadConstants.UPLOAD_SELECTED;
        //_file.formData = payload.formData;
        _packageUpload.uploadURL = payload.uploadURL;
        _packageUpload.file = payload.file;
        _packageUpload.name = payload.file.name;
        PackageStore.emit(CHANGE_EVENT);
        break;

      case UploadConstants.PACKAGE_SCAN:
        scan(payload.scanURL);
        _packageUpload.condition = UploadConstants.UPLOAD_SCANNING;
        _packageUpload.scanURL = payload.scanURL;
        PackageStore.emit(CHANGE_EVENT);
        break;
    }

    return true;
  })
});

module.exports = PackageStore;
