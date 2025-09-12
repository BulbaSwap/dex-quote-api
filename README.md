# BulbaSwap Quote API

## Project setup

```bash
npm install
```

## Compile and run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API base path

```bash
https://api.bulbaswap.io/v1/quote
```

## Params

|  Name   | Require  | Type    | Description |
|  ----  | ----  | ----  | ----  |
| amount  | true | number | Positive integer |
| tokenInAddress  | true | string | eth, ETH, weth, WETH, 0x... |
| tokenOutAddress  | true | string | eth, ETH, weth, WETH, 0x... |
| type  | true | string | (0, exactIn, buy)/(1, exactOut, sell) |
| quoteSpeed  | false | string | standard(default), fast |
| slippage  | false | number | min: 0.01, max: 100, default: 0.5 |
| protocols  | false | string | v2/v3/v2,v3 (default: v2,v3) |
| recipient  | false | string | 0x... |
| deadline  | false | number | Positive integer, min: 60, max: 3600 |
| minSplits  | false | number | Positive integer, min: 1, max: 7 |
| permitSignature  | false | string |  |
| permitNonce  | false | number | Positive integer |
| permitExpiration  | false | number | Positive integer |
| permitAmount  | false | number | Positive integer |
| permitSigDeadline  | false | number | Positive integer |

## Example

```bash
// Get query
https://api.bulbaswap.io/v1/quote?amount=10000000000000000
    &tokenInAddress=ETH
    &tokenOutAddress=0xc7D67A9cBB121b3b0b9c053DD9f469523243379A
    &type=0
    &slippage=0.5
    &recipient=0x3210f5d1a49842634F224dD50a8BadF02e9aB3a4
    &deadline=600
    &protocols=v2,v3
```

```json
{
    "methodParameters": {
        "calldata": "0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000681819b700000000000000000000000000000000000000000000000000000000000000020b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000003210f5d1a49842634f224dd50a8badf02e9ab3a4000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000001115cc500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b5300000000000000000000000000000000000011000bb8c7d67a9cbb121b3b0b9c053dd9f469523243379a000000000000000000000000000000000000000000",
        "value": "0x2386f26fc10000",
        "to": "0xb789922D715475F419b7CB47B6155bF7a2ACECD6"
    },
    "blockNumber": "9975200",
    "amount": "10000000000000000",
    "amountDecimals": "0.01",
    "quote": "18004653",
    "quoteDecimals": "18.004653",
    "quoteGasAdjusted": "17971700",
    "quoteGasAdjustedDecimals": "17.9717",
    "gasUseEstimateQuote": "32952",
    "gasUseEstimateQuoteDecimals": "0.032952",
    "gasUseEstimate": "155938",
    "gasUseEstimateUSD": "0.032952",
    "gasPriceWei": "116600000",
    "route": [
        [
            {
                "type": "v3-pool",
                "tokenIn": {
                    "chainId": 2818,
                    "decimals": 18,
                    "address": "0x5300000000000000000000000000000000000011",
                    "symbol": "WETH"
                },
                "tokenOut": {
                    "chainId": 2818,
                    "decimals": 6,
                    "address": "0xc7D67A9cBB121b3b0b9c053DD9f469523243379A",
                    "symbol": "USDT"
                },
                "fee": "3000",
                "liquidity": "118801304345136",
                "sqrtRatioX96": "3372863822212085493684573",
                "tickCurrent": "-201297",
                "amountIn": "10000000000000000",
                "amountOut": "18004653"
            }
        ]
    ],
    "routeString": "[V3] 100.00% = WETH -- 0.3% [0xfa38088c61C4EF0FDD3AA08c6a63c4a3B77A4af6] --> USDT"
}
```
