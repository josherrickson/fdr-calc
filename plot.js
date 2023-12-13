// Example data (replace this with your actual data)

function drawPlot(numbers, pvArray, ranks, critvals, signif, width, height) {

    // Convert to a singless array
    var data = numbers.map(function(val1, index) {
        return {
            number: val1,
            pv: pvArray[index],
            rank: ranks[index],
            critval: critvals[index],
            signif: signif[index]
        };
    });

    // Set up scales
    const x = d3.scaleLinear()
          .domain([1, pvArray.length])
          .range([40, width - 40]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
          .domain([0, Math.max(...pvArray.concat(critvals))])
          .range([height - 40, 40]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Create circles for scatter plot
    svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", function (d, i) { return x(i + 1); } )
        .attr("cy", function (d) { return y(d.pv); } )
        .attr("r", 4)
        .style("fill", d => (d.signif === "Yes") ? "blue" : "red");

    // Create line plot
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
              .x(function(d, i) { return x(i + 1) })
              .y(function(d) { return y(d.critval) })
             )
}
