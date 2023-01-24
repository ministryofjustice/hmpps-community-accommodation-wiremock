const offenders = require('../data/offenders.json')
const fs = require('fs');

offenders.forEach(offender => {
  const crn = offender.otherIds.crn
  const filename = `CommunityAPI_GetPerson_${crn}.json`
  const body = {
    "name": `community_api_getPerson_${crn}`,
    "priority": 10,
    "request": {
      "url": `/secure/offenders/crn/${crn}`,
      "method": "GET"
    },
    "response": {
      "status": 200,
      "jsonBody": offender
    }
  }
  fs.writeFileSync(`${__dirname}/../mappings/${filename}`, JSON.stringify(body, null, 2), { flag: 'w+' });
})
