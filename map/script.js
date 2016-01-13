var width = 1368;
var height = 768;

var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");
var restaurant_info = d3.select("#map").append("div").attr("class", "info hidden");

var projection = d3.geo.mercator()
    .translate([512, 384])
    .scale(275);

var path = d3.geo.path()
    .projection(projection);

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", move);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .call(zoom);

var g_world = svg.append("g");
var g_restaurants = svg.append("g");

function initializeWorld() {
	d3.json("data/world-topo.json", function(error, world) {
	  	var countries = topojson.feature(world, world.objects.countries).features;
		topo = countries;
		drawWorld(topo);

		fetchAndDrawRestaurants();
	});
}

function drawWorld(topo) {
  	var country = g_world.selectAll(".country").data(topo);

  	country.enter().insert("path")
	.attr("class", "country")
	.attr("d", path);

	country.on("mousemove", function(d,i) {
      	var mouse = d3.mouse(svg.node()).map(function(d) { 
			      		return parseInt(d); 
			      	});
        tooltip
    	.classed("hidden", false)
      	.attr("style", "left:"+(mouse[0]+60)+"px;top:"+(mouse[1]+50)+"px")
      	.html(d.properties.name)
    })
    .on("mouseout",  function(d,i) {
       	tooltip.classed("hidden", true)
    });
}

function fetchAndDrawRestaurants() {
	d3.json("data/world-restaurants-topo.json", function(error, population) {
    	if (error) throw error;

    	var restaurant = g_restaurants.selectAll(".restaurant").data(topojson.feature(population, population.objects['world-restaurants']).features);
    
      	restaurant
		.enter()
		.append("path")
		.attr( "fill", "#FF0000" )
		.attr( "stroke", "#999" )
		.attr( "d", path );

      	restaurant.on("mousemove", function(d,i) {
      		var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        	
        	restaurant_info
          	.classed("hidden", false)
          	.attr("style", "left:"+(mouse[0]+60)+"px;top:"+(mouse[1]+50)+"px")
          	.html(getRestaurantInfoHtml(d.properties));
      	})
      	.on("mouseout",  function(d,i) {
        	restaurant_info.classed("hidden", true)
      	});
      
    	g_restaurants.call(zoom);
  	});
}

function move() {
	var t = d3.event.translate;
	var s = d3.event.scale;  
	var h = height / 3;

	t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
	t[1] = Math.min(height / 2 * (s - 1) + h * s, Math.max(height / 2 * (1 - s) - h * s, t[1]));

	zoom.translate(t);
	g_world.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
	g_restaurants.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
}

function getRestaurantInfoHtml(prop) {
	return '<div class="res-name"> ' + prop.RESTAURANT + '</div>'+
			'<div> Rank: '+prop.RANK0+'</div>'+
			'<div> Location: '+prop.CITY0+', ' + prop.COUNTRY0 + '</div>';
}

initializeWorld();