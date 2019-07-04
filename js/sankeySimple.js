var SankeySimple = function (container, config) {
  var w = config.width || 700,
      h = config.height || 800;

  //prepare data
  var graph = config.data || {
    "nodes": [
      { "node": 0, "name": "Anhui", "color": "#9E0142"}, // color is optional
      { "node": 1, "name": "CPC (Communist Party of China)", "color": "#D53E4F"},
      { "node": 2, "name": "Hunan", "color": "#F46D43" },
      { "node": 3, "name": "No party affiliation", "color": "#FDAE61"}
    ],
    "links": [
      { "source": 0, "target": 1, "value": 1 },
      { "source": 0, "target": 3, "value": 2 },
      { "source": 2, "target": 1, "value": 2 },
      { "source": 2, "target": 3, "value": 1 }
    ]
  };

  var leftTitle = config.leftTitle || '';
  var rightTitle = config.rightTitle || '';

  var nodeWidth = config.nodeWidth || 36;
  var nodePadding = config.nodePadding || 12;

  var margin = config.margin || {top: 50, right: 50, bottom: 50, left: 50},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;

  var color = config.color || d3.scaleOrdinal(d3.schemeCategory20);
  // d3.scale.ordinal()
  //   .range(["#9E0142", "#D53E4F", "#F46D43", "#FDAE61", "#FEE08B", "#E6F598", "#ABDDA4", "#66C2A5", "#3288BD", "#5E4FA2"]);

  // format variables
  var units = config.units || "";
  var formatNumber = d3.format(",.0f"),    // zero decimal places
      format = function(d) { return formatNumber(d) + " " + units; };

  var svg = d3.select(container).append("svg")
      .classed('sankey', true)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

  // Set the sankey diagram properties
  var sankey = d3.sankey()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .size([width, height]);

  var path = sankey.link();

  // layout
  var layout = function () {

    sankey
          .nodes(graph.nodes)
          .links(graph.links)
          .layout(1);
  
    // relayout
    (function () {
        var left = graph.nodes.filter(function (d) {
           return d.x < width / 2; 
        }).sort(function (a, b) {
            return b.dy - a.dy;
        });

        var right = graph.nodes.filter(function (d) {
           return d.x >= width / 2;
        }).sort(function (a, b) {
            return b.dy - a.dy;
        });
        var leftSum = d3.sum(left, function (d) { return d.dy; });
        var rightSum = d3.sum(right, function (d) { return d.dy; });
        var leftPadding = (height - leftSum) / (left.length - 1);
        var rightPadding = (height - rightSum) / (right.length - 1);
        var ly = 0;
        left.forEach(function (d) {
            d.side = 'left';
            d.y = ly;
            ly += d.dy + leftPadding;
        });
        var ry = 0;
        right.forEach(function (d) {
            d.side = 'right';
            d.y = ry;
            ry += d.dy + rightPadding;
        });

        sankey.relayout();

    } ());
  };
  layout();

  //draw
  var draw = function () {
    var fillColor = function(name, d) {
        d.color = d.color || color(name);
        return d.color;
    };

    // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
      .enter().append("path")
        .attr("class", 'link')
        .attr("d", path)
        .style('stroke', function (d) { return fillColor(d.target.name, d);})
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    // add the link titles
    link.append("title")
          .text(function(d) {
              return d.source.name + " → " + 
                  d.target.name + "\n" + format(d.value); });

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
      .enter().append("g")
        .attr("class", function (d) {
          c = d.side + ' node ';
          return c;
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; })
        // .call(d3.drag()
        //   .subject(function(d) {
        //     return d;
        //   })
        //   .on("start", function() {
        //     this.parentNode.appendChild(this);
        //   })
        //   .on("drag", dragmove));

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) { return fillColor(d.name, d);})
        .style("stroke", function(d) {
            return d3.rgb(d.color).darker(2); })
      .append("title")
        .text(function(d) {
            return d.name + "\n" + format(d.value); });

    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    svg.append('text')
        .attr("x", 0)
        .attr("y", -15)
        .attr("font-size", '16px')
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("transform", null)
        .text(leftTitle);

    svg.append('text')
        .attr("x", width)
        .attr("y", -15)
        .attr("font-size", '16px')
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .attr("transform", null)
        .text(rightTitle);
  };
  draw();

}
