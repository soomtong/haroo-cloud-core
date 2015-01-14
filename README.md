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

### No Access Token Required

#### Account

`POST` /account/create

`POST` /account/read

`POST` /account/forgot-password

### Access Token Required in Request Header with `X-Access-Token`

#### Common

`POST` /token/validate

`POST` /spec/version

#### User

`POST` /user/:haroo_id/info

`POST` /user/:haroo_id/change_password

`POST` /user/:haroo_id/update_info

`POST` /user/:haroo_id/logout

`POST` /user/:haroo_id/delete




