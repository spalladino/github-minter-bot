import { Github } from "./github";
import { IssueCommentCreatedEvent } from '@octokit/webhooks-types';
import { ethers } from 'ethers';
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { KeyValueStoreClient } from 'defender-kvstore-client';

const ABI = [`function safeMint(address to, uint256 tokenId) public`];
const NFT_ADDRESS = '0x2C30b60038394755c9Ab4285fa59D722153a63E5';

/**
 * Mints an NFT for the recipient if it hasn't received one yet
 * @param {string} recipient the recipient's address
 * @param {ethers.Signer} signer ethers signer for sending the tx
 */
async function main(payload: IssueCommentCreatedEvent, signer: DefenderRelaySigner, storage: KeyValueStoreClient, github: Github) {
  if (!['OWNER', 'MEMBER'].includes(payload.comment.author_association)) {
    console.log(`Author is not an owner or member (${payload.comment.author_association}). Aborting.`);
    return;
  }
  
  // Match comment text
  const text = payload.comment.body;
  const re = /mint to (?<addr>0x[a-f0-9]{40})|(?<ens>[a-z][a-z0-9\.]+\.eth)/i
  const match = re.exec(text);

  if (!match) {
    console.log(`Could not find mint command. Aborting.`);
    return;
  } else if (match.groups.ens) {
    console.log(`ENS support not implemented yet (sorry). Aborting.`);
    return;
  }

  // Check if recipient was already awarded an nft
  const recipient = match.groups.addr;
  const key = `nft-github/${NFT_ADDRESS}/${payload.repository.id}/${recipient}`;
  if (await storage.get(key)) {
    console.log(`Address ${recipient} already received an NFT. Aborting.`);
    return;
  }
  
  // Mint them an NFT
  console.log(`Using relayer ${await signer.getAddress()}`);
  const tokenId = ethers.utils.id(key);
  const decimalId = ethers.BigNumber.from(tokenId).toString();
  const nft = new ethers.Contract(NFT_ADDRESS, ABI, signer);
  const tx = await nft.safeMint(recipient, tokenId);
  console.log(`Minted an NFT for ${recipient} in ${tx.hash}`);
  
  // Share the news on github
  await github.createComment(payload, `Minted a [token](https://rinkeby.etherscan.io/token/${NFT_ADDRESS}?a=${decimalId}) for ${recipient}`);
  console.log(`Posted comment to github`);
}

// Entrypoint for the Autotask
exports.handler = async function(params: any) {
  const provider = new DefenderRelayProvider(params);
  const signer = new DefenderRelaySigner(params, provider, { speed: 'fast' });
  const storage = new KeyValueStoreClient(params);
  const github = new Github(params.secrets);

  const { body, headers } = params.request;
  if (headers['X-GitHub-Event'] !== 'issue_comment') {
    console.log(`Not an issue comment. Aborting.`);
    return;
  }

  await main(body, signer, storage, github);
}

// Exported for running locally
exports.main = main;