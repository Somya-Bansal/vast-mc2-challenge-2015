function drawInnovativeChart(friData) {

    let innovativeSvg = d3.select("#visInnovative");
    width = +innovativeSvg.style('width').replace('px', '');
    height = +innovativeSvg.style('height').replace('px', '');
    const margin = { top: 10, right: 10, bottom: 10, left: 10 },
        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

    locations = ["Entry Corridor", "Kiddie Land", "Tundra Land", "Wet Land", "Coaster Alley"]
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(locations);

    res = d3.rollup(
        friData.filter((it) => new Date(it.Timestamp).getHours() <= 24),
        (d) => d.length,
        (d) => d.location,
        (d) => d.from
    );
    console.log(res);

    childrenAccessorFn = ([key, value]) => value.size && Array.from(value);
    hierarchyData = d3
        .hierarchy([null, res], childrenAccessorFn)
        .sum(([, value]) => value)
        .sort((a, b) => b.value - a.value);

    const root = d3.pack().size([width, height]).padding(0.5)(hierarchyData);


    innovativeSvg
        .append('g')
        .selectAll('circle')
        .data(root.leaves())
        .join('circle')
        .attr('r', (d) => d.r)
        .attr('transform', (d) => `translate(${d.x},${d.y})`)
        .attr('opacity', '0.3')
        .style("fill", function (d) { return colorScale(d.parent.data[0]) })
        // .append('title');
    //   .text((d) => {
    //     // console.log(d);
    //     return `${d.ancestors().map((d) => d.data[0])}`;
    //     //   .reverse()
    //     //   .join('/')}\n${format(d.value)}`;
    //   });

    innovativeSvg
        .append('g')
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(root.leaves().filter((d) => d.r > 2))
        .join('text')
        .attr('transform', (d) => `translate(${d.x},${d.y}) scale(${d.r / 30})`)
        .selectAll('tspan')
        .data((d) => {
            // console.log(d.parent.data[0]);
            return (d.data[0] + '').split(/\s+/g);
        })
        .join('tspan')
        .attr('x', 0)
        .attr('y', (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
        .text((d) => d);
}