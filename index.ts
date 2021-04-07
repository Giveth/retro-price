const { Client } = require('pg')
import { getPriceAtTime, convertPriceEthToUsd } from 'monoswap'
import * as dotenv from 'dotenv'
const chalk = require('chalk')

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

    let valueEth,
      valueUsd,
      priceInEth: number,
      priceOfEth: number,
      priceInUsd: number,
      pricePerToken: number,
      ethPerToken: number,
      usdPerToken: number
    if (
      donation.currency === 'ETH' ||
      donation.currency === 'XDAI' ||
      donation.currency === 'DAI'
    ) {
      priceOfEth = await getPriceAtTime('ETH', 'USDC', donatedTime, chainId)

      if (donation.currency === 'ETH') {
        priceInEth = 1
        valueEth = donation.amount
        priceInUsd = priceOfEth
        valueUsd = priceOfEth * donation.amount
      } else if (donation.currency === 'XDAI' || donation.currency === 'DAI') {
        priceInUsd = 1
        valueUsd = donation.amount
        priceInEth = priceOfEth
        valueEth = (1 / priceOfEth) * donation.amount
      }
    } else {
      if (donation.currency === 'YAY') {
        priceInEth = 0.02
        priceInUsd = 10
      } else {
        // console.log('  ')
        // console.log('  ')

        // console.log(
        //   `_________________ ${donation.currency} ____________________`
        // )

        // console.log(`donation.currency ---> : ${donation.currency}`)
        // console.log(`donation.amount ---> : ${donation.amount}`)
        // console.log(`chainId 1 ---> : ${chainId}`)
        // console.log(`donatedTime ---> : ${donatedTime}`)

        ethPerToken = await getPriceAtTime(
          donation.currency,
          'ETH',
          donatedTime,
          chainId
        )
        //console.log(chalk.blue(`ethPerToken ---> : ${ethPerToken}`))

        usdPerToken = await convertPriceEthToUsd(ethPerToken, donatedTime)

        //console.log(chalk.green(`usdPerToken ? ---> : ${usdPerToken}`))

        //valueEth = (1 / pricePerToken) * donation.amount
        valueEth = ethPerToken * donation.amount
        valueUsd = usdPerToken * donation.amount

        priceInEth = ethPerToken
        priceInUsd = usdPerToken
      }

      valueEth = priceInEth * donation.amount
      valueUsd = priceInUsd * donation.amount
    }

    const res = await client.query(
      'update donation set "priceEth" = $1, "valueEth" = $3, "priceUsd" = $4, "valueUsd" = $5 where id = $2',
      [priceInEth, donation.id, valueEth, priceInUsd, valueUsd]
    )
    result = it.next()
  }
}

async function run () {
  await client.connect()

  const res = await client.query(
    `select d.id, d.amount, d.currency, d."createdAt" , EXTRACT(EPOCH from d."createdAt") as "donatedTime" from donation d where d.id=94 OR d.id=64`
  )

  await processDonations(res.rows)

  await client.end()

  process.exit()
}
run()
