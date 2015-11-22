PATH  := node_modules/.bin:$(PATH)

SOURCE = src/app.js
TARGET = public/js/bundle.js
FLAGS = -t babelify
UPLOADS = uploads/*

all: build

build:
	browserify $(FLAGS) $(SOURCE) -o $(TARGET)

watch:
	watchify $(FLAGS) $(SOURCE) -o $(TARGET)

server:
	npm start

test:
	npm test

clean:
	rm $(UPLOADS)

.PHONY: build watch test server clean
