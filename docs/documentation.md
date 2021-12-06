# API Documentation

## Board API

### board-notice

- GET /api/v1/board/notice

<table>
<tr><th colspan="2" rowspan="1">허용 타입</th><td colspan="3">application/json</td></tr>
<tr><th>parameter</th><th>type</th><th>description</th><th>default</th><th>optional</th>
<tr><td>page</td><td>Number</td><td>페이지 번호</td><td>1</td><td>✅</td></tr>
<tr><td>pageSize</td><td>Number</td><td>1 페이지 당 크기</td><td>15</td><td>✅</td></tr>
</table>


```js
// request
{ "url": "/api/v1/board/notice", "data": {} }
// response
{
   "_meta": { "page": { "current": 1, "last": 1 } },
   "notices": [
      { "id": 5, "title": "게시글 테스트입니다.", "createdAt": "2021-11-22T04:48:49.000Z", "hit": 6 },
      { "id": 4, "title": "제목을 입력하세요.", "createdAt": "2021-11-22T02:26:16.000Z", "hit": 3 },
      { "id": 3, "title": "제목을 입력하세요.", "createdAt": "2021-11-22T02:26:15.000Z", "hit": 7 },
      { "id": 2, "title": "제목을 입력하세요.", "createdAt": "2021-11-22T02:26:15.000Z", "hit": 1 },
      { "id": 1, "title": "팜플래닛이 오픈했습니다", "createdAt": "2021-11-21T10:35:58.000Z", "hit": 25 }
   ]
}
```

- GET /api/v1/board/notice/:noticeID

<table>
<tr><th colspan="2" rowspan="1">허용 타입</th><td colspan="3">application/json</td></tr>
<tr><th>parameter</th><th>type</th><th>description</th><th>default</th><th>optional</th>
<tr><td>:noticeID</td><td>String</td><td>페이지 번호</td><td>❌</td><td>❌</td></tr>
</table>


```js
// request
{ "url": "/api/v1/board/notice/1", "data": {} }
// response
{
   "title": "팜플래닛이 오픈했습니다",
   "content": "본문을 입력하세요.",
   "createdAt": "2021-11-21T10:35:58.000Z",
   "hit": 25
}
```

## User API

### user-me

- GET /api/v1/user/me

<table>
<tr><th colspan="2" rowspan="1">허용 타입</th><td colspan="3">application/json</td></tr>
<tr><th>parameter</th><th>type</th><th>description</th><th>default</th><th>optional</th>
</table>


```js
// request
{ "url": "/api/v1/user/me", "data": {} }
// response
{
   "id": 5,
   "name": "temp",
   "date": "2021-11-29T06:54:51.000Z",
   "profileImg": null,
   "farm": {
      "subscribeId": 1,
      "name": "진수는 돈이 많수",
      "yard": 350,
      "imageUrl": "img/farm/3951abafa8b54c6db010dcc7a057a480.png",
      "address": "압구정 4번출구 날 기다리는 그녀 이름 경은이",
      "locationX": 37.3595,
      "locationY": 127.105,
      "plants": [ { "id": 1, "plantId": 1, "name": "고구마" }, { "id": 3, "plantId": 2, "name": "사과" } ]
   }
}
```

## Subscribe API

### subscribe

- POST /api/v1/subscribe

<table>
<tr><th colspan="2" rowspan="1">허용 타입</th><td colspan="3">application/json</td></tr>
<tr><th>parameter</th><th>type</th><th>description</th><th>default</th><th>optional</th>
<tr><td>farmId</td><td>Number</td><td>밭 번호</td><td>❌</td><td>❌</td></tr>
</table>


```js
// request
{ "url": "/api/v1/subscribe", "data": { "farmId": 2 } }
// response
{ "subscribeId": 2, "complete": true }
```

### subscribe-plant

- POST /api/v1/subscribe/plant

<table>
<tr><th colspan="2" rowspan="1">허용 타입</th><td colspan="3">application/json</td></tr>
<tr><th>parameter</th><th>type</th><th>description</th><th>default</th><th>optional</th>
<tr><td>plantId</td><td>Number</td><td>작물 번호</td><td>❌</td><td>❌</td></tr>
</table>


```js
// request
{ "url": "/api/v1/subscribe/plant", "data": { "plantId": 1 } }
// response
{ "subscribePlantId": 4, "complete": true }
```

## Sign API

### sign-up

- POST /api/v1/sign/up

<table>
<tr><th colspan="2" rowspan="1">허용 타입</th><td colspan="3">application/json</td></tr>
<tr><th>parameter</th><th>type</th><th>description</th><th>default</th><th>optional</th>
<tr><td>id</td><td>String</td><td>가입자 ID</td><td>❌</td><td>❌</td></tr>
<tr><td>password</td><td>String</td><td>가입자 비밀번호</td><td>❌</td><td>❌</td></tr>
<tr><td>name</td><td>String</td><td>가입자 이름</td><td>❌</td><td>❌</td></tr>
</table>


```js
// request
{ "url": "/api/v1/sign/up", "data": { "name": "ky", "id": "alice1234", "password": "12345678" } }
// response
{ "id": 9, "complete": true }
```

### sign

- POST /api/v1/sign

<table>
<tr><th colspan="2" rowspan="1">허용 타입</th><td colspan="3">application/json</td></tr>
<tr><th>parameter</th><th>type</th><th>description</th><th>default</th><th>optional</th>
<tr><td>id</td><td>String</td><td>가입자 ID</td><td>❌</td><td>❌</td></tr>
<tr><td>password</td><td>String</td><td>가입자 비밀번호</td><td>❌</td><td>❌</td></tr>
</table>


```js
// request
{ "url": "/api/v1/sign", "data": { "id": "alice1234", "password": "12345678" } }
// response
{ "id": 9, "complete": true }
```

- GET /api/v1/sign

<table>
<tr><th colspan="2" rowspan="1">허용 타입</th><td colspan="3">application/json</td></tr>
<tr><th>parameter</th><th>type</th><th>description</th><th>default</th><th>optional</th>
</table>


```js
// request
{ "url": "/api/v1/sign", "data": {} }
// response
{ "userID": 9 }
```

- DELETE /api/v1/sign

<table>
<tr><th colspan="2" rowspan="1">허용 타입</th><td colspan="3">application/json</td></tr>
<tr><th>parameter</th><th>type</th><th>description</th><th>default</th><th>optional</th>
</table>


```js
// request
{ "url": "/api/v1/sign", "data": {} }
// response
{ "complete": true }
```
