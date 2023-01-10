const offenders = require('../data/offenders.json')
const fs = require('fs');

const body = {
  "name": 'CommunityAPI_GetTeamCaseload',
  "request": {
    "url": '/secure/team/TEAM1/caseload',
    "method": "GET"
  },
  "response": {
    "status": 200,
    "jsonBody": {
      "managedOffenders": offenders.map(offender => ({
        "offenderCrn": offender.otherIds.crn,
        "allocationDate": "2020-01-01",
        "staffIdentifier": 12345,
        "teamIdentifier": 54321
      }))
    }
  }
}

fs.writeFileSync(`${__dirname}/../mappings/CommunityAPI_GetTeamCaseload.json`, JSON.stringify(body, null, 2), { flag: 'w+' });
