const rooms = require('../data/rooms.json')

const sql = rooms.map(r => {
  let sql = ''
  sql += `
  insert into
    rooms ("id", "name", "notes", "premises_id")
  values
    (
      '${r.id}',
      '${r.name}',
      NULL,
      '${r.premisesId}'
    );
  `

  r.beds.forEach(bed => {
    sql += `
    insert into
        beds ("id", "name", "room_id")
    values
      (
        '${bed.id}',
        '${bed.name}',
        '${r.id}'
      );
    `
  });

  return sql
})

console.log(`
-- \${flyway:timestamp}
TRUNCATE TABLE rooms CASCADE;
TRUNCATE TABLE beds CASCADE;
${sql.join('\r\n')}
`)
