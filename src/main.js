import puppeteer from "puppeteer-core";
import fs from "fs";
const result = { result: [] };
const app = puppeteer;
const wsChromeEndpointurl =
  "ws://127.0.0.1:9222/devtools/browser/3c344332-22d2-44c7-87e1-7acd1e14eba1";
const browser = await app.connect({
  browserWSEndpoint: wsChromeEndpointurl,
});
const page = await browser.newPage();
await page.goto("https://tokopedia.com");
await page.type("input[data-unify=Search]", "Vortex Vx 5 pro");
await page.click("button[class='css-1czin5k e1v32nag1']");
await page.waitForXPath(
  "(//*[@id='zeus-root']/div/div[2]/div/div[2]/div[4]/div[1]/div[1]/div/div/div/div/div/div[2]/a/div[1])[1]"
);
await page.setViewport({
  width: 1200,
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

// let product_name = await page.$x(
//   `/html/body/div[1]/div/div[2]/div/div[2]/div[4]/div[2]/div[1]/div/div/div/div/div/div[2]/a/div[1]`
// );
// let getProduct_name = await page.evaluate(
//   (el) => el.textContent,
//   product_name[0]
// );
// console.log(getProduct_name);
const getLength = await page.evaluate(() =>
  Array.from(
    document.querySelectorAll(
      "#zeus-root > div > div.css-jau1bt > div > div.css-rjanld > div:nth-child(4) > div.css-jza1fo > div"
    ),
    (e) => e.innerHTML
  )
);
console.log(getLength.length);
for (let i = 1, data = 1, num = 1; i <= getLength.length; i++, data++) {
  if (i == 11) {
    num = 2;
    data = 1;
  }
  let product_name = await page.$x(
    `//*[@id="zeus-root"]/div/div[2]/div/div[2]/div[4]/div[${num}]/div[${data}]/div/div/div/div/div/div[2]/a/div[1]`
  );

  let getProduct_name = await page.evaluate(
    (el) => el.textContent,
    product_name[0]
  );
  let product_price = await page.$x(
    `//*[@id="zeus-root"]/div/div[2]/div/div[2]/div[4]/div[${num}]/div[${data}]/div/div/div/div/div/div[2]/a/div[2]`
  );

  let getProduct_price = await page.evaluate(
    (el) => el.textContent,
    product_price[0]
  );

  let obj = { name: getProduct_name, price: getProduct_price };

  result.result.push(obj);
}
console.log(result.result);
fs.writeFile("output.json", JSON.stringify(result), "utf8", function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }

  console.log("JSON file has been saved.");
});

browser.close();
