function frequencyAnalyzer(arr, interval) {
    var frequency;
    switch (interval) {
        case "hour":
            frequency = new Array(24)
            for (let i = 0; i < 24; i++)
                frequency[i] = 0;

            function hoursplit(ts) {
                frequency[ts.Timestamp.getHours() - 1]++;
            }
            arr.map(hoursplit);
            break;
        case "quarter":
            frequency = new Array(96)
            for (let i = 0; i < 96; i++)
                frequency[i] = 0;

            function quartersplit(ts) {
                frequency[(ts.Timestamp.getHours() * 4) + (Math.floor(ts.Timestamp.getMinutes() / 15)) - 1]++;
            }
            arr.map(quartersplit);
            break;
        case "half":
            frequency = new Array(48)
            for (let i = 0; i < 48; i++)
                frequency[i] = 0;

            function halfsplit(ts) {
                frequency[(ts.Timestamp.getHours() * 2) + (Math.floor(ts.Timestamp.getMinutes() / 30)) - 1]++;
            }
            arr.map(halfsplit);
            break;
        default:
            frequency = new Array(24)
            for (let i = 0; i < 24; i++)
                frequency[i] = 0;

            function hoursplit(ts) {
                frequency[ts.Timestamp.getHours() - 1]++;
            }
            arr.map(hoursplit);
            break;
    }
    return frequency;
}

function drawLineChart(fri_data, sat_data, sun_data) {

    // Grab from elements
    var day = d3.select("#weekend-day-select").property("value");
    var interval = "hour";

    var xmargin = 100;
    var ymargin = 60;

    var offset = 5;

    var width = 1000, height = 600;
    var xAxisTranslate = height / 2 + ymargin;
    var svg = d3.select("#svglinechart");
    svg.selectAll("*").remove();

    // Calculate communication frequenices within chosen interval
    var timestamps = [];
    var frequency = [];
    switch (day) {
        case "2":
            frequency = frequencyAnalyzer(fri_data, interval);
            break;
        case "3":
            frequency = frequencyAnalyzer(sat_data, interval);
            break;
        case "4":
            frequency = frequencyAnalyzer(sun_data, interval);
            break;
        case "1":
            frequency = [frequencyAnalyzer(fri_data, interval), frequencyAnalyzer(sat_data, interval), frequencyAnalyzer(sun_data, interval)];
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
        .range([0, width - 100]);

    var xAxis = d3.axisBottom(xScale);

    svg.append("g")
        .attr("transform", "translate(" + xmargin + "," + xAxisTranslate + ")")
        .call(xAxis.ticks(d3.timeHour.every(1)));

    svg.append("text")
        .attr("transform", "translate(500,400)")
        .style("text-anchor", "middle")
        .text("Time");

    // Y Axis
    var maxcomms = d3.extent(frequency);
    if (day == "1")
        maxcomms = d3.extent([0, d3.max(frequency[0]), d3.max(frequency[1]), d3.max(frequency[2])])
    var yScale = d3.scaleLinear()
        .domain(maxcomms)
        .range([height / 2, 0]);

    var yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", "translate(" + xmargin + ", " + ymargin + ")")
        .call(yAxis);

    svg.append("text")
        .attr("id", "ylabel")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(50,200)rotate(-90)")
        .text("Amount of Communications");

    // Lines
    if (day == "1") {
        for (var i = 0; i < frequency.length; i++) {
            var color = i == 0 ? "#0a9396" : i == 1 ? "#ca6702" : "#ee9b00"
            svg.append("path")
                .attr('transform', `translate(${xmargin},${ymargin})`)
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
    } else {
        svg.append("path")
            .attr('transform', `translate(${xmargin},${ymargin})`)
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
        .attr('transform', 'translate(' + xmargin + ',' + 0 + ')')
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);


    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
        focus.style("opacity", 1)
        ttdiv.style("opacity", 1)
    }
    function mousemove() {
        // recover coordinate we need
        var x0 = Math.floor(xScale.invert(d3.mouse(this)[0]));
        var i = d3.bisect(timeData, x0, 0);

        var ttstr
        switch (interval) {
            case "quarter":
                var totalmins = (i) * 15;
                var h = Math.floor(totalmins / 60);
                var m = Math.floor(totalmins % 60);

                ttstr = `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[i - 1];
                focus
                    .attr("cx", xScale(parseHourMin(`${h}:${m}`)) + xmargin)
                    .attr("cy", yScale(frequency[i - 1]) + ymargin)
                if (day == "1") {
                    ttstr = "Friday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[0][i - 1]
                        + "<br/>------<br/>Saturday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[1][i - 1]
                        + "<br/>------<br/>Sunday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[2][i - 1];
                    focus
                        .attr("cx", xScale(parseHourMin(`${h}:${m}`)) + xmargin)
                        .attr("cy", yScale(d3.max([frequency[0][i - 1], frequency[1][i - 1], frequency[2][i - 1]])) + ymargin)
                }

                break;
            case "half":
                var totalmins = (i) * 30;
                var h = Math.floor(totalmins / 60);
                var m = Math.floor(totalmins % 60);

                ttstr = `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[i - 1];
                focus
                    .attr("cx", xScale(parseHourMin(`${h}:${m}`)) + xmargin)
                    .attr("cy", yScale(frequency[i - 1]) + ymargin)
                if (day == "1") {
                    ttstr = "Friday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[0][i - 1]
                        + "<br/>------<br/>Saturday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[1][i - 1]
                        + "<br/>------<br/>Sunday<br/>" + `Hour: ${h}:${m}` + "<br/>Frequency: " + frequency[2][i - 1];
                    focus
                        .attr("cx", xScale(parseHourMin(`${h}:${m}`)) + xmargin)
                        .attr("cy", yScale(d3.max([frequency[0][i - 1], frequency[1][i - 1], frequency[2][i - 1]])) + ymargin)
                }
                break;
            default:
                ttstr = "Hour: " + i + "<br/>Frequency: " + frequency[i - 1];
                focus
                    .attr("cx", xScale(parseHour(i)) + xmargin)
                    .attr("cy", yScale(frequency[i - 1]) + ymargin)
                if (day == "1") {
                    ttstr = "Friday<br/>" + `Hour: ${i}` + "<br/>Frequency: " + frequency[0][i - 1]
                        + "<br/>------<br/>Saturday<br/>" + `Hour: ${i}` + "<br/>Frequency: " + frequency[1][i - 1]
                        + "<br/>------<br/>Sunday<br/>" + `Hour: ${i}` + "<br/>Frequency: " + frequency[2][i - 1];
                    focus
                        .attr("cx", xScale(parseHour(i)) + xmargin)
                        .attr("cy", yScale(d3.max([frequency[0][i - 1], frequency[1][i - 1], frequency[2][i - 1]])) + ymargin)
                }
                break;
        }
        if(i <= 0)
            focus.attr("cx", xScale(parseHour(0)) + xmargin).attr("cy", yScale(0) + ymargin);

        ttdiv
            .html(ttstr)
            .style('left', (d3.event.pageX + 15) + 'px')
            .style('top', (d3.event.pageY - 40) + 'px')
    }
    function mouseout() {
        focus.style("opacity", 0)
        ttdiv.style("opacity", 0)
    }
}