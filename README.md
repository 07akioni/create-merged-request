# create-merged-request · [![npm version](https://badge.fury.io/js/create-merged-request.svg)](https://badge.fury.io/js/create-merged-request)

Merge scattered requests into one, distribute corresponding result to requestor.

## Install

```bash
npm i create-merged-request rxjs # Please note that rxjs is peer dependency of it
```

## Usage

For example if you have tons of user query in different components and you want
to combine theme into one.

```ts
import { createMergedRequest } from 'create-merged-request'

// `string` is user id
// `User[]` is the response data type that `createRequest` resolves
// `User` is the data type that `createResponse` returns
const mergedRequest = createMergedRequest<string, User[], User>({
  thresholdMs: 0, // time threshold to merged request into one request
  createRequest(ids) {
    return fetchUsers(ids) // type: (ids: string[]) => Promise<User[]>
  },
  createResponse(id, users) {
    return users.find((user) => user.id === id)! // type: User
  }
})

// `fetchUsers` will be called only once
mergedRequest(userId1).then((user) => console.log(user))
mergedRequest(userId2).then((user) => console.log(user))
mergedRequest(userId3).then((user) => console.log(user))
```
