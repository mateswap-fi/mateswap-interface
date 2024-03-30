# Development

## Linking the SDK

The MateSwap SDK is used heavily throughout the Sushi Interface. You might like to clone this library and link it for various reasons, such as debugging, extracting, or even further developing the SDK.

```sh
git clone https://github.com/mateswap-fi/mateswap-sdk.git && cd mateswap-sdk && yarn link
```

In the Mate Interface repository you'd link this package by running this command.

```sh
yarn link @mateswapfi/sdk
```

If actively developing the SDK, you might like to run the watcher. You can do this by running this command in the root of the sdk repository once linked, and changes will be picked up by the interface in real-time.

```sh
yarn watch
```
