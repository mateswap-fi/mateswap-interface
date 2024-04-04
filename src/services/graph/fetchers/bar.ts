import { ChainId } from '@mateswapfi/sdk'
import { GRAPH_HOST } from '../constants'
import { request } from 'graphql-request'
import { barHistoriesQuery, barQuery } from '../queries/bar'
import { useActiveWeb3React } from '../../../hooks'

const BAR = {
  [ChainId.LACHAIN]: 'MateSwap/bar',
  [ChainId.LACHAIN_TESTNET]: 'MateSwap/bar',
}

export const bar = async (query, variables = undefined) => {
  const { chainId } = useActiveWeb3React()wip
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${BAR[chainId]}`, query, variables)
}

export const getBar = async (block: number) => {
  const { bar: barData }: any = await bar(barQuery, { block: block ? { number: block } : undefined })
  return barData
}

export const getBarHistory = async () => {
  const { histories }: any = await bar(barHistoriesQuery)
  return histories
}
