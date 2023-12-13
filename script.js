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


    // Generate Ranks
    const sortpvals = document.getElementById("sortpvals");
    let ranks
    if (sortpvals.checked) {
        pvArray.sort((a, b) => a - b);
        ranks = pvArray.map((_, index) => index + 1);
    } else {
        ranks = getRankingWithoutSorting(pvArray)
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
        console.log(largest)
        if (pvArray[i] <= critvals[i] && (pvArray[i] > largest)) {
            largest = pvArray[i];
        }
    }
    let signif = pvArray.map(x => x <= largest)
    signif = signif.map(value => value ? "Yes" : "No");


    // Reset table
    if (yekutieli.checked) {
        resultTable.innerHTML = '<thead> <tr> <th style="text-align: center;"> Rank </th> <th style="text-align: center;"> p-value </th> <th style="text-align: center;"> B-Y Critical Value </th> <th style="text-align: center;"> Significant? </th> </tr> </thead> ';
    } else {
        resultTable.innerHTML = '<thead> <tr> <th style="text-align: center;"> Rank </th> <th style="text-align: center;"> p-value </th> <th style="text-align: center;"> B-H Critical Value </th> <th style="text-align: center;"> Significant? </th> </tr> </thead> ';
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

        // Set the content of the cell to the current number
        cell0.textContent = ranks[i];
        cell1.textContent = pvArray[i];
        cell2.textContent = critvals[i];
        cell3.textContent = signif[i];
    }
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
