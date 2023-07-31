const crypto = require('crypto')

const applicationData = require('../data/applicationData.json')
const applicationDocument = require('../data/applicationDocument.json')
const users = require('../data/users.json')
const offenders = require('../data/offenders.json')

const randomUser = () => users[Math.floor(Math.random() * users.length)]

sql = []

sql.push(`
-- \${flyway:timestamp}
TRUNCATE TABLE applications CASCADE;
TRUNCATE TABLE assessments CASCADE;
`)

sql.push(`
DO $$
DECLARE
   applicationData json := '${JSON.stringify(applicationData)}';
   applicationDocument json := '${JSON.stringify(applicationDocument)}';
BEGIN
`)

offenders.forEach(offender => {
  const applicationId = crypto.randomUUID()
  sql.push(`
  insert into applications (
    "id",
    "created_at",
    "created_by_user_id",
    "crn",
    "data",
    "document",
    "schema_version",
    "service",
    "submitted_at",
    "noms_number"
  )
  values
    (
      '${applicationId}',
      CURRENT_DATE + ${Math.floor(Math.random() * 30)},
      '${randomUser().id}',
      '${offender.otherIds.crn}',
      applicationData,
      applicationDocument,
      (
        SELECT
          id
        FROM
          json_schemas
        WHERE
          type = 'APPROVED_PREMISES_APPLICATION'
        LIMIT 1
      ),
      'approved-premises',
      CURRENT_DATE + ${Math.floor(Math.random() * 30)},
      '${offender.otherIds.nomsNumber}'
    );
  `)

  sql.push(`
  insert into approved_premises_applications (
      "conviction_id",
      "event_number",
      "id",
      "is_pipe_application",
      "is_womens_application",
      "offence_id",
      "is_withdrawn",
      "risk_ratings"
    )
  values
    (
      '2500295345',
      '2',
      '${applicationId}',
      false,
      false,
      'M2500295343',
      false,
      '{"roshRisks":{"status":"Error","value":null},"mappa":{"status":"Retrieved","value":{"level":"CAT M2/LEVEL M2","lastUpdated":[2021,2,1]}},"tier":{"status":"Retrieved","value":{"level":"D2","lastUpdated":[2022,9,5]}},"flags":{"status":"Retrieved","value":["Risk to Known Adult"]}}'
    );
  `)

  sql.push(`
  INSERT into
  assessments (
    "id",
    "application_id",
    "allocated_to_user_id",
    "created_at",
    "allocated_at",
    "schema_version",
    "service"
  )
  VALUES
    (
      '${crypto.randomUUID()}',
      '${applicationId}',
      '${randomUser().id}',
      CURRENT_DATE,
      CURRENT_DATE,
      (
        SELECT
          id
        FROM
          json_schemas
        WHERE
          type = 'APPROVED_PREMISES_ASSESSMENT'
        LIMIT 1
      ),
      'approved-premises'
    );
  `)
})

sql.push(`END $$;`)

console.log(sql.join('\r\n'))
