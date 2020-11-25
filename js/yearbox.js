class YearBox {
  constructor(data, activeYear, years, updateYear) {
    this.years = years;
    this.activeYear = activeYear;
    this.updateYear = updateYear;
  }

  drawBox() {
    let that = this;

    d3.select("#tool-bar")
      .append("label")
      .attr("for", "year-box")
      .text("Select Year")
      .classed("toggle-text", true);

    d3.select("#tool-bar")
      .append("select")
      .attr("name", "year")
      .attr("id", "year-box")
      .on("change", function () {
        that.updateYear(this.options[this.selectedIndex].value);
      });

    this.years.forEach((y) => {
      d3.select("#year-box")
        .append("option")
        .attr("value", y)
        .text(y)
        .property("selected", () => y === this.activeYear);
    });
  }
}
