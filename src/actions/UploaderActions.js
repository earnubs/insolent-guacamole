var AppDispatcher = require('../dispatcher/AppDispatcher.js');
var UploadConstants = require('../constants/UploadConstants.js');


module.exports = {
  setUploadStatus: function(status) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.PACKAGE_UPDATE_STATUS,
      status: status
    })
  },
  packageScan: function(url) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.PACKAGE_SCAN,
      url: url
    })
  },
  startUpload: function(url, data) {
    AppDispatcher.dispatch({
      actionType: UploadConstants.PACKAGE_START_UPLOAD,
      url: url,
      formData: data
    })
  }
}
