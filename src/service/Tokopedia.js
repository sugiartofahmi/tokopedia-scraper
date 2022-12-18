import { config } from "dotenv";
import { AutoScroll } from "../utils/AutoScroll.js";
config();
import fs from "fs";
export const Tokopedia = async (page, pages) => {
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
    splitProduct.map((x, i) =>
      x.includes("Funstation")
        ? splitProduct.splice(i, 1)
        : x.includes("Cepat & Irit!")
        ? splitProduct.splice(i, 1)
        : x.includes("Tambah Giftcard!")
        ? splitProduct.splice(i, 1)
        : x.includes("Produk Terbaru")
        ? splitProduct.splice(i, 1)
        : x.includes("MED Harbolnas")
        ? splitProduct.splice(i, 1)
        : x.includes("Serbu OS")
        ? splitProduct.splice(i, 1)
        : x.includes("Diskon Pengguna Baru")
        ? splitProduct.splice(i, 1)
        : x.includes("Grosir")
        ? splitProduct.splice(i, 1)
        : x.length < 9 && x.includes("Terlaris")
        ? splitProduct.splice(i, 1)
        : x.includes("Cashback")
        ? splitProduct.splice(i, 1)
        : x.includes("Brand Pilihan")
        ? splitProduct.splice(i, 1)
        : x.endsWith("%")
        ? splitProduct.splice(i, 1)
        : x.startsWith("Sisa")
        ? splitProduct.splice(i, 1)
        : x.startsWith("Rp") && x.endsWith("pcs") && splitProduct.splice(i, 1)
    );
    splitProduct[2].startsWith("Rp") && splitProduct.splice(2, 1);
    // console.log(splitProduct);
    // console.log(splitProduct.length);

    // splitProduct.length === 6
    //   ? (obj = {
    //       id: i * pages,
    //       image_url: getImage,
    //       name_product: splitProduct[0],
    //       price_product: splitProduct[1],
    //       name_seller: splitProduct[3],
    //       seller_type: getLabel,
    //       seller_location: splitProduct[2],
    //       star_product: splitProduct[4],
    //       sold_product: splitProduct[5],
    //       page: pages,
    //     })
    //   : splitProduct.length === 5
    //   ? (obj = {
    //       id: i * pages,
    //       image_url: getImage,
    //       name_product: splitProduct[0],
    //       price_product: splitProduct[1],
    //       name_seller: splitProduct[3],
    //       seller_type: getLabel,
    //       seller_location: splitProduct[2],
    //       star_product: "-",
    //       sold_product: splitProduct[5],
    //       page: pages,
    //     })
    //   : splitProduct.length === 4 &&
    //     (obj = {
    //       id: i * pages,
    //       image_url: getImage,
    //       name_product: splitProduct[0],
    //       price_product: splitProduct[1],
    //       name_seller: splitProduct[3],
    //       seller_type: getLabel,
    //       seller_location: splitProduct[2],
    //       star_product: "-",
    //       sold_product: "-",
    //       page: pages,
    //     });

    // result.push(obj);
  }
  // console.log(result);
  // await page.close();
};

// fs.writeFile("output.json", JSON.stringify(result), "utf8", function (err) {
//   if (err) {
//     console.log("An error occured while writing JSON Object to File.");
//     return console.log(err);
//   }

//   console.log("JSON file has been saved.");
// });
