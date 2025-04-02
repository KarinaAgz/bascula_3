sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("delmex.bascula3.controller.Main", {
        onInit: function () {
            var oTable = this.byId("itemsTable");
            oTable.attachEvent("dataReceived", this.onDataReceived, this);
        },

        onToggleFilters: function () {
            var oFilterHeader = this.byId("filterHeader");
            var bVisible = oFilterHeader.getVisible();
            oFilterHeader.setVisible(!bVisible);
            var oButton = this.byId("toggleFiltersButton");
            oButton.setIcon(bVisible ? "sap-icon://unpin" : "sap-icon://pin");
        },

        onSearch: function (oEvent) {
            this._applyFilters();
        },

        onReset: function () {
            var oFilterBar = this.byId("filterBar");
            oFilterBar.getFilterGroupItems().forEach(function (oFilterItem) {
                oFilterItem.getControl().setValue("");
            });
            this._applyFilters();
        },

        onFilterLiveChange: function (oEvent) {
            this._applyFilters();
        },

        _applyFilters: function () {
            var oTable = this.byId("itemsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
            var oFilterBar = this.byId("filterBar");
            var aFilterGroupItems = oFilterBar.getFilterGroupItems();

            aFilterGroupItems.forEach(function (oFilterItem) {
                var sName = oFilterItem.getName();
                var oControl = oFilterItem.getControl();
                var sValue = oControl.getValue();

                if (sValue) {
                    aFilters.push(new Filter({
                        path: sName,
                        operator: FilterOperator.Contains,
                        value1: sValue,
                        caseSensitive: false
                    }));
                }
            });

            oBinding.filter(aFilters);
        },

        onDataReceived: function (oEvent) {
            var aContexts = oEvent.getSource().getBinding("items").getContexts();
            console.log("Datos recibidos del servicio OData V2:", aContexts);
            if (aContexts && aContexts.length > 0) {
                aContexts.forEach(function (oContext, i) {
                    console.log("Registro", i + 1, ":", oContext.getObject());
                });
            } else {
                console.log("No se recibieron datos del servicio OData V2.");
                MessageToast.show("No se encontraron datos.");
            }
        },

        onRowSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var oSelectedItem = oTable.getSelectedItem();
            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext("zbasc");
                var sFolio = oContext.getProperty("Folio");

                this.getOwnerComponent().getRouter().navTo("RouteDetails", {
                    folio: sFolio
                });
            }
        }
    });
});