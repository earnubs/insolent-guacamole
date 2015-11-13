 Start server:

'''node server.js'''

Build/watch js:

'''watchify -t [ babelify --presets [ es2015 react ] ] src/uploader.js -o public/js/bundle'''
