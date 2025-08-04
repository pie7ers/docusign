import { expect, APIRequestContext } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { ISendEnvelopeResponse, ITokens, IRecipientes, ISigner } from '../models/docuSign';
import 'dotenv/config'
import { IPlaywrightFullResponse } from '../models/playwright';
import { DOCUSIGN } from '../constants/docusign';

const DS_INTEGRATION_KEY = DOCUSIGN.ingetrationKey;
const DS_API_CCOUNT_ID = DOCUSIGN.apiAccountId;
const TOKENS_FILE = 'data/docusing/dsTokens.json';
const SEND_ENVELOP_REQUEST_FILE = 'data/docusing/sendEnvelopRequestBody.json';
const SEND_ENVELOP_RESPONSE_FILE = 'data/docusing/sendEnvelopeResponse.json';
const SIGNERS_URLS_FILE = 'data/docusing/urls.json';

export default class DocuSignAPI {

  accessToken: string
  refreshToken: string
  sendEnvelopResponse: ISendEnvelopeResponse
  signersWithClientUserId: ISigner[]
  signersUrl: string[] = []
  
  async getTokens(request: APIRequestContext): Promise<ITokens> {
    const options = {
      headers: {
        'Authorization': `Basic ${DOCUSIGN.basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        'grant_type': 'refresh_token',
        'refresh_token': DOCUSIGN.refreshToken as string,
      },
    }
    const response = await request.post(`${DOCUSIGN.urlAccount}/oauth/token`, options);
    console.log("🚀 ~ DocuSignAPI ~ getTokens ~ response:", response)
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('refresh_token');
    this.accessToken = body.access_token
    this.refreshToken = body.refresh_token
    const tokens: ITokens = {
      refresh_token: body.refresh_token,
      access_token: body.access_token,
    }

    writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
    return tokens;
  }

  checkTokensSaved() {
    const tokensSaved = JSON.parse(readFileSync(TOKENS_FILE, 'utf-8'));
    expect(tokensSaved.access_token).toBe(this.accessToken);
    expect(tokensSaved.refresh_token).toBe(this.refreshToken);
  }

  async sendEnvelope(request: APIRequestContext) {
    const requestBody = JSON.parse(readFileSync(SEND_ENVELOP_REQUEST_FILE, 'utf-8'));
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
    }
    const response = await request.post(`${DOCUSIGN.url}/restapi/v2.1/accounts/${DS_API_CCOUNT_ID}/envelopes`, {
      headers: headers,
      data: requestBody,
    });

    const body = await response.json();
    this.sendEnvelopResponse = body;
    expect(response.status()).toBe(201);
    const fullResponse: IPlaywrightFullResponse = {
      request: {
        url: response.url(),
        method: 'post',
        headers: headers,
        payload: requestBody
      },
      response: {
        status: response.status(),
        headers: response.headers(),
        body: body,
      }
    }
    writeFileSync(SEND_ENVELOP_RESPONSE_FILE, JSON.stringify(fullResponse, null, 2));
  }

  async checkEnvelopeHasBeenSent(request: APIRequestContext) {
    const response = await request.get(`${DOCUSIGN.url}/restapi/v2.1/accounts/${DS_API_CCOUNT_ID}/envelopes/${this.sendEnvelopResponse.envelopeId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.status).toBe('sent');
  }

  async updateEnvelopeAndRecipientsWithClientUserId(request: APIRequestContext, sendEnvelopRequestBody) {
    const signers = sendEnvelopRequestBody.recipients.signers;
    const requestBody: IRecipientes = { recipients: { signers: [] } };

    signers.forEach((signer: ISigner, i: number) => {
      requestBody.recipients.signers.push({
        email: signer.email,
        name: signer.name,
        recipientId: signer.recipientId,
        clientUserId: `clientUserId${i}`,
      });
    });

    const response = await request.put(`${DOCUSIGN.url}/restapi/v2.1/accounts/${DS_API_CCOUNT_ID}/envelopes/${this.sendEnvelopResponse.envelopeId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      data: requestBody,
    });

    expect(response.status()).toBe(200);
    this.signersWithClientUserId = requestBody.recipients.signers;
  }

  async getUrlOfDocumentsToSign(request: APIRequestContext) {
    for (const signer of this.signersWithClientUserId) {
      const requestBody = {
        returnUrl: 'https://www.docusign.com/devcenter',
        authenticationMethod: 'none',
        email: signer.email,
        userName: signer.name,
        clientUserId: signer.clientUserId,
        recipientId: signer.recipientId,
      };

      const response = await request.post(`${DOCUSIGN.url}/restapi/v2.1/accounts/${DS_API_CCOUNT_ID}/envelopes/${this.sendEnvelopResponse.envelopeId}/views/recipient`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        data: requestBody,
      });

      const body = await response.json();
      expect(response.status()).toBe(201);
      this.signersUrl.push(body.url);
    }

    writeFileSync(SIGNERS_URLS_FILE, JSON.stringify({ urls: this.signersUrl }, null, 2));
  }

  async checkDocumentHasBeenCompleted(request) {

    const response = await request.get(`${DOCUSIGN.url}/restapi/v2.1/accounts/${DS_API_CCOUNT_ID}/envelopes/${this.sendEnvelopResponse.envelopeId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.status).toBe('completed');
  }
}