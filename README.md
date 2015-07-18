haroo-api
=========

haroo-api for haroo cloud service

- nodejs (prefer nginx proxy)
- restify framework
- database bind
    - mongo : mongoose

refer. `package.json` more.

## Usage

should to ready mongo database

install modules

> npm install

> npm test

> npm start

### Run App by MODE

> NODE_ENV=development nodemon app

or

> NODE_ENV=production pm2 start app.js --name "core"

### Public Document Storage Service

bind `/public` url to `your-public-service.com` and map proxy in nginx or your proxy server.
 
example here!

> Public Text Hosting Service [txtree.net](https://txtree.net)

## APIs

check out `APIs.md` or open `/api` url in a browser.