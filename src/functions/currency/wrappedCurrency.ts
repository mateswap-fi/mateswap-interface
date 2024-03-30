import { ChainId, Currency, NATIVE, WNATIVE } from '@mateswapfi/sdk'

export function unwrappedToken(currency: Currency): Currency {
  if (currency.isNative) return currency

  // if (formattedChainId && currency.equals(WLAC_EXTENDED[formattedChainId]))
  //   return ExtendedEther.onChain(currency.chainId)

  if (currency.chainId in ChainId && currency.equals(WNATIVE[currency.chainId])) return NATIVE[currency.chainId]

  return currency
}
