const fs = require("fs");

const parser = () => {
  const inputFilePath = "./stations.json";

  const outputFilePath = "./trains_stations.json";

  const json = fs.readFileSync(inputFilePath, "utf-8");

  const parsedData = JSON.parse(json);

  const object = {};

  parsedData.forEach((record) => {
    const { station, trains } = record;

    trains.forEach((train) => {
      if (!object[train]) {
        object[train] = [station];
      } else {
        object[train].push(station);
      }
    });
  });

  fs.writeFileSync(outputFilePath, JSON.stringify(object, null, 2));
};

parser();
