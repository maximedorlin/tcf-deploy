#!/bin/bash
## build app
cd /app
npm run build
## start app
pm2-runtime npm -- start
