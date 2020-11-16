

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
width = 700 - margin.left - margin.right,
height = 660 - margin.top - margin.bottom;



// append the svg object to the body of the page
var svg = d3.select("#world_ranking")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data

d3.csv('data/migflow.csv').then( function(data) {
   data.forEach(d => {
	if (d["1980"] == "..") {d["1980"] = "0"}
	d["1980"] = +d["1980"];
	if (d["1981"] == "..") {d["1981"] = "0"}
	d["1981"] = +d["1981"];
	if (d["1982"] == "..") {d["1982"] = "0"}
	d["1982"] = +d["1982"];
	if (d["1983"] == "..") {d["1983"] = "0"}
	d["1983"] = +d["1983"];
	if (d["1984"] == "..") {d["1984"] = "0"}
	d["1984"] = +d["1984"];
	if (d["1985"] == "..") {d["1985"] = "0"}
	d["1985"] = +d["1985"];
	if (d["1986"] == "..") {d["1986"] = "0"}
	d["1986"] = +d["1986"];
	if (d["1987"] == "..") {d["1987"] = "0"}
	d["1987"] = +d["1987"];
	if (d["1988"] == "..") {d["1988"] = "0"}
	d["1988"] = +d["1988"];
	if (d["1989"] == "..") {d["1989"] = "0"}
	d["1989"] = +d["1989"];
	if (d["1990"] == "..") {d["1990"] = "0"}
	d["1990"] = +d["1990"];
	if (d["1991"] == "..") {d["1991"] = "0"}
	d["1991"] = +d["1991"];
	if (d["1992"] == "..") {d["1992"] = "0"}
	d["1992"] = +d["1992"];
	if (d["1993"] == "..") {d["1993"] = "0"}
	d["1993"] = +d["1993"];
	if (d["1994"] == "..") {d["1994"] = "0"}
	d["1994"] = +d["1994"];
	if (d["1995"] == "..") {d["1995"] = "0"}
	d["1995"] = +d["1995"];
	if (d["1996"] == "..") {d["1996"] = "0"}
	d["1996"] = +d["1996"];
	if (d["1997"] == "..") {d["1997"] = "0"}
	d["1997"] = +d["1997"];
	if (d["1998"] == "..") {d["1998"] = "0"}
	d["1998"] = +d["1998"];
	if (d["1999"] == "..") {d["1999"] = "0"}
	d["1999"] = +d["1999"];
	if (d["2000"] == "..") {d["2000"] = "0"}
	d["2000"] = +d["2000"];
	if (d["2001"] == "..") {d["2001"] = "0"}
	d["2001"] = +d["2001"];
	if (d["2002"] == "..") {d["2002"] = "0"}
	d["2002"] = +d["2002"];
	if (d["2003"] == "..") {d["2003"] = "0"}
	d["2003"] = +d["2003"];
	if (d["2004"] == "..") {d["2004"] = "0"}
	d["2004"] = +d["2004"];
	if (d["2005"] == "..") {d["2005"] = "0"}
	d["2005"] = +d["2005"];
	if (d["2006"] == "..") {d["2006"] = "0"}
	d["2006"] = +d["2006"];
	if (d["2007"] == "..") {d["2007"] = "0"}
	d["2007"] = +d["2007"];
	if (d["2008"] == "..") {d["2008"] = "0"}
	d["2008"] = +d["2008"];
	if (d["2009"] == "..") {d["2009"] = "0"}
	d["2009"] = +d["2009"];
	if (d["2010"] == "..") {d["2010"] = "0"}
	d["2010"] = +d["2010"];
	if (d["2011"] == "..") {d["2011"] = "0"}
	d["2011"] = +d["2011"];
	if (d["2012"] == "..") {d["2012"] = "0"}
	d["2012"] = +d["2012"];
	if (d["2013"] == "..") {d["2013"] = "0"}
	d["2013"] = +d["2013"];
    });
    console.log(data);

    // X axis
    var x = d3.scaleBand()
	.range([ 0, width ])
	.domain(data.map(function(d) { return d.country_name; }))
	.padding(0.2);
    svg.append("g")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");
    
    // Add Y axis
    var y = d3.scaleLinear()
	.domain([0, 1000000])
	.range([ height, 0]);
    svg.append("g")
	.call(d3.axisLeft(y));
    
    // Bars
    svg.selectAll("mybar")
	.data(data)
	.enter()
	.append("rect")
	.attr("x", function(d) { return x(d.country_name); })
	.attr("y", function(d) { return y(d["2002"]); })
	.attr("width", x.bandwidth())
	.attr("height", function(d) { return height - y(d["2002"]); })
	.attr("fill", "#69b3a2")
    
});
