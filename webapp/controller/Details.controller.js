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
                   console.log("Detalles cargados para el Folio: " + sFolio);
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
        },
        
         
        onDownloadPDF: function () {
            // Verifica si hay datos
            var oModel = this.getView().getModel("zbasc");
            if (!oModel || !oModel.getData()) {
                MessageToast.show("No hay datos para descargar.");
                return;
            }

            // Activa la impresión del navegador
            window.print();
            MessageToast.show("Selecciona 'Guardar como PDF' en la ventana de impresión.");
        },
        onUpdateNumeroDoc: function () {
            var oView = this.getView();
            var oInput = oView.byId("numeroDocInput");
            var sNewNumeroDoc = oInput.getValue().trim(); // Valor ingresado por el usuario

            var oModel = this.getOwnerComponent().getModel("zbasc");
            var oRouter = this.getOwnerComponent().getRouter();
            var sFolio = oRouter.getHashChanger().getHash().split("/")[1]; // Obtener el Folio de la URL

            if (!sFolio) {
                MessageToast.show("No se pudo obtener el Folio.");
                return;
            }

            var sPath = "/Folio('" + sFolio + "')";
            var oData = {};

            // Si el usuario ingresó un valor, lo enviamos; si no, no incluimos el campo en el PATCH
            if (sNewNumeroDoc) {
                oData.NumeroDoc = sNewNumeroDoc;
            }

            // Si no hay datos para actualizar, mostramos un mensaje y no hacemos la petición
            if (Object.keys(oData).length === 0) {
                MessageToast.show("No se ingresó un nuevo número de documento. No se realizará ninguna actualización.");
                return;
            }

            oView.setBusy(true);
            $.ajax({
                url: oModel.sServiceUrl + sPath,
                type: "PATCH",
                contentType: "application/json",
                data: JSON.stringify(oData),
                success: function (data, status, xhr) {
                    oView.setBusy(false);
                    MessageToast.show("Número de documento actualizado exitosamente.");
                    // Actualizar el modelo local para reflejar el cambio
                    var oDetailsModel = oView.getModel("detail");
                    oDetailsModel.setProperty("/NumeroDoc", sNewNumeroDoc);
                },
                error: function (xhr, status, error) {
                    oView.setBusy(false);
                    MessageToast.show("Error al actualizar el número de documento: " + error);
                    console.error("Error en AJAX:", xhr.responseText);
                }
            });
        }
    });
});