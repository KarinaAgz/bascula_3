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
            var oView = this.getView();
            var oForm = oView.byId("detailForm");
            var oContext = oForm.getBindingContext("zbasc");
        
            if (!oContext) {
                MessageToast.show("No hay datos para descargar.");
                return;
            }
        
            var oData = oContext.getObject();
            const { jsPDF } = window.jspdf;
            var doc = new jsPDF();
        
            // Título principal con fondo
            doc.setFillColor(144, 238, 144); // Verde claro
            doc.rect(0, 0, 210, 30, 'F'); // Fondo del título (tamaño A4 completo en ancho)
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255); // Blanco
            doc.text("báscula", 105, 20, { align: "center" });
        
            // Línea divisoria elegante
            doc.setDrawColor(0, 128, 0); // Verde oscuro
            doc.line(20, 35, 190, 35);
        
            // Sección: Información General
            doc.setFillColor(240, 240, 240); // Gris claro
            doc.rect(20, 40, 170, 73, 'F'); // Fondo de la sección
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text("Información General", 25, 50);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text("Tipo ticket: " + this.defaultText(oData.Tipoticket), 25, 60);
            doc.text("Centro entrada: " + this.defaultText(oData.CentroEnt), 25, 70);
            doc.text("Centro salida: " + this.defaultText(oData.CentroSal), 25, 80);
            doc.text("Material: " + this.defaultText(oData.Material), 25, 90);
            doc.text("Conductor: " + this.defaultText(oData.Conductor), 25, 100);
            doc.text("Placa: " + this.defaultText(oData.Placa), 25, 110);
        
            // Sección: Datos de Pesaje
            doc.setFillColor(240, 240, 240);
            doc.rect(20, 120, 170, 73, 'F');
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Datos de Pesaje", 25, 130);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text("Báscula Entrada: " + this.defaultText(oData.BasculaEnt), 25, 140);
            doc.text("Báscula Salida: " + this.defaultText(oData.BasculaSal), 25, 150);
            doc.text("Pesaje 1 en kg: " + this.defaultText(oData.Pesaje), 25, 160);
            doc.text("Pesaje 2 en kg: " + this.defaultText(oData.Pesaje2), 25, 170);
            doc.text("Peso Neto: " + this.defaultText(oData.PesoNeto), 25, 180);
            doc.text("Peso Teórico: " + this.defaultText(oData.PesoTeorico), 25, 190);
        
            // Sección: Fechas y Proceso
            doc.setFillColor(240, 240, 240);
            doc.rect(20, 200, 170, 50, 'F');
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Fechas y Proceso", 25, 210);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text("Fecha Entrada Báscula: " + this.formatDateTime(oData.FechaEntBas), 25, 220);
            doc.text("Fecha Salida Báscula: " + this.formatDateTime(oData.FechaSalBas), 25, 230);
            doc.text("Proceso: " + this.defaultText(oData.Proceso), 25, 240);
        
            // Sección: Resultados
            doc.setFillColor(240, 240, 240);
            doc.rect(20, 260, 170, 30, 'F');
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Resultados", 25, 270);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text("Número Documento: " + this.defaultText(oData.NumeroDoc), 25, 280);
        
            // Líneas divisorias entre secciones
            doc.setDrawColor(0, 128, 0);
            doc.line(20, 120, 190, 120);
            doc.line(20, 200, 190, 200);
            doc.line(20, 260, 190, 260);
        
            // Guardar el PDF
            doc.save("Detalles_Folio_" + this.defaultText(oData.Folio) + ".pdf");
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