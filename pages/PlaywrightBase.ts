import { Locator, Page, expect } from "@playwright/test";

export default class PlaywrightBase {

  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async clickWithRedirectionToURL(locator: Locator, urlExpected: string) {
    await locator.click()
    await this.page.waitForURL(urlExpected, { timeout: 5000 })
    expect(this.page.url()).toBe(urlExpected)
  }

  async fullScreenShot(path: string = 'screenshot-test.png') {
    await this.page.screenshot({ path: `evidences/${path}`, fullPage: true })
  }
} 