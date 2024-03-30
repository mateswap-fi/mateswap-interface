import { ChainId } from '@mateswapfi/sdk'

const Lachain = 'https://raw.githubusercontent.com/mateswap-fi/icons/master/network/Lachain.jpg'
const LachainTestnet = 'https://raw.githubusercontent.com/mateswap-fi/icons/master/network/Lachain_testnet.jpg'

export const NETWORK_ICON = {
  [ChainId.LACHAIN]: Lachain,
  [ChainId.LACHAIN_TESTNET]: LachainTestnet,
}

export const NETWORK_LABEL: { [chainId in ChainId]?: string } = {
  [ChainId.LACHAIN]: 'Lachain',
  [ChainId.LACHAIN_TESTNET]: 'Lachain Testnet',
}
