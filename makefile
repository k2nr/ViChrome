.SUFFIXES: .coffee .js
.PHONY: all clean

COFFEE_CMD = coffee
COFFEE_DIR = ./coffee
COFFEE_FILES := $(wildcard $(COFFEE_DIR)/*.coffee)
GEN_JS = $(patsubst $(COFFEE_DIR)/%.coffee,%.js,$(COFFEE_FILES))

all: $(GEN_JS)

%.js: $(COFFEE_DIR)/%.coffee
	$(COFFEE_CMD) -o . -c $<

zip: all
	zip vichrome.zip *.js manifest.json *.html lib/* lib/dicts/* icons/* css/*

clean:
	rm -f ./*.js vichrome.zip
