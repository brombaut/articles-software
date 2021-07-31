#!/bin/bash

/usr/local/bin/node \
  syncer/build/index.js \
  ./src_html \
  /Users/BenRombaut/dev/benrombaut.ca/src/software \
  software_articles_meta.json \
  software_articles_content.json;