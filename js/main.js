// Main js script
// call all charts from here
fri_data = [];
sat_data = [];
sun_data = [];

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
	var rowConverter = function (d) {
		const df = isNaN(+d.from) ? -1 : +d.from;
		const dt = isNaN(+d.to) ? -1 : +d.to;
		return {
			Timestamp: new Date(d.Timestamp),
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

	const allCsvFiles = [
		d3.csv('data/comm-data-Fri.csv'),
		//   d3.csv('data/comm-data-Sat.csv'),
		//   d3.csv('data/comm-data-Sun.csv'),
	];
	Promise.all(allCsvFiles).then((values) => {
		friData = values[0];
		drawInnovativeChart(friData);
	});
});

function updateForDay() {
	drawLineChart(fri_data, sat_data, sun_data);
	drawNetworkM(fri_data, sat_data, sun_data);
}

function updateForLocation() {
	drawLineChart(fri_data, sat_data, sun_data);
}

