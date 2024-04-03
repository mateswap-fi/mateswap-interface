import { ChainId, MATE_ADDRESS, UXD_ADDRESS, BAR_ADDRESS, Token, WLAC} from '@mateswapfi/sdk'

type ChainTokenMap = {
  readonly [chainId in ChainId]?: Token
}

export const MATE: ChainTokenMap = {
  [ChainId.LACHAIN]: new Token(ChainId.LACHAIN, MATE_ADDRESS[ChainId.LACHAIN], 18, 'MATE', 'Mate'),
  [ChainId.LACHAIN_TESTNET]: new Token(ChainId.LACHAIN_TESTNET, MATE_ADDRESS[ChainId.LACHAIN_TESTNET], 18, 'MATE', 'Mate'),
}

export const XMATE: ChainTokenMap = {
  [ChainId.LACHAIN]: new Token(ChainId.LACHAIN, BAR_ADDRESS[ChainId.LACHAIN], 18, 'xMATE', 'Yerba'),
  [ChainId.LACHAIN_TESTNET]: new Token(ChainId.LACHAIN_TESTNET, BAR_ADDRESS[ChainId.LACHAIN_TESTNET], 18, 'xMATE', 'Yerba'),
}

export const UXD: ChainTokenMap = {
  [ChainId.LACHAIN]: new Token(ChainId.LACHAIN, UXD_ADDRESS[ChainId.LACHAIN], 6, 'UXD', 'UXD token'),
  [ChainId.LACHAIN_TESTNET]: new Token(ChainId.LACHAIN_TESTNET, UXD_ADDRESS[ChainId.LACHAIN_TESTNET], 6, 'UXD', 'UXD token'),
}

export const WLAC_EXTENDED: { [chainId: number]: Token } = {
  ...WLAC,
}

type ChainTokenMapList = {
  readonly [chainId in ChainId]?: Token[]
}

// These are available for migrate
export const YODESWAP_TOKENS: ChainTokenMapList = {
  [ChainId.LACHAIN]: [
  ],
  [ChainId.LACHAIN_TESTNET]: [
  ],
}
