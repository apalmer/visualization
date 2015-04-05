(function(){

    // A formatter for counts.

    var margin = {top: 10, right: 30, bottom: 30, left: 30};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    d3.json('data/histogram.json', function(jsonData){
        
        var values = jsonData;

        var xMin = d3.min(values);
        var xMax = d3.max(values) + 1;

        var x = d3.scale.linear()
            .domain([xMin, xMax])
            .range([0, width]);

        // Generate a histogram using uniformly-spaced bins.
        var data = d3.layout.histogram()
            .bins(x.ticks(xMax))
            (values);

        var extractor = function(d){
            return d.y;
        };

        var y = d3.scale.linear()
            .domain([0, d3.max(data, extractor)])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var bar = svg.selectAll(".bar")
            .data(data)
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function(d) { return height - y(d.y); });

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", x(data[0].dx) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { return d.y; });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

    });

})();
