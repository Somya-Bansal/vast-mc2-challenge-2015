// Main js script
// call all charts from here
fri_data = [];
sat_data = [];
sun_data = [];
// fridata = [];
// satdata = [];
// sundata = [];

// Use these vars to identify changes to user ID across charts
var selected_userID=null;
var commType=null;

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
    var inputs = userInputs();
	Promise.all([d3.csv('data/comm-data-Fri.csv', rowConverter),
                 d3.csv('data/comm-data-Sat.csv', rowConverter),
                 d3.csv('data/comm-data-Sun.csv', rowConverter)])
		.then(function (values) {
			fri_data = values[0];
			sat_data = values[1];
			sun_data = values[2];
            
            drawBar(inputs[0], inputs[1], inputs[2], inputs[3]);
			drawLineChart(fri_data, sat_data, sun_data);
			drawNetworkM(fri_data, sat_data, sun_data);
            
		});

	const allCsvFiles = [
		d3.csv('data/comm-data-Fri.csv'),
		d3.csv('data/comm-data-Sat.csv'),
		d3.csv('data/comm-data-Sun.csv'),
	];
	Promise.all(allCsvFiles).then((values) => {
		friData = values[0];
		satData = values[1];
		sunData = values[2];
		drawInnovativeChart(friData, satData, sunData);
		drawHeatmap(friData, satData, sunData);
	});
});

document.addEventListener('change',function(){
    updateCharts();
});

function userInputs(){
    var wknd = document.getElementById('weekend-day-select').value;
    var loc = document.getElementById('location-select').value;
    var outliers = document.getElementById('outliers').checked;
    var extcomm = document.getElementById('extcomm').checked;

    return [wknd, loc, outliers, extcomm];
}

function updateCharts(){
  var inputs = userInputs();
  drawBar(inputs[0], inputs[1], inputs[2], inputs[3]);
  drawLineChart(fri_data, sat_data, sun_data);
  drawNetworkM(fri_data, sat_data, sun_data);
  drawInnovativeChart(friData, satData, sunData)
  drawHeatmap(friData, satData, sunData);
}