var margin = {
    top: 40,
    right: 1,
    bottom: 6,
    left: 20
  }
var width = window.innerWidth - 20 - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;
var animDuration = 800;

var formatNumber = d3.format(",.0f");
var format = function(d) {
    return formatNumber(d) + " ";
  };
var color = d3.scaleOrdinal(d3.schemeCategory20);

var drag_behavior = d3.drag()
                      .on("start", drag_start)
                      .on("drag", dragged);

var color_spec = {
  "goal_1" : "#97ba4c",
  "goal_2" : "#367d85",
  "goal_3" : "#edbd00",
  "goal_1_1" : "#97ba4c",
  "goal_1_2" : "#97ba4c",
  "goal_1_3" : "#97ba4c",
  // "goal_1" : "#97ba4c",
  "goal_2_1" : "#367d85",
  "goal_2_2" : "#367d85",
  "goal_2_3" : "#367d85",
  "goal_2_4" : "#367d85",

  "goal_3_1" : "#edbd00",
  "goal_3_2" : "#edbd00",

  "final_score" : "#5c5b97"
}

var info_box = d3.select('body')
  .append('div')
  .attr('id','info_box')
  .classed('info_box',true)
  .html('<h5 id="about_header" class="card-title mx-2 my-2">Nod information<span style="float:right;cursor:pointer;"><button type="button" class="close" aria-label="Close"><span onclick="toggle_infobox(1,1)" aria-hidden="true">&times;</span></button></span></h5>');

var text_content =     info_box.append('p')
        .classed('m-3',true);


var svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var links = svg.append("g");
var nodes = svg.append("g");
var headers = svg.append("g");

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

  create_sankey();
});

var pillars_x = [];
var pillar_names = ["Strategi","Fokusområden","Delmål", "Effektmål"];

function create_sankey() {

  var link = links.selectAll(".link")
    .data(sankey.links());

  var newLink = link.enter().append("path")
      .attr("class", "link")
      .style("stroke-width", function (d) {
        return Math.max(1, d.dy) + 'px';
      })
      .style('stroke',function(d){
        // console.log(d.source.id);
        if(d.source.id != undefined){
          if(color_spec[d.source.id] != undefined){
            return color_spec[d.source.id];
          }
        }
        return 'darkblue';
      });

  newLink.append("title")
    .text(function (d) {
      return d.source.name + " → " + d.target.name;
    });

  link = newLink.merge(link);

  link.transition()
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
  })
  .on('click',function(d){
      toggle_infobox(d,0);
  });
  // .call(drag_behavior);


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
      // console.log(d.id);
      if(color_spec[d.id] != undefined){
        return d.color = color_spec[d.id];
      }
      return d.color = color(d.name.replace(/ .*/, ""));
    })
    .style("stroke", function (d) {
      return d3.rgb(d.color).darker(1);
    })
    .style('stroke-width','0.5px')
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

  pillars = headers.selectAll(".pillar_names")
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
    .attr("text-anchor", "start");
}

function drag_start(d) {
    // .subject(function(d) { return d; })
    // .on("start", function() {
    d3.event.sourceEvent.stopPropagation();
    d3.event.sourceEvent.preventDefault();
    this.parentNode.appendChild(this);
    // .on("drag", dragmove))
}

function dragged(d){
  // console.log(d);
  var link = links.selectAll(".link")
    .data(sankey.links());
    // console.log(height-d.dy);
    // console.log(this);
    // console.log(d3.event);
    // console.log(d3.event.y);
  d3.select(this).attr("transform",
      "translate(" + d.x  + "," + (
              d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
          ) + ")");
  sankey.relayout();
  link.attr("d", path);
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
  create_sankey();
});






////////////////////////////////

var info_showed = 1;
function toggle_infobox(d,a){
  if(a == 0){
    d3.select('.info_box')
      .style('display','initial');
      // console.log(d);
      text_content.html("<b>"+d.name + "</b><br>\n<hr style='width:90%;border: 2px solid #5c5b97; border-radius:2px;'>" + "Info Text <br>" + "");
  } else if(a == 1){
    d3.select('.info_box')
      .style('display','none');
  }
  info_showed = a;
}

var about_showed = 1;
function toggle_about(a){
  if(a == 0){
    d3.select(".about_box")
      .style("display","initial");
    d3.select(".inner_content")
      .classed("blurredElement",true);
  } else if(a == 1) {
    d3.select(".about_box")
      .style("display","none");
    d3.select(".inner_content")
      .classed("blurredElement",false);
  }
  about_showed = a;
}


window.addEventListener('click', function(e){
  if (document.getElementById('about_box').contains(e.target)){
    // Clicked in box
  } else{
    // Clicked outside the box
    if(!document.getElementById('about_tog').contains(e.target) && about_showed == 0){
      toggle_about(1);
    }
  }
  if (document.getElementById('info_box').contains(e.target)){
    // Clicked in box
  } else{
    // Clicked outside the box
    if(info_showed == 2){
      toggle_infobox("",1);
    }
    if(info_showed == 0){
      info_showed =2;
    }
  }
});
