// Main js script
// call all charts from here

var barSvg;
var wknd;
var loc;
var outliers;
var extcomm;
var div;
var selected_userID=null;
var commType=null;
var fridata=[];
var saturdata=[];
var sundata=[];

document.addEventListener('DOMContentLoaded', function() {

    barSvg = d3.select('#barchart');
    barSvg2 = d3.select('#barchart2');
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
    
    div = d3.select("body").append("div")
    .attr("class", "tooltip-cmap")
    .style("opacity", 0);

    Promise.all([
                d3.csv('data/comm-data-Fri.csv',
                        rowConverter
                        ),
                d3.csv('data/comm-data-Sat.csv',
                        rowConverter
                        ),
                d3.csv('data/comm-data-Sun.csv',
                        rowConverter
                        )
                ])
            .then(function(values){
        
            fridata=values[0];
            saturdata=values[1];
            sundata=values[2];
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