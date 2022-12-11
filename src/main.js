import puppeteer from "puppeteer-core";
import * as dotenv from "dotenv";
import fs from "fs";
dotenv.config();
const unused = [
  "Terlaris",
  "Funstation",
  "Tambah Giftcard!",
  "Cashback",
  "Produk Terbaru",
  "MED Harbolnas",
  "Serbu OS",
  "Diskon Pengguna Baru",
];
const result = { result: [] };
let obj = {};
const app = puppeteer;
const wsChromeEndpointurl = process.env.WEB_SOCKET;
const browser = await app.connect({
  browserWSEndpoint: wsChromeEndpointurl,
});
const page = await browser.newPage();

await page.goto(
  `https://www.tokopedia.com/search?navsource=&ob=${process.env.OB}&pmax=200000&pmin=29000&shop_tier=1%233%231%232&q=${process.env.SEARCH_QUERY}&page=1`
);

await page.waitForXPath(
  "(//*[@id='zeus-root']/div/div[2]/div/div[2]/div[4]/div[1]/div[6])"
);
await page.setViewport({
  width: 1400,
  height: 800,
});

await autoScroll(page);
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

await page.waitForSelector(
  "#zeus-root > div > div.css-jau1bt > div > div.css-rjanld > div.css-gvoll6 > div.css-j8vtlh > div > p.css-17ik9ib"
);

const getLength = await page.evaluate(() =>
  Array.from(
    document.querySelectorAll(
      "#zeus-root > div > div.css-jau1bt > div > div.css-rjanld > div:nth-child(4) > div.css-jza1fo > div"
    ),
    (e) => e.innerHTML
  )
);
console.log(getLength.length);
for (
  let x = 10, data = 6, num = 1, pic = 7, counter = 6;
  x <= getLength.length;
  x++, data++, pic++, counter++
) {
  if (counter == 11) {
    num = 2;
    data = 1;
    pic = 1;
  }
  let product = await page.$x(
    `//*[@id="zeus-root"]/div/div[2]/div/div[2]/div[4]/div[${num}]/div[${data}]`
  );

  let getProduct = await page.evaluate((el) => el.innerText, product[0]);
  const img = await page.$eval(
    `#zeus-root > div > div.css-jau1bt > div > div.css-rjanld > div:nth-child(4) > div:nth-child(${num}) > div:nth-child(${pic}) > div > div > div > div > div > div.css-1f2quy8 > a > div > img`,
    (img) => img.src
  );
  // const label = await page.$eval(
  //   `#zeus-root > div > div.css-jau1bt > div > div.css-rjanld > div:nth-child(4) > div:nth-child(1) > div:nth-child(7) > div > div > div > div > div > div.css-974ipl > a > div.css-yaxhi2 > div.css-1ktbh56 > i`,
  //   (i) => i + "."
  // );
  let label = await page.$eval(
    `#zeus-root > div > div.css-jau1bt > div > div.css-rjanld > div:nth-child(4) > div:nth-child(${num}) > div:nth-child(${pic}) > div > div > div > div > div > div.css-974ipl > a > div.css-yaxhi2 > div.css-1ktbh56 > i`,
    (i) => i.getAttribute("data-testid")
  );
  const getLabel =
    label === "imgSRPProdTabShopBadgeOSNonTopAds"
      ? "Official Store"
      : label === "imgSRPProdTabShopBadgePMProNonTopAds"
      ? "Power Merchant Pro"
      : label === "imgSRPProdTabShopBadgeNonTopAds"
      ? "Power Merchant"
      : "";
  // console.log(getLabel);
  const imgURL = img.replace("200", "500");
  let splitProduct = await getProduct.split("\n");
  unused.includes(splitProduct[0]) && splitProduct.splice(0, 1);

  splitProduct.length === 8
    ? (obj = {
        id: x,
        image_url: imgURL,
        name_product: splitProduct[0],
        price_product: splitProduct[2],
        name_seller: splitProduct[5],
        seller_type: getLabel,
        seller_location: splitProduct[4],
        star_product: splitProduct[6],
        sold_product: splitProduct[7],
      })
    : splitProduct.length === 7
    ? (obj = {
        id: x,
        image_url: imgURL,
        name_product: splitProduct[0],
        price_product: splitProduct[1],
        name_seller: splitProduct[4],
        seller_type: getLabel,
        seller_location: splitProduct[3],
        star_product: splitProduct[5],
        sold_product: splitProduct[6],
      })
    : splitProduct.length === 6
    ? (obj = {
        id: x,
        image_url: imgURL,
        name_product: splitProduct[0],
        price_product: splitProduct[1],
        name_seller: splitProduct[3],
        seller_type: getLabel,
        seller_location: splitProduct[2],
        star_product: splitProduct[4],
        sold_product: splitProduct[5],
      })
    : splitProduct.length === 5 &&
      (obj = {
        id: x,
        image_url: imgURL,
        name_product: splitProduct[0],
        price_product: splitProduct[2],
        name_seller: splitProduct[4],
        seller_type: getLabel,
        seller_location: splitProduct[3],
        star_product: "-",
        sold_product: "-",
      });

  result.result.push(obj);
}
fs.writeFile("output.json", JSON.stringify(result), "utf8", function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }

  console.log("JSON file has been saved.");
});
console.log(result.result);
await page.close();
