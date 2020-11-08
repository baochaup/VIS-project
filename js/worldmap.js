class CountryData {
  constructor(type, id, name, properties, geometry, region, lat, long) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.properties = properties;
    this.geometry = geometry;
    this.region = region;
    this.latitude = lat;
    this.longitude = long;
  }
}

class WorldMap {
  constructor(data, activeYear, isImmigration, updateActCountry) {

    this.activeYear = activeYear;
    this.isImmigration =isImmigration;
    this.activeCountry = null;
    this.updateActCountry = updateActCountry;
    
    this.coordinates = data.coordinates;
    this.migration = data.migration;

    this.projection = d3.geoEquirectangular().scale(200).translate([700, 290]);
    //this.projection = d3.geoOrthographic().scale(250).translate([700, 250]);

    this.map = d3.select("#map-chart").append("svg");
    this.path = d3.geoPath().projection(this.projection);
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
        d.properties.name,
        d.properties,
        d.geometry,
        d.properties.region_un,
        lat,
        long
      );
    });

    //console.log(countryData);

    // draw countries
    let countries = this.map
      .selectAll("path")
      .data(countryData)
      .join("path")
      .attr("d", this.path)
      .attr("id", (d) => d.id)
      .attr("class", (d) => d.region)
      .classed("countries", true);

    // draw countries circles
    let circles = this.map
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
    let markCountries = this.map
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
      )
      .on("click", (event, d) => {
        this.updateCountry(d.id);
        this.updateActCountry(d.id);
      });
  }

  updateCountry(countryID) {
    this.activeCountry = countryID;
    this.drawLinks();
  }

  updateYear(year) {
    this.activeYear = year;
    this.drawLinks();
  }

  updateFlow(isImmigration) {
    this.isImmigration = isImmigration;
    this.drawLinks();
  }

  // draw data flow lines
  drawLinks() {

    // remove before drawing new lines
    this.map.select("#lines-group").remove();

    let linesGrp = this.map.append("g").attr("id", "lines-group");
    
    let lines = [];
    let type = this.isImmigration? "Immigrants" : "Emigrants";
    let flows = this.migration.filter(d => d.type === type && d.id === this.activeCountry);
    //console.log(flows);

    flows.forEach(d => {
      if (d.od_id === "XX" || d[this.activeYear] === 0 || isNaN(d[this.activeYear])) {
        return;
      }
      //console.log(d[year]);
      let sourceID = this.isImmigration? d.od_id : this.activeCountry;
      let destID = this.isImmigration? this.activeCountry : d.od_id;
      
      let source = this.coordinates.find(d => d.country_code === sourceID);
      let dest = this.coordinates.find(d => d.country_code === destID);

      //if (!source) console.log(d.od_id, d.origin_dest);
 
      let sourceLong = +source.longitude;
      let sourceLat = +source.latitude;
      let destLong = +dest.longitude;
      let destLat = +dest.latitude;

      source = [sourceLong, sourceLat]
      dest = [destLong, destLat]
      let toPush = {type: "LineString", coordinates: [source, dest]}
      lines.push(toPush)
    });
    //console.log(lines);

    linesGrp.selectAll("flow-path")
      .data(lines)
      .enter()
      .append("path")
      .classed("line-string", true)
      .attr("d", (d) => this.path(d));
  }
}
