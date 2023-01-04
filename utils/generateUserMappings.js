const users = require('../data/users.json')
const fs = require('fs');

users.forEach(user => {
  const filename = `CommunityAPI_GetUser_${user.username}.json`
  const body = {
    "name": `community_api_get_user_${user.username}`,
    "request": {
      "url": `/secure/staff/username/${user.username}`,
      "method": "GET"
    },
    "response": {
      "status": 200,
      "jsonBody": {
        "username": user.username,
        "email": user.email,
        "telephoneNumber": "01512112121",
        "staffCode": "SH00007",
        "staffIdentifier": 17,
        "staff": {
            "forenames": user.name,
            "surname": ""
        },
        "probationArea": {
            "probationAreaId": 12,
            "code": "GCS",
            "description": "Gloucestershire",
            "organisation": {
                "code": "SW",
                "description": "South West"
            }
        },
        "staffGrade": {
            "code": "M",
            "description": "PO"
        }
      }
    }
  }
  fs.writeFileSync(`${__dirname}/../mappings/${filename}`, JSON.stringify(body, null, 2), { flag: 'w+' });
})
