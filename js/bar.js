
var ReceiverId_freq={};
var SenderId_freq={};
var selected_frame = null;

function computeStats(arr, Nstdev=1){

    sum = arr.reduce((a,b)=>a+b,0)
    mean = (sum/arr.length) || 0;
    stdev_num = 0
    arr.forEach((d)=>{
        stdev_num = stdev_num + Math.pow(d-mean, 2)
    })
    stdev = Math.sqrt(stdev_num/arr.length)
    
    arr = arr.filter((d)=>{
        return d <= stdev*Nstdev;
    });
    return arr;
}

function drawBar(day, loc, outlier_flag, extcomm_flag){

    switch (day) {
        case "1":
            day_data = Array.prototype.concat(fridata,saturdata,sundata);
            break;
        case "2":
            day_data = fridata;
            break;
        case "3":
            day_data = saturdata;
            break;
        case "4":
            day_data = sundata;
            break;
        default:
            day_data = fridata;
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
            loc_ = "Entry Corridor";
            break;
    }

    if (loc_ != 'All'){
        day_data = day_data.filter((d)=>{
            return d.Location==loc_;
        })
    }

    // filter on extcomm flag here
    if (!extcomm_flag){
        day_data = day_data.filter((d)=>{
            return d.ReceiverId!==-1;
        })
    }
    
    SenderId_freq = {};
    ReceiverId_freq = {};
    var sIds = [];
    var rIds = [];

    day_data.forEach(d=>{
        if (d.ReceiverId in ReceiverId_freq){
            ReceiverId_freq[d.ReceiverId]+=1
        }
        else{
            ReceiverId_freq[d.ReceiverId]=1
            rIds.push(parseInt(d.ReceiverId));
        }

        if (d.SenderId in SenderId_freq){
            SenderId_freq[d.SenderId]+=1
        }
        else{
            SenderId_freq[d.SenderId]=1
            sIds.push(parseInt(d.SenderId));
        }
    })

    rIds=rIds.sort((a,b)=>{return ReceiverId_freq[b]-ReceiverId_freq[a]});
    sIds=sIds.sort((a,b)=>{return SenderId_freq[b]-SenderId_freq[a]});

    sIds = !outlier_flag ? computeStats(sIds, Nstdev=1) : sIds;
    rIds = !outlier_flag ? computeStats(rIds, Nstdev=1) : rIds;

    sIds = sIds.slice(0,30);
    rIds = rIds.slice(0,30);

    barchart(sIds, SenderId_freq, barSvg, 'barchart', ylabel='Sender ID', xlabel='Frequency');
    barchart(rIds, ReceiverId_freq, barSvg2, 'barchart2', ylabel='Receiver ID', xlabel='Frequency' )

}

function barchart(data, freq, svgelement, id, xlabel='', ylabel=''){

    let xoffset=25;
    let yoffset=50;

    xScale = d3.scaleLinear()
            .domain([0,freq[data[0]]])
               .range([xoffset,500]);

    yScale = d3.scaleBand()
                .domain(data)
                .range([yoffset,500]).padding(0.1);

    xAxis = d3.axisTop(xScale).tickSizeOuter(0);
    yAxis = d3.axisRight(yScale).tickSizeInner(0);

    let element='g#'+id;
    let xname = 'g#xscale_'+id;
    let yname = 'g#yscale_'+id;
    svgelement.selectAll(element).remove();
    svgelement.selectAll(xname).remove();
    svgelement.selectAll(yname).remove();

    let g=svgelement
            .append('g')
            .attr('id',id);

    g.selectAll('g')
    .data(data)
    .enter()
    .append("rect")
      .attr('id',id)
      .attr("x", xScale(0))
      .attr("y", function(d) { return yScale(d); })
      .attr("width", function(d) {return xScale(freq[d])})
      .attr("height", yScale.bandwidth())
      .style('fill',"#b07aa1")
      .on('mouseover', mouseoverFunc)
      .on('mousemove', mousemoveFunc)
      .on('mouseout', mouseoutFunc)
      .on('click', mouseclickFunc);

    let x = g.append('g')
    .attr('id',xname)
    .attr('transform', `translate(${0}, ${yoffset})`)
    .call(xAxis);

    let y = g.append('g')
    .attr('id',yname)
    .attr('transform', `translate(${xoffset}, ${0})`)  
    .call(yAxis);

    y.selectAll(".tick text").attr("fill","black").attr('font-size','10px');

    g.append("text")
            .attr("id", "label-y")
            .attr("class", "x-label")
            .attr("fill",'gray')
            .attr("text-anchor", "middle")
            .attr("x", 250)
            .attr("y", yoffset/2)
            .text(ylabel);
  
    g.append('text')
            .attr("id", "label-x")
            .attr("class", "y-label")
            .attr("fill",'gray')
            .attr('transform', 'rotate(-90)')
            .attr("text-anchor", "middle")
            .attr("x", -250)
            .attr("y", 15)
            .text(xlabel);

}

function getfreqData(id){
    if (id == 'barchart'){
        return [SenderId_freq, 'sender'];
    }
    else{
        return [ReceiverId_freq, 'receiver'];
    }
}

function mouseoverFunc(d){
    var data;
    data = getfreqData(d3.select(this).attr('id'));
    d3.select(this)
        .classed("highlightedBar",true);
        div.transition()
           .duration(50)
           .style("opacity", 1);
    if (d == -1){
        d = 'external';
    }
    div.html("User ID: " +d+"<br/>Frequency: "+ data[0][d])
    .style("left", (d3.event.pageX + 10) + "px")
    .style("top", (d3.event.pageY - 15) + "px");

}
function mouseclickFunc(d){
    var data;
    data = getfreqData(d3.select(this).attr('id'));
    selected_userID = d;
    commType = data[1];

    if (selected_frame != null){
        d3.select(selected_frame)
    .classed("highlightedBar",false);
    //Makes the new div disappear:
    div.transition()
    .duration('50')
    .style("opacity", 0);
    }

    selected_frame = this;

    d3.select(this)
        .classed("highlightedBar",true);
        div.transition()
           .duration(50)
           .style("opacity", 1);
}
function mouseoutFunc(d){
    if (selected_frame == null){
        d3.select(this)
    .classed("highlightedBar",false);
    //Makes the new div disappear:
    div.transition()
    .duration('50')
    .style("opacity", 0);
    }
    else if(this!=selected_frame){
        d3.select(this)
    .classed("highlightedBar",false);
    //Makes the new div disappear:
    div.transition()
    .duration('50')
    .style("opacity", 0);
    }
}

function mousemoveFunc(d){

      div.style('left', (d3.event.pageX+10) + 'px')
         .style('top', (d3.event.pageY+10) + 'px')
}