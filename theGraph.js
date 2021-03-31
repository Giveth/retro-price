const axios = require('axios')
async function fetchSwapForPair(pairId, timestamp) {
  console.log(`fetchSwapForPair ---> : ${pairId} > ${timestamp}`)
  //, timestamp: "1616946948" greater thans
  const query = `
  query GetSwap {
    swaps(first: 1, orderBy: timestamp, orderDirection: desc, where:
      { pair: "${pairId}", timestamp_gt: "${timestamp}" }
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
  console.log(`query ---> : ${query}`)
  const response = await axios({
    url: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
    method: 'post',
    data: {
      query
    }
  })

  console.log(`swaps[0].amount0In ---> : ${response.data.data.swaps[0].amount0In}`)
  //console.log(`response.data : ${JSON.stringify(response.data, null, 2)}`)
  return response.data.data.swaps
  
}

module.exports = {
  fetchSwapForPair
}