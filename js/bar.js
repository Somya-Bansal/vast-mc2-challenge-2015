
var ReceiverId_freq = {};
var SenderId_freq = {};
var selected_frame = null;

var barSvg;
var barSvg2;

var ttdiv;

function computeStats(arr, Nstdev = 1) {

    let sum = arr.reduce((a, b) => a + b, 0)
    let mean = (sum / arr.length) || 0;
    let stdev_num = 0
    arr.forEach((d) => {
        stdev_num = stdev_num + Math.pow(d - mean, 2)
    })
    let stdev = Math.sqrt(stdev_num / arr.length)

    arr = arr.filter((d) => {
        return d <= stdev * Nstdev;
    });
    return arr;
}

function drawBar(day, loc, outlier_flag, extcomm_flag) {

    
    barSvg = d3.select('#barchart');
    barSvg2 = d3.select('#barchart2');
    barSvg.selectAll("*").remove();
    barSvg2.selectAll("*").remove();

    switch (day) {
        case "1":
            day_data = Array.prototype.concat(fri_data, sat_data, sun_data);
            break;
        case "2":
            day_data = fri_data;
            break;
        case "3":
            day_data = sat_data;
            break;
        case "4":
            day_data = sun_data;
            break;
        default:
            day_data = fri_data;
            break;
    }
    var loc_;
    switch (loc) {
        case "1":
            loc_ = "All";
            break;
        case "2":
            loc_ = "Entry Corridor";
            break;
        case "3":
            loc_ = "Kiddie Land";
            break;
        case "4":
            loc_ = "Tundra Land";
            break;
        case "5":
            loc_ = "Wet Land";
            break;
        case "6":
            loc_ = "Coaster Alley";
            break;
        default:
            loc_ = "All";
            break;
    }

    if (loc_ != 'All') {
        day_data = day_data.filter((d) => {
            return d.Location == loc_;
        })
    }

    // filter on extcomm flag here
    if (!extcomm_flag) {
        day_data = day_data.filter((d) => {
            return d.ReceiverId_network !== -1;
        })
    }

    SenderId_freq = {};
    ReceiverId_freq = {};
    var sIds = [];
    var rIds = [];

    day_data.forEach(d => {
        if (d.ReceiverId_network in ReceiverId_freq) {
            ReceiverId_freq[d.ReceiverId_network] += 1
        }
        else {
            ReceiverId_freq[d.ReceiverId_network] = 1
            rIds.push(parseInt(d.ReceiverId_network));
        }

        if (d.SenderId_network in SenderId_freq) {
            SenderId_freq[d.SenderId_network] += 1
        }
        else {
            SenderId_freq[d.SenderId_network] = 1
            sIds.push(parseInt(d.SenderId_network));
        }
    })

    rIds = rIds.sort((a, b) => { return ReceiverId_freq[b] - ReceiverId_freq[a] });
    sIds = sIds.sort((a, b) => { return SenderId_freq[b] - SenderId_freq[a] });

    sIds = !outlier_flag ? computeStats(sIds, Nstdev = 1) : sIds;
    rIds = !outlier_flag ? computeStats(rIds, Nstdev = 1) : rIds;

    sIds = sIds.slice(0, 20);
    rIds = rIds.slice(0, 20);

    console.log(sIds);

    barchart(sIds, SenderId_freq, barSvg, 'barchart', ylabel = 'Sender ID', xlabel = 'Frequency');
    barchart(rIds, ReceiverId_freq, barSvg2, 'barchart2', ylabel = 'Receiver ID', xlabel = 'Frequency')

    if (d3.select(".tooltip").empty())
        ttdiv = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);
    else
        ttdiv = d3.select(".tooltip");

}

function barchart(data, freq, svgelement, id, xlabel = '', ylabel = '') {


    const width = 650
    const height = 400
    const margin = {
        top: 60,
        right: 10,
        bottom: 10,
        left: 90
    }
    const innerHeight = height - margin.top - margin.bottom
    const innerWidth = width - margin.left - margin.right

    xScale = d3.scaleLinear()
        .domain([0, freq[data[0]]])
        .range([margin.left, margin.left+innerWidth]);

    yScale = d3.scaleBand()
        .domain(data)
        .range([margin.top, margin.top + innerHeight])
        .padding(0.3);

    xAxis = d3.axisTop(xScale)

    yAxis = d3.axisRight(yScale)
    .tickSizeInner(0);

    let xname = 'g#xscale_' + id;
    let yname = 'g#yscale_' + id;

    let g = svgelement
        .append('g')
        .attr('id', id);

    g.selectAll('g')
        .data(data)
        .enter()
        .append("rect")
        .attr('id', id)
        .attr("x", margin.left)
        .attr("y", function (d) { return yScale(d); })
        .attr("width", function (d) { return xScale(freq[d])-margin.left })
        .attr("height", yScale.bandwidth())
        .attr("class","barChartRect")
        .on('mouseover', mouseoverFunc)
        .on('mousemove', mousemoveFunc)
        .on('mouseout', mouseoutFunc)
        .on('click', mouseclickFunc);

    let x = g.append('g')
        .attr('id', xname)
        .attr('transform', `translate(0, ${margin.top})`)
        .call(xAxis);

    let y = g.append('g')
        .attr('id', yname)
        .attr("class","yaxisBar")
        .attr('transform', `translate(35,0)`)        
        .call(yAxis.tickFormat(function(d){return d!=-1 ? d : 'external'}));

    y.selectAll(".tick text")
    .attr("fill", "black")
    .attr('font-size', '12px');

    x.selectAll(".tick text")
    .attr("fill", "black")
    .attr('font-size', '12px');

    g.append("text")
        .attr("id", "label-y")
        .attr("class", "labelBar")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", margin.top/2-5)
        .text(ylabel);

    g.append('text')
        .attr("id", "label-x")
        .attr("class", "labelBar")
        .attr('transform', 'rotate(-90)')
        .attr("text-anchor", "middle")
        .attr("x", -height/2)
        .attr("y", 20)
        .text(xlabel);

}

function getfreqData(id) {
    if (id == 'barchart') {
        return [SenderId_freq, 'sender'];
    }
    else {
        return [ReceiverId_freq, 'receiver'];
    }
}

function mouseoverFunc(event, d) {
    var data;
    data = getfreqData(d3.select(this).attr('id'));
    d3.select(this)
        .classed("highlightedBar", true);
    ttdiv.transition()
        .duration(50)
        .style("opacity", 1);
    if (d == -1) {
        var userid = 'external';
    } else {
        userid = d;
    }
    ttdiv.html("User ID: " + userid + "<br/>Frequency: " + data[0][d])
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 15) + "px");

}
function mouseclickFunc(event, d) {
    var data;
    data = getfreqData(d3.select(this).attr('id'));
    selected.set_values = [d, data[1], true];

    if (selected_frame == this) {
        d3.select(selected_frame)
            .classed("highlightedBar", false);

        ttdiv.transition()
            .duration('50')
            .style("opacity", 0);
        selected_frame = null;
        selected.set_values = [null, null, true];
    }
    else {
        if (selected_frame != null) {
            d3.select(selected_frame)
                .classed("highlightedBar", false);

            ttdiv.transition()
                .duration('50')
                .style("opacity", 0);
        }

        selected_frame = this;

        d3.select(this)
            .classed("highlightedBar", true);
        ttdiv.transition()
            .duration(50)
            .style("opacity", 1);
    }

}
function mouseoutFunc(event, d) {
    if (selected_frame == null || this != selected_frame) {
        d3.select(this)
            .classed("highlightedBar", false);
        //Makes the new div disappear:
        ttdiv.transition()
            .duration('50')
            .style("opacity", 0);
    }
}

function mousemoveFunc(event, d) {

    ttdiv.style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px')
}