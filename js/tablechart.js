class TableChart {
  constructor(data, activeCountry, activeYear) {
    this.headerData = [
      {
        sorted: false,
        ascending: false,
        key: "country",
      },
      {
        sorted: false,
        ascending: false,
        key: "immigrant",
      },
      {
        sorted: false,
        ascending: false,
        key: "emigrant",
      },
    ];

    this.margin = { top: 0, right: 10, bottom: 0, left: 10 };

    this.migration = data.migration;
    this.activeCountry = activeCountry;
    this.activeYear = activeYear;
    this.flows = null;

    this.axisHeight = 20;
    this.barWidth = 300 - this.margin.left - this.margin.right;
    this.barHeight = 20;

    // add 2 axis
    this.axisIm = d3.select("#marginAxisIm")
      .attr("width", this.barWidth + this.margin.left + this.margin.right)
      .attr("height", this.barHeight)
      .append("g")
      .attr("transform", `translate(${this.margin.left}, ${this.barHeight})`);

    this.axisEm = d3.select("#marginAxisEm")
      .attr("width", this.barWidth + this.margin.left + this.margin.right)
      .attr("height", this.barHeight)
      .append("g")
      .attr("transform", `translate(${this.margin.left}, ${this.barHeight})`);

    this.attachSortHandlers();
  }

  updateCountry(activeCountry) {
    this.activeCountry = activeCountry;
    this.updateData();
    this.drawTable();
  }

  updateYear(activeYear) {
    this.activeYear = activeYear;
    this.updateData();
    this.drawTable();
  }

  updateData() {
    this.flows = this.migration.filter(
      (d) => d.id === this.activeCountry
        && d.origin_dest !== "Total"
        && !isNaN(d[this.activeYear])
    );

    this.flows = this.flows.map(d => {
      return {
        id : d.id,
        ctrName : d.country_name,
        type : d.type,
        origin_dest : d.origin_dest,
        value : d[this.activeYear],
      };
    });
  }

  drawTable() {
    
    let flowsGrp = d3.group(this.flows, d => d.origin_dest);

    // compute scale for Immigrants
    let maxIm = d3.max(this.flows.filter(d => d.type === "Immigrants"), d => d.value);
    let maxEm = d3.max(this.flows.filter(d => d.type === "Emigrants"), d => d.value);
    
    let scaleIm = d3.scaleLinear()
      .domain([0, maxIm])
      .range([0, this.barWidth]);

    let scaleEm = d3.scaleLinear()
      .domain([0, maxEm])
      .range([0, this.barWidth]);

    // update axis for Immigrants
    this.axisIm
      .transition()
      .duration(1000)
      .call(
        d3
          .axisTop(scaleIm)
          .ticks(5)
      )
      .call((g) => g.select(".domain").remove());

    // update axis for Emigrants
    this.axisEm
      .transition()
      .duration(1000)
      .call(
        d3
          .axisTop(scaleEm)
          .ticks(5)
      )
      .call((g) => g.select(".domain").remove());

    let rowSelection = d3
      .select("#tableChartBody")
      .selectAll("tr")
      .data(flowsGrp)
      .join("tr");

    // transform data, and map to cell
    let tableSelection = rowSelection
      .selectAll("td")
      .data(this.rowToCellDataTransform)
      .join("td")
      .attr("class", (d) => d.class);

    // draw country names
    tableSelection.filter((d) => d.type === "text").text((d) => d.value);

    // draw bars for Immigrants
    let ImSelection = tableSelection.filter(
      (d) => d.type === "viz" && d.class === "immigrant"
    );

    let svgImSelect = ImSelection
      .selectAll("svg")
      .data((d) => [d])
      .join("svg")
      .attr("width", this.barWidth + this.margin.left + this.margin.right)
      .attr("height", this.barHeight);

    svgImSelect.selectAll("rect")
      .data((d) => [d])
      .join("rect")
      .classed("immigrant-bar", true)
      .transition()
      .duration(1000)
      .attr("x", this.margin.left)
      .attr("y", this.margin.top)
      .attr("width", (d) => maxIm ? scaleIm(d.value) : 0)
      .attr("height", this.barHeight); 

    // draw bars for Emigrants
    let EmSelection = tableSelection.filter(
      (d) => d.type === "viz" && d.class === "emigrant"
    );

    let svgEmSelect = EmSelection
      .selectAll("svg")
      .data((d) => [d])
      .join("svg")
      .attr("width", this.barWidth + this.margin.left + this.margin.right)
      .attr("height", this.barHeight);

    svgEmSelect.selectAll("rect")
      .data((d) => [d])
      .join("rect")
      .classed("emigrant-bar", true)
      .transition()
      .duration(1000)
      .attr("x", this.margin.left)
      .attr("y", this.margin.top)
      .attr("width", (d) => maxEm ? scaleEm(d.value) : 0)
      .attr("height", this.barHeight);   
  }

  rowToCellDataTransform(d) {
    
    let ctrInfo = {
      type: "text",
      class: "country",
      value: d[0],
    };

    let value = d[1].filter(d => d.type ==="Immigrants")[0];
    value = value ? value.value : 0;
    
    let immigrantInfo = {
      type: "viz",
      class: "immigrant",
      value: value,
    };

    value = d[1].filter(d => d.type ==="Emigrants")[0];
    value = value ? value.value : 0;

    let emigrantInfo = {
      type: "viz",
      class: "emigrant",
      value: value,
    };

    let dataList = [ctrInfo, immigrantInfo, emigrantInfo];

    return dataList;
  }

  attachSortHandlers() {
    d3.select("#columnHeaders")
      .selectAll("th")
      .data(this.headerData)
      .on("click", (event, d) => {

        if (!this.flows)
          return;
        
        if (d.ascending === true) {
          if (d.key === "country") {
            this.flows.sort((a, b) => d3.descending(a.origin_dest, b.origin_dest));
          }
          if (d.key === "immigrant") {
            this.flows.sort((a, b) => {
              if (a.type === "Immigrants" && b.type === "Immigrants") {
                return b.value - a.value;
              }
              return a.type < b.type ? 1 : -1;
            });
          }
          if (d.key === "emigrant") {
            this.flows.sort((a, b) => {
              if (a.type === "Emigrants" && b.type === "Emigrants") {
                return b.value - a.value;
              }
              return a.type > b.type ? 1 : -1;
            });
          }
          d.ascending = false;
        } else {
          if (d.key === "country") {
            this.flows.sort((a, b) => d3.ascending(a.origin_dest, b.origin_dest));
          }
          if (d.key === "immigrant") {
            this.flows.sort((a, b) => {
              if (a.type === "Immigrants" && b.type === "Immigrants") {
                return a.value - b.value;
              }
              return a.type < b.type ? 1 : -1;
            });
          }
          if (d.key === "emigrant") {
            this.flows.sort((a, b) => {
              if (a.type === "Emigrants" && b.type === "Emigrants") {
                return a.value - b.value;
              }
              return a.type > b.type ? 1 : -1;
            });
          }
          this.headerData.forEach((el) => (el.ascending = false));
          d.ascending = true;
        }
        this.headerData.forEach((el) => (el.sorted = false));
        d.sorted = true;

        this.drawTable();
      });
  }
}