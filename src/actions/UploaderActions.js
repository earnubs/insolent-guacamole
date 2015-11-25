var AppDispatcher = require('../dispatcher/AppDispatcher.js');
var UploadConstants = require('../constants/UploadConstants.js');


module.exports = {
  setPackageSignatureUrl: function(url) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.PACKAGE_SET_SIGNATURE_URL,
      url: url
    })
  },
  setUploadStatus: function(status) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.PACKAGE_UPDATE_STATUS,
      status: status
    })
  },
  startUpload: function(url, file, data) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.PACKAGE_START_UPLOAD,
      uploadURL: url,
      file: file,
      data: data
    })
  },
  packageScan: function(url) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.PACKAGE_SCAN,
      url: url
    })
  },
}
