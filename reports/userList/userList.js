"use strict"

// NEW ASYNC/AWAIT EXAMPLE
// execute via  `$ babel-node userList.js`

const MongoClient = require('mongodb').MongoClient;
const _ = require("underscore")
const delimiter = "\t";

async function getShareIds () {
  let type = ""
  let buildingId = ""
  let parentId = ""
  let zips = []
  let shareIds = ["00000A"]

  let promises = []

  if (type) {
    promises.push(addIds (shareIds, {type: type}))
  }
  if (parentId) {
    promises.push(addIds (shareIds, {parent: parentId}))
  }
  if (buildingId) {
    promises.push(addIds (shareIds, {building: buildingId}))
  }
  if (zips && zips.length > 0) {
    promises.push(addIds (shareIds, {zip: {$in: zips}}))
  }

  await Promise.all(promises)
  return shareIds
}

main()

async function main () {
  let db
  let options = { }

  try {
    db = await MongoClient.connect(process.env.MONGODB_URL, options)

    printHeader()

    const shareIds = await getShareIds()

    let query = {'networks': {$in: shareIds}}

    try {
      const users = db.collection('users')
      await listUsers(users, query)
    }
    catch (ex) {
      console.log("ERROR: Connecting to collection", ex.message)
      throw ex
    }
  }
  catch (ex) {
    console.log("ERROR: Connecting to remote db", ex.message)
    throw ex
  }
  finally {
    db.close()
  }
}

async function listUsers (users, query) {
  let fields,
      cursor;

  query = query || {}
  fields = {"createdAt":1, "emails.address":1, "networks":1, "profile":1}

  cursor = users.find(query, fields).sort({createdAt:-1})

  const list = await cursor.toArray()
  list.forEach(function (record) {
    printRecord(record)
  })
}

function printHeader () {
  let parts = [ "Created Date",
                "Emails",
                "EmployeeID",
                "ManagerIDs",
                "Firstname",
                "Lastname",
                "Title",
                "Shift",
                "Mobile",
                "ShareIDs"]

  console.log(parts.join(delimiter))
}

function printRecord (user) {
  let parts,
      profile = user.profile || {},
      managerIds = profile.managerIds || [],
      channels = user.networks || []

  parts = [
    formatDate(user.createdAt),
    _.pluck(user.emails, "address").join(','),
    profile.employeeId,
    managerIds.join(','),
    profile.firstname,
    profile.lastname,
    profile.title,
    profile.shift,
    profile.mobile,
    channels.join(',')
  ]

  console.log(parts.join(delimiter))
}

async function addIds (destList, query) {
  const fields = {code: 1, _id: 0}
  const list = await db.networks.find(query, fields).toArray()

  list.forEach(function (channel) {
    if (!_contains(destList, channel.code)) {
      destList.push(channel.code)
    }
  })
}

function formatDate (date) {
  var d = new Date(date),
      month = (d.getMonth() + 1).toString(),
      day = (d.getDate()).toString()

  if (month.length === 1) {
    month = "0" + month
  }
  if (day.length === 1) {
    day = "0" + day
  }

  return d.getFullYear() + '-' + month + '-' + day
}
