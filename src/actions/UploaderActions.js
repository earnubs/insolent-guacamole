var AppDispatcher = require('../dispatcher/AppDispatcher.js');
var UploadConstants = require('../constants/UploadConstants.js');


module.exports = {
  setUpload: function(upload) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.UPLOAD_UPDATE,
      upload: upload
    })
  },

  uploadHasBeenRetried: function() {
    AppDispatcher.dispatch({
      actionType: UploadConstants.UPLOAD_RETRY
    })
  },

  uploadHasBeenPolled: function() {
    AppDispatcher.dispatch({
      actionType: UploadConstants.UPLOAD_POLL
    })
  },

  startUpload: function(url, file, data) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.PACKAGE_START_UPLOAD,
      uploadURL: url,
      file: file,
      data: data
    })

    // XXX call PackageStore:upload from here, but via util...
  },
  packageScan: function(url) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.PACKAGE_SCAN,
      scanURL: url
    })
  },
}
