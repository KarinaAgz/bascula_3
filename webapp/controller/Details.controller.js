sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("delmex.bascula3.controller.Details", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetails").attachPatternMatched(this._onRouteMatched, this);

            // Cargar ticketModel al iniciar
            this._loadTicketModel();

            // Modelo para la estructura del PDF
            var oPdfStructureModel = new JSONModel(this.get_JSON_PDF());
            this.getView().setModel(oPdfStructureModel, "pdfStructureModel");
        },

        _loadTicketModel: function () {
            var oView = this.getView();
            return new Promise((resolve) => {
                var oTicketModel = oView.getModel("ticketModel");
                if (!oTicketModel) {
                    var oModel = this.getOwnerComponent().getModel("zbasc");
                    if (oModel) {
                        oModel.read("/CTTicket", {
                            success: function (oData) {
                                var oTicketData = {};
                                oData.results.forEach(function (oEntry) {
                                    oTicketData[oEntry.TipoTicket] = oEntry.Descripcion;
                                });
                                oView.setModel(new JSONModel(oTicketData), "ticketModel");
                                console.log("Datos de CTTicket cargados en Details:", oTicketData);
                                resolve();
                            }.bind(this),
                            error: function (oError) {
                                MessageToast.show("Error al cargar los tipos de ticket en Details.");
                                console.error("Error al cargar CTTicket:", oError);
                                resolve(); // Resolver para continuar
                            }
                        });
                    } else {
                        resolve(); // Resolver si no hay modelo
                    }
                } else {
                    resolve();
                }
            });
        },

        _onRouteMatched: async function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sFolio = oArgs.folio;
            var oView = this.getView();
            oView.setBusy(true);
            console.log("Intentando bindear Folio:", sFolio);

            try {
                // Esperar a que ticketModel esté listo
                await this._loadTicketModel();

                oView.bindElement({
                    path: "zbasc>/Folio('" + sFolio + "')",
                    events: {
                        dataReceived: function () {
                            oView.setBusy(false);
                            var oContext = oView.getBindingContext("zbasc");
                            console.log("Contexto vinculado:", oContext ? oContext.getObject() : "No contexto");
                            if (oContext) {
                                console.log("Datos del contexto (incluye Tipoticket):", oContext.getObject());
                                var oForm = oView.byId("detailForm");
                                if (oForm) {
                                    oForm.setBindingContext(oContext, "zbasc");
                                }
                                // Forzar la actualización del control específico
                                var oTicketText = oView.byId("ticketTypeText"); // Ajusta el ID según Details.view.xml
                                if (oTicketText) {
                                    oTicketText.invalidate(); // Fuerza la reevaluación
                                    console.log("Control ticketTypeText invalidado");
                                }
                            } else {
                                MessageToast.show("No se encontraron datos para el Folio: " + sFolio);
                            }
                        },
                        dataRequested: function () {
                            console.log("Solicitando datos para Folio:", sFolio);
                        },
                        change: function (oEvent) {
                            console.log("Cambio en el binding:", oEvent.getParameter("reason"));
                        }
                    }
                });
            } catch (error) {
                oView.setBusy(false);
                console.error("Error al cargar ticketModel:", error);
                MessageToast.show("Error al preparar la vista. Intenta de nuevo.");
            }
        },

        defaultText: function (sText) {
            return sText === undefined || sText === null || sText === "" ? "No disponible" : sText.trim();
        },

        formatTicketDescription: function (sTicketCode) {
            var oTicketModel = this.getView().getModel("ticketModel");
            if (!oTicketModel || !sTicketCode) {
                console.log("Modelo ticket no disponible o código vacío:", sTicketCode);
                return "No disponible";
            }
            var oData = oTicketModel.getData();
            var sDescription = oData[sTicketCode] || "No disponible";
            console.log("Código Ticket:", sTicketCode, "Descripción:", sDescription);
            return sDescription;
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

        // Define la estructura JSON para el diseño del PDF
        get_JSON_PDF: function () {
            return {
                Structure: {
                    Header: {
                        Line1: "AV. ÁNGEL MARTÍNEZ VILLAREAL #637 INT. S2",
                        Line2: "COL. CHEPEVERA C.P. 64030 MONTERREY N. L. MÉXICO",
                        Line3: "RFC GDE091112HA8",
                        Line4: "LIBRAMIENTO NOROESTE # 4030, PARQUE INDUSTRIAL ESCOBEDO",
                        Line5: "GENERAL ESCOBEDO, N.L. C.P. 66072",
                        Line6: "TEL: (81) 4057 5110",
                        Line7: "E-MAIL: CALIDAD@DELMEX.MX CREDITOS@DELMEX.MX",
                        Line8: "WWW.DELMEX.MX"
                    },
                    Body: {
                        Folio: "FOLIO ",
                        Placa: "PLACA ",
                        Bound: "BOUND ",
                        Fecha_Hora_SALIDA_1: "FECHA Y HORA ",
                        Bruto: "BRUTO ",
                        Called_Neto: "CALLED NETO ",
                        Fecha_Hora_SALIDA_2: "DE SALIDA "
                    },
                    Footer: {
                        Nombre: "NOMBRE ",
                        Referencia_Material: "REFERENCIA DE MATERIAL ",
                        No_Doc: "NO. DE DOCUMENTO "
                    },
                    Helpers: {
                        Line: "_______________________"
                    }
                }
            };
        },

        onDownloadPDF: function () {
            var oView = this.getView();
            var oForm = oView.byId("detailForm"); //obtiene el formulario "detailsForm"
            var oContext = oForm.getBindingContext("zbasc");

            if (!oContext) {
                MessageToast.show("No hay datos para descargar.");
                return;
            }
            //Verifica si jsPDF esta disponible
            if (typeof window.jspdf === "undefined") {
                MessageToast.show("La librería jsPDF no se ha cargado correctamente.");
                console.error("jsPDF no está disponible en window.jspdf");
                return;
            }
            //Obtiene la estructura del pdf desde el modelo
            var oData = oContext.getObject();
            var doc = new window.jspdf.jsPDF();
            //obtiene la estructura del pdf desde un modelo llamado pdfDtructureModel
            var o = this.getView().getModel("pdfStructureModel").getData().Structure;

            const a = doc.internal.pageSize.getWidth(); //Ancho de la página
            const n = 90; //Ancho de la imagen en puntos
            const i = 30; //alto de la imagen en pts.
            const s = (a - n) / 2; //centra la posiscion X para centrar la imagen H 
            const c = 10; //Margen
            var l = 10; //Tamaño de fuente inicial encabezado
            var d = 12; //tamaño de fuente para detalles

            // Configura el tamaño de fuente y texto del header
            doc.setFontSize(l);//tamaño de fuente inicial

            //calcula las posiciones x para centrar cada linea del encabezado 
            const u = doc.getTextWidth(o.Header.Line1);   //ancho del texto de la linea1
            const g = (a - u) / 2;                         //calcula la posicion x para centrar la linea1
            const L = doc.getTextWidth(o.Header.Line2);
            const x = (a - L) / 2;
            const m = doc.getTextWidth(o.Header.Line3);
            const _ = (a - m) / 2;
            const p = doc.getTextWidth(o.Header.Line4);
            const E = (a - p) / 2;
            const h = doc.getTextWidth(o.Header.Line5);
            const D = (a - h) / 2;
            const f = doc.getTextWidth(o.Header.Line6);
            const H = (a - f) / 2;
            const M = doc.getTextWidth(o.Header.Line7);
            const S = (a - M) / 2;

            //concat text del cuerpo para el folio
            var A = o.Body.Folio + this.defaultText(oData.Folio);

            // Carga la imagen como recurso estático (ruta absoluta desde webapp)
            const imageUrl = window.location.origin + "/img/LOGO.png";
            this.loadImageAsBase64(imageUrl, function (l) { // función callback para cargar la imagen como Base64
                if (l) {
                    doc.addImage(l, "PNG", s, 20, n, i);/// añade la imagen si se carga (X, Y, ancho, alto)
                } else {
                    console.warn("No se pudo cargar la imagen LOGO2.png, se omitirá en el PDF.");
                }

                //config color de text RGB
                doc.setTextColor(7, 31, 99);
                doc.setFont("helvetica", "bolditalic");//estilo de fuente encabezado
                //añade las lineas del encabezdo en posisicones centradas 
                doc.text(o.Header.Line1, g, 70); // linea1 en y=70
                doc.text(o.Header.Line2, x, 75);
                doc.text(o.Header.Line3, _, 80);
                doc.text(o.Header.Line4, E, 85);
                doc.text(o.Header.Line5, D, 90);
                doc.text(o.Header.Line6, H, 95);
                doc.text(o.Header.Line7, S, 100);
                doc.setFontSize(d);
                //añade el folio alineado a la derecha
                doc.text(A, a - (c + 40), 115, { align: "right" });

                // Resto del cuerpo del PDF
                const uPos = 20;  //posicion X inicial para las etiq
                var L = o.Body.Placa; // Etiqueta Placa del modelo 
                var m = o.Body.Bruto;
                var p = o.Body.Bound;
                var h = o.Body.Fecha_Hora_SALIDA_1;
                var f = o.Body.Bruto;
                var M = o.Body.Called_Neto;
                var C = o.Body.Fecha_Hora_SALIDA_2;
                var rPesaje = this.defaultText(oData.Pesaje);
                var rPesaje2 = this.defaultText(oData.Pesaje2);
                var rPesoNeto = this.defaultText(oData.PesoNeto);

                doc.setFont("helvetica", "italic"); //tamaño de fuente detalles
                //datos del cuerpo del pdf
                doc.text(L, uPos, 140);  //placa en x=20, y =140
                doc.text(this.defaultText(oData.Placa), uPos + 30, 140); // Valor de Placa en X=50, Y=140
                doc.text(o.Helpers.Line, uPos + 30, 141);//linea debajo de placa
                doc.text(m, uPos, 150);
                doc.text(p, uPos, 155);
                doc.text(rPesaje, uPos + 30, 155);
                doc.text(o.Helpers.Line, uPos + 30, 156);
                var F = this.formatDateTime(oData.FechaEntBas);
                doc.text(h, uPos, 165);
                doc.text(C, uPos, 170);
                doc.text(F, 60, 170);
                doc.text(o.Helpers.Line, uPos + 40, 171);
                doc.text(L, uPos, 185);
                doc.text(this.defaultText(oData.Placa), uPos + 30, 185);
                doc.text(o.Helpers.Line, uPos + 30, 186);
                doc.text(f, uPos, 200);
                doc.text(rPesaje2, uPos + 30, 200);
                doc.text(o.Helpers.Line, uPos + 30, 201);
                doc.text(M, uPos, 215);
                doc.text(rPesoNeto, uPos + 40, 215);
                doc.text(o.Helpers.Line, uPos + 40, 216);
                doc.text(h, uPos, 225);
                doc.text(C, uPos, 230);
                doc.text(F, 60, 230);
                doc.text(o.Helpers.Line, uPos + 40, 231);
                var N = o.Footer.Nombre;
                var R = o.Footer.Referencia_Material;
                var B = o.Footer.No_Doc;
                doc.text(N, uPos, 250);
                doc.text(this.defaultText(oData.Conductor), 60, 250);
                doc.text(o.Helpers.Line, uPos + 40, 251);
                doc.text(L, uPos, 260);
                doc.text(this.defaultText(oData.Placa), 60, 260);
                doc.text(o.Helpers.Line, uPos + 40, 261);
                doc.text(R, uPos, 270);
                doc.text(this.defaultText(oData.Material), 90, 270);
                doc.text(o.Helpers.Line, 90, 271);
                doc.text(B, uPos, 280);
                doc.text(this.defaultText(oData.NumeroDoc), uPos + 50, 280);
                doc.text(o.Helpers.Line, uPos + 50, 281);

                // Guardar el PDF
                doc.save("Detalles_Folio_" + this.defaultText(oData.Folio) + ".pdf");
            }.bind(this));
        },

        // Convierte una imagen a base64 para usarla en el PDF
        loadImageAsBase64: function (sUrl, fnCallback) {
            //crea un nuevo obj Image para cargar img
            var oImg = new Image();
            //Config crossOrigin  para evitar ploblemas de CORS
            oImg.crossOrigin = "Anonymous";
            oImg.onload = function () {
                //crea un canvas para dibujar la imagen
                var oCanvas = document.createElement("canvas");
                oCanvas.width = oImg.width; //ancho del canvas al igual de la img
                oCanvas.height = oImg.height;
                var oContext = oCanvas.getContext("2d");
                oContext.drawImage(oImg, 0, 0); //dibuja la img en el canvas (0,0)
                var sBase64 = oCanvas.toDataURL("image/png"); // convierte la img a base64
                fnCallback(sBase64);
            };
            oImg.onerror = function () {
                console.error("Error al cargar la imagen desde:", sUrl);
                fnCallback(""); // Fallback si falla la carga
            };
            oImg.src = sUrl;
        },

        goBackBtn: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMain");
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
                const sPath = `/Alta('${sFolio}')`;
                const sFullUrl = sServiceUrl + sPath;

                const sToken = await this._fetchCsrfToken(sServiceUrl + "/Folio('0')");
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
                        oModel.refresh(); // Solo refresh del modelo si es necesario
                        oContext.setProperty("NumeroDoc", sNewNumeroDoc);
                    },
                    error: (oError) => {
                        let sErrorMessage = oError.responseJSON?.error?.message?.value || "Error desconocido";
                        MessageToast.show("Error al actualizar: " + sErrorMessage);
                        console.error("Error al actualizar:", oError);
                    }
                });
            } catch (error) {
                oView.setBusy(false);
                console.error("Error obteniendo CSRF Token o actualizando:", error);
                MessageToast.show("Error al procesar la solicitud: " + error.message);
            }

            oView.setBusy(false);
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
        }
    });
});