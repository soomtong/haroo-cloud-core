haroo-cloud
===========

the document hosting service, haroo cloud

- nodejs (prefer nginx proxy)
- restify framework
- database bind
    - mongo : mongoose

refer. `package.json` more.

## Usage

prepare mongo database running

install modules

> npm install

> npm postinstall

> npm test

### Run App by MODE

> NODE_ENV=development nodemon app

or

> NODE_ENV=production pm2 start app.js --name "haroocloud"

### Public Document Storage Service

open `/tree/index.html` in a browser or bind `/tree` url to `your-public-service.com` and map proxy in nginx or your proxy server.
 
example here!

> Public Text Hosting Service [txtree.net](https://txtree.net)

## APIs

check out `APIs.md` or open `/dev/doc` url in a browser.