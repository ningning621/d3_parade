function drawDonut(svgClass, data) {
  let width = 1200;
  let height = 1000;
  let centerX = width*0.5;
  let centerY = height*0.45;

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
      .style("stroke", greyColor)
      .style("opacity", 0.8);
    svg.append("text")
      .attr("x", centerX)
      .attr("y", centerY)
      .text(i)
      .attr("transform", "translate("+ (-1*(minRingSize+(i-minYear)*spaceBetweenRings)-(spaceBetweenRings/2)) + "," + -2 +")")
      .style("font-family", "Cabin")
      .style("fill", darkGreyColor)
      .style("text-anchor", "middle")
      .style("opacity", 0.8)
      .style("font-size", "8px");
  }

  // draw outer ring for labels
  svg.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", minRingSize+(maxYear-minYear+1)*spaceBetweenRings+10)
    .style("fill", "none")
    .style("stroke", blackColor)
    .style("opacity", 0.8);


  // referenced this to draw a guidelines for months:
  // https://www.d3-graph-gallery.com/graph/donut_basic.html
  let fakePieData = createFakePieData();
  let pie = d3.pie().value(function(d) {return d.value; })

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
    .style("opacity", 0.3);
  
  // referenced this site to display text labels on an arc:
  // https://observablehq.com/@d3/donut-chart
  let textArc =  d3.arc()
      .innerRadius(minRingSize)
      .outerRadius(minRingSize+(maxYear-minYear+12)*spaceBetweenRings+10);

  svg.append("g")
    .attr("font-size", 16)
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
  
  // draw dots on main ring
  // took inspiration from here for graphing in polar coordinates:
  // https://stackoverflow.com/questions/33695073/javascript-polar-scatter-plot-using-d3-js
  svg.selectAll(".dots")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dots")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", function(d) {
      return 3;
    })
    .attr("transform", function(d) {
      let xy = lineRadial([d]).slice(1).slice(0, -1);
      return "translate(" + xy + ")"
    })
    .style("fill", dotColor)
    .style("opacity", 0.6)
    .on("mouseover", function(d) {
      // enlarge circle
      d3.select(this)
        .transition("enlarge")
        .duration(200)
        .style("opacity", 1)
        .attr("r", function() {
          if (buttonSelection == "contributors") {
            return circleScale(Number(d["insertions"]) + Number(d["deletions"])+2);
          } else {
            return 4;
          }
        });

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
        .attr("r", function() {
          if (buttonSelection == "contributors") {
            return circleScale(Number(d["insertions"]) + Number(d["deletions"]));
          } else {
            return 3
          }
        });

      hideTooltip(tooltip);
    });

  // add buttons
  svg.append("text")
    .attr("x", 2+125/2)
    .attr("y", width*0.25 - 20)
    .text("attributes:")
    .style("text-transform", "uppercase")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-family", "Cabin")
    .style("font-size", "16px");
  drawButton(svg, "monthButton", 2, width*0.25, 125, 50, greyColor, whiteColor, "month", circleScale);
  drawButton(svg, "contributionButton", 2, width*0.25 + 50 + 10, 125, 50, greyColor, whiteColor, "contributors", circleScale);
  // drawButton(svg, "repoButton", 2, width*0.25 + 100 + 20, 125, 50, greyColor, whiteColor, "repository", circleScale);

  /* STATIC ANNOTATIONS FOR LEGEND*/
  // add title
  svg.append("text")
    .attr("x", width-padding*7)
    .attr("y", padding*1)
    .text("legend:")
    .style("text-transform", "uppercase")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-family", "Cabin")
    .style("font-size", "16px");
  // add description about rings
  svg.append("text")
    .attr("x", width-padding*7)
    .attr("y", padding*1.25+15)
    .text("Each ring represents a year,")
    .style("font-family", "Cabin")
    .style("font-size", 12)
    .style("text-anchor", "middle");
  svg.append("text")
    .attr("x", width-padding*7)
    .attr("y", padding*1.25+30)
    .text("starting from 2013 to 2021")
    .style("font-family", "Cabin")
    .style("font-size", 12)
    .style("text-anchor", "middle");
  // add fake circles to key
  svg.append("circle")
    .attr("cx", width-padding*7)
    .attr("cy", padding*5)
    .attr("r", padding*2)
    .style("fill", "none")
    .style("opacity", 0.8)
    .style("stroke", blackColor);
  svg.append("circle")
    .attr("cx", width-padding*7)
    .attr("cy", padding*5)
    .attr("r", padding*1.5)
    .style("fill", "none")
    .style("opacity", 0.8)
    .style("stroke", darkGreyColor);
  svg.append("circle")
    .attr("cx", width-padding*7)
    .attr("cy", padding*5)
    .attr("r", padding)
    .style("fill", "none")
    .style("opacity", 0.8)
    .style("stroke", darkGreyColor);
  // add rotation note
  svg.append("text")
    .attr("x", width-padding*4.5)
    .attr("y", padding*4)
    .text("↷ Calendar year")
    .style("font-family", "Cabin")
    .style("font-size", 12)
    .style("text-anchor", "start");
  svg.append("text")
    .attr("x", width-padding*4.5)
    .attr("y", padding*4+15)
    .text("progresses clockwise")
    .style("font-family", "Cabin")
    .style("font-size", 12)
    .style("text-anchor", "start");
  svg.append("text")
    .attr("x", width-padding*4.5)
    .attr("y", padding*4+30)
    .text("around same radius")
    .style("font-family", "Cabin")
    .style("font-size", 12)
    .style("text-anchor", "start");
  // add dot notes
  svg.append("text")
    .attr("x", width-padding*12)
    .attr("y", padding*7.5)
    .text("Each dot represents a ")
    .style("text-anchor", "start")
    .style("font-size", 12)
    .style("font-family", "Cabin");
  svg.append("text")
    .attr("x", width-padding*12)
    .attr("y", padding*7.5+15)
    .text("commit made in a d3 repo.")
    .style("text-anchor", "start")
    .style("font-size", 12)
    .style("font-family", "Cabin");

  // draw dots for legend
  let legendDots = [
    {"x": width-padding*8, "y": padding*6},
    {"x": width-padding*8-10, "y": padding*6-5},
    {"x": width-padding*8-15, "y": padding*6-10},
    {"x": width-padding*8-15, "y": padding*6-30},
    {"x": width-padding*8-5, "y": padding*6+10},
    {"x": width-padding*8+10, "y": padding*6+10},
    {"x": width-padding*8+10, "y": padding*6-10},
    {"x": width-padding*8-5, "y": padding*6-20},
    {"x": width-padding*8+20, "y": padding*6+10}
  ];
  legendDots.forEach(function(d) {
    svg.append("circle")
      .attr("cx", d.x)
      .attr("cy", d.y)
      .attr("r", 2.5)
      .style("fill", dotColor)
      .style("opacity", 0.6)
      .style("stroke", darkGreyColor);
  });

  /* MONTH ANNOTATIONS */
  let annotationContainer = svg.append("g")
    .attr("class", "annotations")
    .attr("id", "monthAnnotations")
    .style("pointer-event", "auto");
  // add most commits arc
  annotationContainer.append('path')
    .attr('d', d3.arc()
      .startAngle(Number(transformMonthDateToFraction(6, 1))/12*(2*Math.PI))
      .endAngle(Number(transformMonthDateToFraction(7, 1))/12*(2*Math.PI))
      .innerRadius(minRingSize+(2024-minYear)*spaceBetweenRings)
      .outerRadius(minRingSize+(2024-minYear)*spaceBetweenRings+2)
    )
    .attr('fill', "none")
    .attr("stroke", purpleColor)
    .attr("transform", "translate(" + centerX  + ", " + centerY + ")")
    .style("stroke-width", "2")
    .style("opacity", 1);
  // add least commits arc 
  annotationContainer.append('path')
    .attr('d', d3.arc()
      .startAngle(Number(transformMonthDateToFraction(9, 1))/12*(2*Math.PI))
      .endAngle(Number(transformMonthDateToFraction(10, 1))/12*(2*Math.PI))
      .innerRadius(minRingSize+(2024-minYear)*spaceBetweenRings)
      .outerRadius(minRingSize+(2024-minYear)*spaceBetweenRings+2)
    )
    .attr('fill', "none")
    .attr("stroke", purpleColor)
    .attr("transform", "translate(" + centerX  + ", " + centerY + ")")
    .style("stroke-width", "2")
    .style("opacity", 1);
    addMonthText(annotationContainer, width, height);
  let monthData = createCommitsByMonthData();
  let monthx = d3.scaleBand()
    .domain(Object.keys(createFakePieData()))
    .range([padding*2.75, 300])
    .padding(0.1);
  let monthy = d3.scaleLinear()
    .domain([0, 1500])
    .range([height*0.97, height*0.85]);
  annotationContainer.append("g")
    .attr("transform", "translate(0," + height*0.98 + ")")
    .call(d3.axisBottom(monthx))
    .call(g => g.select(".domain").remove())
    .style("font-family", "Cabin");
  annotationContainer.append("g")
    .attr("transform", "translate("+ padding*2.5+"," + 0 + ")")
    .call(d3.axisLeft(monthy).tickFormat(d3.format("d")))
    .call(g => g.select(".domain").remove())
    .style("font-family", "Cabin");
  let monthText = annotationContainer.append("text")
    .style("font-family", "Cabin")
    .style("font-size", 10)
    .style("font-weight", "bold")
    .style("text-anchor", "middle");

  annotationContainer.selectAll(".bars")
    .data(monthData)
    .enter()
    .append("rect")
      .attr("id", d => "rect_" + d["month"])
      .attr("x", d => monthx(d["month"]))
      .attr("y", d => monthy(d["commits"]))
      .attr("width", monthx.bandwidth())
      .attr("height", d => monthy(0) - monthy(d["commits"]))
      .style("fill", dotColor)
    .on("mousemove", function(d) {
      monthText.attr("x", monthx(d["month"])+monthx.bandwidth()/2)
        .attr("y", monthy(d["commits"])-5)
        .text(d["commits"])
        .style("opacity", 1);

      d3.select("#rect_" + d["month"])
        .transition()
        .duration(100)
        .style("fill", darkGreyColor);
    })
    .on("mouseout", function(d) {
      monthText.style("opacity", 0);
      d3.select("#rect_" + d["month"])
        .transition()
        .duration(100)
        .style("fill", dotColor);
    });
  
  addSmallTitleText(annotationContainer, (padding*2.75)+(300-padding*2.75)/2, height*0.83, textColor, ["Commits Made By Month"], true);

  /* CONTRIBUTION ANNOTATIONS */
  let contContainer = svg.append("g")
    .attr("class", "annotations")
    .attr("id", "contributorsAnnotations")
    .style("opacity", 0)
    .style("pointer-events", "none"); 
  // draw arcs 
  drawColoredArc(contContainer, centerX, centerY, minYear, minRingSize, spaceBetweenRings, 
    6, 2015, purpleColor);
  drawColoredArc(contContainer, centerX, centerY, minYear, minRingSize, spaceBetweenRings, 
    8, 2018, purpleColor, addPadding = true);
  drawColoredArc(contContainer, centerX, centerY, minYear, minRingSize, spaceBetweenRings, 
    8, 2019, purpleColor, addingPadding = true);
  // add annotation for june 
  contContainer.append('path')
    .attr('d', d3.arc()
      .startAngle(Number(transformMonthDateToFraction(6, 1))/12*(2*Math.PI))
      .endAngle(Number(transformMonthDateToFraction(7, 1))/12*(2*Math.PI))
      .innerRadius(minRingSize+(2024-minYear)*spaceBetweenRings)
      .outerRadius(minRingSize+(2024-minYear)*spaceBetweenRings+2)
    )
    .attr('fill', "none")
    .attr("stroke", purpleColor)
    .attr("transform", "translate(" + centerX  + ", " + centerY + ")")
    .style("stroke-width", "2")
    .style("opacity", 1);
  // add annotation for august 2018
  contContainer.append('path')
    .attr('d', d3.arc()
      .startAngle(Number(transformMonthDateToFraction(8, 1))/12*(2*Math.PI))
      .endAngle(Number(transformMonthDateToFraction(9, 1))/12*(2*Math.PI))
      .innerRadius(minRingSize+(2024-minYear)*spaceBetweenRings)
      .outerRadius(minRingSize+(2024-minYear)*spaceBetweenRings+2)
    )
    .attr('fill', "none")
    .attr("stroke", purpleColor)
    .attr("transform", "translate(" + centerX  + ", " + centerY + ")")
    .style("stroke-width", "2")
    .style("opacity", 1);
  
  addContributorText(contContainer, width, height);
  addContributorLineAnnotation(contContainer, width, height, yearExtent);
}

function getYearFromEvent(eventX, data) {
  let segmentSize = (300-padding*2.75)/8;
  let list = [];
  let counter = 2013;
  for (var i = padding*2.75; i<= 300; i+=segmentSize) {
    list.push({"year": counter, "pxloc": i});
    counter++;
  }
  let year = 2013;
  list.reduce((a, b) => {
    var isLarger = Math.abs(b["pxloc"] - eventX) < Math.abs(a["pxloc"] - eventX);

    if (isLarger) {
      year = b["year"];
      return b;
    } 
    
    year = a["year"];
    return a;
  });
  return year;
}

function jitter() {
  return (Math.floor(Math.random() * (10 - 1 + 1) + 1)) / 10;
}

function handleDotTransition(svg, circleScale, isContribution = false) {
  if (isContribution) {
    svg.selectAll(".dots")
      .transition("dotTransition")
      .duration(150)
      .delay(function(d,i){ return 3*i;})
      .attr("r", d => circleScale(Number(d["insertions"]) + Number(d["deletions"])));
  } else {
    svg.selectAll(".dots")
      .transition("dotTransition")
      .duration(800)
      .delay(function(d,i){ return 3*i;})
      .attr("r", 3);
  }
}

function drawColoredArc(svg, centerX, centerY, minYear, minRingSize, spaceBetweenRings, month, year, color, addPadding = false, isFilled = false) {
  let arc = !addPadding ? 
    d3.arc()
      .startAngle(Number(transformMonthDateToFraction(month, 1))/12*(2*Math.PI)-0.05)
      .endAngle(Number(transformMonthDateToFraction(month+1, 1))/12*(2*Math.PI)+0.05)
      .innerRadius(minRingSize+(year-minYear)*spaceBetweenRings-5)
      .outerRadius(minRingSize+(year-minYear+1)*spaceBetweenRings+5) : 

    d3.arc()
      .startAngle(Number(transformMonthDateToFraction(month, 1))/12*(2*Math.PI)-0.05)
      .endAngle(Number(transformMonthDateToFraction(month+1, 1))/12*(2*Math.PI)+0.05)
      .innerRadius(minRingSize+(year-minYear)*spaceBetweenRings)
      .outerRadius(minRingSize+(year-minYear+1)*spaceBetweenRings);

  svg.append('path')
    .attr('d', arc)
    .attr('fill', isFilled ? color : "none")
    .attr("stroke", color)
    .attr("transform", "translate(" + centerX  + ", " + centerY + ")")
    .style("stroke-width", "4")
    .style("opacity", 0.8);
}

function drawButton(svg, className, x, y, width, height, strokeColor, fillColor, text, circleScale) {
  svg.append("rect")
    .attr("class", className+ "_button")
    .attr("id", "button")
    .attr("x", x)
    .attr("y", y)
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 7)
    .attr("ry", 7)
    .style("stroke", strokeColor)
    .style("fill", text == "month" ? selectionColor : fillColor)
    .style("cursor", "pointer")
    .on("click", function() {
      // handle button changes
      d3.selectAll("#button")
        .transition()
        .duration(200)
        .style("fill", fillColor);
      d3.select(this)
        .transition()
        .duration(200)
        .style("fill", selectionColor);

      // handle annotation changes
      d3.selectAll(".annotations")
        .transition()
        .duration(400)
        .style("opacity", 0)
        .style("pointer-events", "none");
      d3.select("#" + text + "Annotations")
        .transition()
        .duration(400)
        .style("opacity", 1)
        .style("pointer-events", "auto");

      buttonSelection = text;

      // handle circle transition
      if (text == "contributors") {
        handleDotTransition(svg, circleScale, true);
      } else {
        handleDotTransition(svg, circleScale, false);
      }
    });

  svg.append("text")
    .attr("class", className)
    .attr("x", x + width/2)
    .attr("y", y + height/2)
    .text(text)
    .style("text-transform", "uppercase")
    .style("text-anchor", "middle")
    .style("dominant-baseline", "middle")
    .style("font-family", "Cabin")
    .style("cursor", "pointer")
    // .style("font-weight", "bold")
    .style("font-size", "14px")
    .on("click", function() {
      // handle button changes
      d3.selectAll("#button")
        .transition()
        .duration(200)
        .style("fill", fillColor);
      d3.select("."+className+"_button")
        .transition()
        .duration(200)
        .style("fill", selectionColor);

      // handle annotation changes
      d3.selectAll(".annotations")
        .transition()
        .duration(400)
        .style("opacity", 0)
        .style("pointer-events", "none");
      d3.select("#" + text + "Annotations")
        .transition()
        .duration(400)
        .style("opacity", 1)
        .style("pointer-events", "auto");

      buttonSelection = text;

      // handle circle transition
      if (text == "contributors") {
        handleDotTransition(svg, circleScale, true);
      } else {
        handleDotTransition(svg, circleScale, false);
      }
    });
}

