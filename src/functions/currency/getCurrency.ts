import { AddressZero } from '@ethersproject/constants'
import { ChainId, UXD_ADDRESS } from '@mateswapfi/sdk'

type Currency = { address: string; decimals: number }

// Pricing currency
// TODO: Check decimals and finish table
export const USD_CURRENCY: { [chainId in ChainId]?: Currency } = {
  [ChainId.LACHAIN]: {
    address: UXD_ADDRESS[ChainId.LACHAIN],
    decimals: 18,
  },
  [ChainId.LACHAIN_TESTNET]: {
    address: UXD_ADDRESS[ChainId.LACHAIN_TESTNET],
    decimals: 18,
  },
}

export function getCurrency(chainId: ChainId): Currency {
  return (
    USD_CURRENCY[chainId] || {
      address: AddressZero,
      decimals: 18,
    }
  )
}
