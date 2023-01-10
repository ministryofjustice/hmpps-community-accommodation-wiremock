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
        },
        "teams": [{
            "code": "TEAM1",
            "description": "A Team",
            "telephone": null,
            "emailAddress": null,
            "localDeliveryUnit": {
                "code": "LDU",
                "description": "An LDU Type"
            },
            "teamType": {
                "code": "TEAMTYPE",
                "description": "A Team Type"
            },
            "district": {
                "code": "DISTRICT",
                "description": "A District"
            },
            "borough": {
                "code": "BOROUGH",
                "description": "A Borough"
            },
            "startDate": "2020-01-01",
            "endDate": null
        }]
      }
    }
  }
  fs.writeFileSync(`${__dirname}/../mappings/${filename}`, JSON.stringify(body, null, 2), { flag: 'w+' });
})
