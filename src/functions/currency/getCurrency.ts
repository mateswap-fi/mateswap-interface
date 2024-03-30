import { AddressZero } from '@ethersproject/constants'
import { ChainId, USDT_ADDRESS } from '@mateswapfi/sdk'

type Currency = { address: string; decimals: number }

// Pricing currency
// TODO: Check decimals and finish table
export const USD_CURRENCY: { [chainId in ChainId]?: Currency } = {
  [ChainId.DOGECHAIN]: {
    address: USDT_ADDRESS[ChainId.DOGECHAIN],
    decimals: 18,
  },
  [ChainId.DOGECHAIN_TESTNET]: {
    address: USDT_ADDRESS[ChainId.DOGECHAIN_TESTNET],
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
