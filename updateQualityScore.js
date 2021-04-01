const { Client } = require('pg')
const { fetchSwapForPair } = require('./theGraph')

function calculateQualityScore (description, hasImageUpload, heartCount) {
  const heartScore = 10
  let qualityScore = 40

  if (description.length > 100) qualityScore = qualityScore + 10
  if (hasImageUpload) qualityScore = qualityScore + 30

  if (heartCount) {
    qualityScore = heartCount * heartScore
  }
  return qualityScore
}

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
  /*
    donations.forEach(donation => {

      //find the correct fields in here - calculateQualityScore and pass them into:
      const updatedDonation = calculateQualityScore()
      save updatedDonation

    })
  */
}

async function run() {
  await client.connect()
  
  const res = await client.query('select * from donation')
  
  processDonations(res.rows)

  await client.end()
}
run()
