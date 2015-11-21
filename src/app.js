var React = require('react')
var ReactDOM = require('react-dom');
var Uploader = React.createFactory(require('./components/Uploader.js'));
var Submit = React.createFactory(require('./components/InputTypeSubmit.js'));

require('./form.js'); // ideally form would be a component too

ReactDOM.render(
  <Uploader
    submitButton='submit-form'
    packageUploadUrl='/unscanned-upload' // package upload url
    packageUploadSignatureUrl='/dev/click-apps/upload-signature/'
    packageForm='form-files'
  />,
  document.getElementById('uploader')
);

ReactDOM.render(
  <Submit
    formUrl='/upload' // form post url
  />,
  document.getElementById('submit-form')
);

/**
 *
 * 1. [user] upload file
 * 2. on success, enable form for submission
 * 3. [user] submit form
 * 4. on success, poll scan results
 * 5. on success, redirect to application detail view
 *
 * 1. [user] upload file
 * 2. on failure, get new upload signature
 * 3. reup file
 * 3. on failure, show error message
 *
 * 1. [user] upload file
 * 2. on success, enable form for submission
 * 3. [user] submit form
 * 4. on failure, render form errors || handle bad response
 *
 * 1. [user] upload file
 * 2. on success, enable form for submission
 * 3. [user] submit form
 * 4. on success, poll scan results
 * 5. on fail, show error || check again
 *
 * FileInput
 * * should validate and upload file handling success and failure
 *   events
 * * should emit success and failure events
 *
 * Form
 * * should validate and submit handling success and failure
 * * should emit success and faiure events
 *
 * Scan Poller
 * * should scan for package scan results and act on completion event
 *
 *
 *
 */
