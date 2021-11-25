// Main js script
// call all charts from here
fri_data = [];
sat_data = [];
sun_data = [];
all_days = [];

var selected = {
	userID: null,
	commType:null,
	get get_values(){
		return [this.userID, this.commType];
	},
	set set_values(values){
		let flag=true; // Choose to redraw the charts from setter or not
		[this.userID, this.commType, flag] = values;
		if (flag=true){
		let inputs = userInputs();
		drawLineChart(fri_data, sat_data, sun_data);
		drawNetworkM(fri_data, sat_data, sun_data);
		drawInnovativeChart(fri_data, sat_data, sun_data, inputs, srcid=null);
		}
	}
}

var cache={};

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
	var rowConverter = function (d) {
		const df = isNaN(+d.from) ? -1 : +d.from;
		const dt = isNaN(+d.to) ? -1 : +d.to;
		return {
			Timestamp_network: new Date(d.Timestamp),
			SenderId_network: df,
			ReceiverId_network: dt,
			Location: d.location,
			Timestamp: d.Timestamp,
			SenderId: d.from,
			ReceiverId: d.to
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
			drawInnovativeChart(fri_data, sat_data, sun_data, inputs, srcid=null);
			drawHeatmap(fri_data, sat_data, sun_data, inputs);
		});
});

document.addEventListener('change',(event) => {
	const srcid = event.target.id
	if(srcid == 'interval-select')
		drawLineChart(fri_data, sat_data, sun_data)
	else if(srcid == 'commRadioSender' || srcid == 'commRadioReceiver')
		drawInnovativeChart(fri_data, sat_data, sun_data, userInputs(), srcid);
	else
    	updateCharts();
});

function userInputs() {
	var day = document.getElementById('weekend-day-select').value;
	var location = document.getElementById('location-select').value;
	var outlier_flag = document.getElementById('outliers').checked;
	var external_flag = document.getElementById('extcomm').checked;

	return [day, location, outlier_flag, external_flag];
}

function updateCharts() {
	selected.set_values = [null, null, false]
	var inputs = userInputs();
	drawBar(inputs[0], inputs[1], inputs[2], inputs[3]);
	drawLineChart(fri_data, sat_data, sun_data);
	drawNetworkM(fri_data, sat_data, sun_data);
	drawInnovativeChart(fri_data, sat_data, sun_data, inputs, srcid=null);
	drawHeatmap(fri_data, sat_data, sun_data, inputs);
}