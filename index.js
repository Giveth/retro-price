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
const wethUsdtPair = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"

async function run() {
  await client.connect()
  //const res = await client.query('SELECT $1::text as message', ['Hello world!'])
  //const res = await client.query('SELECT NOW()')
  const res = await client.query('select d."createdAt" , EXTRACT(EPOCH from d."createdAt") as "donatedTime" from donation d where d."priceEth" is null')
  console.log(`res : ${JSON.stringify(res, null, 2)}`)
  res.rows.forEach(async row => {
    console.log(`row.createdAt ---> : ${row.createdAt} - ${row.donatedTime}`)
    const swaps = await fetchSwapForPair(wethUsdcPair, Math.round(row.donatedTime))
    const swap = swaps[0]
    let action = ''
    let price=0
    console.log(`swap love: ${JSON.stringify(swap, null, 2)}`)
    if(Number(swap.amount0In) > 0) {
      action = 'buyEth'
      price = Number(swap.amount0In) / Number(swap.amount1Out)
    } else if(Number(swap.amount0Out) > 0) {
      action = 'sellEth'
      price = Number(swap.amount0Out) / (Number(swap.amount1In))
    } else {
      throw new Error('Should not happen')
    }
    console.log(`action ---> : ${action} - ${Math.round(row.donatedTime)} - ${price}$`)
    //console.log(`prices : ${JSON.stringify(prices, null, 2)}`)
    
  })
  //console.log(`res.rows ---> : ${res.rows[0].message}`)
  await client.end()
}
run()
// client.connect()
// client.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   client.end()
// })
