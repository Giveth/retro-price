const axios = require('axios')
async function fetchSwapForPair(pairId, timestamp) {
  //console.log(`fetchSwapForPair ---> : ${pairId} > ${timestamp}`)
  //, timestamp: "1616946948" greater thans
  const query = `
  query GetSwap {
    swaps(first: 1, orderBy: timestamp, orderDirection: desc, where:
      { pair: "${pairId}", timestamp_lt: "${timestamp}" }
     ) {
          pair {
            token0 {
              symbol
            }
            token1 {
              symbol
            }
          }
          amount0In
          amount0Out
          amount1In
          amount1Out
          amountUSD
          to
      }
  }
  `
  //console.log(`query ---> : ${query}`)
  const response = await axios({
    url: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
    method: 'post',
    data: {
      query
    }
  })

  //console.log(`response.data : ${JSON.stringify(response.data, null, 2)}`)
  
  //console.log(`response.data.data.swaps[0] : ${JSON.stringify(response.data.data.swaps[0], null, 2)}`)

  //console.log(`response.data : ${JSON.stringify(response.data, null, 2)}`)
  return response.data.data.swaps[0]
  
}


async function run() {
  await fetchSwapForPair("0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc", "1615588247")
  await fetchSwapForPair("0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc", "1615591976")
}
// run()
module.exports = {
  fetchSwapForPair
}