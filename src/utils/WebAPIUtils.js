var $ = require('jquery');
var UploadConstants = require('../constants/UploadConstants.js');
var Actions = require('../actions/UploaderActions.js');

/**
 * @external File
 * @see {@link https://developer.mozilla.org/en/docs/Web/API/File}
 */

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

module.exports = {

  /**
   * POST a snap or click binary to updown
   * @method postFile
   * @param {String} url
   * @param {external:File} file
   * @param {String} data.upload_id - Part of the upload signature
   * @param {String} data.timestamp - Part of the upload signature
   * @param {String} data.signature - Part of the upload signature
   */
  postFile: function(url, file, data) {
    var formData = new FormData();

    if (!url) {
      console.warn('postFile requires a url');
      return;
    }

    if (!file) {
      console.warn('postFile requires a file');
      return;
    }

    if (data) {
      for (var prop in data) {
        formData.append(prop, data[prop]);
      }
    }

    formData.append('binary', file);

    $.ajax(url, {
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      xhr: function() {
        var req = new XMLHttpRequest();
        req.upload.onprogress = this._handlePostFileProgress.bind(this);
        return req;
      }.bind(this)
    })
    .done(this._handlePostFileDone)
    .fail(this._handlePostFileFail)
    .always(this._handlePostFileAlways);
  },

  /**
   * @protected
   */
  _handlePostFileProgress: function(e) {
    if (e.lengthComputable) {
      Actions.setUpload({
        progress: this._percent(e.loaded, e.total),
        condition: UploadConstants.UPLOAD_UPLOADING
      });
    }
  },

  /**
   * @protected
   */
  _percent: function(loaded, total) {
    var progress = (loaded / total) * 100 | 0;
    return Math.min(Math.max(progress, 0), 100);
  },

  /**
   * @protected
   */
  _handlePostFileDone: function(data, textStatus) {
    //{"successful": false, "errors": {"timestamp": ["Timestamp is expired."]}}

    if (textStatus === 'success' && data && data.upload_id) {
      Actions.setUpload({
        id: data.upload_id,
        condition: UploadConstants.UPLOAD_UPLOADED
      });
    } else {
      Actions.retryUpload();
    }
  },
  /**
   * @protected
   */
  _handlePostFileFail: function(data, textStatus, jqXHR) {
    console.warn('handleUploadFail: ', errorThrown);
    parseJSONError(jqXHR.responseJSON);

    Actions.retryUpload();

    // tell the system that the upload failed
    // get a new signature, tell the system about it
    // try upload again with new signature
  },

  /**
  * Request a new upload signature
  * @param {String} url - The API url that returns a new upload signature
  */
  getSignature: function(url) {
    $.ajax(url)
    .done(this._handleGetUploadSignatureDone)
    .fail(this._handleGetUploadSignatureFail);
  },

  /**
   * @protected
   */
  _handleGetSignatureDone: function(data, textStatus) {
    console.log(textStatus);
    Actions.startUpload(null, null, {
      id: data.upload_id,
      timestamp: data.timestamp,
      signature: data.signature
    });
  },

  /**
   * @protected
   */
  _handleGetSignatureFail: function() {},

  postForm: function() {},
  _handlePostFormDone: function() {},
  _handlePostFormFail: function() {},
  _handlePostFormAlways: function() {},

  getScanResult: function() {},
  _handleGetScanResultDone: function() {},
  _handleGetScanResultFail: function() {},
  _handleGetScanResultAlways: function() {}
};
