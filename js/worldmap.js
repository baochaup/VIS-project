class CountryData {
  constructor(type, id, properties, geometry, region, lat, long) {
    this.type = type;
    this.id = id;
    this.properties = properties;
    this.geometry = geometry;
    this.region = region;
    this.latitude = lat;
    this.longitude = long;
  }
}

class WorldMap {
  constructor(data) {
    this.projection = d3.geoEquirectangular().scale(200).translate([700, 290]);
    this.coordinates = data.coordinates;
  }

  /**
   * Renders the map
   *
   */
  drawMap(mapData) {
    // build country data from geojson
    let countryData = mapData.features.map((d) => {
      let ctr = this.coordinates.find(
        (c) => c.country_code === d.properties.iso_a2
      );
      let lat = ctr ? ctr.latitude : "";
      let long = ctr ? ctr.longitude : "";

      return new CountryData(
        d.type,
        d.properties.iso_a2, // country's id in geojson file
        d.properties,
        d.geometry,
        d.properties.region_un,
        lat,
        long
      );
    });

    console.log(countryData);

    let path = d3.geoPath().projection(this.projection);

    let map = d3.select("#map-chart").append("svg");

    // draw countries
    let countries = map
      .selectAll("path")
      .data(countryData)
      .join("path")
      .attr("d", path)
      .attr("id", (d) => d.id)
      .attr("class", (d) => d.region)
      .classed("countries", true);

    // draw countries circles
    let circles = map
      .selectAll("circle")
      .data(countryData)
      .join("circle")
      .classed("country-marker", true)
      .attr("cx", (d) => this.projection([d.longitude, d.latitude])[0])
      .attr("cy", (d) => this.projection([d.longitude, d.latitude])[1])
      .attr("r", 2);
  }
}
