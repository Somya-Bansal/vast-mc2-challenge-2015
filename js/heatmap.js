function drawHeatmap(friData, satData, sunData, userInputs) {

    const dayByUser = userInputs[0];
    // const locationByUser = userInputs[1];
    const outlierFlag = userInputs[2];
    const externalFlag = userInputs[3];
    let dataToShow
    switch (dayByUser) {
        case "2":
            dataToShow = friData;
            break;
        case "3":
            dataToShow = satData;
            break;
        case "4":
            dataToShow = sunData;
            break;
        case "1":
            dataToShow = Array.prototype.concat(friData, satData, sunData);
            break;
    }
    // Filter for External Ids
    if (!externalFlag) {
        dataToShow = dataToShow.filter((d) => {
            return d.ReceiverId_network !== -1;
        })
    }
    // Filter for Outlier Ids
    const outlierIds = [1278894, 839736]
    if (!outlierFlag) {
        dataToShow = dataToShow.filter((d) => {
            return !outlierIds.includes(d.ReceiverId_network) && !outlierIds.includes(d.SenderId_network) ;
        })
    }

    let heatmapSvg = d3.select("#visHeatmap")
    heatmapSvg.selectAll("*").remove();
    width = +heatmapSvg.style('width').replace('px', '');
    height = +heatmapSvg.style('height').replace('px', '');
    const margin = { top: 20, right: 30, bottom: 60, left: 110 },
        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

    // Labels of row and columns
    let hoursInDay = new Array(24)
    for (let i = 8; i <= 23; i++)
        hoursInDay[i] = i;
    var locations = ["Entry Corridor", "Kiddie Land", "Tundra Land", "Wet Land", "Coaster Alley"]

    // prepare the data for the heatmap
    res = d3.rollup(
        dataToShow,
        // .filter((it) => new Date(it.Timestamp).getHours() <= 24),
        (d) => d.length,
        (d) => d.Location,
        (d) => (d.Timestamp_network.getHours()),
    );
    let data = []

    Array.from(res).forEach(item => {
        Array.from(item[1]).forEach(hourCount => {
            data.push({
                location: item[0],
                hour: hourCount[0],
                value: hourCount[1]
            })
        })
    })
    // console.log(data)

    const minColor = d3.min(data, d => d['value'])
    const maxColor = d3.max(data, d => d['value'])
    // console.log(minColor, maxColor)

    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([margin.left, margin.left + innerWidth])
        .domain(hoursInDay)
        .padding(0.05);
    heatmapSvg.append("g")
        .style("font-size", 15)
        .attr("transform", `translate(0,${innerHeight + margin.top})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()

    heatmapSvg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "heatmapLabel")
        .attr("x", (width + 100) / 2)
        .attr("y", innerHeight + 60)
        .text("Hour of the day");

    // Build X scales and axis:
    var y = d3.scaleBand()
        .range([innerHeight + margin.top, margin.top])
        .domain(locations)
        .padding(0.05);
    heatmapSvg.append("g")
        .attr("transform", `translate(${margin.left + 20}, 0)`)
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()
    heatmapSvg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "heatmapLabel")
        .attr("x", (-height / 2) + 25)
        .attr("y", 10)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Location");

    // Build color scale
    var myColor = d3.scaleLinear()
        .range(["#F1FAEE", "#005f73"])
        .domain([minColor, maxColor])

    // tooltip
    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    heatmapSvg.selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d['hour']))
        .attr("y", (d) => y(d['location']))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("ry", 4)
        .style("fill", (d) => myColor(d['value']))
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

    function mouseover(event, d) {
        tooltipDiv.transition()
            .duration(50)
            .style("opacity", 1)
            .style("stroke", "black")
        tooltipDiv.html(`Location: ${d['location']} <br> Hour: ${d['hour']} <br>  Count: ${d['value']}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 15) + "px");
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }

    function mouseout(event, d) {
        tooltipDiv.transition()
            .duration(50)
            .style("opacity", 0);
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

}
