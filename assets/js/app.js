// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 90,
    left: 80
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "income";
var chosenYAxis = "healthcare";

// functions used for updating x-scale and y-scale var upon click on axis label
function xScale(cenData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(cenData, d => d[chosenXAxis]) * 0.8,
        d3.max(cenData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

function yScale(cenData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(cenData, d => d[chosenYAxis]) / 1.5, d3.max(cenData, d => d[chosenYAxis])])
        .range([height, 0]);
    return yLinearScale;
}

// function used for updating xAxis and yAxis var upon click on axis label
function renderXaxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

function renderYaxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis, textLabel) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    textLabel.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis, textLabel) {
    console.log(textLabel)
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    textLabel.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis]))
    return circlesGroup;
}

//function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var xlabel;
    var ylabel;

    if (chosenXAxis === "income") {
        xlabel = "Income:";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Age:";
    }
    else
        xlabel = "% Poverty:";

    if (chosenYAxis === "healthcare") {
        ylabel = "% Without Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "% Smokers:";
    }
    else
        ylabel = "% Obesity:";


    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .direction('n')
        .html(function (d) {
            return (`${d.abbr}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

////read csv

d3.csv("assets/data/data.csv").then(function (cenData) {
    console.log(cenData);
    cenData.forEach(data => {
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.poverty = +data.poverty;

    });
    // xLinearScale function above csv import
    var xLinearScale = xScale(cenData, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(cenData, d => d.healthcare)])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, ${width})`)
        .call(leftAxis);


    // append y axis
    chartGroup.append("g")
        .call(leftAxis);


    var circlesGroup = chartGroup.selectAll("circle")
        .data(cenData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .classed("stateCircle", true)
        .attr("r", 15);

    var textLabel = chartGroup.selectAll("stateText")
        .data(cenData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(d => d.abbr)
        .attr("dominate-baseline", "middle")
        .attr("text-anchor", "middle");

    console.log(textLabel);

    // Create group for two x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "income")
        .classed("active", true)
        .text("Income (Median)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var povLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "poverty")
        .classed("inactive", true)
        .text("In Poverty (%)");

    // y axis group labels

    var ylabelsGroup = chartGroup.append("g")

    var healthLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Without Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokers (%)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obesity (%)");


    // updateToolTip function 
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(cenData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXaxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis, textLabel);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis == "age") {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                console.log(chosenYAxis)

                // updates y scale for new data
                yLinearScale = yScale(cenData, chosenYAxis);

                // updates y axis 
                yAxis = renderYaxes(yLinearScale, yAxis);

                // updates circles 
                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis, textLabel);

                // updates tooltips 
                circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

                if (chosenYAxis === "healthcare") {
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis == "smokes") {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

}).catch(function (error) {
    console.log(error);
});