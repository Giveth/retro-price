const { Client } = require('pg')
import { getPriceAtTime, convertPriceEthToUsd } from './monoswap'
import * as dotenv from 'dotenv'
dotenv.config()

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
})
async function processDonations (donations) {
  const it = donations[Symbol.iterator]()
  let result = it.next()

  while (!result.done) {
    const donation = result.value
    const donatedTime = Math.round(donation.donatedTime)
    const chainId =
      donation.currency === 'HNY' || donation.currency === 'WXDAI' ? 100 : 1

    const baseCurrency =
      donation.currency === 'HNY' || donation.currency === 'WXDAI'
        ? 'WXDAI'
        : 'USDC'

    let valueEth, valueUsd, priceEth: number, priceUsd: number
    if (
      donation.currency === 'ETH' ||
      donation.currency === 'XDAI' ||
      donation.currency === 'DAI'
    ) {
      priceEth = await getPriceAtTime('ETH', 'USDC', donatedTime, chainId)

      if (donation.currency === 'ETH') {
        valueEth = donation.amount
        valueUsd = (1 / priceEth) * donation.amount
        priceUsd = 1 / priceEth
      } else if (donation.currency === 'XDAI' || donation.currency === 'DAI') {
        valueEth = (1 / priceEth) * donation.amount
        valueUsd = donation.amount
        priceUsd = 1
      }
    } else {
      priceEth = await getPriceAtTime(
        donation.currency,
        baseCurrency,
        donatedTime,
        chainId
      )

      priceUsd = await convertPriceEthToUsd(priceEth, donatedTime)

      valueEth = priceEth * donation.amount
      valueUsd = priceUsd * donation.amount
    }

    const res = await client.query(
      'update donation set "priceEth" = $1, "valueEth" = $3, "priceUsd" = $4, "valueUsd" = $5 where id = $2',
      [priceEth, donation.id, valueEth, priceUsd, valueUsd]
    )
    result = it.next()
  }
}

async function run () {
  await client.connect()

  const res = await client.query(
    `select d.id, d.amount, d.currency, d."createdAt" , EXTRACT(EPOCH from d."createdAt") as "donatedTime" from donation d`
  )

  await processDonations(res.rows)

  await client.end()

  process.exit()
}
run()
