sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("delmex.bascula3.controller.Details", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetails").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            var sFolio = oArguments.folio;
            this._loadDetails(sFolio);
        },

        _loadDetails: function (sFolio) {
            var oModel = this.getOwnerComponent().getModel("zbasc");
            var sPath = "/Z_ALTA_Set('" + sFolio + "')";

            oModel.read(sPath, {
                success: function (oData) {
                    var oDetailsModel = new JSONModel(oData);
                    this.getView().setModel(oDetailsModel, "basculaDetails");
                    MessageToast.show("Detalles cargados para el Folio: " + sFolio);
                }.bind(this),
                error: function (oError) {
                    console.error("Error al cargar los detalles:", oError);
                    MessageToast.show("Error al cargar los detalles.");
                }
            });
        },

        goBackBtn: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMain");
        }
    });
});