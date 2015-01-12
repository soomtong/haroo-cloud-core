haroo-api
=========

haroo-api for haroo cloud service

- nodejs
- restify
- database bind
    - mongo : mongoose
    - couch : nano
    - mysql : sequelize

refer. `package.json` more.

## Usage

should to ready mongo, couch and mysql database

install modules

```shell
npm install

npm test

npm start
```

## APIs list

### Account

`POST` /account/create
`POST` /account/read
`POST` /account/forgot-password