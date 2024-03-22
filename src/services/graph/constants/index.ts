import { ChainId } from '@boneswapfi/sdk'
const THE_GRAPH = 'http://127.0.0.1:8000';

export const GRAPH_HOST = {
  [ChainId.DOGECHAIN]: THE_GRAPH,
  // [ChainId.DOGECHAIN_TESTNET]: THE_GRAPH,
}
