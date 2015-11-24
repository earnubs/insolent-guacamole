var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var FileInput = require('../src/components/InputTypeFile.js');
var Actions = require('../src/actions/UploaderActions.js');

describe('InputTypeFile', function() {

  describe('props', function() {
    var input;
    var renderer;

    beforeEach(function() {
      renderer = TestUtils.createRenderer();
      input = renderer.render(
      <FileInput
      uploadUrl="/upload"
      name="foo"
      progress={42}
      />
      );
    });

    it('should provide sane defaults', function() {
      var result = renderer.getRenderOutput();
      var fileInput = result.props.children[0];
      var fileNameInput = result.props.children[1]

      expect(result.type).toBe('div');

      expect(fileInput.type).toBe('input');
      expect(fileInput.props.type).toBe('file');
      expect(fileInput.props.multiple).toBe(false);
      expect(fileInput.props.accept).toBe('.snap, .click');
      expect(fileInput.props.className).toBe('b-uploader__file-input');

      });

    it('should render out progress and file name', function() {
      var result = renderer.getRenderOutput();
      // XXX test output gets hard to read when using JSX for larger
      // components, but for small stuff it's OK
      expect(result.props.children[1]).toEqual(
        <div className="b-uploader__filename">foo</div>
      );

      expect(result.props.children[2]).toEqual(
        <div>{42}</div>
      );
    });
  });

  describe('event handlers', function() {
    var input;

    beforeEach(function() {
      spyOn(FileInput.prototype.__reactAutoBindMap, 'handleClick').and.callThrough();
      spyOn(FileInput.prototype.__reactAutoBindMap, 'handleChange').and.callThrough();
      // doesn't actually renderIntoDocument
      // https://github.com/facebook/react/blob/87bcbff/src/test/ReactTestUtils.js#L50-L58
      input = TestUtils.renderIntoDocument(
        <FileInput
          uploadUrl="/upload"
        />
      );
      spyOn(input.refs.fileInput, 'click');
    });

    it('should handle click event on parent', function() {
      var node = ReactDOM.findDOMNode(input);

      var stopPropagationSpy = jasmine.createSpy('stopPropagation');

      TestUtils.Simulate.click(node, {
        stopPropagation: stopPropagationSpy
      });

      expect(input.__reactAutoBindMap.handleClick).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(input.refs.fileInput.value).toBe('');
      expect(input.refs.fileInput.click).toHaveBeenCalled();
    });

    it('should return early on input change with empty file list', function() {
      var fakeEvent = {
        target: {
          files: []
        }
      };
      TestUtils.Simulate.change(input.refs.fileInput, fakeEvent);
      expect(input.__reactAutoBindMap.handleChange).toHaveBeenCalled();
      expect(input.handleChange(fakeEvent)).toBeFalsey;
    });

    it('should handle a file passed in the event and call the correct actions', function() {
      var fakeEvent = {
        target: {
          files: [{
            name: 'fake-filename'
          }]
        }
      };
      spyOn(Actions, 'setPackageName');
      spyOn(Actions, 'startUpload');
      expect(input.handleChange(fakeEvent)).toBeTruthy;
      expect(Actions.setPackageName).toHaveBeenCalledWith(
        fakeEvent.target.files[0].name
      );
      expect(Actions.startUpload).toHaveBeenCalledWith(
      '/upload',
      new FormData()
      );
    });

  });

});
