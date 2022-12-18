import puppeteer from "puppeteer-core";
import { config } from "dotenv";
import { Tokopedia } from "./service/Tokopedia.js";
config();

const app = puppeteer;
const wsChromeEndpointurl = process.env.WEB_SOCKET;
const browser = await app.connect({
  browserWSEndpoint: wsChromeEndpointurl,
});
const page = await browser.newPage();
const limit = process.env.PAGES;

for (let pages = 1; pages <= limit; pages++) {
  await Tokopedia(page, pages);
}
// await page.close();
