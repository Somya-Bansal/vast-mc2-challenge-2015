// Main js script
// call all charts from here

var barSvg;
var wknd;
var loc;
var outliers;
var extcomm;

var fridata=[];
var saturdata=[];
var sundata=[];

document.addEventListener('DOMContentLoaded', function() {

    barSvg = d3.select('#barchart');
    // barWidth = +barSvg.style('width').replace('px','');
    // barHeight = +barSvg.style('height').replace('px','');;
    // barInnerWidth = barWidth - barMargin.left - barMargin.right;
    // barInnerHeight = barHeight - barMargin.top - barMargin.bottom;

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
    date = new Date();
    let start=date.getTime();
    // Load both files before doing anything else
    Promise.all([
                d3.csv('data/comm-data-Fri.csv',
                        rowConverter
                        ),
                // d3.csv('data/comm-data-Sat.csv',
                //         rowConverter
                //         ),
                // d3.csv('data/comm-data-Sun.csv',
                //         rowConverter
                //         )
                ])
            .then(function(values){
        
            fridata=values[0];
            // saturdata=values[1];
            // sundata=values[2];
            date = new Date();
            let end=date.getTime();
            let time=end-start;
            console.log("loaded")
            console.log(time)
            render_chart();
    })
    
  });

  document.addEventListener('change',function(){
      render_chart();
      
  });

function render_chart(){
    wknd = document.getElementById('weekend-day-select').value;
    loc = document.getElementById('location-select').value;
    outliers = document.getElementById('outliers').checked;
    extcomm = document.getElementById('extcomm').checked;
    drawBar(wknd, loc, outliers, extcomm);
} 