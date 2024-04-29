import { ChainId } from '@mateswapfi/sdk'

const lachain = 'https://raw.githubusercontent.com/mateswap-fi/icons/master/network/lachain.jpg'
const lachainTestnet = 'https://raw.githubusercontent.com/mateswap-fi/icons/master/network/lachain.jpg'

export const NETWORK_ICON = {
  [ChainId.LACHAIN]: lachain,
  [ChainId.LACHAIN_TESTNET]: lachainTestnet,
}

export const NETWORK_LABEL: { [chainId in ChainId]?: string } = {
  [ChainId.LACHAIN]: 'LaChain',
  [ChainId.LACHAIN_TESTNET]: 'LaChain Testnet',
}
