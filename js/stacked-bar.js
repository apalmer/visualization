(function () {


    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .rangeRound([0,height]);

    var color = d3.scale.category20();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickFormat(d3.format('.2s'));

    var svg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    d3.json('data/stacked-bar.json', function(error, data){

        var distinct = _.uniq(data, 'Name');
        var distinctNames = _.map(distinct, 'Name');
        color.domain(distinctNames);

        var distinctLayers = [];
        for(var i = 0; i < distinctNames.length; i++){
            distinctLayers.push(_.map(_.where(data, {'Name': distinctNames[i]}), function(item){ return {x: item.TimeBucket, y: item.Count}; }));
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
            .style("fill", function(d, i) { return color(i); });

        var rect = layer.selectAll("rect")
            .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { 
                return y(d.y0) + y(d.y) - height; 
            })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { 
                return y(d.y0); 
            });

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
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

        var legend = svg.selectAll('.legend')
            .data(color.domain().slice().reverse())
          .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) { return 'translate(0,' + i * 20 + ')'; });

        legend.append('rect')
            .attr('x', width - 18)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color);

        legend.append('text')
            .attr('x', width - 24)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function (d) { return d; });

    });

/*
    d3.csv('data/stacked-bar.csv', function (error, data) {


        data.forEach(function (d) {
            var y0 = 0;
            d.ages = color.domain().map(function (name) { return { name: name, y0: y0, y1: y0 += +d[name] }; });
            d.total = d.ages[d.ages.length - 1].y1;
        });
        
        x.domain(data.map(function (d) { return d.State; }));
        y.domain([0, d3.max(data, function (d) { return d.total; })]);

        var state = svg.selectAll('.state')
            .data(data)
          .enter().append('g')
            .attr('class', 'g')
            .attr('transform', function (d) { return 'translate(' + x(d.State) + ',0)'; });

        state.selectAll('rect')
            .data(function (d) { return d.ages; })
          .enter().append('rect')
            .attr('width', x.rangeBand())
            .attr('y', function (d) { return y(d.y1); })
            .attr('height', function (d) { return y(d.y0) - y(d.y1); })
            .style('fill', function (d) { return color(d.name); });


   });
*/

})();
