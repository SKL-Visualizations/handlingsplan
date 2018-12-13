var margin = {
    top: 40,
    right: 1,
    bottom: 6,
    left: 1
  },
  width = window.innerWidth - 20 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom,
  animDuration = 800;

var formatNumber = d3.format(",.0f"),
  format = function(d) {
    return formatNumber(d) + " ";
  },
  color = d3.scaleOrdinal(d3.schemeCategory20);

var svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var links = svg.append("g"),
    nodes = svg.append("g");

var sankey = d3.sankey()
  .nodeWidth(15)
  .nodePadding(10)
  .size([width, height])
  .align('right');

var path = sankey.link();
//https://bl.ocks.org/vasturiano/b0b14f2e58fdeb0da61e62d51c649908
//https://bl.ocks.org/d3noob/013054e8d7807dff76247b81b0e29030
//https://beta.observablehq.com/@mbostock/d3-sankey-diagram
//https://github.com/d3/d3-sankey
//http://blockbuilder.org/SpaceActuary/2a46e03eb7b7e05f48e6251054501244
//https://bl.ocks.org/wvengen/2a71af9df0a0655a470d
//http://jsfiddle.net/88Akd/
//http://bl.ocks.org/FabricioRHS/80ef58d4390b06305c91fdc831844009
//https://gist.github.com/d3noob/9bd82617061e04ad9540
//https://bl.ocks.org/d3noob/d7800f34062b116f9ec0588f2e85e549
d3.json("data/data.json", function(energy) {
  sankey
    .nodes(energy.nodes)
    .links(energy.links)
    .layout(32);

  d3Digest();
});

var pillars_x = [];
var pillar_names = ["Strategi","Fokusområden","Delmål", "Effektmål"];

function d3Digest() {

  var link = links.selectAll(".link")
    .data(sankey.links());

  var newLink = link.enter().append("path")
      .attr("class", "link")
      .style("stroke-width", function (d) {
        return Math.max(1, d.dy) + 'px';
      });

  newLink.append("title")
    .text(function (d) {
      return d.source.name + " → " + d.target.name + "\n" + format(d.value);
    });

  link = newLink.merge(link);

  link.transition().duration(animDuration)
    .attr("d", path)
    .style("stroke-width", function (d) {
      return Math.max(1, d.dy) + 'px';
    });

  var node = nodes.selectAll(".node")
    .data(sankey.nodes());

  var newNode = node.enter().append("g")
    .attr("class", "node");

  newNode.attr("transform", function (d) {
    pillars_x.push(d.x);
    return "translate(" + d.x + "," + d.y + ")";
  });

  node.transition().duration(animDuration)
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  node = newNode.merge(node);

  newNode.append('rect');
  newNode.append('text');

  newNode.select("rect")
    .attr("width", sankey.nodeWidth())
    .attr("height", function (d) {
      return d.dy;
    })
    .append("title")
      .text(function (d) {
        return d.name + "\n" + format(d.value);
      });

  node.select("rect")
    .style("fill", function (d) {
      return d.color = color(d.name.replace(/ .*/, ""));
    })
    .style("stroke", function (d) {
      return d3.rgb(d.color).darker(2);
    })
    .transition().duration(animDuration)
      .attr("height", function (d) {
        return d.dy;
      });

  newNode.select("text")
    .attr("dy", ".35em")
    .attr("transform", null)
    .attr("y", function (d) {
      return d.dy / 2;
    });

  node.select("text")
    .text(function (d) {
      return d.name;
    })
    .attr("x", -6)
    .attr("text-anchor", "end")
    .filter(function (d) {
      return d.x < width / 2;
    })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

  node.select('text').transition().duration(animDuration)
    .attr("y", function (d) {
      return d.dy / 2;
    });
  // console.log();
  pillars_x = uniq(pillars_x);

  pillars = nodes.selectAll(".pillar_names")
    .data(pillar_names);

  pillar = pillars.enter().append("g")
    .attr("class", "pillar");

  pillar.attr("transform", function (d,i) {
    return "translate(" + (pillars_x[i]+sankey.nodeWidth()) + "," + -10 + ")";
  });
  pillar.append('text').text(function(d){return d;})
  .attr("text-anchor", "end")
  .attr('font-weight','bold')
  .filter(function (d,i) {
    return pillars_x[i] < width / 2;
  })
    .attr("x", -1*sankey.nodeWidth())
    .attr("text-anchor", "start");;


}

function uniq(a) {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];
    return a.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
}

// Radio button change
d3.selectAll('.sankey-align').on('change', function() {
  sankey.align(this.value)
        .layout(32);
  d3Digest();
});
