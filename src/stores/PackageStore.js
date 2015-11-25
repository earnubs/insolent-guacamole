var $ = require('jquery');
var Dispatcher = require('../dispatcher/AppDispatcher.js');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var UploadConstants = require('../constants/UploadConstants.js');

const CHANGE_EVENT = 'change';
const MAX_RETRIES = 1;

var _file = {
  status: null,
  progress: 0,
  retries: 0,
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

  _file.status = UploadConstants.UPLOAD_RETRYING;

  if (jqXHR.status === 400 && _file.retries < MAX_RETRIES) {
    getUploadSignature(_file.signatureUrl);
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
  .always(handleGetUploadSignatureAlways)
}

var handleGetUploadSignatureDone = function(data, textStatus, jqXHR) {
  _file.retries++;
  upload(_file.uploadURL, _file.file, data);
}

var handleGetUploadSignatureFail = function(data, textStatus, jqXHR) {
  console.log(textStatus, data);
}

var handleGetUploadSignatureAlways = function(data, textStatus, jqXHR) {
}

var scan = function(url) {
  $.ajax(url)
  .done(handleScanResultsDone)
  .fail(handleScanResultsFail)
  .always(handleScanResultsAlways)
}

var handleScanResultsDone = function(data) {
  // TODO polling, timeout
  console.log('scanning...')
  // XXX handle failure too
  if (data && data.success) {
    _file.status = UploadConstants.UPLOAD_COMPLETE;
  } else {
    // wait, scan again, test a poll count against a limit
  }

  return _file;
}

var handleScanResultsFail = function(error) {
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
        scan(payload.url);
        _file.status = UploadConstants.UPLOAD_SCANNING;
        PackageStore.emit(CHANGE_EVENT);
        break;
    }

    return true;
  })
});

module.exports = PackageStore;
