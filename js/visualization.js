var vis = vis || {};

(function ($, _) {

    var _canonicalize = function (data, mapping) {

        var output = _.map(data, function (datum) {
            var item = {};
            item.id = datum[mapping.id];
            item.name = datum[mapping.name];
            item.bucket = datum[mapping.bucket];
            item.frequency = datum[mapping.frequency];
            item.layerId = item.name + ' (' + item.id + ')';
            item.x = item.bucket;
            item.y = item.frequency;
            return item;
        });

        return output;
    };

    var _getBuckets = function (data) {
        var buckets = _.uniq(data, 'bucket');
        buckets = _.pluck(buckets, 'bucket');
        return buckets;
    };

    var _getPartitions = function (data, lDescs) {
        var partitions = [];
        _.forEach(lDescs, function (lDesc, key, collection) {
            var filtered = _.where(data, { layerId: lDesc.layerId });
            filtered.layerId = lDesc.layerId;
            filtered.total = _.sum(filtered, function (d) { return d.frequency; });
            partitions.push(filtered);
        });
        return partitions;
    };

    var _getLayerDescriptors = function (data) {
        var lDescs = _.uniq(data, 'layerId');
        return lDescs;
    };

    var _applyPadding = function (data, lDescs, buckets) {
        var padding = [];
        _.forEach(lDescs, function (lDesc, key, collection) {
            var filtered = _.where(data, { layerId: lDesc.layerId });
            _.forEach(buckets, function (bucket, key, collection) {
                var found = _.findWhere(filtered, { bucket: bucket });
                if (!found) {
                    padding.push({
                        id: lDesc.id,
                        name: lDesc.name,
                        bucket: bucket,
                        frequency: 0,
                        layerId: lDesc.layerId,
                        x: bucket,
                        y: 0,
                    });
                }
            });
        });
        var output = [];
        output.push.apply(output, data);
        output.push.apply(output, padding);
        return output;
    };

    var _drawChart = function (buckets, layers, options) {

        var yStackMax = d3.max(layers, function (layer) {
            return d3.max(layer, function (d) {
                return d.y0 + d.y;
            });
        });

        var x = d3.scale.ordinal()
            .domain(buckets)
            .rangeBands([0, options.chartWidth], .1);

        var y = d3.scale.linear()
            .domain([0, yStackMax])
            .range([options.chartHeight, 0]);

        var layerIds = _.pluck(layers, 'layerId');

        var color = d3.scale.category20c()
            .domain(layerIds);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        var svg = d3.select('body').append('svg')
            .attr('width', options.svgWidth)
            .attr('height', options.svgHeight)
          .append('g')
            .attr('transform', 'translate(' + options.svgMargin.left + ',' + options.svgMargin.top + ')');


        var legendItems = color.domain().slice().reverse();

        var legend = svg.selectAll('.legend')
            .data(legendItems)
          .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) { return 'translate(0,' + i * 20 + ')'; });

        legend.append('rect')
            .attr('x', options.svgWidth - (options.legendWidth + 18))
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color);

        legend.append('text')
            .attr('x', options.svgWidth - (options.legendWidth + 24))
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function (d) { return d; });

        var layer = svg.selectAll(".layer")
            .data(layers)
          .enter().append("g")
            .attr("class", "layer")
            .style("fill", function (d, i) {
                if (d && d.layerId) {
                    return color(d.layerId);
                }
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
                return options.chartHeight - y(d.y);
            });

        svg.append('g')
           .attr('class', 'x axis')
           .attr('transform', 'translate(0,' + options.chartHeight + ')')
           .call(xAxis)
       .append('text')
           .attr('x', 70)
           .attr('y', 20)
           .attr('dy', '.71em')
           .style('text-anchor', 'end')
           .text(options.xLabel);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
          .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(options.yLabel);
    };

    vis.getParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    vis.stackedBarChart = function (data, options) {

        var defaults = {
            svgWidth : 1024,
            svgHeight : 500,
            svgMargin : { top: 20, right: 20, bottom: 30, left: 70 },
            legendWidth : 96
        };

        options = options || {};
        options.svgWidth = options.svgWidth || defaults.svgWidth;
        options.svgHeight = options.svgHeight || defaults.svgHeight;
        options.svgMargin = options.svgMargin || defaults.svgMargin;
        options.legendWidth = options.legendWidth || defaults.legendWidth;

        options.chartWidth = options.svgWidth - options.svgMargin.left - options.svgMargin.right - options.legendWidth,
        options.chartHeight = options.svgHeight - options.svgMargin.top - options.svgMargin.bottom;

        data = _canonicalize(data, options.mapping);

        var buckets = _getBuckets(data);
        var lDescs = _getLayerDescriptors(data);

        data = _applyPadding(data, lDescs, buckets);

        var partitions = _getPartitions(data, lDescs);

        var sortedPartitions = _.sortByOrder(partitions, ['total'], [false]);

        var layers = d3.layout.stack()(sortedPartitions);



    }
})(jQuery,_);