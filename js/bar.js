

function computeStats(arr, Nstdev=1){

    console.log("computing stats")
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
            day_data = fridata;
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
            loc_ = "Entry Corridor";
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

    day_data = day_data.filter((d)=>{
        return d.Location==loc_;
    })

    console.log(day, loc_, outlier_flag, extcomm_flag, day_data)

    // filter on extcomm flag here
    if (!extcomm_flag){
        day_data = day_data.filter((d)=>{
            return d.ReceiverId!==-1;
        })
    }
    

    var ReceiverId_freq=[];
    var SenderId_freq=[];
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

    barchart(sIds, SenderId_freq, barSvg, 'barchart');
    barchart(rIds, ReceiverId_freq, barSvg2, 'barchart2')


    // let xoffset=60;
    // let yoffset=30;

    // xScale = d3.scaleLinear()
    //         .domain([0,SenderId_freq[sIds[0]]])
    //            .range([xoffset,1000]);

    // yScale = d3.scaleBand()
    //             .domain(sIds)
    //             .range([yoffset,500]).padding(0.1);

    // xAxis = d3.axisTop(xScale).tickSizeOuter(0);
    // yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

    // barSvg.selectAll('g').remove();
    
    // let g=barSvg.append('g');

    // g.selectAll('g')
    // .data(sIds)
    // .enter().append("rect")
    //   .attr("x", xScale(0))
    //   .attr("y", function(d) { return yScale(d); })
    //   .attr("width", function(d) {return xScale(SenderId_freq[d])})
    //   .attr("height", yScale.bandwidth())
    //   .style('fill',"blue");

    // g.append('g')
    // .attr('transform', `translate(${0}, ${yoffset})`)
    // .call(xAxis);

    // g.append('g')
    // .attr('transform', `translate(${xoffset}, ${0})`)  
    // .call(yAxis);

}

function barchart(data, freq, svgelement, id){


    let xoffset=60;
    let yoffset=30;

    xScale = d3.scaleLinear()
            .domain([0,freq[data[0]]])
               .range([xoffset,1000]);

    yScale = d3.scaleBand()
                .domain(data)
                .range([yoffset,500]).padding(0.1);

    xAxis = d3.axisTop(xScale).tickSizeOuter(0);
    yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

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
      .attr("x", xScale(0))
      .attr("y", function(d) { return yScale(d); })
      .attr("width", function(d) {return xScale(freq[d])})
      .attr("height", yScale.bandwidth())
      .style('fill',"blue");

    g.append('g')
    .attr('id',xname)
    .attr('transform', `translate(${0}, ${yoffset})`)
    .call(xAxis);

    g.append('g')
    .attr('id',yname)
    .attr('transform', `translate(${xoffset}, ${0})`)  
    .call(yAxis);

}
