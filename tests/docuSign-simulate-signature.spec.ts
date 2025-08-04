import { test } from '@playwright/test';
import DocuSignAPI from '../services/DocuSign'
import { ITokens } from '../models/docuSign';
import sendEnvelopRequestBody from '../data/docusing/sendEnvelopRequestBody.json';
import DSSignDocument from '../pages/docuSign/SignDocument';

const docuSign = new DocuSignAPI()
let tokens: ITokens

//run tests sequentially
test.describe.configure({ mode: 'serial' });

test.describe('SIGN DOCUMENTS DS', () => {

  test.beforeAll(async ({ request }) => {
    tokens = await docuSign.getTokens(request)
  });

  test('check tokens saved', async () => {
    docuSign.checkTokensSaved()
  });

  test('send envelope', async ({ request }) => {
    await docuSign.sendEnvelope(request)
  });

  test('check envelope has been sent', async ({ request }) => {
    await docuSign.checkEnvelopeHasBeenSent(request)
  });

  test('update envelop and recipients with clientUserId', async ({ request }) => {
    await docuSign.updateEnvelopeAndRecipientsWithClientUserId(request, sendEnvelopRequestBody)
  });

  test('get url of documents to sign', async ({ request }) => {
    await docuSign.getUrlOfDocumentsToSign(request)
  });

  test('sign document', async ({ page }) => {
    await page.goto('https://demo.docusign.net/Signing/...');

    const signDocument = new DSSignDocument(page)
    await signDocument.signDocument()
  });

  test('check document has been completed', async ({ request }) => {
    await docuSign.checkDocumentHasBeenCompleted(request)
  });

});
