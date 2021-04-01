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

async function processDonations(donations) {
  
  const it = donations[Symbol.iterator]()
  let result = it.next()

  while (!result.done) {
    const donation = result.value
    
    const swap = await fetchSwapForPair(wethUsdcPair, Math.round(donation.donatedTime))
    let action = ''
    let price=0
    
    if(Number(swap.amount0In) > 0) {
      action = 'buyEth '+Number(swap.amount0In)
      price = Number(swap.amount0In) / Number(swap.amount1Out)
    
    } else if(Number(swap.amount0Out) > 0) {
      action = 'sellEth '+Number(swap.amount0Out)
      price = Number(swap.amount0Out) / (Number(swap.amount1In))
    
    } else {
      throw new Error('Should not happen')
    }
    console.log(price)
    
    result = it.next()
  }
}

async function run() {
  await client.connect()
  
  const res = await client.query('select d."createdAt" , EXTRACT(EPOCH from d."createdAt") as "donatedTime" from donation d where d."priceEth" is null')
  
  processDonations(res.rows)

  await client.end()
}
run()
