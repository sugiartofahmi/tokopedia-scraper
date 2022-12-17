import { config } from "dotenv";
import { AutoScroll } from "../utils/AutoScroll.js";
config();
import fs from "fs";
export const Tokopedia = async (page, pages) => {
  const unused = [
    "Terlaris",
    "Funstation",
    "Tambah Giftcard!",
    "Cashback",
    "Produk Terbaru",
    "MED Harbolnas",
    "Serbu OS",
    "Diskon Pengguna Baru",
    "Ad",
    "Brand Pilihan",
  ];
  const result = [];
  let obj = {};

  await page.goto(
    `https://www.tokopedia.com/search?navsource=&ob=${process.env.OB}&pmax=${process.env.PMAX}&pmin=${process.env.PMIN}&shop_tier=1%233%231%232&q=${process.env.SEARCH_QUERY}&page=${pages}`
  );

  await page.waitForXPath(
    "(//*[@id='zeus-root']/div/div[2]/div/div[2]/div[4]/div[1]/div[6])"
  );
  await page.setViewport({
    width: 1300,
    height: 800,
  });

  await AutoScroll(page);

  await page.waitForSelector(
    "#zeus-root > div > div.css-1hur13 > div > div > div > nav:nth-child(6) > p"
  );

  const getAllCard = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        "#zeus-root > div > div.css-jau1bt > div > div.css-rjanld > div:nth-child(4) > div.css-jza1fo > div"
      ),
      (e) => e.innerHTML
    )
  );
  console.log(getAllCard.length);
  for (
    let i = 1, row = 1, data = 6, pic = 7;
    i <= getAllCard.length - 10;
    i++, data++, pic++
  ) {
    if (i + 5 === 11) {
      row += 1;
      data = 1;
      pic = 1;
    }
    const product = await page.$x(
      `//*[@id="zeus-root"]/div/div[2]/div/div[2]/div[4]/div[${row}]/div[${data}]`
    );
    const img = await page.$eval(
      `#zeus-root > div > div.css-jau1bt > div > div.css-rjanld > div:nth-child(4) > div:nth-child(${row}) > div:nth-child(${pic}) > div > div > div > div > div > div.css-1f2quy8 > a > div > img`,
      (img) => img.src
    );
    const label = await page.$eval(
      `#zeus-root > div > div.css-jau1bt > div > div.css-rjanld > div:nth-child(4) > div:nth-child(${row}) > div:nth-child(${pic}) > div > div > div > div > div > div.css-974ipl > a > div.css-yaxhi2 > div.css-1ktbh56 > i`,
      (i) => i.getAttribute("data-testid")
    );
    const getProduct = await page.evaluate((el) => el.innerText, product[0]);
    const getImage = img.replace("200", "500");
    const getLabel =
      label === "imgSRPProdTabShopBadgeOSNonTopAds"
        ? "Official Store"
        : label === "imgSRPProdTabShopBadgePMProNonTopAds"
        ? "Power Merchant Pro"
        : label === "imgSRPProdTabShopBadgeNonTopAds"
        ? "Power Merchant"
        : label === "imgSRPProdTabShopBadge" && "Dilayani Tokopedia";

    const splitProduct = await getProduct.split("\n");
    if (unused.includes(splitProduct[0])) {
      splitProduct.splice(0, 1);
    }
    if (unused.includes(splitProduct[1])) {
      splitProduct.splice(1, 1);
    }
    if (unused.includes(splitProduct[2])) {
      splitProduct.splice(2, 1);
    }
    if (unused.includes(splitProduct[3])) {
      splitProduct.splice(3, 1);
    }
    if (unused.includes(splitProduct[4])) {
      splitProduct.splice(4, 1);
    }
    if (splitProduct[2].endsWith("%")) {
      splitProduct.splice(2, 2);
    }
    if (splitProduct[1].startsWith("Rp") && splitProduct[1].endsWith("pcs")) {
      splitProduct.splice(1, 1);
    }
    if (splitProduct[0].startsWith("Sisa")) {
      splitProduct.splice(0, 1);
    }

    splitProduct.length === 6
      ? (obj = {
          id: i,
          image_url: getImage,
          name_product: splitProduct[0],
          price_product: splitProduct[1],
          name_seller: splitProduct[3],
          seller_type: getLabel,
          seller_location: splitProduct[2],
          star_product: splitProduct[4],
          sold_product: splitProduct[5],
          page: pages,
        })
      : splitProduct.length === 5
      ? (obj = {
          id: i,
          image_url: getImage,
          name_product: splitProduct[0],
          price_product: splitProduct[1],
          name_seller: splitProduct[3],
          seller_type: getLabel,
          seller_location: splitProduct[2],
          star_product: "-",
          sold_product: splitProduct[5],
          page: pages,
        })
      : splitProduct.length === 4 &&
        (obj = {
          id: i,
          image_url: getImage,
          name_product: splitProduct[0],
          price_product: splitProduct[1],
          name_seller: splitProduct[3],
          seller_type: getLabel,
          seller_location: splitProduct[2],
          star_product: "-",
          sold_product: "-",
          page: pages,
        });

    result.push(obj);
  }
  console.log(result);
  // await page.close();
};

// fs.writeFile("output.json", JSON.stringify(result), "utf8", function (err) {
//   if (err) {
//     console.log("An error occured while writing JSON Object to File.");
//     return console.log(err);
//   }

//   console.log("JSON file has been saved.");
// });
