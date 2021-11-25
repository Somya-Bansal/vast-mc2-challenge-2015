function filterOutliersNetwork(adjList, arr, Nstdev = 1) {

    let sum = arr.reduce((a, b) => a + b, 0)
    let mean = (sum / arr.length) || 0;
    let stdev_num = 0
    arr.forEach((d) => {
        stdev_num = stdev_num + Math.pow(d - mean, 2)
    })
    let stdev = Math.sqrt(stdev_num / arr.length)

    adjList = new Map([...adjList].filter((d) => {
        return d[1].size <= stdev * Nstdev;
    }));
    return adjList;
}

function adjacencyList(day, loc, ext, outlier) {

    // User ID and communication type
    let userID;
    let commType;
    [userID, commType] = selected.get_values;

    var location = ['All Locations', 'Entry Corridor', 'Kiddie Land', 'Tundra Land', 'Wet Land', 'Coaster Alley']
    var adjacencyList = new Map();
    var day_data;
    
    // No impl for all days selection
    switch (day) {
        case "2":
            day_data = fri_data.filter(d => loc == 1 ? d : d.Location == location[loc-1]);
            break;
        case "3":
            day_data = sat_data.filter(d => loc == 1 ? d : d.Location == location[loc-1]);
            break;
        case "4":
            day_data = sun_data.filter(d => loc == 1 ? d : d.Location == location[loc-1]);
            break;
        default:
            day_data = (fri_data.concat(sat_data)).concat(sun_data);
            day_data = day_data.filter(d => loc == 1 ? d : d.Location == location[loc-1])
            break;
    }

    // external filtering
    if(!ext)
        day_data = day_data.filter(d => d.ReceiverId_network !== -1)

    // selected user id filtering
    if(userID !== null)
        day_data = day_data.filter(d => d.ReceiverId_network == userID || d.SenderId_network == userID)

    day_data.forEach(ele => {
        var adj = adjacencyList.get(ele.SenderId);

        // If the sender id is not in the adjacency list, add a new entry else modify existing entry
        if (adj === undefined) {
            // The value associated to the sender id key is a map relating receivers to amounts of comms
            var m = new Map();
            m.set(ele.ReceiverId, 1)
            adjacencyList.set(ele.SenderId, m)
        } else {
            // If the receiver id is not already in the sender ids map, add a new value else increment the values comm frequency
            var val = adj.get(ele.ReceiverId);
            val === undefined ? adj.set(ele.ReceiverId, 1) : adj.set(ele.ReceiverId, val += 1);
            adjacencyList.set(ele.SenderId, adj)
        }
    })

    // Only filter outliers if outliers is not check and no user ID is selected
    if(!outlier && userID === null) {
        let adjListSizes = []
        adjacencyList.forEach(ele => {
            adjListSizes.push(ele.size)
        })
        adjacencyList = filterOutliersNetwork(adjacencyList, adjListSizes, 1)
    }

    // Sort the map of sender id and map pairs by size of map (degree of the sender id)
    const sortMapSize = ([, a], [, b]) => a.size < b.size;
    return new Map([...adjacencyList].sort(sortMapSize));
}

function topXNetworkMaker(adjList, topx, topy, topz) {
    var iter1 = adjList.entries();
    var nodes = []
    var links = []
    var n = new Map();
    var numnodes = 0;
    for (var i = 0; i < topx; i++) {
        var val1 = iter1.next().value;
        if (n.get(val1[0]) === undefined) {
            n.set(val1[0], numnodes)
            nodes.push({ id: n.get(val1[0]), name: val1[0] });
            numnodes++;
        }

        // Sort the frequency of communication with x and y
        const sortMapFreq = ([, a], [, b]) => a < b;
        var iter2 = new Map([...val1[1]].sort(sortMapFreq)).entries();
        // Add nodes and links corresponding to the y most communicated with ids
        for (var j = 0; j < topy; j++) {
            var val2 = iter2.next().value;
            if (val2 === undefined)
                break;

            //Check if node already exists
            if (n.get(val2[0]) === undefined) {
                n.set(val2[0], numnodes);
                nodes.push({ id: n.get(val2[0]), name: val2[0] })
                numnodes++;
            }
            links.push({ source: n.get(val1[0]), target: n.get(val2[0]) })

            // Add nodes and links corresponding to the topz most communicated with ids
            if (val2[0] != -1) {
                var iter3 = adjList.get(val2[0]);
                if(iter3 === undefined)
                    continue;

                iter3 = iter3.entries();
                for (var z = 0; z < topz; z++) {
                    var val3 = iter3.next().value;
                    if (val3 === undefined)
                        break;

                    // Check if node already exits
                    if (n.get(val3[0]) === undefined) {
                        n.set(val3[0], numnodes);
                        nodes.push({ id: n.get(val3[0]), name: val3[0] })
                        numnodes++;
                    }
                    links.push({ source: n.get(val2[0]), target: n.get(val3[0]) })
                }
            }
        }
    }

    return { nodes: nodes, links: links }
}

function selectiveNetworkMaker(adjList) {

    // User ID and communication type
    var userID;
    var commType;
    [userID, commType] = selected.get_values;

    let sidMap = adjList.get(`${userID}`)
    if(sidMap === undefined)
        return {nodes: [], links: []}

    const sortMapFreq = ([, a], [, b]) => a < b;
    const sortArrMapFreq = ([, a], [, b]) => a.entries().next().value[1] < b.entries().next().value[1];
    let iter1 = new Map([...sidMap].sort(sortMapFreq)).entries();

    var n = new Map();
    var nodes = []
    var links = []
    var numnodes = 0

    // Add outgoing comms for selected uid
    nodes.push( {id: 0, name: `${userID}`} )
    numnodes++;
    for(var i = 0; i < sidMap.size / 10; i++) {
        var val1 = iter1.next().value 
        nodes.push( {id: numnodes, name: val1[0]} )
        links.push({ source: 0, target: numnodes})
        n.set(val1[0], numnodes)
        numnodes++;
    }

    // Add incoming comms for selected uid
    let adjListSorted = new Map([...adjList].sort(sortArrMapFreq));
    let iter2 = adjListSorted.entries();
    for(var i = 0; i < adjListSorted.size / 10; i++) {
        var val1 = iter2.next().value
        if(val1[0] == userID || n.get(val1[0]) !== undefined)
            continue;
        
        nodes.push( {id: numnodes, name: val1[0]} )
        links.push({ source: numnodes, target: 0})
        n.set(val1[0], numnodes)
        numnodes++;
    }

    return {nodes: nodes, links: links}
}

function drawNetworkM() {
    // Grab day selection and tooltip
    var day = d3.select("#weekend-day-select").property("value");
    var loc = d3.select("#location-select").property("value");
    let ext = document.getElementById('extcomm').checked
    let outlier = document.getElementById('outliers').checked;
    var ttdiv;
    if (d3.select(".tooltip").empty())
        ttdiv = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);
    else
        ttdiv = d3.select(".tooltip");

    // User ID and communication type
    var userID;
    var commType;
    [userID, commType] = selected.get_values;

    const width = 600
    const height = 750
    const margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    }

    // Create adjacency list and network, params to network function change the amount of nodes added
    var adjList = adjacencyList(day, loc, ext, outlier);
    var ndata
    if(userID === null)
        ndata = topXNetworkMaker(adjList, 25, 4, 3);
    else
        ndata = selectiveNetworkMaker(adjList)

    // Add links and nodes
    var svg = d3.select("#svgnetworkm").attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`);
    svg.selectAll("*").remove();

    var link = svg.selectAll("line").data(ndata.links).enter().append("line")
        .style("stroke", "#aaa")
        .attr("stroke-width", 2)
        .attr("class", function (d) { return `nid${d.source}` })
        .on('mouseover', function (e, d) {
            d3.select(this).attr("stroke-width", 5)
            d3.select(`#c${d.source.name}`).attr("class", "sourcenode")
            d3.select(`#c${d.target.name}`).attr("class", "targetnode")
            ttdiv.style("opacity", 1);
        })
        .on('mousemove', function (e, d) {
            let ca = adjList.get(d.source.name).get(d.target.name);
            let sn = d.source.name
            let tn = d.target.name > 0 ? d.target.name : "external";
            ttdiv.html(ca + " communications from " + sn + " to " + tn)
                .style('left', (e.pageX + 15) + 'px')
                .style('top', (e.pageY - 40) + 'px');
        })
        .on('mouseout', function (e, d) {
            d3.select(this).attr("stroke-width", 2)
            d3.select(`#c${d.source.name}`).attr("class", "node")
            d3.select(`#c${d.target.name}`).attr("class", "node")
            ttdiv.style("opacity", 0);
        });
    var node = svg.selectAll("circle").data(ndata.nodes).enter().append("circle").attr("r", 5).attr("id", function (d) { return "c" + d.name; })
        .attr("class", "node")
        .on('mouseover', function (e, d) {
            d3.select(this).attr("r", 8)
            d3.selectAll(`.nid${d.id}`).attr("stroke-width", 5);
            ttdiv.style("opacity", 1);
        })
        .on('mousemove', function (e, d) {
            let cn = d.name > 0 ? d.name : "external";
            let ca = 0;
            if(d.name > 0) {
                try {
                    ca = adjList.get(d.name).size;
                } catch (e) {
                    // Will be TypeError
                    if(e instanceof TypeError)
                        ca = "0 valid receivers"
                }
            }
            ttdiv.html("id: " + cn + "<br>unique receivers: " + ca)
                .style('left', (e.pageX + 15) + 'px')
                .style('top', (e.pageY - 40) + 'px');
        })
        .on('mouseout', function (e, d) {
            d3.select(this).attr("r", 5)
            d3.selectAll(`.nid${d.id}`).attr("stroke-width", 2);
            ttdiv.style("opacity", 0);
        });

    // Draw network. X and y force, refer: https://observablehq.com/@d3/disjoint-force-directed-graph
    const forceNode = d3.forceManyBody();
    const forceLink = d3.forceLink().id(d => d.id).links(ndata.links);

    // The forceNode strength determines the push and pull between nodes, can result in nodes off screen
    var simulation = d3.forceSimulation(ndata.nodes).force("link", forceLink).force("charge", forceNode.strength(-75))
        .force("x", d3.forceX()).force("y", d3.forceY()).on("end", ticked);

    function ticked() {
        link.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node.attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
    }

    // Day and Location Legend
    let infoTags = [day, loc]
    const uidInfo = `Top tenth outgoing and incoming comms for ${userID}`
    if(userID !== null)
        infoTags.push(uidInfo)
    const day_keys = ['All Days', 'Friday', 'Saturday', 'Sunday']
    const loc_keys = ['All Locations', 'Entry Corridor', 'Kiddie Land', 'Tundra Land', 'Wet Land', 'Coaster Alley']
    let daylocLegend = svg.selectAll(".daylocLegend").data(infoTags)
        .enter().append("g")
        .attr("class", "daylocLegend")
        .attr("transform", function(d,i) { return(`translate(${-width/2 + margin.left},${(-height/2 + margin.top) + (20*i)})`); });

    daylocLegend.append("text").text(function (d, i) { return (i == 0 ? day_keys[d - 1] : i == 1?  loc_keys[d - 1] : d); })
        // .attr("font-size", "12px");
}