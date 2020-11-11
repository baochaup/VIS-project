//import {legend} from "@d3/color-legend";

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
    this.isImmigration = isImmigration;
    this.activeCountry = null;
    this.updateActCountry = updateActCountry;

    this.coordinates = data.coordinates;
    this.migration = data.migration;

    // initialize projection
    this.rootProjection = d3
      .geoEquirectangular()
      .scale(223)
      .translate([700, 350]);
    this.projection = d3.geoEquirectangular(); // for zoom event

    // initialize svg and path
    this.map = d3.select("#map-chart").append("svg");
    this.path = d3.geoPath().projection(this.rootProjection);

    // initialize width and height
    this.width = document.getElementById("map-chart").clientWidth;
    this.height = document.getElementById("map-chart").clientHeight;

    // set scale
    // use log scale as the gap between smallest and largest is too great
    this.colorScaleIm = d3
      .scaleLog()
      .clamp(true)
      .unknown("gray")
      .range(["white", "red"])
      .domain([1, this.findMax("Immigrants")]);

    this.colorScaleEm = d3
      .scaleLog()
      .clamp(true)
      .unknown("gray")
      .range(["white", "blue"])
      .domain([1, this.findMax("Emigrants")]);
  }

  // find max value of immigration data
  findMax(str) {
    let max = 0;
    this.migration.forEach((d) => {
      // exclude unkown and total
      if (d.type === str && d.od_id !== "XX") {
        for (const [key, value] of Object.entries(d)) {
          if (!isNaN(key) && value > max) {
            max = value;
          }
        }
      }
    });
    return max;
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

    // draw markers
    let ids = this.migration.map((d) => d.id);
    let markctrData = countryData.filter((d) => ids.includes(d.id)); // get 44 countries
    let markCountries = this.map
      .selectAll("image")
      .data(markctrData)
      .join("image")
      .attr("class", "mark")
      .attr("width", 20)
      .attr("height", 20)
      .attr("xlink:href", "img/marker.png")
      .attr("x", (d) => this.rootProjection([d.longitude, d.latitude])[0] - 10)
      .attr("y", (d) => this.rootProjection([d.longitude, d.latitude])[1] - 13)
      .on("click", (event, d) => {
        this.updateCountry(d.id);
        this.updateActCountry(d.id);
      });

    this.projection
      .scale(this.rootProjection.scale())
      .translate(this.rootProjection.translate())
      .rotate(this.rootProjection.rotate());

    // add zooming and panning
    this.map.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [this.width, this.height],
        ])
        .translateExtent([
          [0, 0],
          [this.width, this.height],
        ])
        .scaleExtent([1, 8])
        .on("zoom", (event, d) => {
          countries.attr("transform", event.transform);
          markCountries.attr("transform", event.transform);

          // compute and update projection
          let scale = this.rootProjection.scale();
          let translate = this.rootProjection.translate();
          let t = event.transform;

          let tx = translate[0] * t.k + t.x;
          let ty = translate[1] * t.k + t.y;

          this.projection.scale(t.k * scale).translate([tx, ty]);

          this.drawLinks();
        })
    );
    this.drawLegend();
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
    this.drawLegend();
  }

  drawLegend() {
    this.map.select("defs").remove();
    this.map.select("#map-legend").remove();

    let colorScaleLabel = this.isImmigration
      ? "Number of Immigrants"
      : "Number of Emigrants";
    let colorScale = this.isImmigration ? this.colorScaleIm : this.colorScaleEm;

    let width = 300;
    let barHeight = 20;
    
    // set scale for axis
    let axisScale = d3
      .scaleLinear()
      .domain(colorScale.domain())
      .range([0, width]).nice();

    // set up axis
    let axis = (g) =>
      g
        .attr("class", "x-axis")
        .attr("transform", "translate(20, 570)")
        .call(
          d3
            .axisBottom(axisScale)
            .ticks(width / 50)
            .tickSize(-barHeight)
        );

    // use linearGradient for showing color scale
    const defs = this.map.append("defs");

    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "linear-gradient");

    // calculate stops
    linearGradient
      .selectAll("stop")
      .data(
        colorScale
          .ticks()
          .map((t, i, n) => ({
            offset: `${(100 * i) / n.length}%`,
            color: colorScale(t),
          }))
      )
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    // add axis and color bar
    let legend = this.map.append("g").attr("id", "map-legend");
    legend
      .append("g")
      .attr("transform", "translate(20, 550)")
      .append("rect")
      .attr("width", width)
      .attr("height", barHeight)
      .style("fill", "url(#linear-gradient)");

    legend.append("g").classed("axis", true).call(axis);

    // add label for the bar
    legend.append("text")
          .attr("x", "20")
          .attr("y", "540")
          .classed("legend-label", true)
          .text(colorScaleLabel);
  }

  // draw data flow lines
  drawLinks() {
    // remove before drawing new lines
    //this.map.select("#lines-group").remove();

    // clear highlight countries bf draw
    this.clearHighlight();

    //let linesGrp = this.map.append("g").attr("id", "lines-group");

    //let lines = [];
    let type = this.isImmigration ? "Immigrants" : "Emigrants";

    // select only countries has migration data with selected country
    let flows = this.migration.filter(
      (d) => d.type === type && d.id === this.activeCountry
    );

    flows.forEach((d) => {
      if (
        d.od_id === "XX" // ||
        //d[this.activeYear] === 0 ||
        //isNaN(d[this.activeYear])
      ) {
        return;
      }

      /*let sourceID = this.isImmigration ? d.od_id : this.activeCountry;
      let destID = this.isImmigration ? this.activeCountry : d.od_id;

      let source = this.coordinates.find((d) => d.country_code === sourceID);
      let dest = this.coordinates.find((d) => d.country_code === destID);

      let sourceLong = +source.longitude;
      let sourceLat = +source.latitude;
      let destLong = +dest.longitude;
      let destLat = +dest.latitude;

      //source = [sourceLong, sourceLat];
      //dest = [destLong, destLat];
      //let toPush = { type: "LineString", coordinates: [source, dest] };
      let toPush = {
        source: [sourceLong, sourceLat],
        dest: [destLong, destLat]
      };
      lines.push(toPush);

      linesGrp
        .selectAll("flow-line")
        .data(lines)
        .enter()
        .append("line")
        .classed("line-string", true)
        .attr("x1", d => this.projection(d.source)[0])
        .attr("y1", d => this.projection(d.source)[1])
        .attr("x2", d => this.projection(d.dest)[0])
        .attr("y2", d => this.projection(d.dest)[1]);*/

      // highlight filtered countries
      //this.map.select(`#${d.od_id}`).classed("country-highlight", true);
      this.map
        .select(`#${d.od_id}`)
        .classed("country-highlight", true)
        .style(
          // style-fill has higher priority than attr-fill
          "fill",
          this.isImmigration
            ? this.colorScaleIm(d[this.activeYear])
            : this.colorScaleEm(d[this.activeYear])
        );

      // draw red circle at filtered countries
      /*let highlight = this.coordinates.find((c) => c.country_code === d.od_id);
      this.map
        .append("circle")
        .classed("country-marker", true)
        .attr(
          "cx",
          this.projection([highlight.longitude, highlight.latitude])[0]
        )
        .attr(
          "cy",
          this.projection([highlight.longitude, highlight.latitude])[1]
        )
        .attr("r", 3);*/
    });

    // highlight selected country
    this.map
      .select(`#${this.activeCountry}`)
      .classed("selected-country", true)
      .style("fill", "burlywood");
  }

  clearHighlight() {
    this.map
      .selectAll(".country-highlight")
      .classed("country-highlight", false)
      .style("fill", "white");
    this.map
      .select(".selected-country")
      .classed("selected-country", false)
      .style("fill", "white");
    this.map.selectAll(".country-marker").remove();
  }
}
