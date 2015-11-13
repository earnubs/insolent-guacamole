var React = require('react')
var ReactDOM = require('react-dom');
var Dispatcher = require('./dispatcher/AppDispatcher.js');
var Input = React.createFactory(require('./components/input-type-file.js'));
var FileStore = require('./stores/FileStore.js');


/**
var fileStore = {
  state: null
};

var formStore = {
  isValid: null
};

var fooStore = {
  isValid: null
};

formStore.dispatchToken = uploadDispatcher.register(function(payload) {
  if (payload.actionType === 'state-update') {
    uploadDispatcher.waitFor([fileStore.dispatchToken]);
    console.log(2);
  }
});

fooStore.dispatchToken = uploadDispatcher.register(function(payload) {
  if (payload.actionType === 'state-update') {
    uploadDispatcher.waitFor([formStore.dispatchToken]);
    console.log(3);
  }
});

fileStore.dispatchToken = uploadDispatcher.register(function(payload) {
  if (payload.actionType === 'state-update') {
    console.log(1);
  }
});


uploadDispatcher.dispatch({
  actionType: 'state-update',
  newState: 'uploading'
});
**/

ReactDOM.render(
  <Input
    uploadUrl='/updown'
  />,
  document.getElementById('uploader')
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
