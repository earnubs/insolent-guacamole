var $ = require('jquery');
var _ = require('lodash');
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var UploadConstants = require('../constants/UploadConstants.js');

const CHANGE_EVENT = 'change';
const MAX_RETRIES = 1;
const POLL_INTERVAL = 1000;
const MAX_POLL = 250; // ~ 5 mins

// XXX consider what we want to expose to components and what we do not,
// so maybe split this along those lines
var _file = {
  status: null,
  progress: 0,
  retries: 0,
  polls: 0,
  name: null,
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

  console.log(url);
  console.log(_file);

  if (!file) {
    return;
    console.warn('upload called with no file');
  }
  var formData = new FormData();
  formData.append('package', file);

  if (data) {
    for (var prop in data) {
      formData.append(prop, data[prop]);
    }
  }

  $.ajax(url, {
    type: 'POST',
    data: formData,
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

  return _file;
}

var handleUploadDone = function(data, textStatus, jqXHR) {
//{"successful": false, "errors": {"timestamp": ["Timestamp is expired."]}}
// GET upload-signature
// upload again
// concat to log ?

  if (textStatus === 'success') {
    if (data && data.upload_id) {
      _file.status = UploadConstants.UPLOAD_UPLOADED;
    }
  } else {
    // REQUIRE CONFIG FOR MAX_RETRIES
    if (_file.retries < MAX_RETRIES) {
      getUploadSignature(_file.signatureUrl);
    } else {
      // send message to user: try again
    }
  }

  return _file;
}

var handleUploadFail = function(jqXHR, textStatus, errorThrown) {
  console.warn('handleUploadFail: ', errorThrown);
  parseJSONError(jqXHR.responseJSON);

  if (_file.retries < MAX_RETRIES) {
    _file.status = UploadConstants.UPLOAD_RETRYING;
    getUploadSignature(_file.signatureUrl);
  } else {
    // XXX message to user
    console.warn('Upload failed, please try again.')
    _file.status = UploadConstants.UPLOAD_FAILED;
  }

  return _file;
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
  _file.retries++;
  upload(_file.uploadURL, _file.file, data);
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

  _file.polls++;

  if (data && data.success) {
    _file.status = UploadConstants.UPLOAD_COMPLETE;
  } else if (_file.polls < MAX_POLL) {
    _.delay(scan, POLL_INTERVAL, _file.scanURL);
    console.log(_file.polls);
  } else {
    // XXX 'pollScanResultsSuccess:poll-timeout'
    console.log('poll timeout');
  }

  return _file;
}

var handleScanResultsFail = function(error) {
  // we could try asking for the page again, though probably better to fail
  // and ask the user to upload again
  console.log('fail')
  console.log(error);
  _file.status = UploadConstants.UPLOAD_FAILED;

  return _file;
}

var handleScanResultsAlways = function(error) {
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

      case UploadConstants.PACKAGE_SET_SIGNATURE_URL:
        _file.signatureUrl = payload.url;
        PackageStore.emit(CHANGE_EVENT);
        break;

      case UploadConstants.PACKAGE_UPDATE_STATUS:
        console.log(payload.status);
        _file.status = payload.status;
        PackageStore.emit(CHANGE_EVENT);
        break;

      case UploadConstants.PACKAGE_START_UPLOAD:
        upload(payload.uploadURL, payload.file, payload.data);
        _file.status = UploadConstants.UPLOAD_SELECTED;
        //_file.formData = payload.formData;
        _file.uploadURL = payload.uploadURL;
        _file.file = payload.file;
        _file.name = payload.file.name;
        PackageStore.emit(CHANGE_EVENT);
        break;

      case UploadConstants.PACKAGE_SCAN:
        scan(payload.scanURL);
        _file.status = UploadConstants.UPLOAD_SCANNING;
        _file.scanURL = payload.scanURL;
        PackageStore.emit(CHANGE_EVENT);
        break;
    }

    return true;
  })
});

module.exports = PackageStore;
