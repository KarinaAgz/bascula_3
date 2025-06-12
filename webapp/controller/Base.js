sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "jspdf"], (e, t, o, jsPDF) => {
    "use strict";
    return e.extend("delmex.bascula3.controller.Base", {
        // Método que se ejecuta al iniciar un controlador
        onInit() {
            console.log("base controller");
        },

        // Define la estructura JSON para el diseño del PDF
        get_JSON_PDF() {
            return {
                Structure: {
                    Header: {
                        Line1: "AV. ÁNGEL MARTÍNEZ VILLAREAL #637 INT. S2",
                        Line2: "COL. CHEPEVERA C.P. 64030 MONTERREY N.L. MÉXICO",
                        Line3: "RFC GDE091112HAB",
                        Line4: "LIBRAMIENTO NOROESTE # 4030, PARQUE INDUSTRIAL ESCOBEDO",
                        Line5: "GENERAL ESCOBEDO ,N.L C.P. 66072",
                        Line6: "TEL: (81) 4057 5110",
                        Line7: "E-MAIL: CALIDAD@DELMEX.MX CREDITOS@DELMEX.MX",
                        Line8: "WWW.DELMEX.MX"
                    },
                    Body: {
                        Folio: "FOLIO ",
                        Placa: "PLACA ",
                        Bound: "BOUND ",
                        Fecha_Hora_Salida_1: "FECHA Y HORA ",
                        Bruto: "BRUTO ",
                        Called_Neto: "CALLED NETO ",
                        Fecha_Hora_Salida_2: "DE SALIDA "
                    },
                    Footer: {
                        Nombre: "NOMBRE ",
                        Referencia_Material: "REFERENCIA MATERIAL ",
                        No_Doc: "NO. DE DOCUMENTO"
                    },
                    Helpers: {
                        Line: "--------------------------"
                    }
                }
            };
        },

        // Carga los datos de un folio y opcionalmente genera el PDF
        loadFolioData: function(e, t = false) {
            const r = this;
            const a = this.getView().getModel("zbasc");
            const n = `/Folio('${e}')`;
            sap.ui.core.BusyIndicator.show();
            return new Promise(function(e, i) {
                a.read(n, {
                    success: function(o) {
                        const a = new sap.ui.model.json.JSONModel;
                        a.setData(o);
                        if (r.getView().getModel("basculaDetails")) {
                            r.getView().getModel("basculaDetails").setData();
                        }
                        r.getView().setModel(a, "basculaDetails");
                        if (t) {
                            r.buildPDF(r);
                        }
                        sap.ui.core.BusyIndicator.hide();
                        e(o);
                    },
                    error: function(e) {
                        sap.ui.core.BusyIndicator.hide();
                        o.error("Error al obtener el folio");
                        i(e);
                    }
                });
            });
        },

        // Genera el PDF con logo, header, cuerpo y footer
        buildPDF: function(e) {
            var t = new jsPDF();
            var o = e.getView().getModel("pdfStructureModel").getData().Structure;
            e.getView().getModel("basculaDetails").refresh();
            var r = e.getView().getModel("basculaDetails").getData();
            const a = t.internal.pageSize.getWidth();
            const n = 90;
            const i = 30;
            const s = (a - n) / 2;
            const c = 10;
            var l = 10;
            var d = 12;
            t.setFontSize(l);
            const u = t.getTextWidth(o.Header.Line1);
            const g = (a - u) / 2;
            const L = t.getTextWidth(o.Header.Line2);
            const x = (a - L) / 2;
            const m = t.getTextWidth(o.Header.Line3);
            const _ = (a - m) / 2;
            const P = t.getTextWidth(o.Header.Line4);
            const E = (a - P) / 2;
            const h = t.getTextWidth(o.Header.Line5);
            const D = (a - h) / 2;
            const f = t.getTextWidth(o.Header.Line6);
            const H = (a - f) / 2;
            const M = t.getTextWidth(o.Header.Line7);
            const S = (a - M) / 2;
            var A = o.Body.Folio + r.Folio;
            const C = sap.ui.require.toUrl("delmex/bascula3/images/localStorage.png");
            e.loadImageAsBase64(C, function(l) {
                t.addImage(l, "PNG", s, 20, n, i);
                t.setTextColor(7, 31, 99);
                t.setFont("helvetica", "bolditalic");
                t.text(o.Header.Line1, g, 70);
                t.text(o.Header.Line2, x, 75);
                t.text(o.Header.Line3, _, 80);
                t.text(o.Header.Line4, E, 85);
                t.text(o.Header.Line5, D, 90);
                t.text(o.Header.Line6, H, 95);
                t.text(o.Header.Line7, S, 100);
                t.setFontSize(d);
                t.text(A, a - (c + 40), 115, { align: "right" });
                const u = 20;
                var L = o.Body.Placa;
                var m = o.Body.Bruto;
                var p = o.Body.Bound;
                var h = o.Body.Fecha_Hora_Salida_1;
                var f = o.Body.Bruto;
                var M = o.Body.Called_Neto;
                var C = o.Body.Fecha_Hora_Salida_2;
                r.Pesaje = e.formatter.formatNumberWithCommas(r.Pesaje.trim());
                r.Pesaje2 = e.formatter.formatNumberWithCommas(r.Pesaje2.trim());
                r.PesoNeto = e.formatter.formatNumberWithCommas(r.PesoNeto.trim());
                t.setFont("helvetica", "italic");
                t.text(L, u, 140);
                t.text(r.Placa, u + 30, 140);
                t.text(o.Helpers.Line, u + 30, 141);
                t.text(m, u, 150);
                t.text(p, u, 155);
                t.text(r.Pesaje.trim(), u + 30, 155);
                t.text(o.Helpers.Line, u + 30, 156);
                var F = e.formatDateTime(r.FechaEntBas);
                t.text(h, u, 165);
                t.text(C, u, 170);
                t.text(F, 60, 170);
                t.text(o.Helpers.Line, u + 40, 171);
                t.text(L, u, 185);
                t.text(r.Placa.trim(), u + 30, 185);
                t.text(o.Helpers.Line, u + 30, 186);
                t.text(f, u, 200);
                t.text(r.Pesaje2.trim(), u + 30, 200);
                t.text(o.Helpers.Line, u + 30, 201);
                t.text(M, u, 215);
                t.text(r.PesoNeto.trim(), u + 40, 215);
                t.text(o.Helpers.Line, u + 40, 216);
                t.text(h, u, 225);
                t.text(C, u, 230);
                t.text(F, 60, 230);
                t.text(o.Helpers.Line, u + 40, 231);
                var N = o.Footer.Nombre;
                var R = o.Footer.Referencia_Material;
                var b = o.Footer.No_Doc;
                t.text(N, u, 250);
                t.text(r.Conductor, 60, 250);
                t.text(o.Helpers.Line, u + 40, 251);
                t.text(L, u, 260);
                t.text(r.Placa.trim(), 60, 260);
                t.text(o.Helpers.Line, u + 40, 261);
                t.text(R.trim(), u, 270);
                t.text(r.Material.trim(), 90, 270);
                t.text(o.Helpers.Line, 90, 271);
                t.text(b.trim(), u, 280);
                t.text(r.NumeroDoc.trim(), u + 50, 280);
                t.text(o.Helpers.Line, u + 50, 281);
                const v = t.output("blob");
                const I = URL.createObjectURL(v);
                e._pdfViewer.setSource(I);
                e._pdfViewer.open();
            }.bind(e));
        },

        // Convierte una imagen a base64 para usarla en el PDF
        loadImageAsBase64: function(e, t) {
            var o = new Image;
            o.onload = function() {
                var e = document.createElement("canvas");
                e.width = o.width;
                e.height = o.height;
                var r = e.getContext("2d");
                r.drawImage(o, 0, 0);
                var a = e.toDataURL("image/png");
                t(a);
            };
            o.src = e;
        },

        formatter: {
            formatNumberWithCommas: function(value) {
                if (!value) return "No disponible";
                return parseFloat(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            },
            formatDateTime: function(sDateTime) {
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
            }
        }
    });
});