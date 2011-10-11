#!/bin/bash

rm vichrome.zip
coffee/build.sh
zip vichrome.zip *.js manifest.json *.html lib/* icons/* css/*

