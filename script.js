function updateTable() {
    const resultTable = document.getElementById("resultTable");
    const alpha = document.getElementById("alpha");

    // Get p-values and clean them
    const pvalues = document.getElementById("pvalues");
    // Split string and convert to numeric
    let pvArray = pvalues.value.split(",").map(Number);
    // Drop any non-numeric
    pvArray = pvArray.filter(element => !isNaN(element));
    // Drop outside of (0,1]
    pvArray = pvArray.filter(element => element > 0 & element <= 1);

    // generate entry numbers
    let numbers = pvArray.map((_, index) => index + 1);

    // Generate Ranks
    const sortpvals = document.getElementById("sortpvals");
    let ranks
    let tmparray;
    if (sortpvals.checked) {
        // Need to sort both pvalues and entry numbers
        tmparray = [pvArray, numbers];
        tmparray = tmparray.map(
            (indices => a => indices.map(i => a[i]))
            ([...tmparray[0].keys()].sort((a, b) => tmparray[0][a] - tmparray[0][b]))
        )
        pvArray = tmparray[0];
        numbers = tmparray[1];
        ranks = pvArray.map((_, index) => index + 1);
    } else {
        ranks = getRankingWithoutSorting(pvArray)
        numbers = pvArray.map((_, index) => index + 1);
    }

    // Define critical values
    const numpvals = pvArray.length
    let critvals = ranks.map(x => x*alpha.valueAsNumber/numpvals);
    const digamma1 = -0.5772156649015328606065120900824024310421593359399
    if (yekutieli.checked) {
        critvals = critvals.map(x => x / (Math.log(numpvals) - digamma1 + 1/(2*numpvals)))
    }
    critvals = critvals.map(x => Math.round(x*1000)/1000);


    // Get significance
    let largest = 0;
    for (let i = 0; i < pvArray.length; i++) {
        if (pvArray[i] <= critvals[i] && (pvArray[i] > largest)) {
            largest = pvArray[i];
        }
    }
    let signif = pvArray.map(x => x <= largest)
    signif = signif.map(value => value ? "Yes" : "No");


    // Reset table
    if (yekutieli.checked) {
        resultTable.innerHTML = '<thead> <tr> <th style="text-align: center;"> Number </th> <th style="text-align: center;"> p-value </th> <th style="text-align: center;"> rank </th> <th style="text-align: center;"> B-Y Critical Value </th> <th style="text-align: center;"> Significant? </th> </tr> </thead> ';
    } else {
        resultTable.innerHTML = '<thead> <tr> <th style="text-align: center;"> Number </th> <th style="text-align: center;"> p-value </th> <th style="text-align: center;"> rank </th> <th style="text-align: center;"> B-K Critical Value </th> <th style="text-align: center;"> Significant? </th> </tr> </thead> ';
    }

    // Fill up the table
    for (let i = 0; i < pvArray.length; i++) {
        // Create a new table row
        const row = resultTable.insertRow();

        // Create a new table cell (td) for the current number
        const cell0 = row.insertCell(0);
        const cell1 = row.insertCell(1);
        const cell2 = row.insertCell(2);
        const cell3 = row.insertCell(3);
        const cell4 = row.insertCell(4);

        // Set the content of the cell to the current number
        cell0.textContent = numbers[i];
        cell1.textContent = pvArray[i];
        cell2.textContent = ranks[i];
        cell3.textContent = critvals[i];
        cell4.textContent = signif[i];
    }

    drawPlot(numbers, pvArray, ranks, critvals, signif, width, height);

}

function getRankingWithoutSorting(array, ascending = true) {
    const ranks = [];

    for (let i = 0; i < array.length; i++) {
        let rank = 1; // Start with rank 1
        for (let j = 0; j < array.length; j++) {
            if (i !== j) {
                // Compare the current element with every other element
                if ((ascending && array[j] < array[i]) || (!ascending && array[j] > array[i])) {
                    rank++;
                }
            }
        }
        ranks.push(rank);
    }

    return ranks;
}

// Update table on load
document.addEventListener('DOMContentLoaded', function() {
    updateTable()
}, false);


// Set up the SVG container
const margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

const svg = d3.select("#plot-container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
