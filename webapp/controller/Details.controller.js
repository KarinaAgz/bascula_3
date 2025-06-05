sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("delmex.bascula3.controller.Details", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetails").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            var sFolio = oArguments.folio;
            if (!sFolio) {
                MessageToast.show("Folio no proporcionado.");
                return;
            }
            console.log("Folio recibido:", sFolio); // Depuración
            this._loadDetails(sFolio);
        },

        _loadDetails: function (sFolio) {
            var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel("zbasc");

            if (!oModel) {
                MessageToast.show("El modelo zbasc no está definido.");
                console.error("Modelo zbasc no encontrado en Component.js");
                return;
            }

            oView.setBusy(true);
            var sPath = "/Folio('" + sFolio + "')";
            console.log("Solicitando datos con path:", sPath);

            oModel.read(sPath, {
                success: function (oData) {
                    console.log("Datos recibidos del servicio:", oData); // Depuración
                    // Crear un modelo JSON con los datos
                    var oDetailsModel = new JSONModel(oData);
                    oView.setModel(oDetailsModel, "zbasc");
                    oView.setBusy(false);
                    MessageToast.show("Detalles cargados para el Folio: " + sFolio);
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    var sErrorMessage = oError.message || "Error desconocido";
                    MessageToast.show("Error al cargar los datos: " + sErrorMessage);
                    console.error("Error al cargar datos:", oError);
                }
            });
        },

        goBackBtn: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMain");
        },

        defaultText: function (sValue) {
            return sValue === undefined || sValue === null || sValue === "" ? "No disponible" : sValue.trim();
        },

        formatDateTime: function (sDateTime) {
            if (!sDateTime || sDateTime === "No disponible") return "No disponible";
            try {
                var sDatePart = sDateTime.substring(0, 8); // Extraer YYYYMMDD
                var oDate = new Date(
                    sDatePart.substring(0, 4), // Año
                    sDatePart.substring(4, 6) - 1, // Mes (0-11)
                    sDatePart.substring(6, 8) // Día
                );
                return oDate.toLocaleDateString("es-MX", { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch (e) {
                console.error("Error al formatear fecha:", sDateTime, e);
                return sDateTime;
            }
        }
    });
});