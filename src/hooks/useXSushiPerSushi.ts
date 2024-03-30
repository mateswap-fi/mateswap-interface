import { request } from 'graphql-request'
import useSWR from 'swr'

const QUERY = `{
    bar(id: "0x09762030148180BB2309364aB8F793443cf09823") {
      ratio
    }
}`

const fetcher = (query) => request('https://thegraph.mateswap.fi/subgraphs/name/mateswap/bar', query)

// Returns ratio of XSushi:Sushi
export default function useSushiPerXSushi(parse = true) {
  const { data } = useSWR(QUERY, fetcher)
  return parse ? parseFloat(data?.bar?.ratio) : data?.bar?.ratio
}
