const resultTable = document.getElementById('resultTable')
const alpha = document.getElementById('alpha')
const sortpvals = document.getElementById('sortpvals')
const yekutieli = document.getElementById('yekutieli')

const pvalues = document.getElementById('pvalues')

// Pre-define some variables to be updated later
let pvArray = Array(pvalues.length).fill(0)
let numbers = Array(pvalues.length).fill(0)
let ranks = Array(pvalues.length).fill(0)
let critvals = Array(pvalues.length).fill(0)
let signif = Array(pvalues.length).fill(0)

function makeDataTableElements() {
  pvArray = pvalues.value.split(',').map(Number)
  // Drop any non-numeric
  pvArray = pvArray.filter((element) => !isNaN(element))
  // Drop outside of (0,1]
  pvArray = pvArray.filter((element) => (element > 0) & (element <= 1))

  // generate entry numbers
  numbers = pvArray.map((_, index) => index + 1)

  // Generate Ranks
  let tmparray
  if (sortpvals.checked) {
    // Need to sort both pvalues and entry numbers
    tmparray = [pvArray, numbers]
    tmparray = tmparray.map(
      (
        (indices) => (a) =>
          indices.map((i) => a[i])
      )(
        [...tmparray[0].keys()].sort((a, b) => tmparray[0][a] - tmparray[0][b]),
      ),
    )
    pvArray = tmparray[0]
    numbers = tmparray[1]
    ranks = pvArray.map((_, index) => index + 1)
  } else {
    ranks = getRankingWithoutSorting(pvArray)
    numbers = pvArray.map((_, index) => index + 1)
  }

  // Define critical values
  const numpvals = pvArray.length
  critvals = ranks.map((x) => (x * alpha.valueAsNumber) / numpvals)
  const digamma1 = -0.5772156649015329
  if (yekutieli.checked) {
    critvals = critvals.map(
      (x) => x / (Math.log(numpvals) - digamma1 + 1 / (2 * numpvals)),
    )
  }
  critvals = critvals.map((x) => Math.round(x * 1000) / 1000)

  let largest = 0
  for (let i = 0; i < pvArray.length; i++) {
    if (pvArray[i] <= critvals[i] && pvArray[i] > largest) {
      largest = pvArray[i]
    }
  }
  signif = pvArray.map((x) => x <= largest)
  signif = signif.map((value) => (value ? 'Yes' : 'No'))

  updateTable()
}

// Evaluate when page loads
document.addEventListener('DOMContentLoaded', makeDataTableElements)

// Track any changes in input
pvalues.addEventListener('input', makeDataTableElements)
alpha.addEventListener('input', makeDataTableElements)
// Adding a second track here makes it more instantaneous

function updateTable() {
  // Reset table
  const critValHeader = document.getElementById('critValHeader')

  critValHeader.innerHTML = yekutieli.checked ? 'B-Y Critical Value' : 'B-H Critical Value'

  for (let i = resultTable.rows.length - 1; i > 0; i--) {
    resultTable.deleteRow(i)
  }

  // Fill up the table
  for (let i = 0; i < pvArray.length; i++) {
    // Create a new table row
    const row = resultTable.insertRow()

    // Create a new table cell (td) for the current number
    const cell0 = row.insertCell(0)
    const cell1 = row.insertCell(1)
    const cell2 = row.insertCell(2)
    const cell3 = row.insertCell(3)
    const cell4 = row.insertCell(4)

    // Set the content of the cell to the current number
    cell0.textContent = numbers[i]
    cell1.textContent = pvArray[i]
    cell2.textContent = ranks[i]
    cell3.textContent = critvals[i]
    cell4.textContent = signif[i]
  }
}

function getRankingWithoutSorting(array, ascending = true) {
  const ranks = []

  for (let i = 0; i < array.length; i++) {
    let rank = 1 // Start with rank 1
    for (let j = 0; j < array.length; j++) {
      if (i !== j) {
        // Compare the current element with every other element
        if (
          (ascending && array[j] < array[i]) ||
          (!ascending && array[j] > array[i])
        ) {
          rank++
        }
      }
    }
    ranks.push(rank)
  }

  return ranks
}

const ctx = document.getElementById('myChart').getContext('2d')
const myChart = new Chart(ctx, {
  type: 'scatter',
  data: {
    labels: Array.from({ length: pvArray.length }, (_, i) => i + 1),
    datasets: [
      {
        type: 'scatter',
        data: pvArray,
        pointBackgroundColor: function (context) {
          const index = context.dataIndex
          return signif[index] === 'Yes' ? 'blue' : 'red'
        },
        pointRadius: 8,
        borderWidth: 0,
      },
      {
        type: 'line',
        data: critvals,
        xAxisID: 'x2', // Specify to which axes to link
        pointRadius: 0,
        borderColor: 'black',
      },
    ],
  },
  options: {
    devicePixelRatio: 4, // fixes blurry-on-firefox issue
    scales: {
      x: {
        display: false,
      },
      x2: {
        // add extra axes
        position: 'bottom',
        type: 'category',
        title: {
          display: true,
          text: 'Number',
          font: {
            size: 15,
          },
        },
        ticks: {
          // Label x-axis with 'numbers', even though we plot 1-n
          callback: function (_value, index) {
            return numbers[index]
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'p-value',
          font: {
            size: 15,
          },
        },
      },
    },

    responsive: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: function () {
            return ''
          },
          beforeLabel: function (tooltipItem) {
            const nbstring = 'Number: ' + numbers[tooltipItem.dataIndex]
            const pvstring = 'p-value: ' + pvArray[tooltipItem.dataIndex]
            const rkstring = 'Rank: ' + ranks[tooltipItem.dataIndex]
            const cvstring = 'Crit Value: ' + critvals[tooltipItem.dataIndex]
            return [nbstring, pvstring, rkstring, cvstring]
          },
          label: function (tooltipItem) {
            return 'Significant: ' + signif[tooltipItem.dataIndex]
          },
        },
      },
      legend: {
        display: false,
      },
    },
  },
})

function updateChart() {
  myChart.data.datasets[0].data = pvArray
  myChart.data.datasets[1].data = critvals
  myChart.data.labels = Array.from({ length: pvArray.length }, (_, i) => i + 1)
  myChart.update()
}

document.addEventListener('DOMContentLoaded', updateChart)
pvalues.addEventListener('input', updateChart)
alpha.addEventListener('input', updateChart)

// Quick and simple export target #table_id into a csv
// From https://stackoverflow.com/a/56370447
function downloadTableAsCSV(tableID) {
  const rows = document.querySelectorAll('table#' + tableID + ' tr')
  const csv = []

  for (let i = 0; i < rows.length; i++) {
    const row = []
    const cols = rows[i].querySelectorAll('td, th')
    for (let j = 0; j < cols.length; j++) {
      // Clean innertext to remove multiple spaces and jumpline
      let rowdata = cols[j].innerText
        .replace(/(\r\n|\n|\r)/gm, '')
        .replace(/(\s\s)/gm, ' ')
      // Escape double-quote with double-double-quote
      // (see https://stackoverflow.com/a/17808731)
      rowdata = rowdata.replace(/"/g, '""')
      // Push escaped string
      row.push('"' + rowdata + '"')
    }
    csv.push(row.join(','))
  }
  const csvString = csv.join('\n')
  // Download it
  const filename =
    'export_' + tableID + '_' + new Date().toLocaleDateString() + '.csv'
  const link = document.createElement('a')
  link.style.display = 'none'
  link.style.visibility = 'none' // This is needed for Safari allegedly
  link.setAttribute('target', '_blank')
  link.setAttribute(
    'href',
    'data:text/csvcharset=utf-8,' + encodeURIComponent(csvString),
  )
  link.setAttribute('download', filename)
  link.click()
}
