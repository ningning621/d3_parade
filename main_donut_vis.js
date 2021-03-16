function drawDonut(svgClass, data) {
  let width = 1200;
  let height = 800;
  let centerX = width*0.6;
  let centerY = height*0.5;

  let minRingSize = 60;
  let spaceBetweenRings = 30;

  let svg = d3.select(svgClass);
  let tooltip = addTooltipToVis(".svgToolTip");

  // set up scales
  let yearExtent = d3.extent(data, d => Number(d.year));
  let contributionExtent = d3.extent(data, d => (Number(d.insertions) + Number(d.deletions)))
  let minYear = Number(yearExtent[0]);
  let maxYear = Number(yearExtent[1]);

  let yScale = d3.scaleLinear()
    .domain(yearExtent)
    .range([minRingSize, minRingSize+(maxYear-minYear)*spaceBetweenRings]);

  let lineRadial = d3.lineRadial()
    .angle(function(d) {
      return Number(transformMonthDateToFraction(d["month"], d["date"]))/12*(2*Math.PI);
    })
    .radius(function(d) {
      return yScale(Number(d["year"]) + jitter());
    });

  let circleScale = d3.scaleSqrt()
    .domain(contributionExtent)
    .range([2, 30]);

  // draw concentric rings
  for (var i = minYear; i < maxYear+1; i++) {
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", minRingSize+(i-minYear)*spaceBetweenRings)
      .style("fill", "none")
      .style("stroke", greyColor);
  }

  // draw outer ring for labels
  svg.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", minRingSize+(maxYear-minYear+1)*spaceBetweenRings+10)
    .style("fill", "none")
    .style("stroke", blackColor);


  // referenced this to draw a guidelines for months:
  // https://www.d3-graph-gallery.com/graph/donut_basic.html
  let fakePieData = createFakePieData();
  let pie = d3.pie()
    .value(function(d) {return d.value; })

    drawColoredArc(svg, centerX, centerY, minYear, minRingSize, spaceBetweenRings, 
      1, 2016, greyColor);

  // TODO add labels for year
  const arcs = pie(d3.entries(fakePieData));
  svg.selectAll('.treeRingOutline')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(minRingSize)
      .outerRadius(minRingSize+(maxYear-minYear+1)*spaceBetweenRings+10)
    )
    .attr('fill', "none")
    .attr("stroke", greyColor)
    .attr("transform", "translate(" + centerX  + ", " + centerY + ")")
    .style("stroke-width", "2")
    .style("opacity", 0.4);
  
  // referenced this site to display text labels on an arc:
  // https://observablehq.com/@d3/donut-chart
  let textArc =  d3.arc()
      .innerRadius(minRingSize)
      .outerRadius(minRingSize+(maxYear-minYear+12)*spaceBetweenRings+10);

  svg.append("g")
    .attr("font-size", 14)
    .attr("font-weight", "bold")
    .attr("font-family", "Cabin")
    .attr("text-anchor", "middle")
      .selectAll("text")
      .data(arcs)
      .join("text")
        .attr("transform", d => `translate(${textArc.centroid(d)})` + " translate(" + centerX  + ", " + centerY + ")")
        .call(text =>
          text.append("tspan")
            .text(function(d) { return d.data.key; })
        );

  // draw dots on main tree ring
  // took inspiration from here for graphing in polar coordinates:
  // https://stackoverflow.com/questions/33695073/javascript-polar-scatter-plot-using-d3-js
  svg.selectAll(".dots")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", function(d) {
      return circleScale(Number(d["insertions"]) + Number(d["deletions"]));
    })
    .attr("transform", function(d) {
      let xy = lineRadial([d]).slice(1).slice(0, -1);
      return "translate(" + xy + ")"
    })
    .style("fill", function(d) {
      // if (d["year"] == "2016") return textColor;
      return darkGreyColor;
    }).style("opacity", 0.6)
    .on("mouseover", function(d) {
      // enlarge circle
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .attr("r", circleScale(Number(d["insertions"]) + Number(d["deletions"])) + 2);

      // update tooltip
      var tooltipText = "<b>author:</b> " + d.author
        + "<br/> <b>date:</b> " + d.month + "." + d.date + "." + d.year
        + "<br/> <b>repo:</b> " + d.repo
        + "<br/> <b>insertions:</b> " + d.insertions
        + "<br/> <b>deletions:</b> " + d.deletions;

      updateToolTipText(tooltip, tooltipText, -20, 110);
    })
    .on("mouseout", function(d) {
      // return circle to normal size
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 0.6)
        .attr("r", circleScale(Number(d["insertions"]) + Number(d["deletions"])));

      hideTooltip(tooltip);
    });

  // add buttons
  drawButton(svg, "monthButton", 5, 40, 150, 50, darkGreyColor, greyColor, "month");
  drawButton(svg, "contributionButton", 5, 40 + 50 + 10, 150, 50, darkGreyColor, greyColor, "contribution");
  drawButton(svg, "repoButton", 5, 40 + 100 + 20, 150, 50, darkGreyColor, greyColor, "repository");

}

function jitter() {
  return (Math.floor(Math.random() * (10 - 1 + 1) + 1)) / 10;
}

function drawColoredArc(svg, centerX, centerY, minYear, minRingSize, spaceBetweenRings, month, year, color) {
  svg.append('path')
    .attr('d', d3.arc()
      .startAngle(Number(transformMonthDateToFraction(month, 1))/12*(2*Math.PI))
      .endAngle(Number(transformMonthDateToFraction(month+1, 1))/12*(2*Math.PI))
      .innerRadius(minRingSize+(year-minYear)*spaceBetweenRings)
      .outerRadius(minRingSize+(year-minYear+1)*spaceBetweenRings)
    )
    .attr('fill', color)
    .attr("stroke", color)
    .attr("transform", "translate(" + centerX  + ", " + centerY + ")")
    .style("stroke-width", "2")
    .style("opacity", 1);
}

function drawButton(svg, className, x, y, width, height, strokeColor, fillColor, text) {
  svg.append("rect")
    .attr("class", className)
    .attr("x", x)
    .attr("y", y)
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 7)
    .attr("ry", 7)
    .style("stroke", strokeColor)
    .style("fill", fillColor);

  svg.append("text")
    .attr("class", className)
    .attr("x", x + width/2)
    .attr("y", y + height/2)
    .text(text)
    .style("text-transform", "uppercase")
    .style("text-anchor", "middle")
    .style("dominant-baseline", "middle")
    .style("font-family", "Montserrat")
    .style("font-size", "12px");
}