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
    this.migration = data.migration;
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

    //console.log(countryData);

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

    // draw markers
    let ids = this.migration.map((d) => d.id);
    let markctrData = countryData.filter((d) => ids.includes(d.id)); // get 44 countries
    let markCountries = map
      .selectAll("image")
      .data(markctrData)
      .join("image")
      .attr("class", "mark")
      .attr("width", 15)
      .attr("height", 15)
      .attr("xlink:href", "img/marker.png")
      .attr(
        "transform",
        (d) =>
          `translate(${this.projection([d.longitude, d.latitude])[0] - 8}, ${
            this.projection([d.longitude, d.latitude])[1] - 11
          })`
      );

    // draw data flow lines
    let lines = [];
    let flows = this.migration.filter(d => d.type === "Immigrants");
    flows.forEach(d => {
      if (d.od_id === "XX") return;
      let sourceID = d.od_id;
      let destID = d.id;
      let source = this.coordinates.find(d => d.country_code === sourceID);
      let dest = this.coordinates.find(d => d.country_code === destID);

      let sourceLong = +source.longitude;
      let sourceLat = +source.latitude;
      let destLong = +dest.longitude
      let destLat = +dest.latitude;

      source = [sourceLong, sourceLat]
      dest = [destLong, destLat]
      let toPush = {type: "LineString", coordinates: [source, dest]}
      lines.push(toPush)
    });
    //console.log(lines);

    map.selectAll("path")
      .data(lines)
      .enter()
      .append("path")
      .classed("line-string", true)
      .attr("d", function(d) { return path(d)})
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("stroke-width", 0.2);
  }
}
