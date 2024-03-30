import { ChainId, Currency, CurrencyAmount, Price, Token } from '@mateswapfi/sdk'

import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useMemo } from 'react'
import { useV2TradeExactOut } from './useV2Trades'
import { UXD } from '@mateswapfi/sdk'

// import { wrappedCurrency } from "../functions/currency/wrappedCurrency";

// Stablecoin amounts used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  // [ChainId.LACHAIN]: CurrencyAmount.fromRawAmount(UXD[ChainId.LACHAIN], 100_000e6),
  [ChainId.LACHAIN_TESTNET]: CurrencyAmount.fromRawAmount(UXD[ChainId.LACHAIN_TESTNET], 100_000e6),
}

/**
 * Returns the price in UXD of the input currency
 * @param currency currency to compute the UXD price of
 */
export default function useUXDPrice(currency?: Currency): Price<Currency, Token> | undefined {
  const { chainId } = useActiveWeb3React()

  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined
  const stablecoin = amountOut?.currency

  const v2UXDTrade = useV2TradeExactOut(currency, amountOut, {
    maxHops: 3,
  })

  return useMemo(() => {
    if (!currency || !stablecoin) {
      return undefined
    }

    // handle UXD
    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, '1', '1')
    }

    // use v2 price if available
    if (v2UXDTrade) {
      const { numerator, denominator } = v2UXDTrade.route.midPrice
      return new Price(currency, stablecoin, denominator, numerator)
    }

    return undefined
  }, [currency, stablecoin, v2UXDTrade])
}

export function useUXDValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {
  const price = useUXDPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || !currencyAmount) return null
    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, price])
}
