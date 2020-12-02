class LineChart {
  constructor(data, activeCountry, years) {
    this.margin = { top: 10, right: 30, bottom: 35, left: 75 };
    this.width = 700 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.migration = data.migration;
    this.activeCountry = activeCountry;
    this.years = years;

    this.chart = d3.select("#line-chart").append("svg");
    this.chart
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr("transform", `translate(0, 100)`);

    // obtain max total values
    this.maxVal = 0;
    this.findMax();

    // create scales
    // x scale for year
    this.xScale = d3
      .scaleLinear()
      .domain([d3.min(years), d3.max(years)])
      .range([this.margin.left, this.width]);
    //.nice();
    // y scale
    this.yScale = d3
      .scaleLinear()
      .domain([0, this.maxVal])
      .range([this.height, 0]);
    //.nice();
  }

  // find max total value of migration data
  findMax() {
    this.migration.forEach((d) => {
      if (d.od_id === "XX" && d.origin_dest === "Total") {
        for (const [key, value] of Object.entries(d)) {
          if (!isNaN(key) && value > this.maxVal) {
            this.maxVal = value;
          }
        }
      }
    });
  }

  drawChart() {
    // draw x axis
    this.chart
      .append("g")
      .attr("id", "x-axis-line")
      .attr("transform", `translate(0, ${this.height})`)
      .call(d3.axisBottom(this.xScale));

    // draw x axis label
    this.chart
      .append("text")
      .classed("x-axis-label", true)
      .text("Year")
      .style("text-anchor", "middle")
      .attr(
        "transform",
        `translate(${this.width / 2}, ${this.height + this.margin.bottom})`
      );

    // draw y axis
    this.chart
      .append("g")
      .attr("id", "y-axis-line")
      .attr("transform", `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale));

    // draw y axis label
    this.chart
      .append("text")
      .classed("y-axis-label", true)
      .text("Number of Migrants")
      .style("text-anchor", "middle")
      .attr("transform", `translate(15, ${this.height / 2})rotate(-90)`);

    // add line paths
    this.chart.append("path").attr("id", "immigration-line");
    this.chart.append("path").attr("id", "emigration-line");
    this.chart.append("path").attr("id", "gap-immigration-line");
    this.chart.append("path").attr("id", "gap-emigration-line");

    // add description
    d3.select("#line-chart").append("div")
      .classed("explain", true)
      .text("This chart shows number of immigrants and emigrants from 1980 to 2015.");
  }

  updateCountry(activeCountry) {
    this.activeCountry = activeCountry;
    this.drawLines();
  }

  drawLines() {
    this.cleanUp();

    // filter data by active country
    let filtered = this.migration.filter(
      (d) =>
        d.id === this.activeCountry &&
        d.od_id === "XX" &&
        d.origin_dest === "Total"
    );

    // re compute domains
    this.maxVal = 0;
    filtered.forEach((d) => {
      for (const [key, value] of Object.entries(d)) {
        if (!isNaN(key)) {
          this.maxVal = value > this.maxVal ? value : this.maxVal;
        }
      }
    });
    // update domain
    this.yScale.domain([0, this.maxVal]);
    // update y axis
    this.chart
      .select("#y-axis-line")
      .transition()
      .duration(1000)
      .call(d3.axisLeft(this.yScale));

    // line generator for both types
    let lineGenerator = d3
      .line()
      .defined((d) => !isNaN(d.num))
      .x((d) => this.xScale(d.year))
      .y((d) => this.yScale(d.num));

    // function to add animation to lines
    function animate(line) {
      let length = line.node().getTotalLength();
      line
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    }

    // for computing total number of immigrants and emigrants
    let totalIm = 0;
    let totalEm = 0;

    // compute data for immigration
    let im = filtered.filter((d) => d.type === "Immigrants")[0];
    let imdata = [];

    if (im) {
      for (const [key, value] of Object.entries(im)) {
        if (!isNaN(key)) {
          imdata.push({ year: +key, num: value });
          if (!isNaN(value)) {
            totalIm += value;
          }         
        }
      }
      //console.log(imdata);
      // draw gap line
      let gapLine = d3
        .select("#gap-immigration-line")
        .datum(imdata.filter(lineGenerator.defined()))
        .attr("d", lineGenerator);
      // draw line for immigration
      let segLine = d3
        .select("#immigration-line")
        .datum(imdata)
        .attr("d", lineGenerator);

      animate(gapLine);
      animate(segLine);
    }

    // compute data for emigration
    let em = filtered.filter((d) => d.type === "Emigrants")[0];
    let emdata = [];

    if (em) {
      for (const [key, value] of Object.entries(em)) {
        if (!isNaN(key)) {
          emdata.push({ year: +key, num: value });
          if (!isNaN(value)) {
            totalEm += value;
          } 
        }
      }
      //console.log(emdata);
      // draw gap line
      let gapLine = d3
        .select("#gap-emigration-line")
        .datum(emdata.filter(lineGenerator.defined()))
        .attr("d", lineGenerator);
      // draw line for emigration
      let segLine = d3
        .select("#emigration-line")
        .datum(emdata)
        .attr("d", lineGenerator);

      animate(gapLine);
      animate(segLine);
    }

    this.updateLegend(totalIm, totalEm);
  }

  updateLegend(totalIm, totalEm) {

    // obtain country name
    let ctrName = this.migration.filter(d => d.id === this.activeCountry)[0].country_name;

    // update country
    d3.select("#line-chart")
      .append("div")
      .attr("id", "line-country")
      .text(`Selected country: ${ctrName}`);

    // update total number of immigrants
    d3.select("#line-chart")
      .append("div")
      .attr("id", "line-totalIm")
      .text(`Total number of immigrants: ${totalIm.toLocaleString()}`);

    // update total number of emigrants
    d3.select("#line-chart")
      .append("div")
      .attr("id", "line-totalEm")
      .text(`Total number of emigrants: ${totalEm.toLocaleString()}`);
  }

  cleanUp() {
    // A null value will remove the specified attribute
    this.chart.select("#immigration-line").attr("d", null);
    this.chart.select("#emigration-line").attr("d", null);
    this.chart.select("#gap-immigration-line").attr("d", null);
    this.chart.select("#gap-emigration-line").attr("d", null);

    d3.select("#line-country").remove();
    d3.select("#line-totalIm").remove();
    d3.select("#line-totalEm").remove();
  }
}
