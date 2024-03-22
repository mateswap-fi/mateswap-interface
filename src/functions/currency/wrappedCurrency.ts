import { ChainId, Currency, NATIVE, WNATIVE } from '@boneswapfi/sdk'

export function unwrappedToken(currency: Currency): Currency {
  if (currency.isNative) return currency

  // if (formattedChainId && currency.equals(WWDOGE_EXTENDED[formattedChainId]))
  //   return ExtendedEther.onChain(currency.chainId)

  if (currency.chainId in ChainId && currency.equals(WNATIVE[currency.chainId])) return NATIVE[currency.chainId]

  return currency
}
