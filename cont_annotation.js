function addContributorText(contContainer, width, height) {
  // add annotation for june
  contContainer.append("text")
    .attr("x", width/2 + padding*4)
    .attr("y", height*0.85)
    .text("June 2015 had the most amount of commits made,")
    .style("text-anchor", "start")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  contContainer.append("text")
    .attr("x", width/2 + padding*4)
    .attr("y", height*0.85+15)
    .text("with 778 commits and 39163 lines changed")
    .style("text-anchor", "start")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  
  // add annotation for august 2018
  contContainer.append("text")
    .attr("x", width*0.22)
    .attr("y", height*0.7)
    .text("August 2018 had the most")
    .style("text-anchor", "end")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  contContainer.append("text")
    .attr("x", width*0.22+10)
    .attr("y", height*0.7+15)
    .text("amount of lines of code added")
    .style("text-anchor", "end")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  contContainer.append("text")
    .attr("x", width*0.22+20)
    .attr("y", height*0.7+30)
    .text("to d3 repos (34020 lines), and")
    .style("text-anchor", "end")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  contContainer.append("text")
    .attr("x", width*0.22+30)
    .attr("y", height*0.7+45)
    .text("August 2019 saw the most amount")
    .style("text-anchor", "end")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  contContainer.append("text")
    .attr("x", width*0.22+40)
    .attr("y", height*0.7+60)
    .text("of deletions (10909 lines)")
    .style("text-anchor", "end")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  
  // button note text
  contContainer.append("text")
    .attr("x", width*0.71)
    .attr("y", height*0.14)
    .text("*Dot radius represents")
    .style("text-anchor", "start")
    .style("font-size", 12)
    .style("font-family", "Cabin");
  contContainer.append("text")
    .attr("x", width*0.71)
    .attr("y", height*0.14+15)
    .text("number of lines changed")
    .style("text-anchor", "start")
    .style("font-size", 12)
    .style("font-family", "Cabin");
  
  // add mike shout out
  contContainer.append("text")
    .attr("x", 10)
    .attr("y", height*0.43+45)
    .text("→ shout out to Mike Bostock")
    .style("text-anchor", "start")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  contContainer.append("text")
    .attr("x", 10)
    .attr("y", height*0.43+60)
    .text("for contributing almost")
    .style("text-anchor", "start")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  contContainer.append("text")
    .attr("x", 10)
    .attr("y", height*0.43+75)
    .text("87% of total commits, with")
    .style("text-anchor", "start")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  contContainer.append("text")
    .attr("x", 10)
    .attr("y", height*0.43+90)
    .text("329,153 lines of code changes")
    .style("text-anchor", "start")
    .style("font-size", 14)
    .style("font-family", "Cabin");
}

function addContributorLineAnnotation(contContainer, width, height, yearExtent) {
  let minYear = 2013;
  let contData = createContributionByYearData();
  let contx = d3.scaleLinear()
    .domain(yearExtent)
    .range([padding*2.75, 300]);
  let conty = d3.scaleLinear()
    .domain([0, 110000])
    .range([height*0.97, height*0.85]);
  contContainer.append("path")
    .datum(contData)
    .style("fill", "none")
    .style("stroke", dotColor)
    .style("stroke-width", 2)
    .attr("d", d3.line()
      .x(function(d, i) { return contx(minYear+i) })
      .y(function(d) { return conty(d) })
      .curve(d3.curveCatmullRom.alpha(0.5))
      );
  contContainer.append("g")
    .attr("transform", "translate(0," + height*0.98 + ")")
    .call(d3.axisBottom(contx).tickFormat(d3.format("d")))
    .call(g => g.select(".domain").remove())
    .style("font-family", "Cabin");
  contContainer.append("g")
    .attr("transform", "translate("+ padding*2.5+"," + 0 + ")")
    .call(d3.axisLeft(conty).tickFormat(d3.format("d")).ticks(5))
    .call(g => g.select(".domain").remove())
    .style("font-family", "Cabin");

  // overlay for mouseover
  let circle = contContainer.append("circle")
    .attr("r", 5)
    .style("opacity", 0)
    .style("fill", darkGreyColor);
  let circleText = contContainer.append("text")
    .style("font-family", "Cabin")
    .style("font-weight", "bold")
    .style("opacity", 1)
    .style("font-size", 12);
  contContainer.append("rect")
    .datum(contData)
    .attr("x", padding*2.75)
    .attr("y", height*0.85)
    .attr("width", 300-padding*2.75)
    .attr("height", height*0.97-height*0.85)
    .style("opacity", 0)
    .on("mousemove", function(d) {
      let year = getYearFromEvent(d3.mouse(this)[0], contData);
      circle.attr("transform", "translate("+ contx(year) +","+ conty(contData[year-2013]) +")")
        .style("opacity", 1);
      circleText.attr("x",contx(year)+10)
        .attr("y", conty(contData[year-2013])-10)
        .text("Lines Changed: " +contData[year-2013])
        .style("opacity", 1);
    })
    .on("mouseout", function() {
      circle.style("opacity", 0)
      circleText.style("opacity", 0);
    });

  addSmallTitleText(contContainer, (padding*2.75)+(300-padding*2.75)/2, height*0.83, textColor, ["Amount of Lines Changed by Year"], true);
}

function addMikeToggle(contContainer, width, height) {
  contContainer.append("circle")
    .attr("id", "toggle")
    .attr("cx", 10)
    .attr("cy", height*0.55)
    .attr("r", 7)
    .style("fill", "#fbfbfb")
    .style("stroke", darkGreyColor)
    .style("stroke-width", 2)
    .on("click", function() {
      isMike = !isMike;
      if (isMike) {
        d3.selectAll("#is_mike")
          .transition()
          .duration(800)
          .style("fill", highlightColor);

        // handle toggle click
        d3.select(this) 
          .transition()
          .duration(200)
          .style("fill", highlightColor);
      } else {
        d3.selectAll("#is_mike")
          .transition()
          .duration(800)
          .style("fill", dotColor);

        // handle toggle click
        d3.select(this) 
          .transition()
          .duration(200)
          .style("fill", "#fbfbfb");
      }
    });

  contContainer.append("text")
    .attr("x", 27)
    .attr("y", height*0.55)
    .text("toggle for Mike's contributions")
    .style("font-size", 14)
    .style("alignment-baseline", "middle")
    .style("font-family", "Cabin");
}