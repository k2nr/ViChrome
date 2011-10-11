#!/bin/bash

rm vichrome.zip
cd coffee
build.sh
cd ..
zip vichrome.zip *.js manifest.json *.html lib/* icons/* css/*

