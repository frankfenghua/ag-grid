
var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: 'agTextColumnFilter'},
    {headerName: "Gold", field: "gold", width: 100, floatingFilterComponent:'customNumberFloatingFilter',
        floatingFilterComponentParams:{
            suppressFilterButton:true
        }, filter: 'customNumberFilter'
    },
    {headerName: "Silver", field: "silver", width: 100, floatingFilterComponent:'customNumberFloatingFilter',
        floatingFilterComponentParams:{
            suppressFilterButton:true
        }, filter: 'customNumberFilter'},
    {headerName: "Bronze", field: "bronze", width: 100, floatingFilterComponent:'customNumberFloatingFilter',
        floatingFilterComponentParams:{
            suppressFilterButton:true
        }, filter: 'customNumberFilter'},
    {headerName: "Total", field: "total", width: 100, floatingFilterComponent:'customNumberFloatingFilter',
        floatingFilterComponentParams:{
            suppressFilterButton:true
        }, filter: 'customNumberFilter'}
];

var gridOptions = {
    defaultColDef: {
        filter: true
    },
    components:{
        customNumberFloatingFilter: getNumberFloatingFilterComponent(),
        customNumberFilter: getNumberFilterComponent ()
    },
    floatingFilter:true,
    columnDefs: columnDefs,
    rowData: null
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getNumberFilterComponent (){
    function NumberFilter() {
    }

    NumberFilter.prototype.init = function (params) {
        this.valueGetter = params.valueGetter;
        this.filterText = null;
        this.params = params;
        this.setupGui();
    };

    // not called by ag-Grid, just for us to help setup
    NumberFilter.prototype.setupGui = function () {
        this.gui = document.createElement('div');
        this.gui.innerHTML =
            '<div style="padding: 4px;">' +
            '<div style="font-weight: bold;">Greater than: </div>' +
            '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Number of medals..."/></div>' +
            '</div>';

        var that = this;
        this.onFilterChanged = function() {
            that.extractFilterText();
            that.params.filterChangedCallback();
        };

        this.eFilterText = this.gui.querySelector('#filterText');
        this.eFilterText.addEventListener("input", this.onFilterChanged);
    };

    NumberFilter.prototype.extractFilterText = function () {
        this.filterText = this.eFilterText.value;
    };

    NumberFilter.prototype.getGui = function () {
        return this.gui;
    };

    NumberFilter.prototype.doesFilterPass = function (params) {
        var valueGetter = this.valueGetter;
        var value = valueGetter(params);
        var filterValue = this.filterText;

        if (this.isFilterActive()){
            if (!value) return false;
            return Number(value) > Number(filterValue);
        }
    };

    NumberFilter.prototype.isFilterActive = function () {
        return  this.filterText !== null &&
            this.filterText !== undefined &&
            this.filterText !== '' &&
            isNumeric(this.filterText);
    };

    NumberFilter.prototype.getModel = function () {
        return this.isFilterActive() ? Number(this.eFilterText.value) : null;
    };

    NumberFilter.prototype.setModel = function (model) {
        this.eFilterText.value = model;
        this.extractFilterText();
    };

    NumberFilter.prototype.myMethodForTakingValueFromFloatingFilter = function (value) {
        this.eFilterText.value = value;
        this.onFilterChanged();
    };

    NumberFilter.prototype.destroy = function () {
        this.eFilterText.removeEventListener("input", this.onFilterChanged);
    };

    return NumberFilter;
}




function getNumberFloatingFilterComponent (){
    function NumberFloatingFilter() {
    }

    NumberFloatingFilter.prototype.init = function (params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '&gt; <input style="width:20px" type="text"/>';
        this.currentValue = null;
        this.eFilterInput = this.eGui.querySelector('input');
        var that = this;
        function onInputBoxChanged(){
            if (that.eFilterInput.value === '') {
                //Remove the filter
                params.parentFilterInstance( function(instance) {
                    instance.myMethodForTakingValueFromFloatingFilter(null);
                });
            } else {
                that.currentValue = Number(that.eFilterInput.value);
                params.parentFilterInstance( function(instance) {
                    instance.myMethodForTakingValueFromFloatingFilter(that.currentValue);
                });
            }
        }
        this.eFilterInput.addEventListener('input', onInputBoxChanged);
    };

    NumberFloatingFilter.prototype.onParentModelChanged = function (parentModel) {
        // When the filter is empty we will receive a null message her
        if (!parentModel) {
            this.eFilterInput.value = '';
        } else {
            this.eFilterInput.value = parentModel + '';
        }
        this.currentValue = parentModel;
    };

    NumberFloatingFilter.prototype.getGui = function () {
        return this.eGui;
    };

    return NumberFloatingFilter;
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});

