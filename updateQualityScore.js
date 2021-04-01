const { Client } = require('pg')
const { fetchSwapForPair } = require('./theGraph')

require('dotenv').config()
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

async function processDonations(donations) {

  console.log(`${donations.length} donations returned from the db `)
}

async function run() {
  await client.connect()
  
  const res = await client.query('select * from donation')
  
  processDonations(res.rows)

  await client.end()
}
run()
