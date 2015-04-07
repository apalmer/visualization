(function () {


    var svgWidth = 960,
        svgHeight = 500,
        svgMargin = { top: 20, right: 20, bottom: 30, left: 40 },
        legendWidth = 48,
        chartWidth = svgWidth - svgMargin.left - svgMargin.right - legendWidth,
        chartHeight = svgHeight - svgMargin.top - svgMargin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, chartWidth], .1);

    var y = d3.scale.linear()
        .rangeRound([chartHeight, 0]);

    var color = d3.scale.category20();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var svg = d3.select('body').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
      .append('g')
        .attr('transform', 'translate(' + svgMargin.left + ',' + svgMargin.top + ')');

    d3.json('data/stacked-bar.json', function(error, data){

        var distinct = _.uniq(data, 'Name');
        var distinctNames = _.map(distinct, 'Name');
        color.domain(distinctNames);

        var distinctLayers = [];
        for(var i = 0; i < distinctNames.length; i++){
            distinctLayers.push(_.map(_.where(data, {'Name': distinctNames[i]}), function(item){ return {x: item.TimeBucket, y: item.Count, Name: item.Name}; }));
        }
        
        var layers = d3.layout.stack()(distinctLayers);

        var timeBuckets = _.map(_.uniq(data, 'TimeBucket'), 'TimeBucket');
        x.domain(timeBuckets);

        var yStackMax = d3.max(layers, function(layer) { 
            return d3.max(layer, function(d) { 
                return d.y0 + d.y;  
            }); 
        });
        y.domain([0, yStackMax]);

        var layer = svg.selectAll(".layer")
            .data(layers)
          .enter().append("g")
            .attr("class", "layer")
            .style("fill", function (d, i) {
                return color(d[i].Name);
            });

        var rect = layer.selectAll("rect")
            .data(function (d) { return d; })
          .enter().append("rect")
            .attr("x", function (d) { return x(d.x); })
            .attr("y", function (d) {
                return y(d.y0 + d.y);
            })
            .attr("width", x.rangeBand())
            .attr("height", function (d) {
                return chartHeight - y(d.y);
            })
            .attr("raw-y0", function (d) { return d.y0 })
            .attr("scaled-y0", function (d) { return y(d.y0); })
            .attr("raw-y", function (d) { return d.y; })
            .attr("scaled-y", function (d) { return y(d.y); })
            .attr("raw-height", function (d) { return chartHeight; });
            

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + chartHeight + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
          .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Lead Count');

        var legendItems = color.domain().slice().reverse();

        var legend = svg.selectAll('.legend')
            .data(legendItems)
          .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) { return 'translate(0,' + i * 20 + ')'; });

        legend.append('rect')
            .attr('x', svgWidth - (legendWidth + 18))
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color);

        legend.append('text')
            .attr('x', svgWidth - (legendWidth + 24))
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function (d) { return d; });

    });
 
})();
