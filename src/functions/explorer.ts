import { ChainId } from '@mateswapfi/sdk'

// Multichain Explorer
const builders = {
  Lachain_explorer: (chainName: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => {
    const prefix = `https://explorer.Lachain.dog/`
    switch (type) {
      case 'transaction':
        return `${prefix}/tx/${data}`
      default:
        return `${prefix}/${type}/${data}`
    }
  },
  Lachain_explorer_testnet: (chainName: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => {
    const prefix = `https://explorer-testnet.Lachain.dog/`
    switch (type) {
      case 'transaction':
        return `${prefix}/tx/${data}`
      default:
        return `${prefix}/${type}/${data}`
    }
  },
}

interface ChainObject {
  [chainId: number]: {
    chainName: string
    builder: (chainName: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => string
  }
}

const chains: ChainObject = {
  [ChainId.LACHAIN]: {
    chainName: '',
    builder: builders.Lachain_explorer,
  },
  [ChainId.LACHAIN_TESTNET]: {
    chainName: 'testnet',
    builder: builders.Lachain_explorer_testnet,
  },
}

export function getExplorerLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const chain = chains[chainId]
  return chain.builder(chain.chainName, data, type)
}
