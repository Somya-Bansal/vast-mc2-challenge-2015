function drawInnovativeChart(friData, satData, sunData, userInputs, caller) {

    const dayByUser = userInputs[0];
    const locationByUser = userInputs[1];
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
    const locationMap = {
        1: "All Locations",
        2: "Entry Corridor",
        3: "Kiddie Land",
        4: "Tundra Land",
        5: "Wet Land",
        6: "Coaster Alley"
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
            return !outlierIds.includes(d.ReceiverId_network) && !outlierIds.includes(d.SenderId_network);
        })
    }

    let innovativeSvg = d3.select("#visInnovative");
    innovativeSvg.selectAll("*").remove();
    width = +innovativeSvg.style('width').replace('px', '');
    height = +innovativeSvg.style('height').replace('px', '');

    locations = ["Entry Corridor", "Kiddie Land", "Tundra Land", "Wet Land", "Coaster Alley"]
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(locations);

    // User ID and communication type
    let userID;
    let commType;
    [userID, commType, hourFromHeatmap] = selected.get_values;

    let innovativeCommType;

    if (caller !== null) {
        // calls from form control
        innovativeCommType = document.querySelector('input[name="communicationTypeRadio"]:checked').value;
    }
    else {
        // called on changes to var `selected`
        if (commType == 'sender') {
            document.getElementById("commRadioSender").checked = "checked"
            document.getElementById("commRadioReceiver").checked = ""
            innovativeCommType = "sender";
        }
        else if (commType == 'receiver') {
            document.getElementById("commRadioSender").checked = ""
            document.getElementById("commRadioReceiver").checked = "checked"
            innovativeCommType = "receiver";
        }
        else {
            innovativeCommType = document.querySelector('input[name="communicationTypeRadio"]:checked').value;
        }
    }
    hourOnSlider = +document.querySelector("input[type=range]").value
    console.log(hourOnSlider)

    if (hourFromHeatmap != null) {
        document.querySelector("input[type=range]").value = hourFromHeatmap
    }

    res = d3.rollup(
        dataToShow.filter((it) => {
            // console.log("hourFromHeatmap - ",hourFromHeatmap);
            if (hourFromHeatmap != null) return new Date(it.Timestamp).getHours() <= hourFromHeatmap
            else return new Date(it.Timestamp).getHours() <= hourOnSlider
        }),
        (d) => d.length > 100 ? d.length : 0,
        (d) => d.Location,
        (d) => innovativeCommType === "receiver" ? d.ReceiverId : d.SenderId,
    );

    childrenAccessorFn = ([key, value]) => value.size && Array.from(value);
    hierarchyData = d3
        .hierarchy([null, res], childrenAccessorFn)
        .sum(([, value]) => value)
        .sort((a, b) => b.value - a.value);

    const root = d3.pack().size([width, height]).padding(0.5)(hierarchyData)
    let focus = root;
    let view;

    innovativeSvg
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .style("cursor", "pointer")
        .on("click", (event) => zoom(event, root));

    // tooltip
    let tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    const node = innovativeSvg.append("g")
        .style("border", "red")
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .join("circle")
        .style("fill", (d) => d.parent.data[0] == null ? "white" : colorScale(d.parent.data[0]))
        .attr('opacity', (d) => {
            if (locationMap[locationByUser] === "All Locations") return 0.6
            else return d.parent.data[0] == locationMap[locationByUser] ? "1" : '0.3'
        })
        .attr("stroke", (d) => d.data[0] == userID ? "black" : "")
        .attr("stroke-width", (d) => d.data[0] == userID ? "2px" : "")
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));


    const label = innovativeSvg.append("g")
        .style("font", "20px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", d => d.parent === root ? 0.5 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => {
            if (d.parent === root) {
                if (!d.value) return ""
                return d.data[0]
            }
        });

    zoomTo([root.x, root.y, root.r * 2]);

    function zoomTo(v) {
        const k = width / v[2];

        view = v;

        node.attr("r", d => isNaN(d.r * k) ? 0 : d.r * k);
        node.attr("transform", d => `translate(${isNaN((d.x - v[0]) * k) ? 0 : ((d.x - v[0]) * k)},${isNaN((d.y - v[1]) * k) ? 0 : (d.y - v[1]) * k})`);
        label.attr("transform", d => `translate(${isNaN((d.x - v[0]) * k) ? 0 : ((d.x - v[0]) * k)},${isNaN((d.y - v[1]) * k) ? 0 : (d.y - v[1]) * k})`);
    }

    function zoom(event, d) {
        const focus0 = focus;

        focus = d;

        const transition = innovativeSvg.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", d => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return t => {
                    return zoomTo(i(t))
                };
            });

    }


    function mouseover(event, d) {
        d3.select(this).attr("stroke", "#000");
        tooltipDiv.transition()
            .duration(50)
            .style("opacity", 1)
            .style("stroke", "black")
        tooltipDiv.html(`
            Location: ${d['parent']['data'][0] != null ? d['parent']['data'][0] : "Dino World"} <br> 
            Id: ${d['data'][0]} <br>  
            Count: ${d['value']}
        `)
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 25) + "px");
    }

    function mouseout(event, d) {
        d3.select(this).attr("stroke", d.data[0] == userID ? "black" : null);
        tooltipDiv.transition()
            .duration(50)
            .style("opacity", 0);
    }
    return innovativeSvg.node();


}
function update(h) {
    // update position and text of label according to slider scale
    handle.attr("cx", x(h));
    sliderLabel
        .attr("x", x(h))
        .text(formatDate(h));

    // filter data set and redraw plot
    var newData = dataset.filter(function (d) {
        return d.date < h;
    })
    drawPlot(newData);
}