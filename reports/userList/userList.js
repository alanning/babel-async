// Usage: mongo --quiet <dbname> userList.js
//

"use strict"

// prints users, sorted by create date
// ex.
//   Smith, John, jsmith@example.com, Demo School, 00000A
//
var delimiter = '\t',
    type = "school",
    buildingId = "",
    parentId = "",
    zips = [],
    shareIds = [ ],
    cursor;


if (type) {
  addIds (shareIds, {type: type})
}

if (parentId) {
  addIds (shareIds, {parent: parentId})
}

if (buildingId) {
  addIds (shareIds, {building: buildingId})
}

if (zips && zips.length > 0) {
  addIds (shareIds, {zip: {$in: zips}})
}

printHeader ()

printUsers (shareIds);




function printHeader () {
  var parts = [ "Created Date",
                "Emails",
                "EmployeeID",
                "ManagerIDs",
                "Firstname",
                "Lastname",
                "Title",
                "Shift",
                "Mobile",
                "ShareIDs"]

  print(parts.join(delimiter))
}

function printUsers (shareIds) {
  var query,
      fields,
      cursor

  shareIds = shareIds || []
  
  query = {'networks': {$in: shareIds}}

  fields = {"createdAt":1,
            "emails.address":1,
            "networks":1,
            "profile":1}

  cursor = db.users.find(query, fields).sort({"createdAt":-1})
  cursor.forEach(function (user) {
    printRecord(user)
  })
}

function printRecord (user) {
  var parts,
      profile = user.profile || {},
      managerIds = profile.managerIds || [],
      channels = user.networks || []

  parts = [
    formatDate(user.createdAt),
    _pluck(user.emails, "address").join(','),
    profile.employeeId,
    managerIds.join(','),
    profile.firstname,
    profile.lastname,
    profile.title,
    profile.shift,
    profile.mobile,
    channels.join(',')
  ]

  print(parts.join(delimiter))
}



//////////////////////////////////////////////////////////////////////
// helpers
//

function addIds (destList, query) {
  var cursor
  cursor = db.networks.find(query, {code: 1, _id: 0})
  cursor.forEach(function (channel) {
    if (!_contains(destList, channel.code)) {
      destList.push(channel.code)
    }
  })
}

function _contains (haystack, needle) {
  if (!haystack) {
    return false
  }
  return -1 !== haystack.indexOf(needle)
}

function _pluck (arr, field) {
  var result = []

  for (var i = 0, len = arr.length; i < len; i++) {
    result.push(arr[i][field])
  }

  return result
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
