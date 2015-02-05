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

##### 1. `POST` /api/account/create

**Send**

> localhost:3030/api/account/create

```json
{ "email": "test@gmail.com", "password": "password" }
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

##### 2. `POST` /api/account/login

**Send**

> localhost:3030/api/account/login

```json
{ "email": "test@gmail.com", "password": "password" }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "email": "soomtong@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "", "gender": "", "location": "", "website": "", "picture": ""},
        "db_host": "db1.haroopress.com",
        "access_host": "sven-mac-pro",
        "access_token": "621d08ca-1b2c-4e8b-b543-89e85e88fbf2",
        "login_expire": "1422973462420",
        "tokens": []
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

**Receive - invalid**

```json
{
    "message": "Unauthorized: none exist",
    "data": {
        "email": "test@gmail.com",
        "password": "wrong-password",
        "accessHost": "sven-mac-pro",
        "accessIP": "localhost"
    },
    "isResult": true,
    "statusCode": 401,
    "meta": {"error": "Unauthorized", "message": "none exist"}
}
```

##### 3. `POST` /api/account/forgot-password

**Send**

> localhost:3030/api/account/forgot_password

```json
{ "email": "test@gmail.com" }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "email": "test@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "", "gender": "", "location": "", "website": "", "picture": ""},
        "db_host": "db1.haroopress.com",
        "tokens": []
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

**Receive - invalid**

```json
{
    "message": "OK: can't find information",
    "data": {
        "email": "wrong-id@gmail.com",
        "accessIP": "localhost"
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "can't find information"}
}
```

### Access Token Required in Request Header with `X-Access-Token`

#### Common

##### 1. `POST` /api/token/validate

**Send**

> localhost:3030/api/token/validate

```json
{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "accessToken": "dcbba695-fd91-45f0-987e-1311d8b4b6ca",
        "accessHost": "sven-mac-pro",
        "accessIP": "localhost"
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

**Receive - invalid**

```json
{
    "message": "Bad Request: access deny",
    "data": {
        "accessToken": "wrong-dcbba695-fd91-45f0-987e-1311d8b4b6ca",
        "accessHost": "sven-mac-pro",
        "accessIP": "localhost"
    },
    "isResult": true,
    "statusCode": 400,
    "meta": {"error": "Bad Request", "message": "access deny"}
}
```

**Send**

> localhost:3030/api/token/validate

```json
{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }
{ "keep": "1" }
```

**Receive - done**

```json
{
    "message": "OK: kept one more",
    "data": {
        "keepToken": "1",
        "accessToken": "dcbba695-fd91-45f0-987e-1311d8b4b6ca",
        "accessHost": "sven-mac-pro",
        "accessIP": "localhost"
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "kept one more"}
}
```

**Send**

> localhost:3030/api/token/validate

```json
{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }
{ "keep": "0" }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "keepToken": "0",
        "accessToken": "0d82f030-8cc1-4c42-a3cf-1938faf40b5b",
        "accessHost": "sven-mac-pro",
        "accessIP": "localhost"
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

##### 2. `POST` /api/spec/version

**Send**

> localhost:3030/api/spec/version

```json
{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }
```

**Receive - done**

```json
{
    "message": "OK: api version",
    "data": {"ver": "0.0.1", "released": "2015-02-28T15:00:00.000Z"},
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "api version"}
}
```

#### User

##### 1. `POST` /api/user/:haroo_id/info

**Send**

> localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/info

```json
{ "X-Access-Token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e", "X-Access-Host": "sven-mac-pro" }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "email": "test@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "", "gender": "", "location": "", "website": "", "picture": ""},
        "db_host": "db1.haroopress.com",
        "access_host": "sven-mac-pro",
        "access_token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e",
        "login_expire": "1422975245862",
        "tokens": []
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

**Receive - invalid**

```json
{
    "message": "Bad Request: access deny",
    "data": {
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "accessToken": "976ca623-349b-4a3f-91ee-0e3933cca3fd",
        "accessHost": "sven-mac-pro",
        "accessIP": "localhost"
    },
    "isResult": true,
    "statusCode": 400,
    "meta": {"error": "Bad Request", "message": "access deny"}
}
```

##### 2. `POST` /api/user/:haroo_id/change_password

**Send**

> localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/change_password

```json
{ "X-Access-Token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e", "X-Access-Host": "sven-mac-pro" }
{ "email": "test@gmail.com", "password": "password" }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "email": "test@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "", "gender": "", "location": "", "website": "", "picture": ""},
        "db_host": "db1.haroopress.com",
        "access_host": "sven-mac-pro",
        "access_token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e",
        "login_expire": "1422975245862",
        "tokens": []
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

##### 3. `POST` /api/user/:haroo_id/update_info

**Send**

> localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/update_info

```json
{ "X-Access-Token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e", "X-Access-Host": "sven-mac-pro" }
{ "email": "test@gmail.com", "nickname": "screenName" }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "email": "test@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "screenName", "gender": "", "location": "", "website": "", "picture": ""},
        "db_host": "db1.haroopress.com",
        "access_host": "sven-mac-pro",
        "access_token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e",
        "login_expire": "1422975245862",
        "tokens": []
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

##### 4. `POST` /api/user/:haroo_id/logout

**Send**

> localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/logout

```json
{ "X-Access-Token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e", "X-Access-Host": "sven-mac-pro" }
{ "email": "test@gmail.com" }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "email": "test@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "screenName", "gender": "", "location": "", "website": "", "picture": ""},
        "db_host": "db1.haroopress.com",
        "access_host": "sven-mac-pro",
        "access_token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e",
        "login_expire": "1422975245862",
        "tokens": []
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

##### 5. `POST` /api/user/:haroo_id/delete

**Send**

> localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/delete

```json
{ "X-Access-Token": "ac4ca287-55d9-4aa1-837b-f3cb85f27278", "X-Access-Host": "sven-mac-pro" }
{ "email": "test@gmail.com", "password": "password" }
```

**Receive - done**

```json
{
    "message": "OK: done",
    "data": {
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "email": "test@gmail.com",
        "password": "password",
        "clientToken": {
            "_id": "54bd1da48e1b0eeb0ee4c400",
            "access_ip": "localhost",
            "access_host": "sven-mac-pro",
            "access_token": "ac4ca287-55d9-4aa1-837b-f3cb85f27278",
            "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
            "login_expire": "1422976036114",
            "created_at": "2015-01-19T15:07:16.114Z",
            "__v": 0
        },
        "accessHost": "sven-mac-pro",
        "accessIP": "localhost"
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

#### Document

##### 1. `GET` /api/document/:haroo_id

**Send**

> localhost:3030/api/documents/b4c4ae0692b435427b671649ea30848e7

```json
{ "X-Access-Token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e", "X-Access-Host": "sven-mac-pro" }
```

**Receive - done**

```json
{
    // to do
}
```

##### 2. `GET` /api/document/:haroo_id/:document_id

**Send**

> localhost:3030/api/documents/b4c4ae0692b435427b671649ea30848e7/1A99E3B9-B6DE-7D2B-B394-0A47E4FD9419

```json
{ "X-Access-Token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e", "X-Access-Host": "sven-mac-pro" }
```

**Receive - done**

```json
{
    // to do
}
```

##### 3. `GET` /api/document/:haroo_id/:document_id/public

**Send**

> localhost:3030/api/document/b4c4ae0692b435427b671649ea30848e7/1A99E3B9-B6DE-7D2B-B394-0A47E4FD9419/public

```json
{ "X-Access-Token": "8091cc47-ca6e-451e-b91a-b7797aa8a94e", "X-Access-Host": "sven-mac-pro" }
```

**Receive - done**

```json
{
    // not yet
}
```
