const { Client } = require('pg')
const { fetchSwapForPair } = require('./theGraph')
//const { allTokens } require('./tokens.ts')
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
    let valueEth
    if(Number(swap.amount0In) > 0) {
      action = 'buyEth '+Number(swap.amount0In)
      price = Number(swap.amount0In) / Number(swap.amount1Out)
    
    } else if(Number(swap.amount0Out) > 0) {
      action = 'sellEth '+Number(swap.amount0Out)
      price = Number(swap.amount0Out) / (Number(swap.amount1In))
    
    } else {
      throw new Error('Should not happen')
    }
    console.log({price, id: donation.id})
    
    if(donation.currency === 'ETH') {
      valueEth = donation.amount
      valueUsd = 1 / price * donation.amount
    } else if(donation.currency === 'XDAI') {
      valueEth = price * donation.amount
      valueUsd = donation.amount
    } else {
      console.log(`ERC20 transaction - ${donation.currency}`)
      const wethUsdcPair = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"

      const ercSwap = await fetchSwapForPair(wethUsdcPair, Math.round(donation.donatedTime))
      


      //priceEth = getHNYPriceInEth from eth price above


      // valueEth = price * donation.amount
      // valueUsd = donation.amount
    }
    const priceUsd = 1/price
    const res = await client.query('update donation set "priceEth" = $1, "valueEth" = $3, "priceUsd" = $4 where id = $2', [price, donation.id, valueEth, priceUsd])
    result = it.next()
  }
}

// async function run() {
//   await client.connect()
  
//   const res = await client.query('select d.id, d.amount, d.currency, d."createdAt" , EXTRACT(EPOCH from d."createdAt") as "donatedTime" from donation d where d."priceEth" is null')
  
//   await processDonations(res.rows)

//   await client.end()
// }

async function run() {
  await client.connect()
  
  //const res = await client.query('select d.id, d.amount, d.currency, d."createdAt" , EXTRACT(EPOCH from d."createdAt") as "donatedTime" from donation d where d."priceEth" is null')
  const res = await client.query(`select d.id, d.amount, d.currency, d."createdAt" , EXTRACT(EPOCH from d."createdAt") as "donatedTime" from donation d where d."currency" = 'HNY'`)
  
  console.log(`res.rows : ${JSON.stringify(res.rows, null, 2)}`)
  
  await processDonations(res.rows)

  await client.end()
}
run()
