import { ChainId } from '@mateswapfi/sdk'

// Multichain Explorer
const builders = {
  dogechain_explorer: (chainName: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => {
    const prefix = `https://explorer.dogechain.dog/`
    switch (type) {
      case 'transaction':
        return `${prefix}/tx/${data}`
      default:
        return `${prefix}/${type}/${data}`
    }
  },
  dogechain_explorer_testnet: (chainName: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => {
    const prefix = `https://explorer-testnet.dogechain.dog/`
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
  [ChainId.DOGECHAIN]: {
    chainName: '',
    builder: builders.dogechain_explorer,
  },
  [ChainId.DOGECHAIN_TESTNET]: {
    chainName: 'testnet',
    builder: builders.dogechain_explorer_testnet,
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
