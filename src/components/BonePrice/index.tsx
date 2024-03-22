import { useState, useEffect } from 'react'
import { USDT, BONE } from '../../config/tokens'
import { useV2TradeExactIn as useTradeExactIn } from '../../hooks/useV2Trades'
import { tryParseAmount } from '../../functions/parse'
import { ChainId } from '@boneswapfi/sdk'
import axios from 'axios'

const BonePrice = () => {
  const [price, setPrice] = useState(null)
  const parsedAmount = tryParseAmount('1', BONE[ChainId.DOGECHAIN])
  const bestTradeExactIn = useTradeExactIn(parsedAmount, USDT[ChainId.DOGECHAIN])

  // axios.get('https://api.coingecko.com/api/v3/simple/price?ids=boneswap&vs_currencies=usd')
  // .then(response => {
  //   return setPrice(response.data.boneswap.usd)
  // });

  useEffect(() => {
    if (bestTradeExactIn) setPrice(bestTradeExactIn?.executionPrice?.toSignificant(6))
  }, [bestTradeExactIn])

  return (
    <div className="ml-2 font-bold">
      $<span className={!price && 'opacity-30'}>{price ? price : '0.000000'}</span>
    </div>
  )
}

export default BonePrice