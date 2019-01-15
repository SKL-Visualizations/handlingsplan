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

var drag_2 = d3.drag()
                // .on('start',move_start)
                .on('drag',move_pillar);

                var cc = clickcancel();


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

var nnodes;
var llinks;

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

// Set up dictionary of neighbors
var node2neighbors = {};


function make_sankey(nodes_,links_){

  var nodez = [];
  var linkz = [];
  for(var i = 0; i < nodes_.length; i++){
    var obj = {};
    obj.name = nodes_[i].name;
    obj.id = nodes_[i].id;
    obj.pillar = nodes_[i].pillar;
    obj.click = nodes_[i].click;
    obj.mouseover = nodes_[i].mouseover;
    obj.target_source = nodes_[i].target_source;
    nodez.push(obj);
  }
  for(var i = 0; i < links_.length; i++){
    var obj = {};
    obj.source = links_[i].source;
    obj.value = links_[i].value;
    obj.target = links_[i].target;
    linkz.push(obj);
  }
  var json = {
    "nodes" : nodez,
    "links" : linkz
  };

  for (var i =0; i < json.nodes.length; i++){
  	// var name = json.nodes[i].name;
    var name = json.nodes[i].target_source;
    // console.log(name);

  	node2neighbors[name] = json.links.filter(function(d){
      // console.log(d.target);
  			return d.source == name || d.target == name;
  		}).map(function(d){
  			return d.source == name ? d.target : d.source;
  		});
  }
  // console.log(node2neighbors);

  console.log(json);
    // d3.json("data/del.json", function(energy) {
    // nnodes = nodez;
    // llinks = links;
      sankey
        .nodes(json.nodes)
        .links(json.links)
        // .align('right')
        .layout(32);
      create_sankey();
}



d3.json("data/data_new.json", function(energy) {
  nnodes = energy.nodes;
  llinks = energy.links;


  // console.log(flatten(energy.nodes));
  // console.log(sankey.nodes());
  make_sankey(energy.nodes, energy.links);
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
      })
      .attr('id', function(d){
        // console.log(d);
        return 'link_' + d.source.target_source;
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
  .call(cc);

  // .call(drag_behavior);

  cc.on('click', function(d, index) {
    toggle_infobox(d, 0);
  });
  cc.on('dblclick', function(d, index) {

    // Determine if current node's neighbors and their links are visible
       var active   = d.active ? false : true // toggle whether node is active
       , newOpacity = active ? 0 : 1;

       // Extract node's name and the names of its neighbors
       var name     = d.target_source
       , neighbors  = node2neighbors[name];
       // console.log(neighbors);
       if(name == 0 && neighbors.length!=4){
         neighbors.unshift(0);
       }
       // Hide the neighbors and their links
       rec(neighbors, newOpacity);
       // Update whether or not the node is active
       d.active = active;  });

   function rec(neighbors,newOpacity){
     // console.log(neighbors);
     // if()
     for (var i = 1; i < neighbors.length; i++){
       d3.select("#node_" + neighbors[i]).transition().style("opacity", newOpacity);
       d3.selectAll("#link_" + neighbors[i]).transition().style("opacity", newOpacity);
       var neg = node2neighbors[neighbors[i]];
       for(var j = 0; j < neg.length; j++){
         if(neg[j] > neighbors[i]){
           // console.log(neg);
           j == neg.length;
           rec(neg,newOpacity);
         }
       }
     }
   }

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


    node.attr('id', function(d){
      // console.log(d);
      return 'node_' + d.target_source;
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
  .attr('value',function(d,i){return i})
  .call(drag_2)

  .filter(function (d,i) {
    return pillars_x[i] < width / 2;
  })
    .attr("x", -1*sankey.nodeWidth())
    .attr("text-anchor", "start");

    covfefe();

}
function covfefe(){
  console.log(sankey.links());
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.targetLinks) node.targetLinks.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(root);
  return nodes;
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
      "translate(" + (d.x = d3.event.x)  + "," + (
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
  make_sankey(nnodes, llinks);
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


var removed_list = [];


function move_pillar(x){
  var who = this.getAttribute('value');
  // console.log(this.getAttribute('value'));
  var link = links.selectAll(".link")
    .data(sankey.links());
  var node = nodes.selectAll(".node")
    .data(sankey.nodes());
  node.filter(function(d){
      // console.log(d);
      if(d.pillar == parseInt(who)){
        return true;
      }
      return false;
    })
    .attr("transform", function(d){
    // return  "translate(" + (d.x = d3.event.x)  + "," + (
    // console.log(d3.event.sourceEvent.clientX);
    return "translate(" + (d.x = Math.max(0, Math.min(width - d.dx, d3.event.sourceEvent.clientX))) + "," + (
              d.y
          ) + ")";
    });
    sankey.relayout();
    link.attr("d", path);
    d3.select(this)
        .attr("transform", function(d){
        return "translate(" + d3.event.x + "," + (
                  0
              ) + ")";
        });
}


window.addEventListener('click', function(e){

      // sankey
      // .nodeWidth(15)
      // .nodePadding(10)
      // .size([400, 400])
      // .align('right')
      // .layout(32);
    // create_sankey();
      // link.attr("d", path);
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


function clickcancel() {
  // we want to a distinguish single/double click
  // details http://bl.ocks.org/couchand/6394506
  var dispatcher = d3.dispatch('click', 'dblclick');
  function cc(selection) {
      var down, tolerance = 5, last, wait = null, args;
      // euclidean distance
      function dist(a, b) {
          return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
      }
      selection.on('mousedown', function() {
          down = d3.mouse(document.body);
          last = +new Date();
          args = arguments;
      });
      selection.on('mouseup', function() {
          if (dist(down, d3.mouse(document.body)) > tolerance) {
              return;
          } else {
              if (wait) {
                  window.clearTimeout(wait);
                  wait = null;
                  dispatcher.apply("dblclick", this, args);
              } else {
                  wait = window.setTimeout((function() {
                      return function() {
                          dispatcher.apply("click", this, args);
                          wait = null;
                      };
                  })(), 300);
              }
          }
      });
  };
  // Copies a variable number of methods from source to target.
  var d3rebind = function(target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };

  // Method is assumed to be a standard D3 getter-setter:
  // If passed with no arguments, gets the value.
  // If passed with arguments, sets the value and returns the target.
  function d3_rebind(target, source, method) {
    return function() {
      var value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }
  return d3rebind(cc, dispatcher, 'on');
}
