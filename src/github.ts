import { Octokit } from '@octokit/rest';
import { createAppAuth } from "@octokit/auth-app";
import { IssueCommentCreatedEvent } from '@octokit/webhooks-types';

export type GithubCredentials = {
  GITHUB_NFT_MINTER_PRIVATE_KEY: string;
  GITHUB_NFT_MINTER_APP_ID: string;
}

export class Github {
  constructor(private secrets: GithubCredentials) {
    if (!secrets.GITHUB_NFT_MINTER_APP_ID || !secrets.GITHUB_NFT_MINTER_PRIVATE_KEY) {
      throw new Error(`Missing autotask secret GITHUB_NFT_MINTER_APP_ID or GITHUB_NFT_MINTER_PRIVATE_KEY`);
    }
  }

  async createComment(
    payload: IssueCommentCreatedEvent,
    body: string,
  ) {
    const installationId = payload.installation.id;
    const appId = this.secrets.GITHUB_NFT_MINTER_APP_ID;
    const privateKey = this.secrets.GITHUB_NFT_MINTER_PRIVATE_KEY.split('\\n').join('\n');
    const auth = { appId, privateKey, installationId };
    const octokit = new Octokit({ authStrategy: createAppAuth, auth });
    const { data: { slug } } = await octokit.rest.apps.getAuthenticated();
    
    console.log(`Authenticated on github as ${slug}`);
  
    await octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.issue.number,
      body,
    });
  }
}
