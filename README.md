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

> npm install

> npm test

> npm start

### Run App by MODE

> NODE_ENV=development nodemon app

or

> NODE_ENV=production pm2 start app.js --name "core"


## APIs list

### No Access Token Required

#### Account

`POST` /api/account/create

**Send**

> localhost:3030/api/account/create

```json
{ email: test@gmail.com,password: password }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "email": "soomtong@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"gender": "", "location": "", "website": "", "picture": ""},
        "db_host": "db1.haroopress.com",
        "access_host": "sven-mac-pro",
        "access_token": "29478ae2-4c19-457e-aaac-74fef36d208e",
        "login_expire": "1422973044455",
        "tokens": []
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

**Receive - exist**

```json
{
    "message": "OK: already exist",
    "data": {
        "email": "soomtong@gmail.com",
        "password": "password",
        "accessHost": "sven-mac-pro",
        "accessIP": "localhost",
        "database": "db1.haroopress.com"
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "already exist"}
}
```

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




