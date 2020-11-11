class ToggleButton {
  constructor(isImmigration, updateFlow) {
    this.isImmigration = isImmigration;
    this.updateFlow = updateFlow;  
  }

  drawToggle() {
    // render toggle button
    let toolBar = d3
      .select("#tool-desc")
      .append("div")
      .attr("id", "tool-bar")
      .classed("toolbar", true);
    
    // default is Immigration
    let toggle = this.renderToggle(toolBar, `Switch to Emigration`);
    toggle.attr("id", "dvide");
    toggle.on("click", () => {
      this.updateFlow(toggle.node().checked);
    });
  }

  renderToggle(div, labelText) {
    div.append("text").text(labelText).classed("toggle-text", true);
    let label = div.append("label").classed("switch", true);

    let check = label
      .append("input")
      .attr("type", "checkbox")
      .property("checked", () => this.isImmigration);
    label.append("span").classed("slider round", true);
    return check;
  }

  updateLabel(isImmigration) {
    let label = isImmigration? "Emigration" : "Immigration";
    d3.select("#tool-bar").select(".toggle-text").text(`Switch to ${label}`);
  }
}
