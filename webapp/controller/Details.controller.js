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
                    console.log("Datos recibidos del servicio:", oData);
                    var oContext = new sap.ui.model.Context(oModel, sPath);
                    var oForm = oView.byId("detailForm");
                    if (oForm) {
                        oForm.setBindingContext(oContext, "zbasc");
                        console.log("Contexto establecido en el formulario:", oContext.getPath(), "Datos en contexto:", oContext.getObject());
                    } else {
                        console.error("No se encontró el formulario con ID 'detailForm'");
                    }
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
                var sDatePart = sDateTime.substring(0, 8);
                var oDate = new Date(
                    sDatePart.substring(0, 4),
                    sDatePart.substring(4, 6) - 1,
                    sDatePart.substring(6, 8)
                );
                return oDate.toLocaleDateString("es-MX", { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch (e) {
                console.error("Error al formatear fecha:", sDateTime, e);
                return sDateTime;
            }
        },
        
        onDownloadPDF: function () {
            var oModel = this.getView().getModel("zbasc");
            if (!oModel || !oModel.getData()) {
                MessageToast.show("No hay datos para descargar.");
                return;
            }

            window.print();
            MessageToast.show("Selecciona 'Guardar como PDF' en la ventana de impresión.");
        },

        _fetchCsrfToken: function (sUrl) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: sUrl,
                    method: "GET",
                    headers: {
                        "X-CSRF-Token": "Fetch",
                        "Accept": "application/json"
                    },
                    success: function (_data, _status, xhr) {
                        let sToken = xhr.getResponseHeader("X-CSRF-Token");
                        if (sToken) {
                            resolve(sToken);
                        } else {
                            reject("No se recibió el token CSRF.");
                        }
                    },
                    error: function (oError) {
                        reject("Error al obtener el token CSRF: " + oError.statusText);
                    }
                });
            });
        },

        onUpdateNumeroDoc: async function () {
            var oView = this.getView();
            var oInput = oView.byId("numeroDocInput");
            var sNewNumeroDoc = oInput.getValue().trim();
            var oModel = this.getOwnerComponent().getModel("zbasc");
            var oContext = oView.byId("detailForm").getBindingContext("zbasc");

            if (!oContext || !sNewNumeroDoc) {
                MessageToast.show("No se pudo obtener el contexto o el número de documento está vacío.");
                return;
            }

            const sFolio = oContext.getProperty("Folio");
            if (!sFolio) {
                MessageToast.show("No se pudo obtener el Folio.");
                return;
            }

            oView.setBusy(true);

            try {
                const sServiceUrl = oModel.sServiceUrl;
                const sPath = `/Alta('${sFolio}')`; // Usamos /Alta 
                const sFullUrl = sServiceUrl + sPath;

                const sToken = await this._fetchCsrfToken(sServiceUrl + "/Folio('0')"); // Obtener token
                console.log("Token CSRF obtenido:", sToken);

                await $.ajax({
                    url: sFullUrl,
                    method: "PATCH",
                    headers: {
                        "X-CSRF-Token": sToken,
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    data: JSON.stringify({
                        NumeroDoc: sNewNumeroDoc
                    }),
                    success: () => {
                        MessageToast.show("Número de documento actualizado correctamente.");
                        oModel.refresh(true); // Refresca el modelo para reflejar los cambios
                        oContext.setProperty("NumeroDoc", sNewNumeroDoc); // Actualiza el contexto
                    },
                    error: (oError) => {
                        let sErrorMessage = oError.responseJSON?.error?.message?.value || "Error desconocido";
                        MessageToast.show("Error al actualizar: " + sErrorMessage);
                        console.error("Error al actualizar:", oError);
                    }
                });
            } catch (error) {
                oView.setBusy(false);
                console.error(" Error obteniendo CSRF Token o actualizando:", error);
                MessageToast.show("Error al procesar la solicitud: " + error.message);
            }

            oView.setBusy(false);
        }
    });
});