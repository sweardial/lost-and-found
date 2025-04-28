const fs = require("fs");
const cheerio = require("cheerio");

function parseHTMLTable(html) {
  const $ = cheerio.load(html);

  const rows = [];

  const trElements = $("tr");

  if (trElements.length === 0) {
    console.log("No <tr> elements found in the HTML.");
    return rows;
  }

  trElements.each((index, tr) => {
    if (index % 100 === 0) {
      console.log(`Processing row ${index + 1}`);
    }

    const tdElements = $(tr).find("td");

    if (tdElements.length < 2) {
      return;
    }

    const firstTd = tdElements.eq(0);
    const secondTd = tdElements.eq(1);

    if (firstTd.length === 0 || secondTd.length === 0) {
      return;
    }

    const stationLink = firstTd.find("a").first();
    const station = stationLink.text().trim();

    const trains = [];
    secondTd.find("a").each((_, a) => {
      const train = $(a).attr("title");

      if (train) {
        const trainNameToUse = train.slice(0, train.indexOf("(")).trim();

        trains.push(trainNameToUse);
      }
    });

    if (station && trains.length > 0) {
      rows.push({
        station,
        trains,
      });
    }
  });

  return rows;
}

if (require.main === module) {
  const inputFilePath = "./file.html";
  const outputFilePath = "./output.json";

  const html = fs.readFileSync(inputFilePath, "utf-8");

  const parsedData = parseHTMLTable(html);

  fs.writeFileSync(outputFilePath, JSON.stringify(parsedData, null, 2));
  console.log(
    `Found ${parsedData.length} stations. Output written to ${outputFilePath}`
  );
}
