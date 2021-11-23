function drawInnovativeChart(friData, satData, sunData) {

    let dayByUser = d3.select("#weekend-day-select").property("value");
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
        // case "1":
        //     dataToShow = AllData;
    }


    // selectedDayData = 
    let innovativeSvg = d3.select("#visInnovative");
    innovativeSvg.selectAll("*").remove();
    width = +innovativeSvg.style('width').replace('px', '');
    height = +innovativeSvg.style('height').replace('px', '');
    const margin = { top: 10, right: 10, bottom: 10, left: 10 },
        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

    locations = ["Entry Corridor", "Kiddie Land", "Tundra Land", "Wet Land", "Coaster Alley"]
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(locations);

    res = d3.rollup(
        dataToShow.filter((it) => new Date(it.Timestamp).getHours() <= 24),
        (d) => d.length,
        (d) => d.Location,
        (d) => d.SenderId
    );
    console.log(res);

    childrenAccessorFn = ([key, value]) => value.size && Array.from(value);
    hierarchyData = d3
        .hierarchy([null, res], childrenAccessorFn)
        .sum(([, value]) => value)
        .sort((a, b) => b.value - a.value);

    const root = d3.pack().size([width, height]).padding(0.5)(hierarchyData)
    let focus = root;
    let view;

    innovativeSvg
        .attr("viewBox", `-${innerWidth / 2} -${innerHeight / 2} ${innerWidth} ${innerHeight}`)
        // .style("margin", "0 130px")
        .style("cursor", "pointer")
        .on("click", (event) => zoom(event, root));

    const node = innovativeSvg.append("g")
        .selectAll("circle")
        .data(root.descendants().slice(2))
        .join("circle")
        .style("fill", (d) => d.parent.data[0] == null ? "#F1FAEE" : colorScale(d.parent.data[0]))
        .attr('opacity', '0.5')
        .on("mouseover", function () { d3.select(this).attr("stroke", "#000"); })
        .on("mouseout", function () { d3.select(this).attr("stroke", null); })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));


    const label = innovativeSvg.append("g")
        .style("font", "10px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => d.data[0]);

    zoomTo([root.x, root.y, root.r * 2]);

    function zoomTo(v) {
        const k = width / v[2];

        view = v;

        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
    }

    function zoom(event, d) {
        const focus0 = focus;

        focus = d;

        const transition = innovativeSvg.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", d => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return t => zoomTo(i(t));
            });

        label
            .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
            .transition(transition)
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
    }

    return innovativeSvg.node();
    // innovativeSvg
    //     .append('g')
    //     .attr('pointer-events', 'none')
    //     .attr('text-anchor', 'middle')
    //     .selectAll('text')
    //     .data(root.leaves().filter((d) => d.r > 2))
    //     .join('text')
    //     .attr('transform', (d) => `translate(${d.x},${d.y}) scale(${d.r / 30})`)
    //     .selectAll('tspan')
    //     .data((d) => {
    //         // console.log(d.parent.data[0]);
    //         return (d.data[0] + '').split(/\s+/g);
    //     })
    //     .join('tspan')
    //     .attr('x', 0)
    //     .attr('y', (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
    //     .text((d) => d);

}