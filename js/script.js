loadData().then((data) => {

  const worldMap = new WorldMap(data);

  d3.json("data/world-geo.json").then((mapData) => {
    worldMap.drawMap(mapData);
  });
});

// ******* DATA LOADING *******

/**
 * A file loading function or CSVs
 * @param file
 * @returns {Promise<T>}
 */
async function loadFile(file) {
  let data = await d3.csv(file).then((d) => {
    let mapped = d.map((g) => {
      for (let key in g) {
        let numKey = +key;
        if (numKey) {
          g[key] = +g[key];
        }
      }
      return g;
    });
    return mapped;
  });
  return data;
}

async function loadData() {
  let gps = await loadFile('data/world_country_latitude_and_longitude_values.csv');

  return {
    'coordinates': gps,
  };
}
