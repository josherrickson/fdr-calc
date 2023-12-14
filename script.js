const resultTable = document.getElementById("resultTable");
let alpha = document.getElementById("alpha");
let sortpvals = document.getElementById("sortpvals");

let pvalues = document.getElementById("pvalues");
let pvArray = Array(pvalues.length).fill(0);
let numbers = Array(pvalues.length).fill(0);
let ranks = Array(pvalues.length).fill(0);
let critvals = Array(pvalues.length).fill(0);
let signif = Array(pvalues.length).fill(0);
let data = Array(pvalues.length).fill(0);

function makeDataTableElements() {
    pvArray = pvalues.value.split(",").map(Number);
    // Drop any non-numeric
    pvArray = pvArray.filter(element => !isNaN(element));
    // Drop outside of (0,1]
    pvArray = pvArray.filter(element => element > 0 & element <= 1);

    // generate entry numbers
    numbers = pvArray.map((_, index) => index + 1);

    // Generate Ranks
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
    critvals = ranks.map(x => x*alpha.valueAsNumber/numpvals);
    const digamma1 = -0.5772156649015328606065120900824024310421593359399
    if (yekutieli.checked) {
        critvals = critvals.map(x => x / (Math.log(numpvals) - digamma1 + 1/(2*numpvals)))
    }
    critvals = critvals.map(x => Math.round(x*1000)/1000);

    let largest = 0;
    for (let i = 0; i < pvArray.length; i++) {
        if (pvArray[i] <= critvals[i] && (pvArray[i] > largest)) {
            largest = pvArray[i];
        }
    }
    signif = pvArray.map(x => x <= largest)
    signif = signif.map(value => value ? "Yes" : "No");

    data = numbers.map(function(val1, index) {
        return {
            number: val1,
            pv: pvArray[index],
            rank: ranks[index],
            critval: critvals[index],
            signif: signif[index]
        };
    });

    updateTable()
}

// Evaluate when page loads
document.addEventListener("DOMContentLoaded", makeDataTableElements);

// Track any changes in input
pvalues.addEventListener("input", makeDataTableElements);
// Most of the change trackers are in the HTML, but for this one, this approach
// makes it more instanteous

function updateTable() {

    // Reset table
    if (yekutieli.checked) {
        resultTable.innerHTML = '<thead> <tr> <th style="text-align: center;"> Number </th> <th style="text-align: center;"> p-value </th> <th style="text-align: center;"> Rank </th> <th style="text-align: center;"> B-Y Critical Value </th> <th style="text-align: center;"> Significant? </th> </tr> </thead> ';
    } else {
        resultTable.innerHTML = '<thead> <tr> <th style="text-align: center;"> Number </th> <th style="text-align: center;"> p-value </th> <th style="text-align: center;"> Rank </th> <th style="text-align: center;"> B-H Critical Value </th> <th style="text-align: center;"> Significant? </th> </tr> </thead> ';
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


let ctx = document.getElementById("myChart").getContext("2d");
let myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        labels: Array.from({length: pvArray.length}, (_, i) => i + 1),
        datasets: [
                {
                    data: pvArray
                }
        ]
    },
    options: {
        responsive: false,
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

function updateChart() {
    myChart.data.datasets[0].data = pvArray
    myChart.data.labels = Array.from({length: pvArray.length}, (_, i) => i + 1)
    myChart.update();
}

document.addEventListener("DOMContentLoaded", updateChart);
pvalues.addEventListener("input", updateChart);
//sortpvals.addEventListener("input", updateChart);
