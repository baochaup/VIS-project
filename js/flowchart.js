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
        this.innerRadius = 250;
        this.outerRadius = 260;
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

        let listCountries = [...countries];
        let listCountryNames = [];
        listCountries.forEach((d) => {
            listCountryNames.push(countryDict[d].name)
        })


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
                if(countries.has(d.od_id) && (d.id == "US" || d.od_id == "US")){
                    if(!isNaN(d[year])){
                        countryMatrix[countryDict[d.od_id].index][countryDict[d.id].index] = d[year];

                    }
                }
            }
        });

        let calc = d3.chordDirected()
            .padAngle(0.06)     // padding between entities (black arc)
            .sortSubgroups(d3.descending)
            (countryMatrix)

        // Inner Part of circle
        this.chart
            .datum(calc)
            .append("g").attr("id", "countryNames")
            .selectAll("g")
            .data(d => {
                console.log(d);
                console.log(d.groups);
                return d.groups; })
            .enter()
            .append("g").attr("transform", "translate(350, 350)").attr("class", "categories")
            .append("path")
            .style("fill", d => d3.interpolateRainbow(color(d.index)))
            .style("stroke", d => d3.rgb(d3.interpolateRainbow(color(d.index))).darker())
            .attr("d", d3.arc()
                .innerRadius(this.innerRadius)
                .outerRadius(this.outerRadius)
            )

        d3.selectAll(".categories").data(calc.groups)
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2;
            console.log(d.angle)})
            .append("text")
            .attr("dy", ".35em")
            .attr("transform", d => {
                console.log(d.angle * 180 / Math.PI - 90)
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") " +
                "translate(" + (this.innerRadius + 20) + ")" +
                    (d.angle > Math.PI ? "rotate(180)" : "")})
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .style("font-size", "10px")
            .text(d => listCountryNames[d.index]);

        //Add paths
        this.chart
            .datum(calc)
            .append("g").attr("transform", "translate(350, 350)")
            .selectAll("path")
            .data(function(d) { return d; })
            .enter()
            .append("path")
            .attr("d", d3.ribbonArrow()
                .radius(this.innerRadius)
            )
            .style("fill", d => d3.interpolateRainbow(color(d.source.index)))
            .style("stroke", d => d3.rgb(d3.interpolateRainbow(color(d.source.index))).darker())
            .style("opacity", .8);
    }
}
