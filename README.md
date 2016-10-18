# babel-async

An example of using async/await via babel-node

Final version of script to print users.

## Steps

### First install babel dependencies:

```
$ npm install -g babel-cli
$ cd ~/tmp
$ git clone https://github.com/alanning/babel-async.git
$ cd babel-async
$ npm install
```

### Then install script dependencies:

```
$ cd reports/userList
$ npm install
```


### Execute script against local database:

```
$ MONGODB_URL=mongodb://localhost:27017/test babel-node userList.js
```


