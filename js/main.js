// Main js script
// call all charts from here
fri_data = [];
sat_data = [];
sun_data = [];

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
    var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    var rowConverter = function (d) {
        const df = isNaN(+d.from) ? -1 : +d.from;
        const dt = isNaN(+d.to) ? -1 : +d.to;
        return {
            Timestamp: parseTime(d.Timestamp),
            SenderId: df,
            ReceiverId: dt,
            Location: d.location
        }
    }

    Promise.all([d3.csv('data/comm-data-Fri.csv', rowConverter), d3.csv('data/comm-data-Sat.csv', rowConverter), d3.csv('data/comm-data-Sun.csv', rowConverter)])
        .then(function (values) {
            fri_data = values[0];
            sat_data = values[1];
            sun_data = values[2];

            drawLineChart(fri_data, sat_data, sun_data);
            drawNetworkM(fri_data, sat_data, sun_data);
        });
});

function updateForDay() {
    drawLineChart(fri_data, sat_data, sun_data);
    drawNetworkM(fri_data, sat_data, sun_data);
}