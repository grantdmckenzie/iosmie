
<!DOCTYPE html>
<meta charset="utf-8">

<body style="margin:0;position:absolute;height:100%;width:100%;font-size:12px;background-color:#000;font-family: 'Muli', sans-serif;">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script src="d3.min.js"></script>
<script src="http://d3js.org/d3.geo.projection.v0.min.js"></script>

<script src="topojson.js" charset="utf-8"></script>
<script src="simple-map-d3.js"></script>


<div style="height:50%;overflow:auto" class="chart"></div>
<div style="height:50%;position:absolute;border-top:solid 4px rgb(156, 158, 222);;left:0px;bottom:0px" id="map"></div>
<div id="wrapperYears" style="right:0px;position:absolute;padding:0px;height:20%;bottom:0px;width:300px;overflow:auto;">
  <div style="border-radius:3px;margin-top:5px;padding:5px 10px;color:#fff;font-weight:bold;background-color:rgb(156, 158, 222);width:90%;font-size:1.4em;">Years</div>
  <div id="wrapperYearsContent" style="color:#fff;font-size:1.2em;"></div>
</div>
<div id="wrapperAuthors" style="right:0px;position:absolute;padding:0px;height:50%;top:0px;width:300px;overflow:auto;">
  <div style="border-radius:3px;margin-top:5px;padding:5px 10px;color:#fff;font-weight:bold;background-color:rgb(156, 158, 222);width:90%;font-size:1.4em;">Authors</div>
  <div id="wrapperAuthorsContent" style="color:#fff;font-size:1.2em;overflow:auto;"></div>
</div>
<div id="wrapperPapers" style="right:0px;position:absolute;padding:0px;height:30%;top:50%;width:300px;overflow:auto;">
  <div style="border-radius:3px;margin-top:5px;padding:5px 10px;color:#fff;font-weight:bold;background-color:rgb(156, 158, 222);width:90%;font-size:1.4em;">Papers</div>
  <div id="wrapperPaperContent" style="color:#fff;font-size:1.2em;overflow:auto;"></div>
</div>

<script>

var _ENDPOINT = "http://stko-testing.geog.ucsb.edu:8890/sparql";
String.prototype.capitalizeFirstLetter = function() {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var url = _ENDPOINT+"?default-graph-uri=&query=SELECT+%3Fkey+count%28%3Fdate%29+as+%3Fvalue+%3Fdate%0D%0AWHERE+%7B%0D%0A++%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fsubject%3E+%3Fkey+.+%0D%0A++%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fontology%2Fbibo%2FpresentedAt%3E+%3Fc+.%0D%0A++%3Fc+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2Fdate%3E+%3Fdate%0D%0A++%7B%0D%0A++++select+%3Fkey+count%28%3Fkey%29+as+%3Fcnt2+where+%7B%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fsubject%3E+%3Fkey%7D+group+by+%3Fkey+order+by+desc%28%3Fcnt2%29+limit+20%0D%0A++%7D%0D%0A%7D+group+by+%3Fkey+%3Fdate+order+by+asc%28%3Fkey%29+%3Fdate&format=text%2Fcsv&timeout=0&debug=on";

var urlyear = _ENDPOINT+"?default-graph-uri=&query=select+%3Fkey+%3Fdate+count%28%3Fkey%29+as+%3Fcount+WHERE+%7B%0D%0A%09%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fsubject%3E+%3Fkey+.%0D%0A%09%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fontology%2Fbibo%2FpresentedAt%3E+%3Fpresented+.%0D%0A%09%3Fpresented+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2Fdate%3E+%3Fdate%0D%0A%09%7B%0D%0A++++%09select+%3Fkey+count%28%3Fkey%29+as+%3Fcnt2+where+%7B%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fsubject%3E+%3Fkey%7D+group+by+%3Fkey+order+by+desc%28%3Fcnt2%29+limit+20%0D%0A++++%7D%0D%0A%7D+group+by+%3Fkey+%3Fdate+order+by+%3Fkey+%3Fdate&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";


var urldetails = _ENDPOINT+"?default-graph-uri=&query=select+%3Fkey+%3Ftitle+%3Fdate+%3Fauthorname+WHERE%7B%0D%0A%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fsubject%3E+%3Fkey+.%0D%0A%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Ftitle%3E+%3Ftitle+.%0D%0A%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fcreator%3E+%3Fauthor+.%0D%0A%3Fauthor+%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2Fname%3E+%3Fauthorname+.%0D%0A%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fontology%2Fbibo%2FpresentedAt%3E+%3Fpresented+.%0D%0A%3Fpresented+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2Fdate%3E+%3Fdate%0D%0A+++%7B%0D%0A++++select+%3Fkey+count%28%3Fkey%29+as+%3Fcnt2+where+%7B%3Fa+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Fsubject%3E+%3Fkey%7D+group+by+%3Fkey+order+by+desc%28%3Fcnt2%29+limit+20%0D%0A+++%7D%0D%0A%7D%0D%0Aorder+by+%3Fkey&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";

chart(url, "blue");
loadDetails(urldetails);
loadYears(urlyear);

var datearray = [];
var colorrange = [];
var authors = {};
var years = {};
var title = {};
var _years = {};

var worldMap = SimpleMapD3({
    container: '#map',
    datasource: 'world-population.geo.json',
    projection: 'nellHammer',
    colorOn: true,
    colorProperty: 'POP2005',
    colorSet: 'Reds',
    colorScale: 'quantize',
    tooltipOn: false,
    //graticuleOn: false,
    globeOn: false,
    legendOn: false,
    startManually: true
  }).start();


function chart(csvpath, color) {

strokecolor = "#000000";

var format = d3.time.format("%Y");

var width = document.body.clientWidth - 300;
var height = document.body.clientHeight / 2 - 20;

$('#map').width(width+66);
//$('#wrapperYears').height(height-20);
//$('#wrapperYears').width(width/4);
// $('#wrapperAuthors').height("100%");
// $('#wrapperAuthors').css('left',width/4);
// $('#wrapperAuthors').width(width/4);
//$('#wrapperTitles').height(height-20);
//$('#wrapperTitles').css('left',width/4*2);
//$('#wrapperTitles').width(width/4);

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden")
    .style("top", "30px")
    .style("left", "55px");

var x = d3.scale.linear() //d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height-10, 0]);

var z = d3.scale.category20b(); 
var yAxis = d3.svg.axis()
    .scale(y);

var yAxisr = d3.svg.axis()
    .scale(y);

var stack = d3.layout.stack()
    .offset("silhouette") //expand
    .values(function(d) { return d.values; })
    .x(function(d) { return d.date; })
    .y(function(d) { return d.value; });

var nest = d3.nest()
    .key(function(d) { return d.key; });

var area = d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { 
      return x(d.date); 
    })
    .y0(function(d) { 
        return y(d.y0); 
    })
    .y1(function(d) { return y(d.y0 + d.y); });

var svg = d3.select(".chart").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + 10 + "," + 10 + ")");

var dataJSON = {};
var data_years = [];

var graph = d3.csv(csvpath, function(data) {
  data.forEach(function(d) {
    //d.date = format.parse(d.date);
    d.value = +d.value;
      if(!dataJSON[d.key])
          dataJSON[d.key] = {};
      dataJSON[d.key][d.date] = d.value;
      data_years.push(d.date);
  });
  data = backFillData(dataJSON, data_years);
  data.forEach(function(d) {
    //d.date = format.parse(d.date);
    d.date = d.date;
    d.value = +d.value;
  });

  var unique = data_years.filter( onlyUnique ); 
  unique.push("2001");
  unique.sort();
  intyears = [];
  for(var prop in unique) {
    intyears.push(parseInt(unique[prop])); 
  }

/* var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(5)
    .tickValues(unique)   // only one tick at max
    .tickFormat(d3.format("d")); */
/* var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.years); */
var xAxis = d3.svg.axis()
    .scale(x).tickFormat('');
    //.tickValues([0,1,2,3,4,5])
    //.tickFormat(d3.format("dd"));
  
  var layers = stack(nest.entries(data));

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

  var tmp = shuffle(z.range());

  svg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d, i) { return tmp[i]; }); // replaced "i"


  svg.append("g")
      .attr("class", "x axis")
      .attr("display", "none")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

 /* svg.append("g")
      //.attr("class", "y axis")
      .attr("transform", "translate(" + width + ", 0)")
      .call(Axis.orient("bottom")); */

  svg.selectAll(".layer")
    .attr("opacity", 1)
    .attr("cursor","pointer")
    .on("mouseover", function(d, i) {
      svg.selectAll(".layer").transition()
      .duration(250)
      .attr("opacity", function(d, j) {
        return j != i ? 0.6 : 1;
    })})

    .on("mousemove", function(d, i) {
      mousex = d3.mouse(this);
      mousex = mousex[0];
      var invertedx = x.invert(mousex);
      //invertedx = invertedx.getFullYear();
      var selected = (d.values);
      for (var k = 0; k < selected.length; k++) {
        datearray[k] = selected[k].date; //.getFullYear();
        // datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
      }

      mousedate = datearray.indexOf(Math.round(invertedx));
      if (mousedate != -1) {
        pro = d.values[mousedate].value;
        yr = d.values[mousedate].year;
      } else {
        pro = "undefined";
        yr = "undefined"
      }
      mm = d3.mouse(this);
      mx = mm[0] + 50;
      my = mm[1] - 45;
      d3.select(this)
      .classed("hover", true)
      .attr("stroke", "#fff")
      .attr("stroke-width", "2px"), 
      tooltip.style("left",mx+"px");
      tooltip.style("top",my+"px");
      tooltip.html( "<div style='background-color:#fff;border-radius:3px;padding:10px;20px;font-size:1.3em;width:250px'>Keyword:<b> " + d.key + "</b><br/>Year: " + yr+ "<br/>Count: " + pro + "</div>" ).style("visibility", "visible");
      displayDetails(d.key, d.date);
      
    })
    .on("mouseout", function(d, i) {
     svg.selectAll(".layer")
      .transition()
      .duration(250)
      .attr("opacity", "1");
      d3.select(this)
      .classed("hover", false)
      .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "hidden");
  })
    
  /*var vertical = d3.select(".chart")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "1px")
        .style("height", "380px")
        .style("top", "10px")
        .style("bottom", "30px")
        .style("left", "0px")
        .style("background", "#fff"); */

  d3.select(".chart")
      .on("mousemove", function(){  
         mousex = d3.mouse(this);
         mousex = mousex[0] + 5})
         // vertical.style("left", mousex + "px" )})
      .on("mouseover", function(){  
         mousex = d3.mouse(this);
         mousex = mousex[0] + 5});
         // vertical.style("left", mousex + "px")});
});

}

function backFillData(data, data_years) {

  var unique = data_years.filter( onlyUnique ); 
  unique.push("2001");
  unique.sort();
  var outputdata = [];
  
  for(var prop in data) {
    for(var i=0;i<unique.length;i++) {
        if(data[prop][unique[i]])
            outputdata.push({'key':prop,'year':unique[i],'date':i,'value':data[prop][unique[i]]});
        else
            outputdata.push({'key':prop,'year':unique[i],'date':i,'value':0});
    }
  }
  return outputdata;
}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}


function loadYears(years) {
  $.ajax({
      type: "GET",
      url: years,
      dataType: "json",
      success: function(data) {
          var x = data.results.bindings;
          for(var i=0;i<x.length;i++) {
              var a = x[i].date.value;
              if (_years[x[i].key.value]) {
                  _years[x[i].key.value][a] = x[i].count.value;

              } else {
                _years[x[i].key.value] = {};
                _years[x[i].key.value][a] = x[i].count.value;
              }
          }
      }
  });

}

function loadDetails(details) {
  $.ajax({
      type: "GET",
      url: details,
      dataType: "json",
      success: function(data) {
        var x = data.results.bindings;
        
        for(var i=0;i<x.length;i++) {
            // Authors
            var a = x[i].authorname.value.toLowerCase();
            if (authors[x[i].key.value]) {
                if (authors[x[i].key.value][a]) {
                  authors[x[i].key.value][a] += 1;
                } else {
                  authors[x[i].key.value][a] = 1;
                }

            } else {
              authors[x[i].key.value] = {};
              authors[x[i].key.value][a] = 1;
            }
            // Years
            a = x[i].date.value;
            if (years[x[i].key.value]) {
                if (years[x[i].key.value][a]) {
                  years[x[i].key.value][a] += 1;
                } else {
                  years[x[i].key.value][a] = 1;
                }

            } else {
              years[x[i].key.value] = {};
              years[x[i].key.value][a] = 1;
            }
            // Paper Titles
            a = x[i].title.value;
            if (title[x[i].key.value]) {
                if (title[x[i].key.value][a]) {
                  title[x[i].key.value][a] += 1;
                } else {
                  title[x[i].key.value][a] = 1;
                }

            } else {
              title[x[i].key.value] = {};
              title[x[i].key.value][a] = 1;
            }
        }

      }
   });
}

function displayDetails(key, date) {
  var yearscontent = "";
  for(var prop in _years) {
    if (key == prop) {
      for(var p in _years[prop]) {
        yearscontent += "<div style='padding:5px 10px;margin-top:1px;width:90%;border-radius:3px;background-color:#111;'><span style='font-weight:bold;color:rgb(156, 158, 222)'>"+p+": </span> " + _years[prop][p] + "</div>";
      }
    }
  }
  $('#wrapperYearsContent').html(yearscontent);

  var authorcontent = "";
  for(var prop in authors) {
    if (key == prop) {
      var sortable = [];
      var aa = authors[prop];
      for (var p in aa)
          sortable.push([p, aa[p]])
      sortable.sort(function(a, b) {return b[1] - a[1]})

      for(var i=0;i<sortable.length;i++) {
          authorcontent += "<div style='padding:5px 10px;margin-top:1px;width:90%;border-radius:3px;background-color:#111;'><span style='font-weight:bold;color:rgb(156, 158, 222)'>"+sortable[i][0].capitalizeFirstLetter()+": </span> " + sortable[0][1] + "</div>";
        
      }
    }
  }
  $('#wrapperAuthorsContent').html(authorcontent);

  var papercontent = "";
  for(var prop in title) {
    if (key == prop) {

      for(var p in title[prop]) {
        papercontent += "<div style='padding:5px 10px;margin-top:1px;width:90%;border-radius:3px;background-color:#111;'>"+p+"</div>";
      }
    }
  }
  $('#wrapperPaperContent').html(papercontent);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

</script>