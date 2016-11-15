#!/bin/sh

PM2="./node_modules/.bin/pm2"
$PM2 -n applog start index.js --watch --ignore-watch ./node_modules
