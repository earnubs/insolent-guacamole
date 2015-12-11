var React = require('react')
var ReactDOM = require('react-dom');
var Uploader = React.createFactory(require('./components/Uploader.js'));
var Submit = React.createFactory(require('./components/InputTypeSubmit.js'));

require('./form.js')(); // ideally form would be a component too

ReactDOM.render(
  <Uploader
    submitButton='submit-form'
    packageUploadUrl={SCA_FILES_UPLOAD_URL}
    packageUploadSignatureUrl={SCA_UPLOAD_SIGNATURE_URL}
    packageForm='form-files'
  />,
  document.getElementById('uploader')
);

ReactDOM.render(
  <Submit
    formUrl='/upload' // form post url
    text='Submit'
  />,
  document.getElementById('submit-form')
);
