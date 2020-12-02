class Country {
    constructor(id, name, index) {
        this.id = id;
        this.name = name;
        this.index = index;
    }
}

class FlowChart {
    constructor(data, activeYear, isImmigration) {
        this.activeYear = activeYear;
        this.isImmigration = isImmigration;
        this.activeCountry = null;
        this.migration = data.migration;
        this.chart = d3.select("#flow-chart").append("svg");
        this.innerRadius = 250;
        this.outerRadius = 260;
        this.initChart();
    }

    updateYear(year) {
        this.activeYear = year;
        this.drawChart();
    }

    updateCountry(country) {
        this.activeCountry = country;
        this.drawChart();
    }

    initChart(){

        this.chart
            .append("g").attr("class", "paths").attr("transform", "translate(350, 350)");
        this.chart
            .append("g").attr("class", "countryNames");

        this.countries = new Set();
        this.countryDict = {};
        let index = 0;

        this.migration.forEach((d) => {
            let size = this.countries.size
            if(this.countries.add(d.id).size > size){
                this.countryDict[d.id] = new Country(d.id, d.country_name, index)
                index++;
            }
        });

        this.listCountries = [...this.countries];
        this.listCountryNames = [];
        this.listCountries.forEach((d) => {
            if(this.countryDict[d].id == "US"){
                this.listCountryNames.push("United States")
            }
            this.listCountryNames.push(this.countryDict[d].name)
        })

        this.colorScale = d3.scaleLinear()
            .domain([0, 45])
            .range([0, 1])
    }

    drawChart(){
        if(this.activeCountry == null){
            return;
        }

        //Create empty matrix
        let countryMatrix = []
        for(let i = 0; i < this.countries.size; i++){
            let arr = [];
            arr.length = this.countries.size;
            countryMatrix.push(arr.fill(0))
        }

        //Fill matrix with country data
        this.migration.forEach((d) => {
            if(d.type == "Immigrants"){
                if(this.countries.has(d.od_id) && (d.id == this.activeCountry || d.od_id == this.activeCountry)){
                    if(!isNaN(d[this.activeYear])){
                        countryMatrix[this.countryDict[d.id].index][this.countryDict[d.od_id].index] = d[this.activeYear];
                    }
                }
            }
        });

        //Cord calculations
        let layout = d3.chordDirected()
            .padAngle(0.06)
            .sortSubgroups(d3.descending)
            .sortChords(d3.ascending)
            (countryMatrix)

        let arc = d3.arc()
            .innerRadius(this.innerRadius)
            .outerRadius(this.outerRadius);

        //Create Country Arcs / Groups
        let countries = this.chart.selectAll("g.country")
            .data(layout.groups, function (d) {
                return d.index;
            });

        //Handle removed countries
        countries.exit()
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            .remove();

        //Handle new countries
        let newCountries = countries.enter().append("g").attr("transform", "translate(350, 350)")
            .attr("class", "country");

        //Add arcs
        newCountries.append("path")
            .attr("id", function (d) {
                return "group" + d.index;
            })
            .style("fill", d => d3.interpolateRainbow(this.colorScale(d.index)))
            .style("stroke", d => d3.rgb(d3.interpolateRainbow(this.colorScale(d.index))).darker())
            .attr("d", arc);

        //Add country labels
        newCountries
            .each(d => d.angle = (d.startAngle + d.endAngle) / 2)
            .append("text")
            .attr("dy", ".35em")
            .attr("transform", d => "rotate(" + (d.angle * 180 / Math.PI - 90) + ") " +
                "translate(" + (this.innerRadius + 20) + ")" +
                (d.angle > Math.PI ? "rotate(180)" : ""))
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .style("font-size", "10px")
            .text(d => this.listCountryNames[d.index]);

        //Update text labels
        countries.select("text").each(d => d.angle = (d.startAngle + d.endAngle) / 2)
            .transition()
            .duration(1000)
            .attr("transform", d => "rotate(" + (d.angle * 180 / Math.PI - 90) + ") " +
                "translate(" + (this.innerRadius + 20) + ")" +
                (d.angle > Math.PI ? "rotate(180)" : ""))
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => this.listCountryNames[d.index]);

        //Update country arcs
        countries.select("path")
            .transition()
            .duration(1000)
            .attr("d", arc);

        //Create paths
        let links = this.chart.selectAll("path.links")
            .data(layout);

        //Create new paths
        let newLinks = links.enter()
            .append("path")
            .attr("class", "links").attr("transform", "translate(350, 350)")
            .attr("opacity", 0.8)
            .style("fill", d => d3.interpolateRainbow(this.colorScale(d.source.index)))
            .style("stroke", d => d3.rgb(d3.interpolateRainbow(this.colorScale(d.source.index))).darker())
            .attr("d", d3.ribbonArrow()
                .radius(this.innerRadius));

        //Handle removed paths
        links.exit().transition()
            .duration(1000)
            .attr("opacity", 0)
            .remove();

        //Update paths
        links.transition()
            .duration(1000)
            .attr("opacity", 0.8)
            .style("fill", d => d3.interpolateRainbow(this.colorScale(d.source.index)))
            .style("stroke", d => d3.rgb(d3.interpolateRainbow(this.colorScale(d.source.index))).darker())
            .attr("d", d3.ribbonArrow()
                .radius(this.innerRadius));
    }
}
