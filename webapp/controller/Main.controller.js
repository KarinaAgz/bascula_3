sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("delmex.bascula3.controller.Main", {
        onInit: function () {
            var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel("zbasc");

            if (!oModel) {
                MessageToast.show("El modelo zbasc no está definido.");
                return;
            }

            // Cargar datos de CTTicket usando el modelo zbasc
            oModel.read("/CTTicket", {
                success: function (oData) {
                    var oTicketData = {};
                    oData.results.forEach(function (oEntry) {
                        oTicketData[oEntry.TipoTicket] = oEntry.Descripcion;
                    });
                    oView.setModel(new JSONModel(oTicketData), "ticketModel");
                    console.log("Datos de CTTicket cargados:", oTicketData);
                    // Forzar actualización de la vista después de cargar ticketModel
                    oView.rerender();
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    MessageToast.show("Error al cargar los tipos de ticket.");
                    console.error("Error al cargar CTTicket:", oError);
                }
            });
        },

        onRowSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var oSelectedItem = oTable.getSelectedItem();
            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext("zbasc");
                var sFolio = oContext.getProperty("Folio");
                console.log("Folio seleccionado:", sFolio);
                this.getOwnerComponent().getRouter().navTo("RouteDetails", {
                    folio: sFolio
                });
            }
        },

        formatTicketDescription: function (sTicketCode) {
            var oTicketModel = this.getView().getModel("ticketModel");
            if (!oTicketModel || !sTicketCode) {
                // Retrasar la evaluación si el modelo no está listo
                if (!oTicketModel) {
                    setTimeout(() => this.getView().rerender(), 100); // Reintentar después de 100ms
                }
                console.log("Modelo ticket no disponible o código vacío:", sTicketCode);
                return "No disponible";
            }
            var oData = oTicketModel.getData();
            var sDescription = oData[sTicketCode] || "No disponible";
            console.log("Código Ticket:", sTicketCode, "Descripción:", sDescription);
            return sDescription;
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
            oFilterBar.getFilterGroupItems().forEach(function (oItem) {
                var oControl = oItem.getControl();
                if (oControl instanceof sap.m.Input) {
                    oControl.setValue("");
                } else if (oControl instanceof sap.m.DatePicker) {
                    oControl.setDateValue(null);
                }
            });
            this._applyFilters();
        },

        onFilterLiveChange: function (oEvent) {
            this._applyFilters();
            var oFilterBar = this.byId("filterBar");
            oFilterBar.fireSearch();
        },

        _applyFilters: function () {
            var oTable = this.byId("itemsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
            var oFilterBar = this.byId("filterBar");
            var aFilterGroupItems = oFilterBar.getFilterGroupItems();
            var oTicketModel = this.getView().getModel("ticketModel");

            aFilterGroupItems.forEach(function (oFilterItem) {
                var sName = oFilterItem.getName();
                var oControl = oFilterItem.getControl();
                var sValue;

                if (oControl instanceof sap.m.Input) {
                    sValue = oControl.getValue();
                    if (sValue) {
                        var sValueUpper = sValue.toUpperCase();
                        console.log("Filtrando", sName, "con valor:", sValueUpper);

                        if (sName === "Ticket") {
                            var sTicketCode = Object.keys(oTicketModel.getData()).find(function (key) {
                                return oTicketModel.getData()[key].toUpperCase() === sValueUpper;
                            });
                            if (sTicketCode) {
                                aFilters.push(new Filter({
                                    path: "Tipoticket",
                                    operator: FilterOperator.EQ,
                                    value1: sTicketCode
                                }));
                            } else {
                                console.log("Descripción de ticket no encontrada:", sValueUpper);
                            }
                        } else {
                            aFilters.push(new Filter({
                                path: sName,
                                operator: FilterOperator.Contains,
                                value1: sValueUpper,
                                caseSensitive: true
                            }));
                        }
                    }
                } else if (oControl instanceof sap.m.DatePicker) {
                    var oDate = oControl.getDateValue();
                    if (oDate && oDate instanceof Date && !isNaN(oDate)) {
                        var sYear = oDate.getFullYear().toString();
                        var sMonth = ("0" + (oDate.getMonth() + 1)).slice(-2);
                        var sDay = ("0" + oDate.getDate()).slice(-2);
                        var sFormattedDate = sYear + sMonth + sDay;

                        aFilters.push(new Filter({
                            path: sName,
                            operator: FilterOperator.Contains,
                            value1: sFormattedDate
                        }));
                    } else {
                        console.log("Fecha inválida para", sName, ":", oDate);
                    }
                }
            });

            oBinding.filter(aFilters);
            console.log("Filtros aplicados:", aFilters);
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

        formatDateTime: function (sDateTime) {
            if (!sDateTime) return "";

            var sYear = sDateTime.substring(0, 4);
            var sMonth = sDateTime.substring(4, 6);
            var sDay = sDateTime.substring(6, 8);
            var sHour = sDateTime.substring(9, 11) || "00"; // Hora, "00" si no hay
            var sMinute = sDateTime.substring(11, 13) || "00"; // Minutos, "00" si no hay
            var sSecond = sDateTime.substring(13, 15) || "00"; // Segundos, "00" si no hay

            var oDate = new Date(sYear, sMonth - 1, sDay, sHour, sMinute, sSecond);

            var sFormattedDate = ("0" + oDate.getDate()).slice(-2) + "/" +
                                 ("0" + (oDate.getMonth() + 1)).slice(-2) + "/" +
                                 oDate.getFullYear();

            var sFormattedTime = ("0" + oDate.getHours()).slice(-2) + ":" +
                                 ("0" + oDate.getMinutes()).slice(-2) + ":" +
                                 ("0" + oDate.getSeconds()).slice(-2);

            return sFormattedDate + " " + sFormattedTime;
        }
    });
});