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
await Tokopedia(page, process.env.PAGES);

await page.close();
