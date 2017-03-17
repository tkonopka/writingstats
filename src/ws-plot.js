/** ws-plot.js. Copyright 2017 Tomasz Konopka **/

/* global ws */
/* global d3 */
/* global _ */


// core settings for barplot
ws.barplot = {
    w: 520, // width of plot
    h: 200, // height of plot
    margin: [30, 15, 40, 55], // margins (top, right, bottom, left)
    offset: ["-3.5em", "2.5em", "-3em"], // label offsets (top, x, y)
    padding: 0.2, // spacing between bars
    color: ["#961d4e", "#c74e7f"], // colors
    opacity: 0.8, // opacity for unhighlighted
    xlab: "", // x label
    ylab: "", // y label
    strokewidth: 3, // width of highlight stroke
    stroke: "#000"    // color of highlight stroke
};


// namespace for plot functions
ws.plot = {};


/**
 * Make svg element with a title
 * 
 * @param objname DOM object to hold svg
 * @param x object with settings
 */
ws.plot.makeBase = function (objname, x) {

    // precompute plot dimensions	
    x.hinner = x.h - x.margin[0] - x.margin[2];
    x.winner = x.w - x.margin[1] - x.margin[3];

    // create svg element
    var svg = d3.select(objname).append("svg")
            .attr("width", x.w + "px").attr("height", x.h + "px")
            .append("g").attr("transform",
            "translate(" + x.margin[3] + "," + x.margin[0] + ")");

    // create title
    svg.append("text").text(x.title)
            .attr("class", "title")
            .attr("x", 0).attr("y", 0).attr("dy", x.offset[0]);

    return svg;
};


/**
 * Horizontal-bar plot
 * 
 * @param objname target div to contain barplot
 * @param x object holding barplot settings
 * @param data array with values for barplot
 * (must have .value .name)
 * @param barclick function handling barclick
 */
ws.plot.makeBarplotH = function (objname, x, data,
        barclick = ws.plot.defaultClick) {

    // make plot core
    var svg = ws.plot.makeBase(objname, x);

    // create d3 xaxis object
    var xvalues = _.pluck(data, "value");
    xvalues.push(0);
    var xscale = d3.scaleLinear().range([0, x.winner])
            .domain([_.min(xvalues), _.max(xvalues)]);
    var xaxis = d3.axisTop(xscale).ticks(5);
    svg.append("text").text(x.xlab)
            .attr("class", "xlab top")
            .attr("x", 0).attr("y", 0).attr("dy", x.offset[1]);
    var gg = svg.append("g").attr("class", "xaxis")
            .attr("transform", "translate(0,0)").call(xaxis);
    gg.selectAll("path.domain").attr("d", "M" + x.winner + ",0.5H-0.5");

    // create d3 yaxis object
    var yscale = d3.scaleBand().range([0, x.hinner]).padding(x.padding)
            .domain(_.pluck(data, "name"));
    var yaxis = d3.axisLeft(yscale);
    var gg = svg.append("g").attr("class", "yaxis").call(yaxis);
    gg.selectAll("path.domain").attr("d", "M0.5," + x.hinner + "V0.5");

    // create bars    
    svg.selectAll(".bar").data(data).enter().append("rect")
            .attr("class", "bar")
            .attr("fill", x.color[0])
            .attr("opacity", x.opacity)
            .attr("stroke-width", x.strokewidth)
            .attr("x", function (d) {
                return xscale(_.min([0, d.value]));
            })
            .attr("width", function (d) {
                return xscale(_.max([0, d.value]));
            })
            .attr("y", function (d) {
                return yscale(d.name);
            })
            .attr("height", yscale.bandwidth())
            .on('mouseover', function (d) {
                d3.select(this).attr("opacity", 1);
            })
            .on('mouseout', function (d) {
                d3.select(this).attr("opacity", x.opacity);
            })
            .on('click', function (d) {
                barclick(d, this);
            });

};


/**
 * Dummy function, does nothing 
 * It's here to document the required arguments
 * 
 * @param d object describing data for a clicked bar
 * @param bar rect object that is clicked
 * @returns nothing
 */
ws.plot.defaultClick = function (d, bar) {
    return;
};


/**
 * Verical-bar plot
 * 
 * @param objname target div to contain barplot
 * @param x object holding barplot settings
 * @param data array with values for barplot
 * (must have .value .name)
 * @param barclick function that handles click on idividual bars
 */
ws.plot.makeBarplotV = function (objname, x, data,
        barclick = ws.plot.defaultClick) {

    // make plot core
    var svg = ws.plot.makeBase(objname, x);

    // create d3 xaxis object
    var xscale = d3.scaleBand().range([0, x.winner]).padding(x.padding)
            .domain(_.pluck(data, "name"));
    var xaxis = d3.axisBottom(xscale);
    var gg = svg.append("g").attr("class", "xaxis")
            .attr("transform", "translate(0," + x.hinner + ")").call(xaxis);
    gg.selectAll("path.domain").attr("d", "M" + x.winner + ",0.5H-0.5");
    svg.append("text").text(x.xlab).attr("class", "xlab bottom")
            .attr("x", x.winner / 2).attr("y", x.hinner).attr("dy", x.offset[1]);

    // create d3 yaxis object
    var yvalues = _.pluck(data, "value");
    yvalues.push(0);
    var yscale = d3.scaleLinear().range([x.hinner, 0])
            .domain([_.min(yvalues), _.max(yvalues)]);
    var yaxis = d3.axisLeft(yscale).ticks(4);
    var gg = svg.append("g").attr("class", "yaxis").call(yaxis);
    gg.selectAll("path.domain").attr("d", "M0.5," + x.hinner + "V0.5");
    svg.append("text").text(x.ylab).attr("transform", "rotate(-90)")
            .attr("class", "ylab left")
            .attr("x", 0 - (x.h - x.margin[0] - x.margin[2]) / 2)
            .attr("y", 0).attr("dy", x.offset[2]);

    // create bars
    svg.selectAll(".bar").data(data).enter().append("rect")
            .attr("fill", function (d) {
                return d.color;
            })
            .attr("x", function (d) {
                return xscale(d.name);
            })
            .attr("opacity", x.opacity)
            .attr("stroke-width", x.strokewidth)
            .attr("width", xscale.bandwidth())
            .attr("y", function (d) {
                return yscale(_.max([0, d.value]));
            })
            .attr("height", function (d) {
                return Math.sign(d.value) * (yscale(0) - yscale(d.value));
            })
            .on('mouseover', function (d) {
                d3.select(this).attr("opacity", 1);
            })
            .on('mouseout', function (d) {
                d3.select(this).attr("opacity", x.opacity);
            })
            .on('click', function (d) {
                barclick(d, this);
            });
};


/**
 * Remove ticks at non-integers positions (and some integer positions too)
 * 
 * @param selectstring - used for d3 selection
 * @param step - integer, use to remove some crowded integer ticks too
 * @returns 
 */
ws.plot.integerTicks = function (selectstring, step) {
    d3.selectAll(selectstring + " .tick")
            .filter(function () {
                var ticktext = +d3.select(this).select("text").text();
                return ticktext % step !== 0;
            }).remove();
};