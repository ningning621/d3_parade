function transformMonthDateToFraction(month, date) {
  return Number(month)-1 + (Number(date)-1)/30;
}

function createFakePieData() {
  return {"Jan": 1, "Feb": 1, "Mar": 1, "Apr": 1, "May": 1, "Jun": 1,"Jul": 1,
    "Aug": 1, "Sep": 1, "Oct": 1, "Nov": 1, "Dec": 1 };
}

function createContributionByYearData() {
  return [
    654, 14, 105947, 108651, 21317, 48838, 49733, 18825, 326
  ];
}

function createCommitsByMonthData() {
  return [
    {"month": "Jan", "commits": 478},
    {"month": "Feb", "commits": 539},
    {"month": "Mar", "commits": 576},
    {"month": "Apr", "commits": 470},
    {"month": "May", "commits": 909},
    {"month": "Jun", "commits": 1426},
    {"month": "Jul", "commits": 392},
    {"month": "Aug", "commits": 728},
    {"month": "Sep", "commits": 177},
    {"month": "Oct", "commits": 198},
    {"month": "Nov", "commits": 638},
    {"month": "Dec", "commits": 358}
  ];
}

function getFrequencyByKey(data, str, splitter="::", index = 0) {
  let map = new Map();
  for (var i = 0; i < data.length; i++) {
      let key = data[i][str].split(splitter)[index];
      // let key = data[i][str];
      if (!map.has(key)) {
          map.set(key, 1);
      } else {
          map.set(key, map.get(key) + 1);
      }
  }

  let sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
  return sortedMap;
}

function calculateAmtOfContributions(data, mapKey) {
  let map = new Map();
  for (var i = 0; i < data.length; i++) {
      // let key = data[i]["month"]+"-"+data[i]["year"];
      let key = data[i][mapKey]
      let commitCount = Number(data[i]["insertions"]) + Number(data[i]["deletions"]);
      let insertionsCount = Number(data[i]["insertions"]);
      let deletionCount = Number(data[i]["deletions"]);
      if (!map.has(key)) {
        map.set(key, commitCount);
      } else {
          map.set(key, map.get(key) + commitCount);
      }
  }

  let sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
  return sortedMap;
}

/* FUNCTIONS TO HANDLE TOOLTIP FUNCTIONALITY */

function addTooltipToVis(className) {
  return d3.select("body")
    .append("div")
    .attr("class", className)
    .style("padding", 10)
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("white-space", "pre-line")
    .style("background-color", "#fbfbfb")
    .style("border-radius", "5px")
    .style("border", "1px solid #cdcdcd");
}

function updateToolTipText(tooltip, tooltipText, topOffset, leftOffset) {
  tooltip
    .html(tooltipText)
    .style("font-family", "Cabin")
    .style("font-size", "14px")
    .style("visibility", "visible")
    .style("max-width", 150)
    .style("text-align", "left")
    .style("top", function() { return event.pageY - topOffset + "px"; })
    .style("left", function() { return event.pageX - leftOffset +"px"; });
}

function hideTooltip(tooltip) {
  tooltip.style("visibility", "hidden");
}

/* FUNCTIONS TO DRAW TEXT */

function addSmallTitleText(svg, x, y, textColor, textLst, isWeighted = false) {
  let counter = 0;
  for (var text of textLst) {
    svg.append("text")
      .attr("x", x)
      .attr("y", y+15*counter)
      .text(text)
      .attr("transform", "translate(-2.5, -2.5)")
      .style("font-family", "Ubuntu")
      .style("text-anchor", "middle")
      .style("font-size", 12)
      .style("font-weight", isWeighted ? "bold" : "normal")
      .style("fill", textColor);
      
    counter = counter + 1;
  }
}