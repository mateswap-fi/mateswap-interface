import { ChainId, BONE_ADDRESS, USDC_ADDRESS, USDT_ADDRESS, BAR_ADDRESS, Token, WWDOGE} from '@boneswapfi/sdk'

type ChainTokenMap = {
  readonly [chainId in ChainId]?: Token
}

export const BONE: ChainTokenMap = {
  [ChainId.DOGECHAIN]: new Token(ChainId.DOGECHAIN, BONE_ADDRESS[ChainId.DOGECHAIN], 18, 'BONE', 'BoneToken'),
  [ChainId.DOGECHAIN_TESTNET]: new Token(ChainId.DOGECHAIN_TESTNET, BONE_ADDRESS[ChainId.DOGECHAIN_TESTNET], 18, 'BONE', 'BoneToken'),
}

export const XBONE: ChainTokenMap = {
  [ChainId.DOGECHAIN]: new Token(ChainId.DOGECHAIN, BAR_ADDRESS[ChainId.DOGECHAIN], 18, 'xBONE', 'Meat Bone'),
  [ChainId.DOGECHAIN_TESTNET]: new Token(ChainId.DOGECHAIN_TESTNET, BAR_ADDRESS[ChainId.DOGECHAIN_TESTNET], 18, 'xBONE', 'Meat Bone'),
}

export const USDT: ChainTokenMap = {
  [ChainId.DOGECHAIN]: new Token(ChainId.DOGECHAIN, USDT_ADDRESS[ChainId.DOGECHAIN], 6, 'USDT', 'USDT token'),
  [ChainId.DOGECHAIN_TESTNET]: new Token(ChainId.DOGECHAIN_TESTNET, USDT_ADDRESS[ChainId.DOGECHAIN_TESTNET], 6, 'USDT', 'USDT token'),
}

export const USDC: ChainTokenMap = {
  [ChainId.DOGECHAIN]: new Token(ChainId.DOGECHAIN, USDC_ADDRESS[ChainId.DOGECHAIN], 6, 'USDC', 'USDC token'),
  [ChainId.DOGECHAIN_TESTNET]: new Token(ChainId.DOGECHAIN_TESTNET, USDC_ADDRESS[ChainId.DOGECHAIN_TESTNET], 6, 'USDC', 'USDC token'),
}

export const WWDOGE_EXTENDED: { [chainId: number]: Token } = {
  ...WWDOGE,
}

type ChainTokenMapList = {
  readonly [chainId in ChainId]?: Token[]
}

// These are available for migrate
export const YODESWAP_TOKENS: ChainTokenMapList = {
  [ChainId.DOGECHAIN]: [
  ],
  [ChainId.DOGECHAIN_TESTNET]: [
  ],
}
