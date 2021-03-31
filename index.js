const { Client } = require('pg')
require('dotenv').config()
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})
async function run() {
  await client.connect()
  //const res = await client.query('SELECT $1::text as message', ['Hello world!'])
  //const res = await client.query('SELECT NOW()')
  const res = await client.query('select d."createdAt" , EXTRACT(EPOCH from d."createdAt") as "donatedTime" from donation d where d."priceEth" is null')
  console.log(`res : ${JSON.stringify(res, null, 2)}`)
  res.rows.forEach(row => {
    console.log(`row.createdAt ---> : ${row.createdAt} - ${row.donatedTime}`)

  })
  console.log(res.rows[0].now) // Hello world!
  //console.log(`res.rows ---> : ${res.rows[0].message}`)
  await client.end()
}
run()
// client.connect()
// client.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   client.end()
// })
