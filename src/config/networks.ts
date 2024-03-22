import { ChainId } from '@boneswapfi/sdk'

const Dogechain = 'https://raw.githubusercontent.com/boneswap-fi/icons/master/network/dogechain.jpg'
const DogechainTestnet = 'https://raw.githubusercontent.com/boneswap-fi/icons/master/network/dogechain_testnet.jpg'

export const NETWORK_ICON = {
  [ChainId.DOGECHAIN]: Dogechain,
  [ChainId.DOGECHAIN_TESTNET]: DogechainTestnet,
}

export const NETWORK_LABEL: { [chainId in ChainId]?: string } = {
  [ChainId.DOGECHAIN]: 'Dogechain',
  [ChainId.DOGECHAIN_TESTNET]: 'Dogechain Testnet',
}
