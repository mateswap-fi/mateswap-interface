import { Chef, PairType } from '../../features/onsen/enum'
import { useActiveWeb3React, useFuse } from '../../hooks'
import {
  useAverageBlockTime,
  useEthPrice,
  useFarmPairAddresses,
  useFarms,
  useMasterChefV1SushiPerBlock,
  useMasterChefV1TotalAllocPoint,
  useSushiPairs,
  useSushiPrice,
} from '../../services/graph'

import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, WNATIVE, Token, CurrencyAmount, JSBI, WLAC, MASTERCHEF_ADDRESS, MASTERCHEF_V2_ADDRESS } from '@mateswapfi/sdk'
import { MATE, UXD, XMATE } from '../../config/tokens'
import Container from '../../components/Container'
import FarmList from '../../features/onsen/FarmList'
import Head from 'next/head'
import Menu from '../../features/onsen/FarmMenu'
import React, { useEffect, useState } from 'react'
import Search from '../../components/Search'
import { classNames } from '../../functions'
import dynamic from 'next/dynamic'
import { getAddress } from '@ethersproject/address'
import useFarmRewards from '../../hooks/useFarmRewards'
import usePool from '../../hooks/usePool'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { usePositions, usePendingSushi } from '../../features/onsen/hooks'
import { useRouter } from 'next/router'
import { updateUserFarmFilter } from '../../state/user/actions'
import { getFarmFilter, useUpdateFarmFilter } from '../../state/user/hooks'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import axios from 'axios'

function getTokensSorted(pool, pair) {
  if (pool.token0 == pair.token0.address && pool.token1 == pair.token1.address) {
    return [pair.token0, pair.token1, pool.reserves[0], pool.reserves[1]];
  }

  if (pool.token0 == pair.token1.address && pool.token1 == pair.token0.address) {
    return [pair.token0, pair.token1, pool.reserves[1], pool.reserves[0]];
  }

  return [undefined, undefined, undefined, undefined];
}

function getTokenPriceInLac(pool, pair, chainId, matePriceLac, lacPriceUSD) {
  let [token0, token1, reserve0, reserve1] = getTokensSorted(pool, pair);

  if (! token0) return 0;

  let factor = 0;
  let tokenAmount0 = Number.parseFloat(CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(reserve0.toString())).toFixed());
  let tokenAmount1 = Number.parseFloat(CurrencyAmount.fromRawAmount(token1, JSBI.BigInt(reserve1.toString())).toFixed());

  if (token0.address === MATE[chainId].address) {
    factor = matePriceLac;
  } else if (token1.address === MATE[chainId].address) {
    [tokenAmount1, tokenAmount0] = [tokenAmount0, tokenAmount1];
    factor = matePriceLac;
  } else if (token0.address === UXD[chainId].address) {
    factor = lacPriceUSD;
  } else if (token1.address === UXD[chainId].address) {
    [tokenAmount1, tokenAmount0] = [tokenAmount0, tokenAmount1];
    factor = lacPriceUSD;
  } else if (token0.address === WLAC[chainId].address) {
    factor = 1;
  } else if (token1.address === WLAC[chainId].address) {
    [tokenAmount1, tokenAmount0] = [tokenAmount0, tokenAmount1];
    factor = 1;
  }
  const derivedETH = (tokenAmount0 / tokenAmount1) * factor;
  return derivedETH;
}

export default function Farm(): JSX.Element {
  const { i18n } = useLingui()
  const { chainId } = useActiveWeb3React()
  const router = useRouter()

  // Note: take the price from an external resource
  // const [matePriceUSD, setMatePriceUSD] = useState(0);

  const type = router.query.filter as string

  const savedFilter = getFarmFilter()

  if (!type && savedFilter) {
    router.push(`/farm?filter=${savedFilter}`)
  }

  const updateFarmFilter = useUpdateFarmFilter()
  updateFarmFilter(type)

  // Mate-xMate	 500	0x211bbB315C9DAA1900B435E8E7ddBCB1b6776702  2
  // Mate-WLAC	4950	0xEB3Fa9dF542F8afF75D00fA486f891A56B5c8923	3
  // UXD-Mate	  3700	0x0c27280680Bf3c8358630336949B08127eC15CB7	4
  // UXD-WLAC	   300	0xcDc3736cabB8864eB1ef84B7583f9C1b1c9a118e	5

  const hardcodedPairs = {
    [ChainId.LACHAIN]: {
      "0x211bbB315C9DAA1900B435E8E7ddBCB1b6776702": {
        farmId: 2,
        allocPoint: 500,
        token0: MATE[ChainId.LACHAIN],
        token1: XMATE[ChainId.LACHAIN],
      },
      "0xEB3Fa9dF542F8afF75D00fA486f891A56B5c8923": {
        farmId: 3,
        allocPoint: 4950,
        token0: MATE[ChainId.LACHAIN],
        token1: WLAC[ChainId.LACHAIN],
      },
      "0x0c27280680Bf3c8358630336949B08127eC15CB7": {
        farmId: 4,
        allocPoint: 3700,
        token0: UXD[ChainId.LACHAIN],
        token1: MATE[ChainId.LACHAIN],
      },
      "0xcDc3736cabB8864eB1ef84B7583f9C1b1c9a118e": {
        farmId: 5,
        allocPoint: 300,
        token0: UXD[ChainId.LACHAIN],
        token1: WLAC[ChainId.LACHAIN],
      },
    },
    [ChainId.LACHAIN_TESTNET]: {
    }
  };

  // const hardcodedPairs2x = {
  //   [ChainId.LACHAIN]: {
  //   },
  //   [ChainId.LACHAIN_TESTNET]: {
  //   }
  // };

  const kashiPairs = [] // unused
  const swapPairs = []
  const farms2 = useFarms();
  let farms = []

  for (const [pairAddress, pair] of Object.entries(hardcodedPairs[chainId])) {
    swapPairs.push({
      id: pairAddress,
      reserveUSD: "100000",
      totalSupply: "1000",
      timestamp: "1599830986",
      token0: {
        id: pair.token0.address,
        name: pair.token0.name,
        symbol: pair.token0.symbol,
        decimals: pair.token0.decimals
      },
      token1: {
        id: pair.token1.address,
        name: pair.token1.name,
        symbol: pair.token1.symbol,
        decimals: pair.token1.decimals
      },
    })

    const f = {
      pair: pairAddress,
      symbol: `${hardcodedPairs[chainId][pairAddress].token0.symbol}-${hardcodedPairs[chainId][pairAddress].token1.symbol}`,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      pool: usePool(pairAddress),
      allocPoint: pair.allocPoint,
      balance: "1000000000000000000",
      chef: 0,
      id: pair.farmId,
      pendingSushi: undefined,
      pending: 0,
      owner: {
        id: MASTERCHEF_ADDRESS[chainId],
        sushiPerBlock: "1000000000000000000",
        totalAllocPoint: "10000"
      },
      userCount: 1,
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    f.pendingSushi = usePendingSushi(f)
    f.pending = Number.parseFloat(f.pendingSushi?.toFixed())

    farms.push(f);
  }

  // console.log(farms);
  const lacUXDPool = farms[3].pool;
  const lacMatePool = farms[1].pool;
  const UXDMatePool = farms[2].pool;
  let lacPriceUSD = 0;
  let matePriceLac = 0;
  let matePriceUSD = 0;

  // matePriceUSD
  // axios.get('https://api.coingecko.com/api/v3/simple/price?ids=mateswap&vs_currencies=usd')
  // .then(response => {
  //   return setMatePriceUSD(response.data.mateswap.usd)
  // })

  if (lacUXDPool.reserves) {
    lacPriceUSD = Number.parseFloat(lacUXDPool.reserves[1].toFixed(18)) / Number.parseFloat(lacUXDPool.reserves[0].toFixed(18));
  }

  if (UXDMatePool.reserves) {
    matePriceUSD = 1. / ( Number.parseFloat(UXDMatePool.reserves[0].toFixed(18)) / Number.parseFloat(UXDMatePool.reserves[1].toFixed(18)))
  }

  if (lacMatePool.reserves) {
    matePriceLac = Number.parseFloat(lacMatePool.reserves[1].toFixed(18)) / Number.parseFloat(lacMatePool.reserves[0].toFixed(18))
  }

  console.log("lacPriceUSD:  ", lacPriceUSD);
  console.log("matePriceUSD:  ", matePriceUSD);
  console.log("matePriceLac: ", matePriceLac);


  // for (const [pairAddress, pair] of Object.entries(hardcodedPairs2x[chainId])) {
  //   swapPairs.push({
  //     id: pairAddress,
  //     reserveUSD: "100000",
  //     totalSupply: "1000",
  //     timestamp: "1599830986",
  //     token0: {
  //       id: pair.token0.address,
  //       name: pair.token0.name,
  //       symbol: pair.token0.symbol,
  //       decimals: pair.token0.decimals
  //     },
  //     token1: {
  //       id: pair.token1.address,
  //       name: pair.token1.name,
  //       symbol: pair.token1.symbol,
  //       decimals: pair.token1.decimals
  //     },
  //   })

  //   const f = {
  //     pair: pairAddress,
  //     symbol: `${hardcodedPairs2x[chainId][pairAddress].token0.symbol}-${hardcodedPairs2x[chainId][pairAddress].token1.symbol}`,

  //     // eslint-disable-next-line react-hooks/rules-of-hooks
  //     pool: usePool(pairAddress),

  //     allocPoint: pair.allocPoint,
  //     balance: "1000000000000000000",
  //     chef: 1,
  //     id: pair.farmId,
  //     pendingSushi: undefined,
  //     pending: 0,
  //     owner: {
  //       id: MASTERCHEF_V2_ADDRESS[chainId],
  //       sushiPerBlock: "1000000000000000000",
  //       totalAllocPoint: "10000",
  //     },

  //     rewarder: {
  //       id: pair.rewarderId,
  //       rewardToken: pair.rewardToken.address,
  //       rewardPerSecond: pair.rewardPerSecond
  //     },

  //     rewardToken: {
  //       ...pair.rewardToken,
  //       // eslint-disable-next-line react-hooks/rules-of-hooks
  //       derivedETH: getTokenPriceInLac(usePool(pairAddress), pair, chainId, matePriceLac, lacPriceUSD),
  //     },

  //     userCount: 1,
  //   }
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   f.pendingSushi = usePendingSushi(f)
  //   f.pending = Number.parseFloat(f.pendingSushi?.toFixed())

  //   farms.push(f);
  // }


  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    MASTERCHEF_ADDRESS[chainId],
    farms.map((farm) => new Token(chainId, farm.pair, 18, 'LP', 'LP Token')),
  )

  const [v2PairsBalances2x, fetchingV2PairBalances2x] = useTokenBalancesWithLoadingIndicator(
    MASTERCHEF_V2_ADDRESS[chainId],
    farms.map((farm) => new Token(chainId, farm.pair, 18, 'LP', 'LP Token')),
  )

  if (! fetchingV2PairBalances) {
    for (let i=0; i < farms.length; ++i) {
      if (v2PairsBalances.hasOwnProperty(farms[i].pair) && farms[i].pool.totalSupply) {
        const totalSupply = Number.parseFloat(farms[i].pool.totalSupply.toFixed());
        let chefBalance = Number.parseFloat(v2PairsBalances[farms[i].pair].toFixed());

        if (v2PairsBalances2x.hasOwnProperty(farms[i].pair)) {
          chefBalance += Number.parseFloat(v2PairsBalances2x[farms[i].pair].toFixed());
        }

        let tvl = 0;
        if (farms[i].pool.token0 === MATE[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed(18));
          // tvl = reserve / totalSupply * chefBalance * matePriceUSD * 2;
          tvl = reserve * matePriceUSD * 2;
        }
        else if (farms[i].pool.token1 === MATE[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed(18));
          // tvl = reserve / totalSupply * chefBalance * matePriceUSD * 2;
          tvl = reserve * matePriceUSD * 2;
        }
        else if (farms[i].pool.token0 === UXD[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed(18));
          // tvl = reserve / totalSupply * chefBalance * 2;
          tvl = reserve * 2;
        }
        else if (farms[i].pool.token1 === UXD[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed(18));
          // tvl = reserve / (totalSupply * chefBalance * 2);
          tvl = reserve * 2;
        }
        else if (farms[i].pool.token0 === WLAC[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed(18));
          // tvl = reserve / totalSupply * chefBalance * lacPriceUSD * 2;
          tvl = reserve * lacPriceUSD * 2;
        }
        else if (farms[i].pool.token1 === WLAC[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed(18));
          // tvl = reserve / totalSupply * chefBalance * lacPriceUSD * 2;
          tvl = reserve * lacPriceUSD * 2;
        }
        farms[i].tvl = tvl;
        farms[i].chefBalance = chefBalance;
      } else {
        farms[i].tvl = "0";
        farms[i].chefBalance = 0;
      }
    }
  }

  // if (! fetchingV2PairBalances) {
  //   for (let i=0; i<farms.length; ++i) {

  //     if (v2PairsBalances.hasOwnProperty(farms[i].pair) && farms[i].pool.totalSupply) {
  //       // const totalSupply = Number.parseFloat(farms[i].pool.totalSupply.toFixed());
  //       // let chefBalance = Number.parseFloat(v2PairsBalances[farms[i].pair].toFixed());
  //       const totalSupply = farms[i].pool.totalSupply;
  //       let chefBalance = v2PairsBalances[farms[i].pair];

  //       // if (v2PairsBalances2x.hasOwnProperty(farms[i].pair)) {
  //       //   chefBalance += Number.parseFloat(v2PairsBalances2x[farms[i].pair].toFixed());
  //       // }

  //       console.log("totalSupply: ", totalSupply.toFixed(18))
  //       console.log("totalSupply: ", totalSupply.toString())
  //       console.log("chefBalance: ", chefBalance.toFixed(18))
  //       console.log("chefBalance: ", chefBalance.toString())

  //       let tvl = 0;
  //       if (farms[i].pool.token0 === MATE[chainId].address) {
  //         const reserve = farms[i].pool.reserves[0];
  //         console.log("case 1 - reserve: ", reserve)
  //         // console.log(`case 1 - farms[${i}]: `, farms[i])
  //         tvl = reserve.div(totalSupply.mul(chefBalance).mul(matePriceUSD).mul(2));
  //       }
  //       else if (farms[i].pool.token1 === MATE[chainId].address) {
  //         const reserve = farms[i].pool.reserves[1];
  //         console.log("case 2 - reserve: ", reserve)
  //         // console.log(`case 2 - farms[${i}]: `, farms[i])
  //         // tvl = reserve / totalSupply * chefBalance * matePriceUSD * 2;
  //         tvl = reserve.div(totalSupply.mul(chefBalance).mul(matePriceUSD).mul(2));
  //       }
  //       else if (farms[i].pool.token0 === UXD[chainId].address) {
  //         const reserve = farms[i].pool.reserves[0];
  //         console.log("case 3 - reserve: ", reserve)
  //         // console.log(`case 3 - farms[${i}]: `, farms[i])

  //         // tvl = reserve / totalSupply * chefBalance * 2;
  //         tvl = reserve.div(totalSupply.mul(chefBalance).mul(2));
  //       }
  //       else if (farms[i].pool.token1 === UXD[chainId].address) {
  //         const reserve = farms[i].pool.reserves[1];
  //         console.log("case 4 - reserve: ", reserve)
  //         console.log(`case 4 - farms[${i}]: `, farms[i])
  //         // tvl = reserve / totalSupply * chefBalance * 2;
  //         tvl = reserve.div(totalSupply.mul(chefBalance).mul(2));
  //       }
  //       else if (farms[i].pool.token0 === USDC[chainId].address) {
  //         const reserve = farms[i].pool.reserves[0];
  //         console.log("case 5 - reserve: ", reserve)
  //         // console.log(`case 5 - farms[${i}]: `, farms[i])
  //         // tvl = reserve / totalSupply * chefBalance * 2;
  //         tvl = reserve.div(totalSupply.mul(chefBalance).mul(2));
  //       }
  //       else if (farms[i].pool.token1 === USDC[chainId].address) {
  //         const reserve = farms[i].pool.reserves[1];
  //         console.log("case 6 - reserve: ", reserve)
  //         // console.log(`case 6 - farms[${i}]: `, farms[i])
  //         // tvl = reserve / totalSupply * chefBalance * 2;
  //         tvl = reserve.div(totalSupply.mul(chefBalance).mul(2));
  //       }
  //       else if (farms[i].pool.token0 === WLAC[chainId].address) {
  //         const reserve = farms[i].pool.reserves[0];
  //         console.log("case 7 - reserve: ", reserve)
  //         // console.log(`case 7 - farms[${i}]: `, farms[i])
  //         // tvl = reserve / totalSupply * chefBalance * lacPriceUSD * 2;
  //         tvl = reserve.div(totalSupply.mul(chefBalance).mul(lacPriceUSD).mul(2));

  //       }
  //       else if (farms[i].pool.token1 === WLAC[chainId].address) {
  //         const reserve = farms[i].pool.reserves[1];
  //         console.log("case 8 - reserve: ", reserve)
  //         // console.log(`case 8 - farms[${i}]: `, farms[i])
  //         // tvl = reserve / totalSupply * chefBalance * lacPriceUSD * 2;
  //         tvl = reserve.div(totalSupply.mul(chefBalance).mul(lacPriceUSD).mul(2));
  //       } else {
  //         console.log("opaaaa 2222 !!!!!!")
  //       }
  //       farms[i].tvl = tvl;
  //       console.log(`farms[${i}].tvl: ${farms[i].tvl}`)
  //       farms[i].chefBalance = chefBalance;
  //     } else {
  //       console.log("opaaaa ******")
  //       farms[i].tvl = "0";
  //       farms[i].chefBalance = 0;
  //     }
  //   }
  // }


  const positions = usePositions(chainId)

  // const averageBlockTime = useAverageBlockTime()
  const averageBlockTime = 2;
  const masterChefV1TotalAllocPoint = useMasterChefV1TotalAllocPoint()
  const masterChefV1SushiPerBlock = useMasterChefV1SushiPerBlock()

  const secondsPerDay = 86400
  const blocksPerDay = secondsPerDay / Number(averageBlockTime)

  const map = (pool) => {
    // TODO: Account for fees generated in case of swap pairs, and use standard compounding
    // algorithm with the same intervals acrosss chains to account for consistency.
    // For lending pairs, what should the equivilent for fees generated? Interest gained?
    // How can we include this?

    // TODO: Deal with inconsistencies between properties on subgraph
    pool.owner = pool?.owner || pool?.masterChef
    pool.balance = pool?.balance || pool?.slpBalance

    const swapPair = swapPairs?.find((pair) => pair.id === pool.pair)
    const kashiPair = kashiPairs?.find((pair) => pair.id === pool.pair)

    const type = swapPair ? PairType.SWAP : PairType.KASHI

    const pair = swapPair || kashiPair

    // 1 block per 2 seconds, so
    // per minute: 30 blocks
    // per hour: 1800 blocks
    // per day: 43200 blocks
    // const blocksPerDay = 43200

    function getRewards() {
      // TODO: Some subgraphs give sushiPerBlock & sushiPerSecond, and mcv2 gives nothing
      // const sushiPerBlock =
      //   pool?.owner?.sushiPerBlock / 1e18 ||
      //   (pool?.owner?.sushiPerSecond / 1e18) * averageBlockTime ||
      //   masterChefV1SushiPerBlock

      const sushiPerBlock = 1
      const rewardPerBlock = (pool.allocPoint / pool.owner.totalAllocPoint) * sushiPerBlock

      const defaultReward = {
        token: 'MATE',
        icon: 'https://raw.githubusercontent.com/mateswap-fi/assets/master/blockchains/lachain/assets/0x10B9BE5482E9A16EFBD04BE723E6452423FAD6FC/logo.png',
        rewardPerBlock,
        rewardPerDay: rewardPerBlock * blocksPerDay,
        rewardPrice: +matePriceUSD,
      }

      let rewards = [defaultReward]

      // if (pool.chef === Chef.MASTERCHEF_V2) {
      //   // override for mcv2...
      //   pool.owner.totalAllocPoint = masterChefV1TotalAllocPoint

      //   const icon = `https://raw.githubusercontent.com/mateswap-fi/assets/master/blockchains/lachain/assets/${getAddress(
      //     pool.rewarder.rewardToken
      //   )}/logo.png`

      //   const decimals = 10 ** pool.rewardToken.decimals
      //   // console.log("pool.rewardToken.decimals:      ", pool.rewardToken.decimals);
      //   // console.log("pool.rewardToken.derivedETH:    ", pool.rewardToken.derivedETH);
      //   // console.log("pool.rewarder.rewardPerSecond:  ", pool.rewarder.rewardPerSecond);
      //   // console.log("decimals:      ", decimals);

      //   if (pool.rewarder.rewardToken !== '0x0000000000000000000000000000000000000000') {

      //     // console.log("pool.rewarder.rewardPerSecond / decimals:      ", pool.rewarder.rewardPerSecond / decimals);

      //     const rewardPerBlock = (pool.rewarder.rewardPerSecond / decimals) * averageBlockTime

      //     // console.log("rewardPerBlock:      ", rewardPerBlock);

      //     const rewardPerDay = (pool.rewarder.rewardPerSecond / decimals) * averageBlockTime * blocksPerDay
      //     const rewardPrice = pool.rewardToken.derivedETH * lacPriceUSD

      //     // console.log("rewardPrice:      ", rewardPrice);

      //     const reward = {
      //       token: pool.rewardToken.symbol,
      //       icon: icon,
      //       rewardPerBlock,
      //       rewardPerDay,
      //       rewardPrice,
      //     }

      //     rewards[1] = reward
      //   }
      // }

      return rewards
    }

    const rewards = getRewards()

    const balance = Number(pool.balance / 1e18);

    const roiPerBlock = rewards.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.rewardPerBlock * currentValue.rewardPrice
    }, 0) / pool.tvl

    const roiPerDay = roiPerBlock * blocksPerDay
    const roiPerYear = roiPerDay * 365

    const position = positions.find((position) => position.id === pool.id && position.chef === pool.chef)

    return {
      ...pool,
      ...position,
      pair: {
        ...pair,
        decimals: pair.type === PairType.KASHI ? Number(pair.asset.tokenInfo.decimals) : 18,
        type,
      },
      balance,
      roiPerYear,
      rewards,
    }
  }

  const FILTER = {
    all: (farm) => farm.allocPoint !== 0,
    portfolio: (farm) => farm.pending !== 0,
    past: (farm) => farm.allocPoint === 0,
    // sushi: (farm) => farm.pair.type === PairType.SWAP && farm.allocPoint !== '0',
    // kashi: (farm) => farm.pair.type === PairType.KASHI && farm.allocPoint !== '0',
    // '2x': (farm) => (farm.chef === Chef.MASTERCHEF_V2) && farm.allocPoint !== '0',

    '2x': (farm) =>
      farm.chef === Chef.MASTERCHEF_V2 &&
      farm.rewards.length > 1 &&
      farm.allocPoint !== '0',
  }

  const data = farms
    .filter((farm) => {
      return (
        (swapPairs && swapPairs.find((pair) => pair.id === farm.pair)) ||
        (kashiPairs && kashiPairs.find((pair) => pair.id === farm.pair))
      )
    })
    .map(map)
    .filter((farm) => {
      return type in FILTER ? FILTER[type](farm) : true
    })

  const options = {
    keys: ['pair.id', 'pair.token0.symbol', 'pair.token1.symbol'],
    threshold: 0.4,
  }

  const { result, term, search } = useFuse({
    data,
    options,
  })

  return (
    <Container id="farm-page" className="h-full py-4 mx-auto lg:grid lg:grid-cols-4 md:py-8 lg:py-12 gap-9" maxWidth="7xl">
      <Head>
        <title>Farm | MateSwap</title>
        <meta key="description" name="description" content="Farm MATE" />
      </Head>
      <div className={classNames('px-3 md:px-0 lg:block md:col-span-1')}>
        <Menu positionsLength={positions.length} />
      </div>
      <div className={classNames('space-y-6 col-span-4 lg:col-span-3')}>
        <Search
          search={search}
          placeholder={i18n._(t`Search by name, symbol, address`)}
          term={term}
          className={classNames('px-3 md:px-0 ')}
          inputProps={{
            className:
              'relative w-full bg-transparent border border-transparent focus:border-gradient-r-blue-pink-dark-900 rounded placeholder-secondary focus:placeholder-primary font-bold text-base px-6 py-3.5',
          }}
        />

        <div className="flex items-center hidden text-lg font-bold md:block text-high-emphesis whitespace-nowrap">
          Farms{' '}
          <div className="w-full h-0 ml-4 font-bold bg-transparent border border-b-0 border-transparent rounded text-high-emphesis md:border-gradient-r-blue-pink-dark-800 opacity-20"></div>
        </div>

        <FarmList farms={result} term={term} />
      </div>
    </Container>
  )
}
