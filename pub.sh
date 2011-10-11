#!/bin/bash

rm vichrome.zip
coffee -o . -c coffee/*.coffee
zip vichrome.zip *.js manifest.json *.html lib/* icons/* css/*

