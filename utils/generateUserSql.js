const users = require('../data/users.json')

const sql = users.map(u => `
  insert into
    users (
      "delius_staff_identifier",
      "delius_username",
      "id",
      "name"
    )
  values
    (
      '${Math.floor(Math.random() * 100000)}',
      '${u.username}',
      '${u.id}',
      '${u.name}'
    );
`)

console.log(`
-- \${flyway:timestamp}
TRUNCATE TABLE users CASCADE;
${sql.join('\r\n')}
`)
