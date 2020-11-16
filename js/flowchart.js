class Country {
    constructor(id, name, index) {
        this.id = id;
        this.name = name;
        this.index = index;
    }
}

class FlowChart {
    constructor(data, activeYear, isImmigration, updateActCountry) {
        this.activeYear = activeYear;
        this.isImmigration = isImmigration;
        this.activeCountry = null;
        this.updateActCountry = updateActCountry;
        this.migration = data.migration;
        this.chart = d3.select("#flow-chart").append("svg");
    }

    drawChart(){
        let matrix = [
            [11975,  5871, 0, 0],
            [ 1951, 10048, 2060, 6171],
            [ 8010, 16145, 8090, 8045],
            [ 1013,   990,  940, 6907]
        ];

        let countries = new Set();
        let countryDict = {};
        let index = 0;

        this.migration.forEach((d) => {
            let size = countries.size
            if(countries.add(d.id).size > size){
                countryDict[d.id] = new Country(d.id, d.country_name, index)
                index++;
            }
        });

        //Create empty matrix
        let countryMatrix = []
        for(let i = 0; i < countries.size; i++){
            let arr = [];
            arr.length = countries.size;
            countryMatrix.push(arr.fill(0))
        }

        let color = d3.scaleLinear()
            .domain([0, 45])
            .range([0, 1])


        let year = 2013;

        this.migration.forEach((d) => {
            if(d.type == "Immigrants"){
                if(countries.has(d.od_id) && (d.id == "AU" || d.od_id == "AU")){
                    if(!isNaN(d[year])){
                        countryMatrix[countryDict[d.id].index][countryDict[d.od_id].index] = d[year];

                    }
                }
            }
        });

        let calc = d3.chordDirected()
            .padAngle(0.02)     // padding between entities (black arc)
            .sortSubgroups(d3.descending)
            (countryMatrix)

        // Inner Part of circle
        this.chart
            .datum(calc)
            .append("g").attr("id", "countryNames")
            .selectAll("g")
            .data(function(d) { return d.groups; })
            .enter()
            .append("g").attr("transform", "translate(350, 350)").attr("class", "categories")
            .append("path")
            //.style("fill", "grey")
            .style("fill", d => d3.interpolateRainbow(color(d.index)))
            .style("stroke", d => d3.rgb(d3.interpolateRainbow(color(d.index))).darker())
            .attr("d", d3.arc()
                .innerRadius(300)
                .outerRadius(310)
            )

        d3.selectAll(".categories").data(calc)
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2;
            console.log(d)})
            .append("text")
            .attr("dy", ".35em")
            .attr("transform", d => "rotate(" + d.angle * 180 / Math.PI - 90 + ") " +
                "translate(" + 300 + 26 + ")")
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text("test");

        //Add paths
        this.chart
            .datum(calc)
            .append("g").attr("transform", "translate(350, 350)")
            .selectAll("path")
            .data(function(d) { return d; })
            .enter()
            .append("path")
            .attr("d", d3.ribbonArrow()
                .radius(300)
            )
            .style("fill", d => d3.interpolateRainbow(color(d.source.index)))
            .style("stroke", d => d3.rgb(d3.interpolateRainbow(color(d.source.index))).darker())
            .style("opacity", .8);
    }
}
