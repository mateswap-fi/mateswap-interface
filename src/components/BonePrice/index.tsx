import { useState, useEffect } from 'react'
import { UXD, MATE } from '../../config/tokens'
import { useV2TradeExactIn as useTradeExactIn } from '../../hooks/useV2Trades'
import { tryParseAmount } from '../../functions/parse'
import { ChainId } from '@mateswapfi/sdk'
import axios from 'axios'

const MatePrice = () => {
  const [price, setPrice] = useState(null)
  const parsedAmount = tryParseAmount('1', MATE[ChainId.LACHAIN])
  const bestTradeExactIn = useTradeExactIn(parsedAmount, UXD[ChainId.LACHAIN])

  // axios.get('https://api.coingecko.com/api/v3/simple/price?ids=mateswap&vs_currencies=usd')
  // .then(response => {
  //   return setPrice(response.data.mateswap.usd)
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

export default MatePrice