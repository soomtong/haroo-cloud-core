---

title: API Reference

language_tabs:

toc_footers:
  - <a href='//haroocloud.com/dev/signup'>Sign Up for a Developer Key</a>
  - <a href='//github.com/tripit/slate'>Documentation Powered by Slate</a>

search: true

---

# Introduction

Welcome to the Haroo Cloud API!



# Anonymous Document

## Create Document

```shell
curl 'localhost:3030/api/tree/doc'
  -d '{ "title": "title of our secret story", "text": "text of content" }'
```

> The above command returns JSON structured like this:

```json
{
    "message": "OK: done",
    "data": {
            "url": "localhost:3030/api/tree/doc/55aba11a13693fc1e166eba9"
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

Make a public document by anonymous

Use simple rest call for make new document.
call http POST method and send data in a body. no need auth or tokens.
but a little district exist here.

- throttle for huge call simultaneously in same IP
  - 5 (number of requests/second to allow)
  - 1000  (amount of requests)

### HTTP Request

`POST https://haroocloud.com/api/tree/doc`

### Header

None

### Content

Parameter | Require | Default   | Description
--------- | ------- | --------- | -----------
title     | false   | null      |
text      | true    |           |
type      | false   | text      | normal text or language type for code highlight (todo: javascript/monokai)
author    | false   | anonymous |



## Read Document

```shell
curl 'localhost:3030/api/tree/doc/55aba11a13693fc1e166eba9'
(todo)
curl 'localhost:3030/api/tree/doc/55aba11a13693fc1e166eba9?output=clojure'
curl 'localhost:3030/api/tree/doc/55aba11a13693fc1e166eba9?output=clojure/monokai'
```

> The above command returns JSON structured like this:

```json
{
    "message": "OK: done",
    "data": {
        "__v": 0,
        "title": "test title",
        "text": "test content with title and author",
        "author": "anonymous_101",
        "view_count": 0,
        "commend_count": 0,
        "alert_count": 0,
        "created_at": "2015-07-19T10:17:47.730Z",
        "_id": "55ab794b4368269fdf9de925"
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

Read a anonymous document by document id

call http GET method with url. same throttle exist.

### HTTP Request

`GET https://haroocloud.com/api/tree/doc/:document_id`

### Header

None

### Resource

Parameter   | Require | Default   | Description
----------- | ------- | --------- | -----------
document_id | true    |           |

### Query

Parameter | Require | Default   | Description
--------- | ------- | --------- | -----------
output    | false   |           | code highlight style and color theme

`output` query used like this

- javascript : code highlight
- solarize : theme name
- javascript/monokai : (combination)



## Document List

```shell
curl 'localhost:3030/api/tree/list'
curl 'localhost:3030/api/tree/list?order=newest'
curl 'localhost:3030/api/tree/list?order=hottest'
```

> The above command returns JSON structured like this:

```json
{
    "message": "OK: done",
    "data": {
        "list": [ "... list of documents ..." ],
        "page": 1,
        "size": 10
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

get list of documents by sent page, size with order flags

### HTTP Request

`GET https://haroocloud.com/api/tree/list`

### Header

None

### Query

Parameter | Require | Default   | Description
--------- | ------- | --------- | -----------
order     | false   | newest    |
p         | false   | 0         |
s         | false   | 10        |

`order` query used like this

- newest : sort by created_at
- oldest : sort by created_at invert
- hottest : sort by view_count
- coldest : sort by view_count invert
- commend : sort by commend_count
- claim : sort by claim_count



## Get Document Stat

```shell
curl 'localhost:3030/api/tree/stat/55aba11a13693fc1e166eba9'
```

> The above command returns JSON structured like this:

```json
{
    "message": "OK: done",
    "data": {
        (todo)
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

Read stats of document by document id

call http GET method with url. same throttle exist.

(todo)

### HTTP Request

`GET https://haroocloud.com/api/tree/stat/:document_id`

### Header

None

### Resource

Parameter   | Require | Default   | Description
----------- | ------- | --------- | -----------
document_id | true    |           |



## Feedback Document






# Account

## Create Account

```shell
curl 'localhost:3030/api/account/create'
  -d '{ "email": "test@gmail.com", "password": "password" }'
```

> Make new account for haroo cloud core. Returns below

```json
{
    "message": "OK: done",
    "data": {
        "access_token": "e8e58304-dd29-4c03-8791-673e96a7f34e",
        "db_host": "localhost:5984",
        "email": "test@email.net",
        "haroo_id": "ko5d146ee4ac3f5274a6ce3e3467915482",
        "login_expire": "1422208905667",
        "profile": {
            "gender": "",
            "location": "",
            "picture": "",
            "website": ""
        }, "tokens": []
    },
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "done"}
}
```

> already account exist

```json
{
    "message": "Precondition Failed: already exist",
    "data": {
        "email": "test@email.net",
        "password": "password",
        "accessHost": "sven-mac-pro",
        "accessIP": "localhost"
    },
    "isResult": true,
    "statusCode": 412,
    "meta": {"error": "Precondition Failed", "message": "already exist"}
}
```

Make new user account

Use simple rest call for make new account.
call http POST method and send data in a body. no need auth or token in this process
this API returns new access token. use this token for next access

### HTTP Request

`POST https://haroocloud.com/api/account/create`

### Header

None

### Content

Parameter | Require | Default   | Description
--------- | ------- | --------- | -----------
email     | true    | null      |
password  | true    |           |
nickname  | false   |           |
client_id | false   |           | sign in device



## Sign in Account

```shell
curl 'localhost:3030/api/account/login'
  -d '{ "email": "test@gmail.com", "password": "password" }'
```

> Sign in process

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

> Wrong account information

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

Sign in user account

process login. and get new access token

### HTTP Request

`POST https://haroocloud.com/api/account/forgot-password`

### Header

None

### Content

Parameter | Require | Default   | Description
--------- | ------- | --------- | -----------
email     | true    |           |
password  | true    |           |




## User Information

```shell
curl 'localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/info'
  -H '{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }'
```

> get user information

```json
{
    "message": "OK: done",
    "data": {
        "email": "test@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "", "gender": "", "location": "", "website": "", "picture": ""},
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

> get invalid user account

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
## Change Password

### 2. `POST` /api/user/:haroo_id/change_password

```shell
curl 'localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/change_password'
  -d '{ "email": "test@gmail.com", "password": "password" }'
  -H '{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }'
```

> Password changed

```json
{
    "message": "OK: done",
    "data": {
        "email": "test@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "", "gender": "", "location": "", "website": "", "picture": ""},
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

## Update User Information

```shell
curl 'localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/update_info'
  -d '{ "email": "test@gmail.com", "nickname": "screenName" }'
  -H '{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }'
```

> Receive updated user information

```json
{
    "message": "OK: done",
    "data": {
        "email": "test@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "screenName", "gender": "", "location": "", "website": "", "picture": ""},
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

## Logout Account

```shell
curl 'localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/logout'
  -d '{ "email": "test@gmail.com" }'
  -H '{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }'
```

> logout user account and expire access token

```json
{
    "message": "OK: done",
    "data": {
        "email": "test@gmail.com",
        "haroo_id": "b4c4ae0692b435427b671649ea30848e7",
        "profile": {"nickname": "screenName", "gender": "", "location": "", "website": "", "picture": ""},
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

## Delete Account

```shell
curl 'localhost:3030/api/user/b4c4ae0692b435427b671649ea30848e7/delete'
  -d '{ "email": "test@gmail.com", "password": "password" }'
  -H '{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }'
```

> delete account

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



# Access Token

## Validate

```shell
curl 'localhost:3030/api/token/validate'
  -H '{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }'
```

> return valid token validation

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

> return invalid token validation

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

> re-new access token more

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

> expire access token

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

Validate or manipulate token information

### HTTP Request

`POST https://localhost:3030/api/token/validate`

### Header

"X-Access-Token" for access token and "X-Access-Host"

### Content

Parameter | Require | Default   | Description
--------- | ------- | --------- | -----------
keep      | false   | 1         | token expire or keep more



# Common

## API version

```shell
curl 'localhost:3030/api/spec/version'
  -H '{ "X-Access-Token": "dcbba695-fd91-45f0-987e-1311d8b4b6ca", "X-Access-Host": "sven-mac-pro" }'
```

> check API version

```json
{
    "message": "OK: api version",
    "data": {"ver": "0.0.1", "released": "2015-02-28T15:00:00.000Z"},
    "isResult": true,
    "statusCode": 200,
    "meta": {"error": "OK", "message": "api version"}
}
```



# Document
