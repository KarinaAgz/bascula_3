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
                    var sValueUpper=sValue.toUpperCase();
                    aFilters.push(new Filter({
                        path: sName,
                        operator: FilterOperator.Contains,
                        value1: sValue,
                        caseSensitive: true
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
        },
        // Formatter para combinar fecha y hora en formato DD/MM/YYYY HH:MM:SS
        formatDateTime: function (sDateTime) {
            if (!sDateTime) return "";

            // Extraer componentes de la fecha y hora
            var sYear = sDateTime.substring(0, 4);
            var sMonth = sDateTime.substring(4, 6);
            var sDay = sDateTime.substring(6, 8);
            var sHour = sDateTime.substring(9, 11);
            var sMinute = sDateTime.substring(11, 13);
            var sSecond = sDateTime.substring(13, 15);

            // Crear objeto Date para validación
            var oDate = new Date(sYear, sMonth - 1, sDay, sHour, sMinute, sSecond);

            // Formatear la fecha como DD/MM/YYYY
            var sFormattedDate = ("0" + oDate.getDate()).slice(-2) + "/" +
                                 ("0" + (oDate.getMonth() + 1)).slice(-2) + "/" +
                                 oDate.getFullYear();

            // Formatear la hora como HH:MM:SS
            var sFormattedTime = ("0" + oDate.getHours()).slice(-2) + ":" +
                                 ("0" + oDate.getMinutes()).slice(-2) + ":" +
                                 ("0" + oDate.getSeconds()).slice(-2);

            // Combinar fecha y hora
            return sFormattedDate + " " + sFormattedTime;
        }
    });
});