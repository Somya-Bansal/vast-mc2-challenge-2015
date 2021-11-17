const data = [
  d3.csv('data/comm-data-Fri.csv'),
  //   d3.csv('data/comm-data-Sat.csv'),
  //   d3.csv('data/comm-data-Sun.csv'),
];
let satData = [];
let sunData = [];
let friData = [];
let allDaysData = [];
document.addEventListener('DOMContentLoaded', () => {
  const margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 445 - margin.left - margin.right,
    height = 445 - margin.top - margin.bottom;
  Promise.all(data).then((values) => {
    friData = values[0].slice(0, 28000);
    console.log(friData);

    res = d3.rollup(
      friData.filter((it) => new Date(it.Timestamp).getHours() === 9),
      (d) => d.length,
      (d) => d.location,
      (d) => d.from
    );

    console.log(res);

    const svg = d3
      .select('#vis1')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    childrenAccessorFn = ([key, value]) => value.size && Array.from(value);
    hierarchyData = d3
      .hierarchy([null, res], childrenAccessorFn)
      .sum(([, value]) => value)
      .sort((a, b) => b.value - a.value);

    pack = d3.pack().size([width, height]).padding(1)(hierarchyData);

    const root = pack;

    svg
      .append('g')
      .attr('fill', '#ccc')
      .selectAll('circle')
      .data(root.leaves())
      .join('circle')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .attr('r', (d) => d.r)
      .append('title');
    //   .text((d) => {
    //     // console.log(d);
    //     return `${d.ancestors().map((d) => d.data[0])}`;
    //     //   .reverse()
    //     //   .join('/')}\n${format(d.value)}`;
    //   });

    svg
      .append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(root.leaves().filter((d) => d.r > 2))
      .join('text')
      .attr('transform', (d) => `translate(${d.x},${d.y}) scale(${d.r / 30})`)
      .selectAll('tspan')
      .data((d) => {
        console.log(d.parent.data[0]);
        return (d.data[0] + '').split(/\s+/g);
      })
      .join('tspan')
      .attr('x', 0)
      .attr('y', (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
      .text((d) => d);
  });
});
