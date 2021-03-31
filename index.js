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
const wethUsdcPair = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"

async function run() {
  await client.connect()
  //const res = await client.query('SELECT $1::text as message', ['Hello world!'])
  //const res = await client.query('SELECT NOW()')
  const res = await client.query('select d."createdAt" , EXTRACT(EPOCH from d."createdAt") as "donatedTime" from donation d where d."priceEth" is null')
  console.log(`res : ${JSON.stringify(res, null, 2)}`)
  res.rows.forEach(async row => {
    console.log(`row.createdAt ---> : ${row.createdAt} - ${row.donatedTime}`)
    const swaps = await fetchSwapForPair(wethUsdcPair, Math.round(row.donatedTime))
    console.log(`swaps : ${JSON.stringify(swaps, null, 2)}`)
    
    let action = ''
    if(Number(swaps[0].amount0In) > 1) {
      action = 'buyEth'
    } else if(Number(swaps[0].amount0Out) > 1) {
      action = 'sellEth'
    } else {
      throw new Error('Should not happen')
    }
    console.log(`action ---> : ${action}`)
    //console.log(`prices : ${JSON.stringify(prices, null, 2)}`)
    
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
