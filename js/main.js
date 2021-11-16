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
    friData = values[0].slice(0, 100);
    // satData = values[0];
    // sunData = values[0];
    // allDaysData = friData + satData + sunData;
    // console.log(friData);
    // groupedToLocationDataFri = d3.group(
    //   friData,
    //   (d) => d.location,
    //   (d) => d.to
    // );
    groupedFromLocationDataFri = d3.groups(
      friData,
      (d) => d.location,
      (d) => d.from
    );
    // console.log(groupedToLocationDataFri);
    console.log(groupedFromLocationDataFri);
    // groupedLocationDataSat = d3.group(satData, (d) => d.location);
    // groupedLocationDataSun = d3.group(sunData, (d) => d.location);
    // groupedLocationData = d3.group(allDaysData, (d) => d.location);
    // console.log(groupedLocationDataFri);

    const svg = d3
      .select('#vis1')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const root = d3
      .stratify()
      .id(function (d) {
        return d.from;
      })
      .parentId(function (d) {
        return d.location;
      })(friData);
    console.log(root);
    root.sum(function (d) {
      console.log(d);
      return d.children.length;
    });

    d3.treemap().size([width, height]).padding(4)(root);

    // use this information to add rectangles:
    svg
      .selectAll('rect')
      .data(root.leaves())
      .join('rect')
      .attr('x', function (d) {
        return d.x0;
      })
      .attr('y', function (d) {
        return d.y0;
      })
      .attr('width', function (d) {
        return d.x1 - d.x0;
      })
      .attr('height', function (d) {
        return d.y1 - d.y0;
      })
      .style('stroke', 'black')
      .style('fill', '#69b3a2');

    // and to add the text labels
    svg
      .selectAll('text')
      .data(root.leaves())
      .join('text')
      .attr('x', function (d) {
        return d.x0 + 10;
      }) // +10 to adjust position (more right)
      .attr('y', function (d) {
        return d.y0 + 20;
      }) // +20 to adjust position (lower)
      .text(function (d) {
        return d.data.from;
      })
      .attr('font-size', '15px')
      .attr('fill', 'white');
  });
});
