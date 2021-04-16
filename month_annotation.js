function addMonthText(monthContainer, width, height) {
  // add text about june commits
  monthContainer.append("text")
    .attr("x", width/2 + padding*4)
    .attr("y", height*0.85)
    .text("June is the month with the most amount")
    .style("text-anchor", "start")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  monthContainer.append("text")
    .attr("x", width/2 + padding*4)
    .attr("y", height*0.85+15)
    .text("of commits pushed to d3 repos, making up")
    .style("text-anchor", "start")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  monthContainer.append("text")
    .attr("x", width/2 + padding*4)
    .attr("y", height*0.85+30)
    .text("more than 20% of all commits")
    .style("text-anchor", "start")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  
  // add september note
  monthContainer.append("text")
    .attr("x", width/2 - padding*16)
    .attr("y", height*0.55)
    .text("September saw the least")
    .style("text-anchor", "end")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  monthContainer.append("text")
    .attr("x", width/2 - padding*16+10)
    .attr("y", height*0.55+15)
    .text("amount of commits, standing at")
    .style("text-anchor", "end")
    .style("font-size", 14)
    .style("font-family", "Cabin");
  monthContainer.append("text")
    .attr("x", width/2 - padding*16+20)
    .attr("y", height*0.55+30)
    .text("only 177 total commits since 2013")
    .style("text-anchor", "end")
    .style("font-size", 14)
    .style("font-family", "Cabin");
}

function addMonthBarAnnotation(monthContainer, height) {
  let monthData = createCommitsByMonthData();
  let monthx = d3.scaleBand()
    .domain(Object.keys(createFakePieData()))
    .range([padding*2.75, 300])
    .padding(0.1);
  let monthy = d3.scaleLinear()
    .domain([0, 1500])
    .range([height*0.97, height*0.85]);
  monthContainer.append("g")
    .attr("transform", "translate(0," + height*0.98 + ")")
    .call(d3.axisBottom(monthx))
    .call(g => g.select(".domain").remove())
    .style("font-family", "Cabin");
  monthContainer.append("g")
    .attr("transform", "translate("+ padding*2.5+"," + 0 + ")")
    .call(d3.axisLeft(monthy).tickFormat(d3.format("d")))
    .call(g => g.select(".domain").remove())
    .style("font-family", "Cabin");
  let monthText = monthContainer.append("text")
    .style("font-family", "Cabin")
    .style("font-size", 10)
    .style("font-weight", "bold")
    .style("text-anchor", "middle");

  monthContainer.selectAll(".bars")
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
  
  addSmallTitleText(monthContainer, (padding*2.75)+(300-padding*2.75)/2, height*0.83, textColor, ["Commits Made By Month"], true);

}