const users = require('../data/users.json')

const sql = users.map(u => `
  insert into
    users (
      "delius_staff_identifier",
      "delius_username",
      "id",
      "name",
      "probation_region_id"
    )
  values
    (
      '${Math.floor(Math.random() * 100000)}',
      '${u.username}',
      '${u.id}',
      '${u.name}',
      '${u.probation_region_id}'
    )
  ON CONFLICT (id) DO NOTHING;
`)

console.log(`
-- \${flyway:timestamp}

${sql.join('\r\n')}
`)
