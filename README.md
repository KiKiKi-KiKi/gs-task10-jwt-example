# JWT API server

use: Docker + Exporess + mongoDB + Redis 

```
/
|- docker-compose.yml
|-/api (express server)
|   |- Dockerfile
|-/redis
|   |-/data ... redis data
|-/mongodb
|   |-/data ... mongodb data
|   |- Dockerfile
|   |- createUser.js ... create database user
|-/frontend (not on the docker)
```

## setup backend

install server package

```sh
$ cd api
$ npm install
```

### start API server

```sh
$ docker-compose build
$ docker-compose up
```

start api server `localhost:3000`

## setup frontend

```sh
$ cd frontend
$ yarn install
```

### start frontend dev-server

```sh
$ yarn start
```


---



## API

USE: [POSTMAN](https://www.postman.com/)

#### Signup

POST:  `localhost:3000/api/users/register`
request.body

```
{
  name: String,
  email: String (email),
  password: String
}
```

return

```
{
  user: user id,
  name: user name,
  token: token (access token),
  refreshToken: refresh token,
}
```



#### Login

POST: `localhost:3000/api/users/login`

request.body

```
{
  email, 
  password
}
```

return

```
{
  user: user id,
  name: user name,
  token: token (access token),
  refreshToken: refresh token,
}
```



### Re Login (remember login)

POST: `localhost:3000/api/users/relogin`

Header

```
auth-token: token (optional)
autu-refresh-token: refresh token
```

return

```
{
  user: user id,
  name: user name,
  token: access token,
  refreshToken: refresh token,
}
```



#### Logout

POST: `localhost:3000/api/users/logout`

Header

```
auth-token: token (optional)
autu-refresh-token: refresh token
```

Delete token by refresh token



#### Logout All devices

POST: `localhost:3000/api/users/logout-all`

Header
```
auth-token: token (optional)
autu-refresh-token: refresh token
```

Get user id by refresh token & delete all users token.



#### TEST API

GET: `localhost:3000/api/post`

Header

```
auth-token: token
autu-refresh-token: refresh token
```

return (token is valid)

```
{
  user: user id,
}
```

return (token is expired. refresh token is valid)

```
{
  user: user id,
  token: access token,
  refreshToken: refresh token,
}
```



---



### Redis

```
- db0 ... token: user ID
- db2 ... user ID: { refresh token: token, ... }
```

#### Create Token

save to db0

- token: userID expire TOKEN_EXPIRE_TIME
  `set token userID`
  `expire token TOKEN_EXPIRE_TIME `
- refreshToken: userID expire REFRESH_TOKEN_EXPIRE_TIME
  `set refreshToken`
  `expire refreshToken REFRESH_TOKEN_EXPIRE_TIME`

save to db0

- userID: {refreshToken: token} expire REFRESH_TOKEN_EXPIRE_TIME
  `hset userID refreshToken token`
  `expire userID REFRESH_TOKEN_EXPIRE_TIME`



#### Delete Token by Refresh Token 

logout, refresh token

1. get userID from db0
   `get refreshToken` => userID
2. get token from db1
   `hget userID refreshToken` => token
3. delete tokens from db0
   `del token refreshToken`
4. delete key value from db1
   `hdel userID refreshToken`



#### Delete All Tokens by Refresh Token

logout all devices

1. get userID from db0
   `get refreshToken` => userID
2. get users token list from db1
   `hgetall userID` => [refreshToken, token, ...]
3. delete tokens from db0
   `del refreshToken token ...`
4. delete item from db1
   `del userID`

