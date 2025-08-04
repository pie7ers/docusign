import { Locator, Page } from "@playwright/test";
import { readFileSync } from 'fs';
import PlaywrightBase from "../PlaywrightBase";

const SIGNERS_URLS_FILE = 'data/docusing/urls.json';

export default class DSSignDocument extends PlaywrightBase {

  readonly modalReview: Locator
  readonly startButton: Locator
  readonly signButton: Locator
  readonly finishButton: Locator

  constructor(page: Page) {
    super(page)
    this.modalReview = page.locator('div').filter({ hasText: /^Review and continue$/ })
    this.startButton = page.locator('#navigate-btn')
    this.signButton = page.locator('[data-qa="signature-icon"]')
    this.finishButton = page.locator('[data-qa="slide-up-bar-finish-button"]')
  }

  async modalReviewAndContinue() {
    await this.page.waitForTimeout(3000);
    const modalReview = this.modalReview.first()

    const modalReviewExists = await modalReview.count() > 0;
    if (modalReviewExists) {
      const agreeCheckbox = this.page.getByText('I agree to use electronic');
      const agreeCheckboxExists = await agreeCheckbox.count() > 0;
      if (agreeCheckboxExists) {
        await this.page.getByText('I agree to use electronic').click();
      }
      await this.page.getByRole('button', { name: 'Continue' }).click()
    } else console.log(`could not continue`)
  }

  async signDocument() {
    const urls = JSON.parse(readFileSync(SIGNERS_URLS_FILE, 'utf-8')).urls;

    for (let index = 0; index < urls.length; index++) {
      const url = urls[index]
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.modalReviewAndContinue();

      const checkboxAgree = await this.page.$('#disclosureAccepted');
      if (checkboxAgree && await checkboxAgree.isVisible()) {
        await checkboxAgree.click();
      }
      //start button
      await this.startButton.click();
      await super.fullScreenShot(`docusign/1_start_${index}.png`)
      //sign button
      await this.signButton.click();
      await super.fullScreenShot(`docusign/2_sign_${index}.png`)

      //modal to adopt sign when is a new sign
      const adoptSign = this.page.getByRole('button', { name: 'Adopt and Sign' })
      await this.page.waitForTimeout(2000);
      const adoptSignExists = await adoptSign.count() > 0;
      if (adoptSignExists) {
        await adoptSign.click({ force: true })
      }

      //Finish button on footer bar
      await super.fullScreenShot(`docusign/3_finish_${index}.png`)
      await this.finishButton.click();
      await this.page.waitForTimeout(3000);
    }
  }
}