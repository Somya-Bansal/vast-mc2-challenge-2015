function filterOutliersLineChart(finalarr, idfreq, Nstdev = 1) {
    let idarr = [...idfreq]
    let sum = 0
    idarr.forEach(ele => {
        sum += ele[1]
    })
    let mean = (sum / idarr.length) || 0;
    let stdev_num = 0
    idarr.forEach((d) => {
        stdev_num = stdev_num + Math.pow(d[1] - mean, 2)
    })
    let stdev = Math.sqrt(stdev_num / idarr.length)

    finalarr = finalarr.filter((d) => {
        return (idfreq.get(d.SenderId_network) <= stdev * Nstdev && idfreq.get(d.ReceiverId_network) <= stdev * Nstdev);
    });
    return finalarr;
}

function frequencyAnalyzer(arr, interval) {
    var frequency;
    switch (interval) {
        case "hour":
            frequency = new Array(24)
            for (let i = 0; i < 24; i++)
                frequency[i] = 0;

            function hoursplit(ts) {
                frequency[ts.Timestamp_network.getHours() - 1]++;
            }
            arr.map(hoursplit);
            break;
        case "quarter":
            frequency = new Array(96)
            for (let i = 0; i < 96; i++)
                frequency[i] = 0;

            function quartersplit(ts) {
                frequency[(ts.Timestamp_network.getHours() * 4) + (Math.floor(ts.Timestamp_network.getMinutes() / 15)) - 1]++;
            }
            arr.map(quartersplit);
            break;
        case "half":
            frequency = new Array(48)
            for (let i = 0; i < 48; i++)
                frequency[i] = 0;

            function halfsplit(ts) {
                frequency[(ts.Timestamp_network.getHours() * 2) + (Math.floor(ts.Timestamp_network.getMinutes() / 30)) - 1]++;
            }
            arr.map(halfsplit);
            break;
        default:
            frequency = new Array(24)
            for (let i = 0; i < 24; i++)
                frequency[i] = 0;

            function hoursplit(ts) {
                frequency[ts.Timestamp_network.getHours() - 1]++;
            }
            arr.map(hoursplit);
            break;
    }
    return frequency;
}

function locFilter(arr, loc, ext, outlier) {
    // external filtering
    if(!ext)
        arr = arr.filter(d => d.ReceiverId_network !== -1)
    // bar chart selected id filtering
    if(selected_userID !== null)
        arr = arr.filter(d => commType == "sender" ? d.SenderId_network == selected_userID : d.ReceiverId_network == selected_userID)
    switch(loc) {
        case "2":
            arr = arr.filter(d => d.Location == "Entry Corridor")
            break;
        case "3":
            arr = arr.filter(d => d.Location == "Kiddie Land")
            break;
        case "4":
            arr = arr.filter(d => d.Location == "Tundra Land")
            break;
        case "5":
            arr = arr.filter(d => d.Location == "Wet Land")
            break;
        case "6":
            arr = arr.filter(d => d.Location == "Coaster Alley")
            break;
        default:
            arr = arr;
            break;
    }

    // Outlier filtering, only when no user id is selected
    if(!outlier && selected_userID === null) {
        let idFreq = new Map()
        arr.forEach(ele => {
            let rd = idFreq.get(ele.ReceiverId_network)
            let sd = idFreq.get(ele.SenderId_network)
            if(rd !== undefined)
                idFreq.set(ele.ReceiverId_network, rd + 1)
            else
                idFreq.set(ele.ReceiverId_network, 1)

            if(sd !== undefined)
                idFreq.set(ele.SenderId_network, sd + 1)
            else
                idFreq.set(ele.SenderId_network, 1)
        })
        arr = filterOutliersLineChart(arr, idFreq, 1)
    }

    return arr;
}

function drawLineChart(fri_data, sat_data, sun_data) {

    // Grab from elements
    var day = d3.select("#weekend-day-select").property("value");
    var loc = d3.select("#location-select").property("value");
    let interval = d3.select("#interval-select").property("value");
    let ext = document.getElementById('extcomm').checked
    let outlier = document.getElementById('outliers').checked;

    const width = 1000
    const height = 600
    const margin = {
        top: 20,
        right: 30,
        bottom: 60,
        left: 100
    }
    const innerHeight = height - margin.top - margin.bottom
    const innerWidth = width - margin.left - margin.right
    
    var svg = d3.select("#svglinechart");
    svg.selectAll("*").remove();

    // Calculate communication frequenices within chosen interval
    var frequency = [];
    switch (day) {
        case "2":
            fri_data = locFilter(fri_data, loc, ext, outlier)
            frequency = frequencyAnalyzer(fri_data, interval);
            break;
        case "3":
            sat_data = locFilter(sat_data, loc, ext, outlier)
            frequency = frequencyAnalyzer(sat_data, interval);
            break;
        case "4":
            sun_data = locFilter(sun_data, loc, ext, outlier)
            frequency = frequencyAnalyzer(sun_data, interval);
            break;
        case "1":
            fri_data = locFilter(fri_data, loc, ext, outlier)
            sat_data = locFilter(sat_data, loc, ext, outlier)
            sun_data = locFilter(sun_data, loc, ext, outlier)
            frequency = [frequencyAnalyzer(fri_data, interval), frequencyAnalyzer(sat_data, interval), frequencyAnalyzer(sun_data, interval)];
            break;
    }

    var parseTime = d3.timeParse("%H:%M:%S");
    var parseHour = d3.timeParse("%H")
    var parseHourMin = d3.timeParse("%H:%M")

    // Keep track of time intervals for hover interactions
    var timeData = [];
    const maxtime = interval == "quarter" ? 96 : interval == "half" ? 48 : 24
    for (var i = 0; i < maxtime; i++) {
        if (interval == "quarter") {
            var totalmins = (i + 1) * 15;
            var h = Math.floor(totalmins / 60);
            var m = Math.floor(totalmins % 60);
            timeData.push(parseTime(`${h}:${m}:0`))
        } else if (interval == "half") {
            var totalmins = (i + 1) * 30;
            var h = Math.floor(totalmins / 60);
            var m = Math.floor(totalmins % 60);
            timeData.push(parseTime(`${h}:${m}:0`))
        } else {
            timeData.push(parseTime(`${i + 1}:0:0`))
        }
    }

    // X Axis
    var timePads = [parseTime("00:00:01"), parseTime("23:59:59")];

    var domain = [timePads[0], timePads[1]];

    var xScale = d3.scaleTime()
        .domain(domain)
        .range([margin.left, margin.left + innerWidth]);

    var xAxis = d3.axisBottom(xScale);

    svg.append("g")
        .attr("transform", `translate(0,${innerHeight + margin.top})`)
        .call(xAxis.ticks(d3.timeHour.every(1)));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "labelBar")
        .attr("x", (width + 100) / 2)
        .attr("y", innerHeight + 60)
        .text("Time");

    // Y Axis
    var maxcomms = d3.extent(frequency);
    if (day == "1")
        maxcomms = d3.extent([0, d3.max(frequency[0]), d3.max(frequency[1]), d3.max(frequency[2])])
    var yScale = d3.scaleLinear()
        .domain(maxcomms)
        .range([innerHeight + margin.top, margin.top]);

    var yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis);

    svg.append("text")
        .attr("id", "ylabel")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", 30)
        .attr("dy", ".75em")
        .attr("class", "labelBar")
        .attr("transform", "rotate(-90)")
        .text("Amount of Communications");

    // Lines
    if (day == "1") {
        const legend_keys = ["Friday", "Saturday", "Sunday"]
        const color_keys = ["#0a9396", "#ca6702", "#ee9b00"]
        for (var i = 0; i < frequency.length; i++) {
            var color = color_keys[i] //i == 0 ? "#0a9396" : i == 1 ? "#ca6702" : "#ee9b00"
            svg.append("path")
                .datum(frequency[i])
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d, i) {
                        switch (interval) {
                            case "hour":
                                return xScale(parseHour(i + 1))
                            case "half":
                                var totalmins = (i + 1) * 30;
                                var h = Math.floor(totalmins / 60);
                                var m = Math.floor(totalmins % 60);
                                return xScale(parseHourMin(`${h}:${m}`))
                            case "quarter":
                                var totalmins = (i + 1) * 15;
                                var h = Math.floor(totalmins / 60);
                                var m = Math.floor(totalmins % 60);
                                return xScale(parseHourMin(`${h}:${m}`))
                            default:
                                return xScale(parseHour(i + 1))
                        }
                    })
                    .y(function (d) { return yScale(+d) })
                )
        }

        // Line Legend
        var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
            .enter().append("g")
            .attr("class", "lineLegend")
            .attr("transform", function(d, i) { return("translate(" + (width - (margin.left + 110)) + ", "+ (10 + (20 * i)) + ")"); });

        lineLegend.append("text").text(function (d) { return d; })
            .attr("font-size", "12px")
            .attr("transform", "translate(15,9)"); //align texts with boxes

        lineLegend.append("rect")
            .attr("fill", function(d, i) { return(color_keys[i]); })
            .attr("width", 10).attr("height", 10);
    } else {
        svg.append("path")
            .datum(frequency)
            .attr("fill", "none")
            .attr("stroke", "#005f73")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) {
                    switch (interval) {
                        case "hour":
                            return xScale(parseHour(i + 1))
                        case "half":
                            var totalmins = (i + 1) * 30;
                            var h = Math.floor(totalmins / 60);
                            var m = Math.floor(totalmins % 60);
                            return xScale(parseHourMin(`${h}:${m}`))
                        case "quarter":
                            var totalmins = (i + 1) * 15;
                            var h = Math.floor(totalmins / 60);
                            var m = Math.floor(totalmins % 60);
                            return xScale(parseHourMin(`${h}:${m}`))
                        default:
                            return xScale(parseHour(i + 1))
                    }
                })
                .y(function (d) { return yScale(+d) })
            )
    }

    // Day and Location Legend
    let infoTags = [day, loc]
    const uidType = `${commType}: ${selected_userID}`
    if(selected_userID !== null)
        infoTags.push(uidType)
    const day_keys = ['All Days', 'Friday', 'Saturday', 'Sunday']
    const loc_keys = ['All Locations', 'Entry Corridor', 'Kiddie Land', 'Tundra Land', 'Wet Land', 'Coaster Alley']
    let tagLegend = svg.selectAll(".daylocLegend").data(infoTags)
        .enter().append("g")
        .attr("class", "tagLegend")
        .attr("transform", function(d,i) { return(`translate(${margin.left + 20},${margin.top + (margin.top*i)})`); });

    tagLegend.append("text").text(function (d, i) { return (i == 0 ? day_keys[d - 1] : i == 1 ? loc_keys[d - 1] : d); })
        .attr("font-size", "12px");

    // Interactions
    // Interaction circle
    var ttdiv;
    if (d3.select(".tooltip").empty())
        ttdiv = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);
    else
        ttdiv = d3.select(".tooltip");
    var bisect = d3.bisector(function (d) { return d.x; }).left;
    // Create the circle that travels along the curve of chart
    var focus = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 10)
        .style("opacity", 0)

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);


    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
        focus.style("opacity", 1)
        ttdiv.style("opacity", 1)
    }
    function mousemove(e) {
        // recover coordinate we need
        var x0 = Math.floor(xScale.invert(d3.pointer(e)[0]));
        var i = d3.bisect(timeData, x0, 0);

        var ttstr
        switch (interval) {
            case "quarter":
                var totalmins = (i) * 15;
                var h = Math.floor(totalmins / 60);
                var m = Math.floor(totalmins % 60);

                ttstr = `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[i - 1];
                focus
                    .attr("cx", xScale(parseHourMin(`${h}:${m}`)))
                    .attr("cy", yScale(frequency[i - 1]))
                if (day == "1") {
                    ttstr = "Friday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[0][i - 1]
                        + "<br/>------<br/>Saturday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[1][i - 1]
                        + "<br/>------<br/>Sunday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[2][i - 1];
                    focus
                        .attr("cx", xScale(parseHourMin(`${h}:${m}`)))
                        .attr("cy", yScale(d3.max([frequency[0][i - 1], frequency[1][i - 1], frequency[2][i - 1]])))
                }

                break;
            case "half":
                var totalmins = (i) * 30;
                var h = Math.floor(totalmins / 60);
                var m = Math.floor(totalmins % 60);

                ttstr = `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[i - 1];
                focus
                    .attr("cx", xScale(parseHourMin(`${h}:${m}`)))
                    .attr("cy", yScale(frequency[i - 1]))
                if (day == "1") {
                    ttstr = "Friday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[0][i - 1]
                        + "<br/>------<br/>Saturday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[1][i - 1]
                        + "<br/>------<br/>Sunday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[2][i - 1];
                    focus
                        .attr("cx", xScale(parseHourMin(`${h}:${m}`)))
                        .attr("cy", yScale(d3.max([frequency[0][i - 1], frequency[1][i - 1], frequency[2][i - 1]])))
                }
                break;
            default:
                ttstr = "Hour: " + i + "<br/>Frequency: " + frequency[i - 1];
                focus
                    .attr("cx", xScale(parseHour(i)))
                    .attr("cy", yScale(frequency[i - 1]))
                if (day == "1") {
                    ttstr = "Friday<br/>" + `Hour: ${i}` + "<br/>Frequency: " + frequency[0][i - 1]
                        + "<br/>------<br/>Saturday<br/>" + `Hour: ${i}` + "<br/>Frequency: " + frequency[1][i - 1]
                        + "<br/>------<br/>Sunday<br/>" + `Hour: ${i}` + "<br/>Frequency: " + frequency[2][i - 1];
                    focus
                        .attr("cx", xScale(parseHour(i)))
                        .attr("cy", yScale(d3.max([frequency[0][i - 1], frequency[1][i - 1], frequency[2][i - 1]])))
                }
                break;
        }
        if (i <= 0)
            focus.attr("cx", xScale(parseHour(0))).attr("cy", yScale(0));

        ttdiv
            .html(ttstr)
            .style('left', (e.pageX + 15) + 'px')
            .style('top', (e.pageY - 40) + 'px')
    }
    function mouseout() {
        focus.style("opacity", 0)
        ttdiv.style("opacity", 0)
    }
}