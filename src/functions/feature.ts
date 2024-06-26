import { ChainId } from '@mateswapfi/sdk'

export enum Feature {
  AMM = 'AMM',
  AMM_V2 = 'AMM V2',
  LIQUIDITY_MINING = 'Liquidity Mining',
  BENTOBOX = 'Mirror',
  KASHI = 'Lend',
  MISO = 'MISO',
  ANALYTICS = 'Analytics',
  MIGRATE = 'Migrate',
  STAKING = 'Staking',
}

const features = {
  [ChainId.LACHAIN]: [
    Feature.AMM,
    Feature.LIQUIDITY_MINING,
    // Feature.MIGRATE,
    Feature.ANALYTICS,
    Feature.STAKING,
  ],
  [ChainId.LACHAIN_TESTNET]: [
    Feature.AMM,
    Feature.LIQUIDITY_MINING,
    /*
    Feature.MIGRATE,
    Feature.ANALYTICS,
    */
    Feature.STAKING,
    Feature.BENTOBOX,
    Feature.KASHI
  ],
}

export function featureEnabled(feature: Feature, chainId: ChainId): boolean {
  return features?.[chainId]?.includes(feature)
}

export function chainsWithFeature(feature: Feature): ChainId[] {
  return Object.keys(features)
    .filter((chain) => features[chain].includes(feature))
    .map((chain) => ChainId[chain])
}
