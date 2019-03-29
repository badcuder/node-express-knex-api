import knex from "knex";
const builder = knex({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : "root",
    password : "",
    database : "node-api"
  },
  pool: { min: 0, max: 7 } // connectionpool có tối đa 7 connection trong 1 lúc.
});
export default builder;
