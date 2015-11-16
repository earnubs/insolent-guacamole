PATH  := node_modules/.bin:$(PATH)

SOURCE = src/uploader.js
TARGET = public/js/bundle.js
FLAGS = -t [ babelify --presets [ es2015 react ] ]

all: build

build:
	browserify $(FLAGS) $(SOURCE) -o $(TARGET)

watch:
	watchify $(FLAGS) $(SOURCE) -o $(TARGET)

server:
	npm start

test:
	npm test

.PHONY: build watch test server
