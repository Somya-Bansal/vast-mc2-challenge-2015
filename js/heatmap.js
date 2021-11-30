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

    [userID, commType, hourFromHeatmap] = selected.get_values;

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
            return !outlierIds.includes(d.ReceiverId_network) && !outlierIds.includes(d.SenderId_network);
        })
    }

    let heatmapSvg = d3.select("#visHeatmap")
    heatmapSvg.selectAll("*").remove();
    width = +heatmapSvg.style('width').replace('px', '');
    height = +heatmapSvg.style('height').replace('px', '');
    const margin = { top: 40, right: 20, bottom: 20, left: 60 },
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
        .domain(locations)
        .padding(0.1);
    heatmapSvg.append("g")
        .attr("class", "heatmapTicks")
        .attr("transform", `translate(0,${margin.top + 20})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()

    heatmapSvg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "heatmapLabel")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .text("Location");

    // Build Y scales and axis:
    var y = d3.scaleBand()
        .range([margin.top, innerHeight + margin.top])
        .domain(hoursInDay)
        .padding(0.05);
    heatmapSvg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .attr("class", "heatmapTicks")
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()
    heatmapSvg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "heatmapLabel")
        .attr("x", (-innerHeight / 2) - margin.top)
        .attr("y", 10)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Hour of the Day");

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
        .attr("x", (d) => x(d['location']))
        .attr("y", (d) => y(d['hour']))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("ry", 4)
        .style("fill", (d) => myColor(d['value']))
        .style("stroke", (d) => d['hour'] == hourFromHeatmap ? "black" : "")
        .attr("stroke-width", (d) => d['hour'] == hourFromHeatmap ? "2px" : "")
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('click', mouseclick);
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
        if (d['hour'] != hourFromHeatmap){

            tooltipDiv.transition()
                .duration(50)
                .style("opacity", 0);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }
    }
    function mouseclick(event, d) {
        console.log("Clicked", d['hour']);
        selected.set_values = [userID, commType, d['hour'], true];
        tooltipDiv.transition()
            .duration(50)
            .style("opacity", 0);
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

}
