# github-minter-bot

Proof of concept for a Github App that responds to commands to mint NFT tokens. Uses [OpenZeppelin Defender](http://zpl.in/defender).

## Interacting

Whenever an owner or member of the repo includes the text `mint to 0x0000000000000000000000000000000000000000` (for any Ethereum address), the bot will automatically mint an NFT for the target address as a token of appreciation for the contributor. Check out the [issues on this repo](https://github.com/spalladino/github-minter-bot/issues/2) for an example, where the app is already installed.

## Pending

- Add ENS support
- Load contributor's address from their github profile

## How it works

The [`nft-minter`](https://github.com/settings/apps/nft-minter) Github app, after installed in the repo, monitors all comments on issues and pull requests, invoking a [Defender Autotask](https://docs.openzeppelin.com/defender/autotasks) via a [webhook](https://docs.openzeppelin.com/defender/autotasks#webhook-handler). The Autotask code is built from this repo's source through `yarn build`.

The Autotask stores the Github app's private key and id as [secrets](https://docs.openzeppelin.com/defender/autotasks#secrets), uses the [key-value store](https://docs.openzeppelin.com/defender/autotasks#kvstore) to keep track of tokens already minted, and sends the `mint` transactions using a [Relayer](https://docs.openzeppelin.com/defender/autotasks#relayer-integration). Note that the Relayer address needs to be whitelisted as a minter in the ERC721 contract.