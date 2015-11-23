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

first example used haroo cloud core system. it use anonymous document api service of haroo cloud core
 
check out here!

> Public Text Hosting Service [txtree.xyz](https://txtree.xyz)

## APIs

check out `APIs.md` or open `/dev/doc` url in a browser.

### Documentation

move to slate directory

> rake build

and copy `build` directory to `/static/dev/doc`
