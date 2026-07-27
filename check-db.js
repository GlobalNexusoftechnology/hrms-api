const { DataSource } = require('typeorm');
const data = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password', 
  database: 'hrms'
});
async function run() {
  await data.initialize();
  const res = await data.query("SELECT id, is_active FROM employees WHERE email = 'shezanshaikh@gmail.com'");
  console.log(res);
  await data.destroy();
}
run().catch(console.error);
