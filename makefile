.SUFFIXES:.coffee .js

COFFEE = coffee
COFFEE_DIR = ./coffee
COFFEE_FILES = $(COFFEE_DIR)/*.coffee

all:
	$(COFFEE) -o . -c $(COFFEE_FILES)

.coffee.js:
	$(COFFEE) -o . -c $<

vichrome.zip: all
	zip $@ *.js manifest.json *.html lib/* lib/dicts/* icons/* css/*

clean:
	rm -f ./*.js vichrome.zip
