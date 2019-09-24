var columnDefs = [
    {field: "country", chartDataType: 'category'},
    {field: "sugar", chartDataType: 'series'},
    {field: "fat", chartDataType: 'series'},
    {field: "weight", chartDataType: 'series'},
];

var gridOptions = {
    defaultColDef: {
        width: 180,
        resizable: true
    },
    popupParent: document.body,
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableRangeSelection: true,
    enableCharts: true,
    createChartContainer: createChartContainer,
    processChartOptions: processChartOptions,
    onChartOptionsChanged: onChartOptionsChanged,
    onFirstDataRendered: onFirstDataRendered,
};

// used to keep track of chart options per chart type
var savedUserPreferenceByChartType = {};

// used to keep track of user's legend preferences
var savedLegendUserPreference = undefined;

function onChartOptionsChanged(event) {
    var chartOptions = event.chartOptions;

    // changes made by users via the format panel are being saved locally here,
    // however applications can choose to persist them across user sessions.
    savedLegendUserPreference = {
        legend: chartOptions.legend,
        legendPosition: chartOptions.legendPosition,
        legendPadding: chartOptions.legendPadding
    };

    savedUserPreferenceByChartType[event.chartType] = chartOptions;
}

function processChartOptions(params) {
    var overriddenChartOptions = params.options;

    // use saved chart options for specific chart type
    if (savedUserPreferenceByChartType[params.type]) {
        overriddenChartOptions = savedUserPreferenceByChartType[params.type];
    }

    // used shared legend user preference for all chart types
    if (savedLegendUserPreference) {
        overriddenChartOptions.legend = savedLegendUserPreference.legend;
        overriddenChartOptions.legendPosition = savedLegendUserPreference.legendPosition;
        overriddenChartOptions.legendPadding = savedLegendUserPreference.legendPadding;
    }

    // here we fix the chart and axis titles when a bubble chart is selected.
    if (params.type === 'bubble') {
        overriddenChartOptions.title = {
            text: 'Weights for individuals Sugar vs Fat intake',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontSize: 18,
            fontFamily: 'Arial, sans-serif',
            color: 'black'
        };
        overriddenChartOptions.xAxis.title = {
            text: 'Sugar (g)',
            fontWeight: 'bold',
            fontSize: 14,
            fontFamily: 'Arial, sans-serif',
            color: 'black'
        };
        overriddenChartOptions.yAxis.title = {
            text: 'Fat (g)',
            fontWeight: 'bold',
            fontSize: 14,
            fontFamily: 'Arial, sans-serif',
            color: 'black'
        };
    }

    return overriddenChartOptions;
}

let currentChartRef;
function createChartContainer(chartRef) {
    // destroy existing chart
    if (currentChartRef) {
        currentChartRef.destroyChart();
    }

    var eChart = chartRef.chartElement;
    var eParent = document.querySelector('#myChart');
    eParent.appendChild(eChart);
    currentChartRef = chartRef;
}

function onFirstDataRendered(firstDataRenderedParams) {
    let params = {
        cellRange: {
            columns: ['sugar', 'fat', 'weight']
        },
        chartContainer: document.querySelector('#myChart'),
        chartType: 'bubble',
        suppressChartRanges: true
    };

    currentChartRef = firstDataRenderedParams.api.chartRange(params);
}

function createRowData() {
    let countries = ["Ireland", "Spain", "United Kingdom", "France", "Germany", "Luxembourg", "Sweden",
        "Norway", "Italy", "Greece", "Iceland", "Portugal", "Malta", "Brazil", "Argentina",
        "Colombia", "Peru", "Venezuela", "Uruguay", "Belgium"];
    let rowData = [];
    countries.forEach( function(country) {
        rowData.push({
            country: country,
            sugar: Math.floor(Math.floor(Math.random()*50)),
            fat: Math.floor(Math.floor(Math.random()*100)),
            weight: Math.floor(Math.floor(Math.random()*200))
        });
    });
    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
