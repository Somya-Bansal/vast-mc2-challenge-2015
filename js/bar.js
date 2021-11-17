
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

    // filter on extcomm flag here
    day_data.filter((d)=>{
        d.location==loc_;
    })

    day_data.filter((d)=>{
        if (!extcomm_flag){
            d.ReceiverId!=-1;
        }
        
    })
    

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

    sIds = sIds.slice(0,5);

    xScale = d3.scaleLinear()
               .domain([0,SenderId_freq[sIds[0]]])
               .range([0,1100])
    
    yScale = d3.scaleBand()
                .domain(sIds)
                .range([0,600])

    let g=barSvg.append('g');

    g.selectAll('g')
    .data(sIds)
    .enter().append("rect")
      .attr("x", xScale(0) )
      .attr("y", function(d) { return yScale(d); })
      .attr("height", yScale.bandwidth())
      .attr("width", function(d) {xScale(SenderId_freq[d])})
      .style('fill',"#69b3a2");

    g.append('g')
    .call(d3.axisLeft(yScale));

    g.append('g')
    .call(d3.axisBottom(xScale));

    
}