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

`POST` /api/account/create

`POST` /api/account/read

`POST` /api/account/forgot-password

### Access Token Required in Request Header with `X-Access-Token`

#### Common

`POST` /api/token/validate

`POST` /api/spec/version

#### User

`POST` /api/user/:haroo_id/info

`POST` /api/user/:haroo_id/change_password

`POST` /api/user/:haroo_id/update_info

`POST` /api/user/:haroo_id/logout

`POST` /api/user/:haroo_id/delete




