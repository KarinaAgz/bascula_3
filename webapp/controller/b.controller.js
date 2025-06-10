//@ui5-bundle delmex/zmmbascula/Component-preload.js
sap.ui.require.preload({
    "delmex/zmmbascula/Component-preload.js": function() {
    },
    "delmex/zmmbascula/Component.js": function() {
        sap.ui.define(["sap/ui/core/UIComponent", "delmex/zmmbascula/model/models"], (e, t) => {
            "use strict";
            return e.extend("delmex.zmmbascula.Component", {
                metadata: {
                    manifest: "json",
                    interfaces: ["sap.ui.core.IAsyncContentCreation"]
                },
                init() {
                    e.prototype.init.apply(this, arguments);
                    this.setModel(t.createDeviceModel(), "device");
                    this.getRouter().initialize()
                }
            })
        }
        );
    },
    "delmex/zmmbascula/controller/App.controller.js": function() {
        sap.ui.define(["sap/ui/core/mvc/Controller"], e => {
            "use strict";
            return e.extend("delmex.zmmbascula.controller.App", {
                onInit() {}
            })
        }
        );
    },
    "delmex/zmmbascula/controller/BaseController.js": function() {
        sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"], (e, t, o) => {
            "use strict";
            return e.extend("delmex.zmmbascula.controller.BaseController", {
                onInit() {
                    console.log("base controller")
                },
                getRouter: function() {
                    return sap.ui.core.UIComponent.getRouterFor(this)
                },
                goBack: function() {
                    var e = sap.ui.core.routing.History.getInstance().getPreviousHash();
                    if (e !== undefined && !e.includes("header")) {
                        history.go(-1)
                    } else {
                        var t = true;
                        this.getRouter().navTo("RouteMain")
                    }
                },
                getRequestModel() {
                    let e = new t({
                        Folio: "",
                        CentroEnt: "",
                        Tipoticket: "",
                        CentroSal: "",
                        Material: "",
                        NumeroDoc: "",
                        Placa: "",
                        FechaEntBas: "",
                        FechaSalBas: ""
                    });
                    return e
                },
                getCatalogsModel() {
                    let e = new t({
                        Proceso: {
                            1: "Entrada de Mercancía",
                            2: "Salida de Mercancía",
                            3: "Traslados de Mercancía",
                            4: "Venta de Chatarra",
                            5: "Serv de pesaje externo",
                            6: "Otros"
                        },
                        TipoTicket: {
                            1: "Ticket interno",
                            2: "Ticket externo"
                        }
                    });
                    return e
                },
                detailSettingsModel() {
                    let e = new t({
                        flag_oc: false,
                        flag_ov: false
                    });
                    return e
                },
                getResourceBundle: function() {
                    return this.getOwnerComponent().getModel("i18n").getResourceBundle()
                },
                _fetchCsrfToken: function(e) {
                    return new Promise( (t, o) => {
                        $.ajax({
                            url: e,
                            method: "GET",
                            headers: {
                                "X-CSRF-Token": "Fetch",
                                Accept: "application/json"
                            },
                            success: function(e, r, a) {
                                let n = a.getResponseHeader("X-CSRF-Token");
                                if (n) {
                                    t(n)
                                } else {
                                    o("No se recibió el token CSRF.")
                                }
                            },
                            error: o
                        })
                    }
                    )
                },
                get_JSON_PDF() {
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
                                Line: "___________________________"
                            }
                        }
                    }
                },
                buildDate(e) {
                    let t = parseInt(e.getMonth()) + 1;
                    t = t <= 9 ? "0" + t.toString() : t.toString();
                    let o = parseInt(e.getDate());
                    o = o <= 9 ? "0" + o.toString() : o.toString();
                    let r = e.getFullYear().toString() + t.toString() + o;
                    return r
                },
                _getServiceUrl: function() {
                    const e = sap.ui.require.toUrl("delmex/zmmbascula");
                    const t = e.split("/webapp")[0];
                    return t + "/sap/opu/odata/sap/ZUI_BASCULA_SRV_V2"
                },
                loadFolioData: function(e, t=false) {
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
                                    r.getView().getModel("basculaDetails").setData()
                                }
                                r.getView().setModel(a, "basculaDetails");
                                debugger ;if (t) {
                                    r.buildPDF(r)
                                }
                                sap.ui.core.BusyIndicator.hide();
                                e(o)
                            },
                            error: function(e) {
                                sap.ui.core.BusyIndicator.hide();
                                o.error("Error al obtener el folio.");
                                i(e)
                            }
                        })
                    }
                    )
                },
                buildPDF: function(e) {
                    var t = new jsPDF;
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
                    const p = t.getTextWidth(o.Header.Line4);
                    const E = (a - p) / 2;
                    const h = t.getTextWidth(o.Header.Line5);
                    const D = (a - h) / 2;
                    const f = t.getTextWidth(o.Header.Line6);
                    const H = (a - f) / 2;
                    const M = t.getTextWidth(o.Header.Line7);
                    const S = (a - M) / 2;
                    var A = o.Body.Folio + r.Folio;
                    const C = sap.ui.require.toUrl("delmex/zmmbascula/images/Logo.png");
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
                        t.text(A, a - (c + 40), 115, {
                            align: "right"
                        });
                        const u = 20;
                        var L = o.Body.Placa;
                        var m = o.Body.Bruto;
                        var p = o.Body.Bound;
                        var h = o.Body.Fecha_Hora_SALIDA_1;
                        var f = o.Body.Bruto;
                        var M = o.Body.Called_Neto;
                        var C = o.Body.Fecha_Hora_SALIDA_2;
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
                        var F = e.formatter.formatDate(r.FechaEntBas);
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
                        var B = o.Footer.No_Doc;
                        t.text(N, u, 250);
                        t.text(r.Conductor, 60, 250);
                        t.text(o.Helpers.Line, u + 40, 251);
                        t.text(L, u, 260);
                        t.text(r.Placa.trim(), 60, 260);
                        t.text(o.Helpers.Line, u + 40, 261);
                        t.text(R.trim(), u, 270);
                        t.text(r.Material.trim(), 90, 270);
                        t.text(o.Helpers.Line, 90, 271);
                        t.text(B.trim(), u, 280);
                        t.text(r.NumeroDoc.trim(), u + 50, 280);
                        t.text(o.Helpers.Line, u + 50, 281);
                        const v = t.output("blob");
                        const I = URL.createObjectURL(v);
                        e._pdfViewer.setSource(I);
                        e._pdfViewer.open()
                    }
                    .bind(e))
                },
                loadImageAsBase64: function(e, t) {
                    var o = new Image;
                    o.onload = function() {
                        var e = document.createElement("canvas");
                        e.width = o.width;
                        e.height = o.height;
                        var r = e.getContext("2d");
                        r.drawImage(o, 0, 0);
                        var a = e.toDataURL("image/png");
                        t(a)
                    }
                    ;
                    o.src = e
                }
            })
        }
        );
    },
    "delmex/zmmbascula/controller/Detail.controller.js": function() {
        sap.ui.define(["delmex/zmmbascula/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/m/MessageBox", "sap/m/PDFViewer", "delmex/zmmbascula/util/formatter", "sap/ui/core/BusyIndicator"], (e, t, o, a, s, i, r, l) => {
            "use strict";
            return e.extend("delmex.zmmbascula.controller.Detail", {
                formatter: r,
                onInit() {
                    let e = this.getCatalogsModel();
                    this.getView().setModel(e, "catalogsModel");
                    sap.ui.getCore().setModel(e, "catalogsModel");
                    var t = this.getRouter();
                    t.getRoute("RouteDetail").attachMatched(this._onObjectMatched, this);
                    this._pdfViewer = new i({
                        title: "Vista previa del PDF"
                    });
                    this.getView().addDependent(this._pdfViewer);
                    var o = new sap.ui.model.json.JSONModel;
                    let a = this.get_JSON_PDF();
                    o.setData(a);
                    this.getView().setModel(o, "pdfStructureModel");
                    let s = this.detailSettingsModel();
                    this.getView().setModel(s, "settingsModel")
                },
                _onObjectMatched: async function(e) {
                    const t = e.getParameter("arguments").folio;
                    try {
                        const e = await this.loadFolioData(t)
                    } catch (e) {
                        console.error("Fallo al cargar el folio:", e)
                    }
                },
                goBackBtn() {
                    this.goBack()
                },
                onShowPDF: function() {
                    var e = this.getView().getModel("basculaDetails").getData();
                    const t = true;
                    this.loadFolioData(e.Folio, t)
                },
                loadImageAsBase64: function(e, t) {
                    var o = new Image;
                    o.onload = function() {
                        var e = document.createElement("canvas");
                        e.width = o.width;
                        e.height = o.height;
                        var a = e.getContext("2d");
                        a.drawImage(o, 0, 0);
                        var s = e.toDataURL("image/png");
                        t(s)
                    }
                    ;
                    o.src = e
                },
                onUpdateData: async function() {
                    const e = this.getView().getModel("zbasc");
                    const t = this.getView().getModel("basculaDetails");
                    const o = t?.getData()?.Folio;
                    const a = this.getView().byId("txt_NumeroDoc").getValue();
                    if (!o || !a) {
                        sap.m.MessageBox.warning(this.getResourceBundle().getText("message.folio_oc_requeridos"));
                        return
                    }
                    const s = `/Alta('${o}')`;
                    const i = e.sServiceUrl + s;
                    const r = {
                        NumeroDoc: a
                    };
                    try {
                        const t = this._getServiceUrl() + "/Folio('0')";
                        const o = await this._fetchCsrfToken(t);
                        await $.ajax({
                            url: i,
                            method: "PATCH",
                            headers: {
                                "X-CSRF-Token": o,
                                "Content-Type": "application/json",
                                Accept: "application/json"
                            },
                            data: JSON.stringify({
                                NumeroDoc: a
                            }),
                            success: () => {
                                sap.m.MessageToast.show(this.getResourceBundle().getText("message.actualizacion_exitosa"));
                                e.refresh(true)
                            }
                            ,
                            error: (e, t) => {
                                let o = e.responseJSON.error.message.value;
                                sap.m.MessageBox.error(o)
                            }
                        })
                    } catch (e) {
                        console.error("❌ Error obteniendo CSRF Token:", e)
                    }
                },
                onBeforeRendering() {}
            })
        }
        );
    },
    "delmex/zmmbascula/controller/Main.controller.js": function() {
        sap.ui.define(["delmex/zmmbascula/controller/BaseController", "delmex/zmmbascula/util/formatter", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/m/MessageBox", "sap/ui/core/BusyIndicator"], (e, t, o, s, l, i, r) => {
            "use strict";
            return e.extend("delmex.zmmbascula.controller.Main", {
                formatter: t,
                onInit() {
                    let e = this.getRequestModel();
                    this.getView().setModel(e, "requestModel");
                    let t = this.getCatalogsModel();
                    this.getView().setModel(t, "catalogsModel");
                    sap.ui.getCore().setModel(t, "catalogsModel")
                },
                navToDetail(e) {
                    var t = e.getSource();
                    var o = t.getBindingContext("detailsModel");
                    var s = o.getProperty(o.getPath());
                    var l = s.Folio;
                    console.log("Master busy");
                    r.show(5e3);
                    this.getRouter().navTo("RouteDetail", {
                        folio: l
                    }, false)
                },
                onSearch() {
                    r.show(5e3);
                    var e = this.getFilters();
                    var t = this;
                    var s = this.getView().getModel("zbasc");
                    const l = "/Folio";
                    var i = new o;
                    s.read(l, {
                        filters: e,
                        success: function(e, o) {
                            i.setData(e.results);
                            t.getView().setModel(i, "detailsModel");
                            r.hide()
                        },
                        error: function(e) {
                            sap.m.MessageBox.error(e);
                            r.hide()
                        }
                    })
                },
                getFilters() {
                    let e = [];
                    let t = this.getView().getModel("requestModel").getProperty("/Folio");
                    let o = this.getView().getModel("requestModel").getProperty("/CentroEnt");
                    let i = this.getView().getModel("requestModel").getProperty("/Tipoticket");
                    let r = this.getView().getModel("requestModel").getProperty("/CentroSal");
                    let a = this.getView().getModel("requestModel").getProperty("/Material");
                    let n = this.getView().getModel("requestModel").getProperty("/NumeroDoc");
                    let g = this.getView().getModel("requestModel").getProperty("/Placa");
                    let d = this.getView().getModel("requestModel").getProperty("/FechaEntBas");
                    let u = this.getView().getModel("requestModel").getProperty("/FechaSalBas");
                    if (t) {
                        e.push(new s("Folio",l.EQ,t))
                    }
                    if (o) {
                        e.push(new s("CentroEnt",l.EQ,o))
                    }
                    if (i) {
                        e.push(new s("Tipoticket",l.EQ,i))
                    }
                    if (r) {
                        e.push(new s("CentroSal",l.EQ,r))
                    }
                    if (a) {
                        e.push(new s("Material",l.Contains,a))
                    }
                    if (n) {
                        e.push(new s("NumeroDoc",l.EQ,n))
                    }
                    if (g) {
                        e.push(new s("Placa",l.Contains,g))
                    }
                    if (d) {
                        let t = this.buildDate(d);
                        e.push(new s("FechaEntBas",l.Contains,t))
                    }
                    if (u) {
                        let t = this.buildDate(u);
                        e.push(new s("FechaSalBas",l.Contains,t))
                    }
                    return e
                }
            })
        }
        );
    },
    "delmex/zmmbascula/i18n/i18n.properties": '# This is the resource bundle for delmex.zmmbascula\n\n#Texts for manifest.json\n\n#XTIT: Application name\nappTitle=Bascula Delmex\n\n#YDES: Application description\nappDescription=Pesaje Entrada y Salida\n#XTIT: Main view title\ntitle=Bascula Delmex\n\nvalor=********\n\n#Main View\nformatter.noData=-\n\n#Detail view\ndetailView.form_title=Detalle del Folio\ndetailView.proceso=Proceso\ndetailView.tipo_ticket=Tipo ticket\ndetailView.bascula_entrada=B\\u00e1scula entrada\ndetailView.centro_entrada=Centro entrada\ndetailView.bascula_salida=B\\u00e1scula salida\ndetailView.centro_salida=Centro Salida\ndetailView.material=Material\ndetailView.fecha_reg_bas=Fecha y hora de registro en b\\u00e1scula\ndetailView.placa=Placa\ndetailView.conductor=Conductor\ndetailView.fecha_ent_bas=Fecha y hora pesaje entrada en b\\u00e1scula\ndetailView.pesaje=Pesaje 1 en KG\ndetailView.fecha_sal_bas=Fecha y hora de Salida en b\\u00e1scula\ndetailView.pesaje2=Pesaje 2 en KG\ndetailView.peso_neto=Peso Neto\ndetailView.peso_teorico=Peso Te\\u00f3rico\ndetailView.diferencia=Diferencia\ndetailView.valor=Valor\ndetailView.reg_incompleto=Registro Incompleto\ndetailView.numero_doc=Numero Doc.\ndetailView.numero_doc.placeholder=Orden de compra\ndetailView.mensaje=Mensaje\ndetailview.regresar=Regresar\ndetailView.generar_pdf=Generar PDF\ndetailView.actualizar_datos=Actualizar Datos\ndetailView.orden_venta=Orden de venta\ndetailView.orden_venta.placeholder=Captura la orden de venta\n\n\n# Messages\nmessage.numeroDoc.locked=Este campo ya tiene n\\u00famero asignado y no puede ser editado.\n\n# Formatter\nformatter.invalidDate=Fecha inv\\u00e1lida\nmessage.folio_oc_requeridos=Folio y n\\u00famero de documento son obligatorios.\nmessage.actualizacion_exitosa=\\ud83d\\udcc4 Registro actualizado correctamente.\nmessage.error_patch=Ocurri\\u00f3 un error al actualizar el registro.\nmessage.error_csrf=No se pudo obtener el token CSRF.\n',
    "delmex/zmmbascula/i18n/i18n_en.properties": '# This is the resource bundle for delmex.zmmbascula\n\n#Texts for manifest.json\n\n#XTIT: Application name\nappTitle=Bascula Delmex\n\n#YDES: Application description\nappDescription=Pesaje Entrada y Salida\n#XTIT: Main view title\ntitle=Bascula Delmex\n\nvalor=********\n\n#Main View\nformatter.noData=-\n\n#Detail view\ndetailView.form_title=Detalle del Folio\ndetailView.proceso=Proceso\ndetailView.tipo_ticket=Tipo ticket\ndetailView.bascula_entrada=B\\u00e1scula entrada\ndetailView.centro_entrada=Centro entrada\ndetailView.bascula_salida=B\\u00e1scula salida\ndetailView.centro_salida=Centro Salida\ndetailView.material=Material\ndetailView.fecha_reg_bas=Fecha y hora de registro en b\\u00e1scula\ndetailView.placa=Placa\ndetailView.conductor=Conductor\ndetailView.fecha_ent_bas=Fecha y hora pesaje entrada en b\\u00e1scula\ndetailView.pesaje=Pesaje 1 en KG\ndetailView.fecha_sal_bas=Fecha y hora de Salida en b\\u00e1scula\ndetailView.pesaje2=Pesaje 2 en KG\ndetailView.peso_neto=Peso Neto\ndetailView.peso_teorico=Peso Te\\u00f3rico\ndetailView.diferencia=Diferencia\ndetailView.valor=Valor\ndetailView.reg_incompleto=Registro Incompleto\ndetailView.numero_doc=Numero Doc.\ndetailView.numero_doc.placeholder=Orden de compra\ndetailView.mensaje=Mensaje\ndetailview.regresar=Regresar\ndetailView.generar_pdf=Generar PDF\ndetailView.actualizar_datos=Actualizar Datos\ndetailView.orden_venta=Orden de venta\ndetailView.orden_venta.placeholder=Captura la orden de venta\n\n\n# Messages\nmessage.numeroDoc.locked=Este campo ya tiene n\\u00famero asignado y no puede ser editado.\n\n# Formatter\nformatter.invalidDate=Fecha inv\\u00e1lida\n',
    "delmex/zmmbascula/i18n/i18n_es.properties": '# This is the resource bundle for delmex.zmmbascula\n\n#Texts for manifest.json\n\n#XTIT: Application name\nappTitle=Bascula Delmex\n\n#YDES: Application description\nappDescription=Pesaje Entrada y Salida\n#XTIT: Main view title\ntitle=Bascula Delmex\n\nvalor=********\n\n#Main View\nformatter.noData=-\n\n#Detail view\ndetailView.form_title=Detalle del Folio\ndetailView.proceso=Proceso\ndetailView.tipo_ticket=Tipo ticket\ndetailView.bascula_entrada=B\\u00e1scula entrada\ndetailView.centro_entrada=Centro entrada\ndetailView.bascula_salida=B\\u00e1scula salida\ndetailView.centro_salida=Centro Salida\ndetailView.material=Material\ndetailView.fecha_reg_bas=Fecha y hora de registro en b\\u00e1scula\ndetailView.placa=Placa\ndetailView.conductor=Conductor\ndetailView.fecha_ent_bas=Fecha y hora pesaje entrada en b\\u00e1scula\ndetailView.pesaje=Pesaje 1 en KG\ndetailView.fecha_sal_bas=Fecha y hora de Salida en b\\u00e1scula\ndetailView.pesaje2=Pesaje 2 en KG\ndetailView.peso_neto=Peso Neto\ndetailView.peso_teorico=Peso Te\\u00f3rico\ndetailView.diferencia=Diferencia\ndetailView.valor=Valor\ndetailView.reg_incompleto=Registro Incompleto\ndetailView.numero_doc=Numero Doc.\ndetailView.numero_doc.placeholder=Orden de compra\ndetailView.mensaje=Mensaje\ndetailview.regresar=Regresar\ndetailView.generar_pdf=Generar PDF\ndetailView.actualizar_datos=Actualizar Datos\ndetailView.orden_venta=Orden de venta\ndetailView.orden_venta.placeholder=Captura la orden de venta\n\n\n# Messages\nmessage.numeroDoc.locked=Este campo ya tiene n\\u00famero asignado y no puede ser editado.\n\n# Formatter\nformatter.invalidDate=Fecha inv\\u00e1lida\n',
    "delmex/zmmbascula/i18n/i18n_es_ES.properties": '# This is the resource bundle for delmex.zmmbascula\n\n#Texts for manifest.json\n\n#XTIT: Application name\nappTitle=Bascula Delmex\n\n#YDES: Application description\nappDescription=Pesaje Entrada y Salida\n#XTIT: Main view title\ntitle=Bascula Delmex\n\nvalor=********\n\n#Main View\nformatter.noData=-\n\n#Detail view\ndetailView.form_title=Detalle del Folio\ndetailView.proceso=Proceso\ndetailView.tipo_ticket=Tipo ticket\ndetailView.bascula_entrada=B\\u00e1scula entrada\ndetailView.centro_entrada=Centro entrada\ndetailView.bascula_salida=B\\u00e1scula salida\ndetailView.centro_salida=Centro Salida\ndetailView.material=Material\ndetailView.fecha_reg_bas=Fecha y hora de registro en b\\u00e1scula\ndetailView.placa=Placa\ndetailView.conductor=Conductor\ndetailView.fecha_ent_bas=Fecha y hora pesaje entrada en b\\u00e1scula\ndetailView.pesaje=Pesaje 1 en KG\ndetailView.fecha_sal_bas=Fecha y hora de Salida en b\\u00e1scula\ndetailView.pesaje2=Pesaje 2 en KG\ndetailView.peso_neto=Peso Neto\ndetailView.peso_teorico=Peso Te\\u00f3rico\ndetailView.diferencia=Diferencia\ndetailView.valor=Valor\ndetailView.reg_incompleto=Registro Incompleto\ndetailView.numero_doc=Numero Doc.\ndetailView.numero_doc.placeholder=Orden de compra\ndetailView.mensaje=Mensaje\ndetailview.regresar=Regresar\ndetailView.generar_pdf=Generar PDF\ndetailView.actualizar_datos=Actualizar Datos\ndetailView.orden_venta=Orden de venta\ndetailView.orden_venta.placeholder=Captura la orden de venta\n\n\n# Messages\nmessage.numeroDoc.locked=Este campo ya tiene n\\u00famero asignado y no puede ser editado.\n\n# Formatter\nformatter.invalidDate=Fecha inv\\u00e1lida\n',
    "delmex/zmmbascula/lib/jspdf.js": function() {
        (function(t) {
            typeof define === "function" && define.amd ? define(t) : t()
        }
        )(function() {
            "use strict";
            /** @license
     * jsPDF - PDF Document creation from JavaScript
     * Version 1.5.3 Built on 2018-12-27T14:11:42.696Z
     *                      CommitID d93d28db14
     *
     * Copyright (c) 2010-2016 James Hall <james@parall.ax>, https://github.com/MrRio/jsPDF
     *               2010 Aaron Spike, https://github.com/acspike
     *               2012 Willow Systems Corporation, willow-systems.com
     *               2012 Pablo Hess, https://github.com/pablohess
     *               2012 Florian Jenett, https://github.com/fjenett
     *               2013 Warren Weckesser, https://github.com/warrenweckesser
     *               2013 Youssef Beddad, https://github.com/lifof
     *               2013 Lee Driscoll, https://github.com/lsdriscoll
     *               2013 Stefan Slonevskiy, https://github.com/stefslon
     *               2013 Jeremy Morel, https://github.com/jmorel
     *               2013 Christoph Hartmann, https://github.com/chris-rock
     *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
     *               2014 James Makes, https://github.com/dollaruw
     *               2014 Diego Casorran, https://github.com/diegocr
     *               2014 Steven Spungin, https://github.com/Flamenco
     *               2014 Kenneth Glassey, https://github.com/Gavvers
     *
     * Licensed under the MIT License
     *
     * Contributor(s):
     *    siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
     *    kim3er, mfo, alnorth, Flamenco
     */
            function t(e) {
                if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    t = function(t) {
                        return typeof t
                    }
                } else {
                    t = function(t) {
                        return t && typeof Symbol === "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
                    }
                }
                return t(e)
            }
            (function(e) {
                if (t(e.console) !== "object") {
                    // Console-polyfill. MIT license.
                    e.console = {};
                    var r = e.console;
                    var n, i;
                    var a = function t() {};
                    var o = ["memory"];
                    var s = ("assert,clear,count,debug,dir,dirxml,error,exception,group," + "groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd," + "show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn").split(",");
                    while (n = o.pop()) {
                        if (!r[n])
                            r[n] = {}
                    }
                    while (i = s.pop()) {
                        if (!r[i])
                            r[i] = a
                    }
                }
                var f = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                if (typeof e.btoa === "undefined") {
                    e.btoa = function(t) {
                        var e, r, n, i, a, o, s, u, l = 0, h = 0, c = "", d = [];
                        if (!t) {
                            return t
                        }
                        do {
                            e = t.charCodeAt(l++);
                            r = t.charCodeAt(l++);
                            n = t.charCodeAt(l++);
                            u = e << 16 | r << 8 | n;
                            i = u >> 18 & 63;
                            a = u >> 12 & 63;
                            o = u >> 6 & 63;
                            s = u & 63;
                            d[h++] = f.charAt(i) + f.charAt(a) + f.charAt(o) + f.charAt(s)
                        } while (l < t.length);
                        c = d.join("");
                        var p = t.length % 3;
                        return (p ? c.slice(0, p - 3) : c) + "===".slice(p || 3)
                    }
                }
                if (typeof e.atob === "undefined") {
                    e.atob = function(t) {
                        var e, r, n, i, a, o, s, u, l = 0, h = 0, c = "", d = [];
                        if (!t) {
                            return t
                        }
                        t += "";
                        do {
                            i = f.indexOf(t.charAt(l++));
                            a = f.indexOf(t.charAt(l++));
                            o = f.indexOf(t.charAt(l++));
                            s = f.indexOf(t.charAt(l++));
                            u = i << 18 | a << 12 | o << 6 | s;
                            e = u >> 16 & 255;
                            r = u >> 8 & 255;
                            n = u & 255;
                            if (o == 64) {
                                d[h++] = String.fromCharCode(e)
                            } else if (s == 64) {
                                d[h++] = String.fromCharCode(e, r)
                            } else {
                                d[h++] = String.fromCharCode(e, r, n)
                            }
                        } while (l < t.length);
                        c = d.join("");
                        return c
                    }
                }
                if (!Array.prototype.map) {
                    Array.prototype.map = function(t) {
                        if (this === void 0 || this === null || typeof t !== "function")
                            throw new TypeError;
                        var e = Object(this)
                          , r = e.length >>> 0
                          , n = new Array(r);
                        var i = arguments.length > 1 ? arguments[1] : void 0;
                        for (var a = 0; a < r; a++) {
                            if (a in e)
                                n[a] = t.call(i, e[a], a, e)
                        }
                        return n
                    }
                }
                if (!Array.isArray) {
                    Array.isArray = function(t) {
                        return Object.prototype.toString.call(t) === "[object Array]"
                    }
                }
                if (!Array.prototype.forEach) {
                    Array.prototype.forEach = function(t, e) {
                        if (this === void 0 || this === null || typeof t !== "function")
                            throw new TypeError;
                        var r = Object(this)
                          , n = r.length >>> 0;
                        for (var i = 0; i < n; i++) {
                            if (i in r)
                                t.call(e, r[i], i, r)
                        }
                    }
                }
                if (!Array.prototype.find) {
                    Object.defineProperty(Array.prototype, "find", {
                        value: function t(e) {
                            if (this == null) {
                                throw new TypeError('"this" is null or not defined')
                            }
                            var r = Object(this);
                            var n = r.length >>> 0;
                            if (typeof e !== "function") {
                                throw new TypeError("predicate must be a function")
                            }
                            var i = arguments[1];
                            var a = 0;
                            while (a < n) {
                                var o = r[a];
                                if (e.call(i, o, a, r)) {
                                    return o
                                }
                                a++
                            }
                            return undefined
                        },
                        configurable: true,
                        writable: true
                    })
                }
                if (!Object.keys) {
                    Object.keys = function() {
                        var e = Object.prototype.hasOwnProperty
                          , r = !{
                            toString: null
                        }.propertyIsEnumerable("toString")
                          , n = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"]
                          , i = n.length;
                        return function(a) {
                            if (t(a) !== "object" && (typeof a !== "function" || a === null)) {
                                throw new TypeError
                            }
                            var o = [], s, f;
                            for (s in a) {
                                if (e.call(a, s)) {
                                    o.push(s)
                                }
                            }
                            if (r) {
                                for (f = 0; f < i; f++) {
                                    if (e.call(a, n[f])) {
                                        o.push(n[f])
                                    }
                                }
                            }
                            return o
                        }
                    }()
                }
                if (typeof Object.assign != "function") {
                    Object.assign = function(t) {
                        if (t == null) {
                            throw new TypeError("Cannot convert undefined or null to object")
                        }
                        t = Object(t);
                        for (var e = 1; e < arguments.length; e++) {
                            var r = arguments[e];
                            if (r != null) {
                                for (var n in r) {
                                    if (Object.prototype.hasOwnProperty.call(r, n)) {
                                        t[n] = r[n]
                                    }
                                }
                            }
                        }
                        return t
                    }
                }
                if (!String.prototype.trim) {
                    String.prototype.trim = function() {
                        return this.replace(/^\s+|\s+$/g, "")
                    }
                }
                if (!String.prototype.trimLeft) {
                    String.prototype.trimLeft = function() {
                        return this.replace(/^\s+/g, "")
                    }
                }
                if (!String.prototype.trimRight) {
                    String.prototype.trimRight = function() {
                        return this.replace(/\s+$/g, "")
                    }
                }
                Number.isInteger = Number.isInteger || function(t) {
                    return typeof t === "number" && isFinite(t) && Math.floor(t) === t
                }
            }
            )(typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || Function('return typeof this === "object" && this.content')() || Function("return this")());
            var e = function(e) {
                function n(r) {
                    if (t(r) !== "object") {
                        throw new Error("Invalid Context passed to initialize PubSub (jsPDF-module)")
                    }
                    var n = {};
                    this.subscribe = function(t, e, r) {
                        r = r || false;
                        if (typeof t !== "string" || typeof e !== "function" || typeof r !== "boolean") {
                            throw new Error("Invalid arguments passed to PubSub.subscribe (jsPDF-module)")
                        }
                        if (!n.hasOwnProperty(t)) {
                            n[t] = {}
                        }
                        var i = Math.random().toString(35);
                        n[t][i] = [e, !!r];
                        return i
                    }
                    ;
                    this.unsubscribe = function(t) {
                        for (var e in n) {
                            if (n[e][t]) {
                                delete n[e][t];
                                if (Object.keys(n[e]).length === 0) {
                                    delete n[e]
                                }
                                return true
                            }
                        }
                        return false
                    }
                    ;
                    this.publish = function(t) {
                        if (n.hasOwnProperty(t)) {
                            var i = Array.prototype.slice.call(arguments, 1)
                              , a = [];
                            for (var o in n[t]) {
                                var s = n[t][o];
                                try {
                                    s[0].apply(r, i)
                                } catch (t) {
                                    if (e.console) {
                                        console.error("jsPDF PubSub Error", t.message, t)
                                    }
                                }
                                if (s[1])
                                    a.push(o)
                            }
                            if (a.length)
                                a.forEach(this.unsubscribe)
                        }
                    }
                    ;
                    this.getTopics = function() {
                        return n
                    }
                }
                function i(a, o, s, f) {
                    var u = {};
                    var l = [];
                    var h = 1;
                    if (t(a) === "object") {
                        u = a;
                        a = u.orientation;
                        o = u.unit || o;
                        s = u.format || s;
                        f = u.compress || u.compressPdf || f;
                        l = u.filters || (f === true ? ["FlateEncode"] : l);
                        h = typeof u.userUnit === "number" ? Math.abs(u.userUnit) : 1
                    }
                    o = o || "mm";
                    a = ("" + (a || "P")).toLowerCase();
                    var c = u.putOnlyUsedFonts || true;
                    var d = {};
                    var p = {
                        internal: {},
                        __private__: {}
                    };
                    p.__private__.PubSub = n;
                    var v = "1.3";
                    var g = p.__private__.getPdfVersion = function() {
                        return v
                    }
                    ;
                    var m = p.__private__.setPdfVersion = function(t) {
                        v = t
                    }
                    ;
                    var y = {
                        a0: [2383.94, 3370.39],
                        a1: [1683.78, 2383.94],
                        a2: [1190.55, 1683.78],
                        a3: [841.89, 1190.55],
                        a4: [595.28, 841.89],
                        a5: [419.53, 595.28],
                        a6: [297.64, 419.53],
                        a7: [209.76, 297.64],
                        a8: [147.4, 209.76],
                        a9: [104.88, 147.4],
                        a10: [73.7, 104.88],
                        b0: [2834.65, 4008.19],
                        b1: [2004.09, 2834.65],
                        b2: [1417.32, 2004.09],
                        b3: [1000.63, 1417.32],
                        b4: [708.66, 1000.63],
                        b5: [498.9, 708.66],
                        b6: [354.33, 498.9],
                        b7: [249.45, 354.33],
                        b8: [175.75, 249.45],
                        b9: [124.72, 175.75],
                        b10: [87.87, 124.72],
                        c0: [2599.37, 3676.54],
                        c1: [1836.85, 2599.37],
                        c2: [1298.27, 1836.85],
                        c3: [918.43, 1298.27],
                        c4: [649.13, 918.43],
                        c5: [459.21, 649.13],
                        c6: [323.15, 459.21],
                        c7: [229.61, 323.15],
                        c8: [161.57, 229.61],
                        c9: [113.39, 161.57],
                        c10: [79.37, 113.39],
                        dl: [311.81, 623.62],
                        letter: [612, 792],
                        "government-letter": [576, 756],
                        legal: [612, 1008],
                        "junior-legal": [576, 360],
                        ledger: [1224, 792],
                        tabloid: [792, 1224],
                        "credit-card": [153, 243]
                    };
                    var w = p.__private__.getPageFormats = function() {
                        return y
                    }
                    ;
                    var b = p.__private__.getPageFormat = function(t) {
                        return y[t]
                    }
                    ;
                    if (typeof s === "string") {
                        s = b(s)
                    }
                    s = s || b("a4");
                    var x = p.f2 = p.__private__.f2 = function(t) {
                        if (isNaN(t)) {
                            throw new Error("Invalid argument passed to jsPDF.f2")
                        }
                        return t.toFixed(2)
                    }
                    ;
                    var N = p.__private__.f3 = function(t) {
                        if (isNaN(t)) {
                            throw new Error("Invalid argument passed to jsPDF.f3")
                        }
                        return t.toFixed(3)
                    }
                    ;
                    var L = "00000000000000000000000000000000";
                    var A = p.__private__.getFileId = function() {
                        return L
                    }
                    ;
                    var S = p.__private__.setFileId = function(t) {
                        t = t || "12345678901234567890123456789012".split("").map(function() {
                            return "ABCDEF0123456789".charAt(Math.floor(Math.random() * 16))
                        }).join("");
                        L = t;
                        return L
                    }
                    ;
                    p.setFileId = function(t) {
                        S(t);
                        return this
                    }
                    ;
                    p.getFileId = function() {
                        return A()
                    }
                    ;
                    var _;
                    var F = p.__private__.convertDateToPDFDate = function(t) {
                        var e = "";
                        var r = t.getTimezoneOffset()
                          , n = r < 0 ? "+" : "-"
                          , i = Math.floor(Math.abs(r / 60))
                          , a = Math.abs(r % 60)
                          , o = [n, C(i), "'", C(a), "'"].join("");
                        e = ["D:", t.getFullYear(), C(t.getMonth() + 1), C(t.getDate()), C(t.getHours()), C(t.getMinutes()), C(t.getSeconds()), o].join("");
                        return e
                    }
                    ;
                    var k = p.__private__.convertPDFDateToDate = function(t) {
                        var e = parseInt(t.substr(2, 4), 10);
                        var r = parseInt(t.substr(6, 2), 10) - 1;
                        var n = parseInt(t.substr(8, 2), 10);
                        var i = parseInt(t.substr(10, 2), 10);
                        var a = parseInt(t.substr(12, 2), 10);
                        var o = parseInt(t.substr(14, 2), 10);
                        var s = parseInt(t.substr(16, 2), 10);
                        var f = parseInt(t.substr(20, 2), 10);
                        var u = new Date(e,r,n,i,a,o,0);
                        return u
                    }
                    ;
                    var P = p.__private__.setCreationDate = function(e) {
                        var r;
                        var n = /^D:(20[0-2][0-9]|203[0-7]|19[7-9][0-9])(0[0-9]|1[0-2])([0-2][0-9]|3[0-1])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])(0[0-9]|[1-5][0-9])(\+0[0-9]|\+1[0-4]|\-0[0-9]|\-1[0-1])\'(0[0-9]|[1-5][0-9])\'?$/;
                        if (typeof e === "undefined") {
                            e = new Date
                        }
                        if (t(e) === "object" && Object.prototype.toString.call(e) === "[object Date]") {
                            r = F(e)
                        } else if (n.test(e)) {
                            r = e
                        } else {
                            throw new Error("Invalid argument passed to jsPDF.setCreationDate")
                        }
                        _ = r;
                        return _
                    }
                    ;
                    var I = p.__private__.getCreationDate = function(t) {
                        var e = _;
                        if (t === "jsDate") {
                            e = k(_)
                        }
                        return e
                    }
                    ;
                    p.setCreationDate = function(t) {
                        P(t);
                        return this
                    }
                    ;
                    p.getCreationDate = function(t) {
                        return I(t)
                    }
                    ;
                    var C = p.__private__.padd2 = function(t) {
                        return ("0" + parseInt(t)).slice(-2)
                    }
                    ;
                    var B = !1;
                    var j = [];
                    var E = [];
                    var M;
                    var O = 0;
                    var q;
                    var T = p.__private__.setCustomOutputDestination = function(t) {
                        q = t
                    }
                    ;
                    var R = p.__private__.resetCustomOutputDestination = function(t) {
                        q = undefined
                    }
                    ;
                    var D = p.__private__.out = function(t) {
                        var e;
                        t = typeof t === "string" ? t : t.toString();
                        if (typeof q === "undefined") {
                            e = B ? j[M] : E
                        } else {
                            e = q
                        }
                        e.push(t);
                        if (!B) {
                            O += t.length + 1
                        }
                        return e
                    }
                    ;
                    var U = p.__private__.write = function(t) {
                        return D(arguments.length === 1 ? t.toString() : Array.prototype.join.call(arguments, " "))
                    }
                    ;
                    var z = p.__private__.getArrayBuffer = function(t) {
                        var e = t.length
                          , r = new ArrayBuffer(e)
                          , n = new Uint8Array(r);
                        while (e--) {
                            n[e] = t.charCodeAt(e)
                        }
                        return r
                    }
                    ;
                    var H = [["Helvetica", "helvetica", "normal", "WinAnsiEncoding"], ["Helvetica-Bold", "helvetica", "bold", "WinAnsiEncoding"], ["Helvetica-Oblique", "helvetica", "italic", "WinAnsiEncoding"], ["Helvetica-BoldOblique", "helvetica", "bolditalic", "WinAnsiEncoding"], ["Courier", "courier", "normal", "WinAnsiEncoding"], ["Courier-Bold", "courier", "bold", "WinAnsiEncoding"], ["Courier-Oblique", "courier", "italic", "WinAnsiEncoding"], ["Courier-BoldOblique", "courier", "bolditalic", "WinAnsiEncoding"], ["Times-Roman", "times", "normal", "WinAnsiEncoding"], ["Times-Bold", "times", "bold", "WinAnsiEncoding"], ["Times-Italic", "times", "italic", "WinAnsiEncoding"], ["Times-BoldItalic", "times", "bolditalic", "WinAnsiEncoding"], ["ZapfDingbats", "zapfdingbats", "normal", null], ["Symbol", "symbol", "normal", null]];
                    var W = p.__private__.getStandardFonts = function(t) {
                        return H
                    }
                    ;
                    var V = u.fontSize || 16;
                    var G = p.__private__.setFontSize = p.setFontSize = function(t) {
                        V = t;
                        return this
                    }
                    ;
                    var Y = p.__private__.getFontSize = p.getFontSize = function() {
                        return V
                    }
                    ;
                    var J = u.R2L || false;
                    var X = p.__private__.setR2L = p.setR2L = function(t) {
                        J = t;
                        return this
                    }
                    ;
                    var K = p.__private__.getR2L = p.getR2L = function(t) {
                        return J
                    }
                    ;
                    var Z;
                    var Q = p.__private__.setZoomMode = function(t) {
                        var e = [undefined, null, "fullwidth", "fullheight", "fullpage", "original"];
                        if (/^\d*\.?\d*\%$/.test(t)) {
                            Z = t
                        } else if (!isNaN(t)) {
                            Z = parseInt(t, 10)
                        } else if (e.indexOf(t) !== -1) {
                            Z = t
                        } else {
                            throw new Error('zoom must be Integer (e.g. 2), a percentage Value (e.g. 300%) or fullwidth, fullheight, fullpage, original. "' + t + '" is not recognized.')
                        }
                    }
                    ;
                    var $ = p.__private__.getZoomMode = function() {
                        return Z
                    }
                    ;
                    var tt;
                    var et = p.__private__.setPageMode = function(t) {
                        var e = [undefined, null, "UseNone", "UseOutlines", "UseThumbs", "FullScreen"];
                        if (e.indexOf(t) == -1) {
                            throw new Error('Page mode must be one of UseNone, UseOutlines, UseThumbs, or FullScreen. "' + t + '" is not recognized.')
                        }
                        tt = t
                    }
                    ;
                    var rt = p.__private__.getPageMode = function() {
                        return tt
                    }
                    ;
                    var nt;
                    var it = p.__private__.setLayoutMode = function(t) {
                        var e = [undefined, null, "continuous", "single", "twoleft", "tworight", "two"];
                        if (e.indexOf(t) == -1) {
                            throw new Error('Layout mode must be one of continuous, single, twoleft, tworight. "' + t + '" is not recognized.')
                        }
                        nt = t
                    }
                    ;
                    var at = p.__private__.getLayoutMode = function() {
                        return nt
                    }
                    ;
                    var ot = p.__private__.setDisplayMode = p.setDisplayMode = function(t, e, r) {
                        Q(t);
                        it(e);
                        et(r);
                        return this
                    }
                    ;
                    var st = {
                        title: "",
                        subject: "",
                        author: "",
                        keywords: "",
                        creator: ""
                    };
                    var ft = p.__private__.getDocumentProperty = function(t) {
                        if (Object.keys(st).indexOf(t) === -1) {
                            throw new Error("Invalid argument passed to jsPDF.getDocumentProperty")
                        }
                        return st[t]
                    }
                    ;
                    var ut = p.__private__.getDocumentProperties = function(t) {
                        return st
                    }
                    ;
                    var lt = p.__private__.setDocumentProperties = p.setProperties = p.setDocumentProperties = function(t) {
                        for (var e in st) {
                            if (st.hasOwnProperty(e) && t[e]) {
                                st[e] = t[e]
                            }
                        }
                        return this
                    }
                    ;
                    var ht = p.__private__.setDocumentProperty = function(t, e) {
                        if (Object.keys(st).indexOf(t) === -1) {
                            throw new Error("Invalid arguments passed to jsPDF.setDocumentProperty")
                        }
                        return st[t] = e
                    }
                    ;
                    var ct = 0;
                    var dt = [];
                    var pt = {};
                    var vt = {};
                    var gt;
                    var mt;
                    var yt = 0;
                    var wt = [];
                    var bt = [];
                    var xt = new n(p);
                    var Nt = u.hotfixes || [];
                    var Lt = p.__private__.newObject = function() {
                        var t = At();
                        St(t, true);
                        return t
                    }
                    ;
                    var At = p.__private__.newObjectDeferred = function() {
                        ct++;
                        dt[ct] = function() {
                            return O
                        }
                        ;
                        return ct
                    }
                    ;
                    var St = function t(e, r) {
                        r = typeof r === "boolean" ? r : false;
                        dt[e] = O;
                        if (r) {
                            D(e + " 0 obj")
                        }
                        return e
                    };
                    var _t = p.__private__.newAdditionalObject = function() {
                        var t = At();
                        var e = {
                            objId: t,
                            content: ""
                        };
                        bt.push(e);
                        return e
                    }
                    ;
                    var Ft = At();
                    var kt = At();
                    var Pt = p.__private__.decodeColorString = function(t) {
                        var e = t.split(" ");
                        if (e.length === 2 && (e[1] === "g" || e[1] === "G")) {
                            var r = parseFloat(e[0]);
                            e = [r, r, r, "r"]
                        }
                        var n = "#";
                        for (var i = 0; i < 3; i++) {
                            n += ("0" + Math.floor(parseFloat(e[i]) * 255).toString(16)).slice(-2)
                        }
                        return n
                    }
                    ;
                    var It = p.__private__.encodeColorString = function(e) {
                        var r;
                        if (typeof e === "string") {
                            e = {
                                ch1: e
                            }
                        }
                        var n = e.ch1;
                        var i = e.ch2;
                        var a = e.ch3;
                        var o = e.ch4;
                        var s = e.precision;
                        var f = e.pdfColorType === "draw" ? ["G", "RG", "K"] : ["g", "rg", "k"];
                        if (typeof n === "string" && n.charAt(0) !== "#") {
                            var u = new RGBColor(n);
                            if (u.ok) {
                                n = u.toHex()
                            } else if (!/^\d*\.?\d*$/.test(n)) {
                                throw new Error('Invalid color "' + n + '" passed to jsPDF.encodeColorString.')
                            }
                        }
                        if (typeof n === "string" && /^#[0-9A-Fa-f]{3}$/.test(n)) {
                            n = "#" + n[1] + n[1] + n[2] + n[2] + n[3] + n[3]
                        }
                        if (typeof n === "string" && /^#[0-9A-Fa-f]{6}$/.test(n)) {
                            var l = parseInt(n.substr(1), 16);
                            n = l >> 16 & 255;
                            i = l >> 8 & 255;
                            a = l & 255
                        }
                        if (typeof i === "undefined" || typeof o === "undefined" && n === i && i === a) {
                            if (typeof n === "string") {
                                r = n + " " + f[0]
                            } else {
                                switch (e.precision) {
                                case 2:
                                    r = x(n / 255) + " " + f[0];
                                    break;
                                case 3:
                                default:
                                    r = N(n / 255) + " " + f[0]
                                }
                            }
                        } else if (typeof o === "undefined" || t(o) === "object") {
                            if (o && !isNaN(o.a)) {
                                if (o.a === 0) {
                                    r = ["1.000", "1.000", "1.000", f[1]].join(" ");
                                    return r
                                }
                            }
                            if (typeof n === "string") {
                                r = [n, i, a, f[1]].join(" ")
                            } else {
                                switch (e.precision) {
                                case 2:
                                    r = [x(n / 255), x(i / 255), x(a / 255), f[1]].join(" ");
                                    break;
                                default:
                                case 3:
                                    r = [N(n / 255), N(i / 255), N(a / 255), f[1]].join(" ")
                                }
                            }
                        } else {
                            if (typeof n === "string") {
                                r = [n, i, a, o, f[2]].join(" ")
                            } else {
                                switch (e.precision) {
                                case 2:
                                    r = [x(n / 255), x(i / 255), x(a / 255), x(o / 255), f[2]].join(" ");
                                    break;
                                case 3:
                                default:
                                    r = [N(n / 255), N(i / 255), N(a / 255), N(o / 255), f[2]].join(" ")
                                }
                            }
                        }
                        return r
                    }
                    ;
                    var Ct = p.__private__.getFilters = function() {
                        return l
                    }
                    ;
                    var Bt = p.__private__.putStream = function(t) {
                        t = t || {};
                        var e = t.data || "";
                        var r = t.filters || Ct();
                        var n = t.alreadyAppliedFilters || [];
                        var a = t.addLength1 || false;
                        var o = e.length;
                        var s = {};
                        if (r === true) {
                            r = ["FlateEncode"]
                        }
                        var f = t.additionalKeyValues || [];
                        if (typeof i.API.processDataByFilters !== "undefined") {
                            s = i.API.processDataByFilters(e, r)
                        } else {
                            s = {
                                data: e,
                                reverseChain: []
                            }
                        }
                        var u = s.reverseChain + (Array.isArray(n) ? n.join(" ") : n.toString());
                        if (s.data.length !== 0) {
                            f.push({
                                key: "Length",
                                value: s.data.length
                            });
                            if (a === true) {
                                f.push({
                                    key: "Length1",
                                    value: o
                                })
                            }
                        }
                        if (u.length != 0) {
                            if (u.split("/").length - 1 === 1) {
                                f.push({
                                    key: "Filter",
                                    value: u
                                })
                            } else {
                                f.push({
                                    key: "Filter",
                                    value: "[" + u + "]"
                                })
                            }
                        }
                        D("<<");
                        for (var l = 0; l < f.length; l++) {
                            D("/" + f[l].key + " " + f[l].value)
                        }
                        D(">>");
                        if (s.data.length !== 0) {
                            D("stream");
                            D(s.data);
                            D("endstream")
                        }
                    }
                    ;
                    var jt = p.__private__.putPage = function(t) {
                        var e = t.mediaBox;
                        var r = t.number;
                        var n = t.data;
                        var i = t.objId;
                        var a = t.contentsObjId;
                        St(i, true);
                        var o = wt[M].mediaBox.topRightX - wt[M].mediaBox.bottomLeftX;
                        var s = wt[M].mediaBox.topRightY - wt[M].mediaBox.bottomLeftY;
                        D("<</Type /Page");
                        D("/Parent " + t.rootDictionaryObjId + " 0 R");
                        D("/Resources " + t.resourceDictionaryObjId + " 0 R");
                        D("/MediaBox [" + parseFloat(x(t.mediaBox.bottomLeftX)) + " " + parseFloat(x(t.mediaBox.bottomLeftY)) + " " + x(t.mediaBox.topRightX) + " " + x(t.mediaBox.topRightY) + "]");
                        if (t.cropBox !== null) {
                            D("/CropBox [" + x(t.cropBox.bottomLeftX) + " " + x(t.cropBox.bottomLeftY) + " " + x(t.cropBox.topRightX) + " " + x(t.cropBox.topRightY) + "]")
                        }
                        if (t.bleedBox !== null) {
                            D("/BleedBox [" + x(t.bleedBox.bottomLeftX) + " " + x(t.bleedBox.bottomLeftY) + " " + x(t.bleedBox.topRightX) + " " + x(t.bleedBox.topRightY) + "]")
                        }
                        if (t.trimBox !== null) {
                            D("/TrimBox [" + x(t.trimBox.bottomLeftX) + " " + x(t.trimBox.bottomLeftY) + " " + x(t.trimBox.topRightX) + " " + x(t.trimBox.topRightY) + "]")
                        }
                        if (t.artBox !== null) {
                            D("/ArtBox [" + x(t.artBox.bottomLeftX) + " " + x(t.artBox.bottomLeftY) + " " + x(t.artBox.topRightX) + " " + x(t.artBox.topRightY) + "]")
                        }
                        if (typeof t.userUnit === "number" && t.userUnit !== 1) {
                            D("/UserUnit " + t.userUnit)
                        }
                        xt.publish("putPage", {
                            objId: i,
                            pageContext: wt[r],
                            pageNumber: r,
                            page: n
                        });
                        D("/Contents " + a + " 0 R");
                        D(">>");
                        D("endobj");
                        var f = n.join("\n");
                        St(a, true);
                        Bt({
                            data: f,
                            filters: Ct()
                        });
                        D("endobj");
                        return i
                    }
                    ;
                    var Et = p.__private__.putPages = function() {
                        var t, e, r = [];
                        for (t = 1; t <= yt; t++) {
                            wt[t].objId = At();
                            wt[t].contentsObjId = At()
                        }
                        for (t = 1; t <= yt; t++) {
                            r.push(jt({
                                number: t,
                                data: j[t],
                                objId: wt[t].objId,
                                contentsObjId: wt[t].contentsObjId,
                                mediaBox: wt[t].mediaBox,
                                cropBox: wt[t].cropBox,
                                bleedBox: wt[t].bleedBox,
                                trimBox: wt[t].trimBox,
                                artBox: wt[t].artBox,
                                userUnit: wt[t].userUnit,
                                rootDictionaryObjId: Ft,
                                resourceDictionaryObjId: kt
                            }))
                        }
                        St(Ft, true);
                        D("<</Type /Pages");
                        var n = "/Kids [";
                        for (e = 0; e < yt; e++) {
                            n += r[e] + " 0 R "
                        }
                        D(n + "]");
                        D("/Count " + yt);
                        D(">>");
                        D("endobj");
                        xt.publish("postPutPages")
                    }
                    ;
                    var Mt = function t(e) {
                        xt.publish("putFont", {
                            font: e,
                            out: D,
                            newObject: Lt,
                            putStream: Bt
                        });
                        if (e.isAlreadyPutted !== true) {
                            e.objectNumber = Lt();
                            D("<<");
                            D("/Type /Font");
                            D("/BaseFont /" + e.postScriptName);
                            D("/Subtype /Type1");
                            if (typeof e.encoding === "string") {
                                D("/Encoding /" + e.encoding)
                            }
                            D("/FirstChar 32");
                            D("/LastChar 255");
                            D(">>");
                            D("endobj")
                        }
                    };
                    var Ot = function t() {
                        for (var e in pt) {
                            if (pt.hasOwnProperty(e)) {
                                if (c === false || c === true && d.hasOwnProperty(e)) {
                                    Mt(pt[e])
                                }
                            }
                        }
                    };
                    var qt = function t() {
                        D("/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]");
                        D("/Font <<");
                        for (var e in pt) {
                            if (pt.hasOwnProperty(e)) {
                                if (c === false || c === true && d.hasOwnProperty(e)) {
                                    D("/" + e + " " + pt[e].objectNumber + " 0 R")
                                }
                            }
                        }
                        D(">>");
                        D("/XObject <<");
                        xt.publish("putXobjectDict");
                        D(">>")
                    };
                    var Tt = function t() {
                        Ot();
                        xt.publish("putResources");
                        St(kt, true);
                        D("<<");
                        qt();
                        D(">>");
                        D("endobj");
                        xt.publish("postPutResources")
                    };
                    var Rt = function t() {
                        xt.publish("putAdditionalObjects");
                        for (var e = 0; e < bt.length; e++) {
                            var r = bt[e];
                            St(r.objId, true);
                            D(r.content);
                            D("endobj")
                        }
                        xt.publish("postPutAdditionalObjects")
                    };
                    var Dt = function t(e, r, n) {
                        if (!vt.hasOwnProperty(r)) {
                            vt[r] = {}
                        }
                        vt[r][n] = e
                    };
                    var Ut = function t(e, r, n, i, a) {
                        a = a || false;
                        var o = "F" + (Object.keys(pt).length + 1).toString(10)
                          , s = {
                            id: o,
                            postScriptName: e,
                            fontName: r,
                            fontStyle: n,
                            encoding: i,
                            isStandardFont: a,
                            metadata: {}
                        };
                        var f = this;
                        xt.publish("addFont", {
                            font: s,
                            instance: f
                        });
                        if (o !== undefined) {
                            pt[o] = s;
                            Dt(o, r, n)
                        }
                        return o
                    };
                    var zt = function t(e) {
                        for (var r = 0, n = H.length; r < n; r++) {
                            var i = Ut(e[r][0], e[r][1], e[r][2], H[r][3], true);
                            d[i] = true;
                            var a = e[r][0].split("-");
                            Dt(i, a[0], a[1] || "")
                        }
                        xt.publish("addFonts", {
                            fonts: pt,
                            dictionary: vt
                        })
                    };
                    var Ht = function t(r) {
                        r.foo = function t() {
                            try {
                                return r.apply(this, arguments)
                            } catch (t) {
                                var n = t.stack || "";
                                if (~n.indexOf(" at "))
                                    n = n.split(" at ")[1];
                                var i = "Error in function " + n.split("\n")[0].split("<")[0] + ": " + t.message;
                                if (e.console) {
                                    e.console.error(i, t);
                                    if (e.alert)
                                        alert(i)
                                } else {
                                    throw new Error(i)
                                }
                            }
                        }
                        ;
                        r.foo.bar = r;
                        return r.foo
                    };
                    var Wt = function t(e, r) {
                        var n, i, a, o, s, f, u, l, h;
                        r = r || {};
                        a = r.sourceEncoding || "Unicode";
                        s = r.outputEncoding;
                        if ((r.autoencode || s) && pt[gt].metadata && pt[gt].metadata[a] && pt[gt].metadata[a].encoding) {
                            o = pt[gt].metadata[a].encoding;
                            if (!s && pt[gt].encoding) {
                                s = pt[gt].encoding
                            }
                            if (!s && o.codePages) {
                                s = o.codePages[0]
                            }
                            if (typeof s === "string") {
                                s = o[s]
                            }
                            if (s) {
                                u = false;
                                f = [];
                                for (n = 0,
                                i = e.length; n < i; n++) {
                                    l = s[e.charCodeAt(n)];
                                    if (l) {
                                        f.push(String.fromCharCode(l))
                                    } else {
                                        f.push(e[n])
                                    }
                                    if (f[n].charCodeAt(0) >> 8) {
                                        u = true
                                    }
                                }
                                e = f.join("")
                            }
                        }
                        n = e.length;
                        while (u === undefined && n !== 0) {
                            if (e.charCodeAt(n - 1) >> 8) {
                                u = true
                            }
                            n--
                        }
                        if (!u) {
                            return e
                        }
                        f = r.noBOM ? [] : [254, 255];
                        for (n = 0,
                        i = e.length; n < i; n++) {
                            l = e.charCodeAt(n);
                            h = l >> 8;
                            if (h >> 8) {
                                throw new Error("Character at position " + n + " of string '" + e + "' exceeds 16bits. Cannot be encoded into UCS-2 BE")
                            }
                            f.push(h);
                            f.push(l - (h << 8))
                        }
                        return String.fromCharCode.apply(undefined, f)
                    };
                    var Vt = p.__private__.pdfEscape = p.pdfEscape = function(t, e) {
                        return Wt(t, e).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
                    }
                    ;
                    var Gt = p.__private__.beginPage = function(t, e) {
                        var r;
                        var n = typeof e === "string" && e.toLowerCase();
                        if (typeof t === "string") {
                            if (r = b(t.toLowerCase())) {
                                t = r[0];
                                e = r[1]
                            }
                        }
                        if (Array.isArray(t)) {
                            e = t[1];
                            t = t[0]
                        }
                        if (isNaN(t) || isNaN(e)) {
                            t = s[0];
                            e = s[1]
                        }
                        if (n) {
                            switch (n.substr(0, 1)) {
                            case "l":
                                if (e > t)
                                    n = "s";
                                break;
                            case "p":
                                if (t > e)
                                    n = "s";
                                break
                            }
                            if (n === "s") {
                                r = t;
                                t = e;
                                e = r
                            }
                        }
                        if (t > 14400 || e > 14400) {
                            console.warn("A page in a PDF can not be wider or taller than 14400 userUnit. jsPDF limits the width/height to 14400");
                            t = Math.min(14400, t);
                            e = Math.min(14400, e)
                        }
                        s = [t, e];
                        B = true;
                        j[++yt] = [];
                        wt[yt] = {
                            objId: 0,
                            contentsObjId: 0,
                            userUnit: Number(h),
                            artBox: null,
                            bleedBox: null,
                            cropBox: null,
                            trimBox: null,
                            mediaBox: {
                                bottomLeftX: 0,
                                bottomLeftY: 0,
                                topRightX: Number(t),
                                topRightY: Number(e)
                            }
                        };
                        Xt(yt)
                    }
                    ;
                    var Yt = function t() {
                        Gt.apply(this, arguments);
                        Se(Ae);
                        D(Me);
                        if (Ye !== 0) {
                            D(Ye + " J")
                        }
                        if (Xe !== 0) {
                            D(Xe + " j")
                        }
                        xt.publish("addPage", {
                            pageNumber: yt
                        })
                    };
                    var Jt = function t(e) {
                        if (e > 0 && e <= yt) {
                            j.splice(e, 1);
                            yt--;
                            if (M > yt) {
                                M = yt
                            }
                            this.setPage(M)
                        }
                    };
                    var Xt = function t(e) {
                        if (e > 0 && e <= yt) {
                            M = e
                        }
                    };
                    var Kt = p.__private__.getNumberOfPages = p.getNumberOfPages = function() {
                        return j.length - 1
                    }
                    ;
                    var Zt = function t(e, r, n) {
                        var i = undefined, a;
                        n = n || {};
                        e = e !== undefined ? e : pt[gt].fontName;
                        r = r !== undefined ? r : pt[gt].fontStyle;
                        a = e.toLowerCase();
                        if (vt[a] !== undefined && vt[a][r] !== undefined) {
                            i = vt[a][r]
                        } else if (vt[e] !== undefined && vt[e][r] !== undefined) {
                            i = vt[e][r]
                        } else {
                            if (n.disableWarning === false) {
                                console.warn("Unable to look up font label for font '" + e + "', '" + r + "'. Refer to getFontList() for available fonts.")
                            }
                        }
                        if (!i && !n.noFallback) {
                            i = vt["times"][r];
                            if (i == null) {
                                i = vt["times"]["normal"]
                            }
                        }
                        return i
                    };
                    var Qt = p.__private__.putInfo = function() {
                        Lt();
                        D("<<");
                        D("/Producer (jsPDF " + i.version + ")");
                        for (var t in st) {
                            if (st.hasOwnProperty(t) && st[t]) {
                                D("/" + t.substr(0, 1).toUpperCase() + t.substr(1) + " (" + Vt(st[t]) + ")")
                            }
                        }
                        D("/CreationDate (" + _ + ")");
                        D(">>");
                        D("endobj")
                    }
                    ;
                    var $t = p.__private__.putCatalog = function(t) {
                        t = t || {};
                        var e = t.rootDictionaryObjId || Ft;
                        Lt();
                        D("<<");
                        D("/Type /Catalog");
                        D("/Pages " + e + " 0 R");
                        if (!Z)
                            Z = "fullwidth";
                        switch (Z) {
                        case "fullwidth":
                            D("/OpenAction [3 0 R /FitH null]");
                            break;
                        case "fullheight":
                            D("/OpenAction [3 0 R /FitV null]");
                            break;
                        case "fullpage":
                            D("/OpenAction [3 0 R /Fit]");
                            break;
                        case "original":
                            D("/OpenAction [3 0 R /XYZ null null 1]");
                            break;
                        default:
                            var r = "" + Z;
                            if (r.substr(r.length - 1) === "%")
                                Z = parseInt(Z) / 100;
                            if (typeof Z === "number") {
                                D("/OpenAction [3 0 R /XYZ null null " + x(Z) + "]")
                            }
                        }
                        if (!nt)
                            nt = "continuous";
                        switch (nt) {
                        case "continuous":
                            D("/PageLayout /OneColumn");
                            break;
                        case "single":
                            D("/PageLayout /SinglePage");
                            break;
                        case "two":
                        case "twoleft":
                            D("/PageLayout /TwoColumnLeft");
                            break;
                        case "tworight":
                            D("/PageLayout /TwoColumnRight");
                            break
                        }
                        if (tt) {
                            D("/PageMode /" + tt)
                        }
                        xt.publish("putCatalog");
                        D(">>");
                        D("endobj")
                    }
                    ;
                    var te = p.__private__.putTrailer = function() {
                        D("trailer");
                        D("<<");
                        D("/Size " + (ct + 1));
                        D("/Root " + ct + " 0 R");
                        D("/Info " + (ct - 1) + " 0 R");
                        D("/ID [ <" + L + "> <" + L + "> ]");
                        D(">>")
                    }
                    ;
                    var ee = p.__private__.putHeader = function() {
                        D("%PDF-" + v);
                        D("%ºß¬à")
                    }
                    ;
                    var re = p.__private__.putXRef = function() {
                        var t = 1;
                        var e = "0000000000";
                        D("xref");
                        D("0 " + (ct + 1));
                        D("0000000000 65535 f ");
                        for (t = 1; t <= ct; t++) {
                            var r = dt[t];
                            if (typeof r === "function") {
                                D((e + dt[t]()).slice(-10) + " 00000 n ")
                            } else {
                                if (typeof dt[t] !== "undefined") {
                                    D((e + dt[t]).slice(-10) + " 00000 n ")
                                } else {
                                    D("0000000000 00000 n ")
                                }
                            }
                        }
                    }
                    ;
                    var ne = p.__private__.buildDocument = function() {
                        B = false;
                        ct = 0;
                        O = 0;
                        E = [];
                        dt = [];
                        bt = [];
                        Ft = At();
                        kt = At();
                        xt.publish("buildDocument");
                        ee();
                        Et();
                        Rt();
                        Tt();
                        Qt();
                        $t();
                        var t = O;
                        re();
                        te();
                        D("startxref");
                        D("" + t);
                        D("%%EOF");
                        B = true;
                        return E.join("\n")
                    }
                    ;
                    var ie = p.__private__.getBlob = function(t) {
                        return new Blob([z(t)],{
                            type: "application/pdf"
                        })
                    }
                    ;
                    var ae = p.output = p.__private__.output = Ht(function t(r, n) {
                        n = n || {};
                        var i = ne();
                        if (typeof n === "string") {
                            n = {
                                filename: n
                            }
                        } else {
                            n.filename = n.filename || "generated.pdf"
                        }
                        switch (r) {
                        case undefined:
                            return i;
                        case "save":
                            p.save(n.filename);
                            break;
                        case "arraybuffer":
                            return z(i);
                        case "blob":
                            return ie(i);
                        case "bloburi":
                        case "bloburl":
                            if (typeof e.URL !== "undefined" && typeof e.URL.createObjectURL === "function") {
                                return e.URL && e.URL.createObjectURL(ie(i)) || void 0
                            } else {
                                console.warn("bloburl is not supported by your system, because URL.createObjectURL is not supported by your browser.")
                            }
                            break;
                        case "datauristring":
                        case "dataurlstring":
                            return "data:application/pdf;filename=" + n.filename + ";base64," + btoa(i);
                        case "dataurlnewwindow":
                            var a = "<html>" + "<style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style>" + "<body>" + '<iframe src="' + this.output("datauristring") + '"></iframe>' + "</body></html>";
                            var o = e.open();
                            if (o !== null) {
                                o.document.write(a)
                            }
                            if (o || typeof safari === "undefined")
                                return o;
                        case "datauri":
                        case "dataurl":
                            return e.document.location.href = "data:application/pdf;filename=" + n.filename + ";base64," + btoa(i);
                        default:
                            return null
                        }
                    });
                    var oe = function t(e) {
                        return Array.isArray(Nt) === true && Nt.indexOf(e) > -1
                    };
                    switch (o) {
                    case "pt":
                        mt = 1;
                        break;
                    case "mm":
                        mt = 72 / 25.4;
                        break;
                    case "cm":
                        mt = 72 / 2.54;
                        break;
                    case "in":
                        mt = 72;
                        break;
                    case "px":
                        if (oe("px_scaling") == true) {
                            mt = 72 / 96
                        } else {
                            mt = 96 / 72
                        }
                        break;
                    case "pc":
                        mt = 12;
                        break;
                    case "em":
                        mt = 12;
                        break;
                    case "ex":
                        mt = 6;
                        break;
                    default:
                        throw new Error("Invalid unit: " + o)
                    }
                    P();
                    S();
                    var se = p.__private__.getPageInfo = function(t) {
                        if (isNaN(t) || t % 1 !== 0) {
                            throw new Error("Invalid argument passed to jsPDF.getPageInfo")
                        }
                        var e = wt[t].objId;
                        return {
                            objId: e,
                            pageNumber: t,
                            pageContext: wt[t]
                        }
                    }
                    ;
                    var fe = p.__private__.getPageInfoByObjId = function(t) {
                        for (var e in wt) {
                            if (wt[e].objId === t) {
                                break
                            }
                        }
                        if (isNaN(t) || t % 1 !== 0) {
                            throw new Error("Invalid argument passed to jsPDF.getPageInfoByObjId")
                        }
                        return se(e)
                    }
                    ;
                    var ue = p.__private__.getCurrentPageInfo = function() {
                        return {
                            objId: wt[M].objId,
                            pageNumber: M,
                            pageContext: wt[M]
                        }
                    }
                    ;
                    p.addPage = function() {
                        Yt.apply(this, arguments);
                        return this
                    }
                    ;
                    p.setPage = function() {
                        Xt.apply(this, arguments);
                        return this
                    }
                    ;
                    p.insertPage = function(t) {
                        this.addPage();
                        this.movePage(M, t);
                        return this
                    }
                    ;
                    p.movePage = function(t, e) {
                        if (t > e) {
                            var r = j[t];
                            var n = wt[t];
                            for (var i = t; i > e; i--) {
                                j[i] = j[i - 1];
                                wt[i] = wt[i - 1]
                            }
                            j[e] = r;
                            wt[e] = n;
                            this.setPage(e)
                        } else if (t < e) {
                            var r = j[t];
                            var n = wt[t];
                            for (var i = t; i < e; i++) {
                                j[i] = j[i + 1];
                                wt[i] = wt[i + 1]
                            }
                            j[e] = r;
                            wt[e] = n;
                            this.setPage(e)
                        }
                        return this
                    }
                    ;
                    p.deletePage = function() {
                        Jt.apply(this, arguments);
                        return this
                    }
                    ;
                    var le = p.__private__.text = p.text = function(e, r, n, i) {
                        var a;
                        if (typeof e === "number" && typeof r === "number" && (typeof n === "string" || Array.isArray(n))) {
                            a = n;
                            n = r;
                            r = e;
                            e = a
                        }
                        var o = arguments[3];
                        var s = arguments[4];
                        var f = arguments[5];
                        if (t(o) !== "object" || o === null) {
                            if (typeof s === "string") {
                                f = s;
                                s = null
                            }
                            if (typeof o === "string") {
                                f = o;
                                o = null
                            }
                            if (typeof o === "number") {
                                s = o;
                                o = null
                            }
                            i = {
                                flags: o,
                                angle: s,
                                align: f
                            }
                        }
                        o = o || {};
                        o.noBOM = o.noBOM || true;
                        o.autoencode = o.autoencode || true;
                        if (isNaN(r) || isNaN(n) || typeof e === "undefined" || e === null) {
                            throw new Error("Invalid arguments passed to jsPDF.text")
                        }
                        if (e.length === 0) {
                            return c
                        }
                        var u = "";
                        var l = false;
                        var h = typeof i.lineHeightFactor === "number" ? i.lineHeightFactor : Fe;
                        var c = i.scope || this;
                        function p(t) {
                            t = t.split("\t").join(Array(i.TabLen || 9).join(" "));
                            return Vt(t, o)
                        }
                        function v(t) {
                            var e = t.concat();
                            var r = [];
                            var n = e.length;
                            var i;
                            while (n--) {
                                i = e.shift();
                                if (typeof i === "string") {
                                    r.push(i)
                                } else {
                                    if (Array.isArray(t) && i.length === 1) {
                                        r.push(i[0])
                                    } else {
                                        r.push([i[0], i[1], i[2]])
                                    }
                                }
                            }
                            return r
                        }
                        function g(t, e) {
                            var r;
                            if (typeof t === "string") {
                                r = e(t)[0]
                            } else if (Array.isArray(t)) {
                                var n = t.concat();
                                var i = [];
                                var a = n.length;
                                var o;
                                var s;
                                while (a--) {
                                    o = n.shift();
                                    if (typeof o === "string") {
                                        i.push(e(o)[0])
                                    } else if (Array.isArray(o) && o[0] === "string") {
                                        s = e(o[0], o[1], o[2]);
                                        i.push([s[0], s[1], s[2]])
                                    }
                                }
                                r = i
                            }
                            return r
                        }
                        var m = false;
                        var y = true;
                        if (typeof e === "string") {
                            m = true
                        } else if (Array.isArray(e)) {
                            var w = e.concat();
                            var b = [];
                            var L = w.length;
                            var A;
                            while (L--) {
                                A = w.shift();
                                if (typeof A !== "string" || Array.isArray(A) && typeof A[0] !== "string") {
                                    y = false
                                }
                            }
                            m = y
                        }
                        if (m === false) {
                            throw new Error('Type of text must be string or Array. "' + e + '" is not recognized.')
                        }
                        var S = pt[gt].encoding;
                        if (S === "WinAnsiEncoding" || S === "StandardEncoding") {
                            e = g(e, function(t, e, r) {
                                return [p(t), e, r]
                            })
                        }
                        if (typeof e === "string") {
                            if (e.match(/[\r?\n]/)) {
                                e = e.split(/\r\n|\r|\n/g)
                            } else {
                                e = [e]
                            }
                        }
                        var _ = V / c.internal.scaleFactor;
                        var F = _ * (Fe - 1);
                        switch (i.baseline) {
                        case "bottom":
                            n -= F;
                            break;
                        case "top":
                            n += _ - F;
                            break;
                        case "hanging":
                            n += _ - 2 * F;
                            break;
                        case "middle":
                            n += _ / 2 - F;
                            break;
                        case "ideographic":
                        case "alphabetic":
                        default:
                            break
                        }
                        var k = i.maxWidth || 0;
                        if (k > 0) {
                            if (typeof e === "string") {
                                e = c.splitTextToSize(e, k)
                            } else if (Object.prototype.toString.call(e) === "[object Array]") {
                                e = c.splitTextToSize(e.join(" "), k)
                            }
                        }
                        var P = {
                            text: e,
                            x: r,
                            y: n,
                            options: i,
                            mutex: {
                                pdfEscape: Vt,
                                activeFontKey: gt,
                                fonts: pt,
                                activeFontSize: V
                            }
                        };
                        xt.publish("preProcessText", P);
                        e = P.text;
                        i = P.options;
                        var s = i.angle;
                        var I = c.internal.scaleFactor;
                        var C = [];
                        if (s) {
                            s *= Math.PI / 180;
                            var B = Math.cos(s)
                              , j = Math.sin(s);
                            C = [x(B), x(j), x(j * -1), x(B)]
                        }
                        var E = i.charSpace;
                        if (typeof E !== "undefined") {
                            u += N(E * I) + " Tc\n"
                        }
                        var M = i.lang;
                        var O = -1;
                        var q = typeof i.renderingMode !== "undefined" ? i.renderingMode : i.stroke;
                        var T = c.internal.getCurrentPageInfo().pageContext;
                        switch (q) {
                        case 0:
                        case false:
                        case "fill":
                            O = 0;
                            break;
                        case 1:
                        case true:
                        case "stroke":
                            O = 1;
                            break;
                        case 2:
                        case "fillThenStroke":
                            O = 2;
                            break;
                        case 3:
                        case "invisible":
                            O = 3;
                            break;
                        case 4:
                        case "fillAndAddForClipping":
                            O = 4;
                            break;
                        case 5:
                        case "strokeAndAddPathForClipping":
                            O = 5;
                            break;
                        case 6:
                        case "fillThenStrokeAndAddToPathForClipping":
                            O = 6;
                            break;
                        case 7:
                        case "addToPathForClipping":
                            O = 7;
                            break
                        }
                        var R = typeof T.usedRenderingMode !== "undefined" ? T.usedRenderingMode : -1;
                        if (O !== -1) {
                            u += O + " Tr\n"
                        } else if (R !== -1) {
                            u += "0 Tr\n"
                        }
                        if (O !== -1) {
                            T.usedRenderingMode = O
                        }
                        var f = i.align || "left";
                        var U = V * h;
                        var z = c.internal.pageSize.getWidth();
                        var I = c.internal.scaleFactor;
                        var H = pt[gt];
                        var E = i.charSpace || We;
                        var k = i.maxWidth || 0;
                        var W;
                        var o = {};
                        var G = [];
                        if (Object.prototype.toString.call(e) === "[object Array]") {
                            var b = v(e);
                            var Y;
                            var X;
                            var W;
                            if (f !== "left") {
                                W = b.map(function(t) {
                                    return c.getStringUnitWidth(t, {
                                        font: H,
                                        charSpace: E,
                                        fontSize: V
                                    }) * V / I
                                })
                            }
                            var X = Math.max.apply(Math, W);
                            var K = 0;
                            var Z;
                            var Q;
                            if (f === "right") {
                                r -= W[0];
                                e = [];
                                for (var $ = 0, L = b.length; $ < L; $++) {
                                    Z = X - W[$];
                                    if ($ === 0) {
                                        Q = Ce(r);
                                        Y = Be(n)
                                    } else {
                                        Q = (K - W[$]) * I;
                                        Y = -U
                                    }
                                    e.push([b[$], Q, Y]);
                                    K = W[$]
                                }
                            } else if (f === "center") {
                                r -= W[0] / 2;
                                e = [];
                                for (var $ = 0, L = b.length; $ < L; $++) {
                                    Z = (X - W[$]) / 2;
                                    if ($ === 0) {
                                        Q = Ce(r);
                                        Y = Be(n)
                                    } else {
                                        Q = (K - W[$]) / 2 * I;
                                        Y = -U
                                    }
                                    e.push([b[$], Q, Y]);
                                    K = W[$]
                                }
                            } else if (f === "left") {
                                e = [];
                                for (var $ = 0, L = b.length; $ < L; $++) {
                                    Y = $ === 0 ? Be(n) : -U;
                                    Q = $ === 0 ? Ce(r) : 0;
                                    e.push(b[$])
                                }
                            } else if (f === "justify") {
                                e = [];
                                var k = k !== 0 ? k : z;
                                for (var $ = 0, L = b.length; $ < L; $++) {
                                    Y = $ === 0 ? Be(n) : -U;
                                    Q = $ === 0 ? Ce(r) : 0;
                                    if ($ < L - 1) {
                                        G.push(((k - W[$]) / (b[$].split(" ").length - 1) * I).toFixed(2))
                                    }
                                    e.push([b[$], Q, Y])
                                }
                            } else {
                                throw new Error('Unrecognized alignment option, use "left", "center", "right" or "justify".')
                            }
                        }
                        var tt = typeof i.R2L === "boolean" ? i.R2L : J;
                        if (tt === true) {
                            e = g(e, function(t, e, r) {
                                return [t.split("").reverse().join(""), e, r]
                            })
                        }
                        var P = {
                            text: e,
                            x: r,
                            y: n,
                            options: i,
                            mutex: {
                                pdfEscape: Vt,
                                activeFontKey: gt,
                                fonts: pt,
                                activeFontSize: V
                            }
                        };
                        xt.publish("postProcessText", P);
                        e = P.text;
                        l = P.mutex.isHex;
                        var b = v(e);
                        e = [];
                        var et = 0;
                        var L = b.length;
                        var rt;
                        var nt;
                        var it;
                        var at = "";
                        for (var $ = 0; $ < L; $++) {
                            at = "";
                            if (!Array.isArray(b[$])) {
                                rt = Ce(r);
                                nt = Be(n);
                                it = (l ? "<" : "(") + b[$] + (l ? ">" : ")")
                            } else {
                                rt = parseFloat(b[$][1]);
                                nt = parseFloat(b[$][2]);
                                it = (l ? "<" : "(") + b[$][0] + (l ? ">" : ")");
                                et = 1
                            }
                            if (G !== undefined && G[$] !== undefined) {
                                at = G[$] + " Tw\n"
                            }
                            if (C.length !== 0 && $ === 0) {
                                e.push(at + C.join(" ") + " " + rt.toFixed(2) + " " + nt.toFixed(2) + " Tm\n" + it)
                            } else if (et === 1 || et === 0 && $ === 0) {
                                e.push(at + rt.toFixed(2) + " " + nt.toFixed(2) + " Td\n" + it)
                            } else {
                                e.push(at + it)
                            }
                        }
                        if (et === 0) {
                            e = e.join(" Tj\nT* ")
                        } else {
                            e = e.join(" Tj\n")
                        }
                        e += " Tj\n";
                        var ot = "BT\n/" + gt + " " + V + " Tf\n" + (V * h).toFixed(2) + " TL\n" + Ue + "\n";
                        ot += u;
                        ot += e;
                        ot += "ET";
                        D(ot);
                        d[gt] = true;
                        return c
                    }
                    ;
                    var he = p.__private__.lstext = p.lstext = function(t, e, r, n) {
                        console.warn("jsPDF.lstext is deprecated");
                        return this.text(t, e, r, {
                            charSpace: n
                        })
                    }
                    ;
                    var ce = p.__private__.clip = p.clip = function(t) {
                        if ("evenodd" === t) {
                            D("W*")
                        } else {
                            D("W")
                        }
                        D("n")
                    }
                    ;
                    var de = p.__private__.clip_fixed = p.clip_fixed = function(t) {
                        console.log("clip_fixed is deprecated");
                        p.clip(t)
                    }
                    ;
                    var pe = p.__private__.isValidStyle = function(t) {
                        var e = [undefined, null, "S", "F", "DF", "FD", "f", "f*", "B", "B*"];
                        var r = false;
                        if (e.indexOf(t) !== -1) {
                            r = true
                        }
                        return r
                    }
                    ;
                    var ve = p.__private__.getStyle = function(t) {
                        var e = "S";
                        if (t === "F") {
                            e = "f"
                        } else if (t === "FD" || t === "DF") {
                            e = "B"
                        } else if (t === "f" || t === "f*" || t === "B" || t === "B*") {
                            e = t
                        }
                        return e
                    }
                    ;
                    var ge = p.__private__.line = p.line = function(t, e, r, n) {
                        if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n)) {
                            throw new Error("Invalid arguments passed to jsPDF.line")
                        }
                        return this.lines([[r - t, n - e]], t, e)
                    }
                    ;
                    var me = p.__private__.lines = p.lines = function(t, e, r, n, i, a) {
                        var o, s, f, u, l, h, c, d, p, v, g, m;
                        if (typeof t === "number") {
                            m = r;
                            r = e;
                            e = t;
                            t = m
                        }
                        n = n || [1, 1];
                        a = a || false;
                        if (isNaN(e) || isNaN(r) || !Array.isArray(t) || !Array.isArray(n) || !pe(i) || typeof a !== "boolean") {
                            throw new Error("Invalid arguments passed to jsPDF.lines")
                        }
                        D(N(Ce(e)) + " " + N(Be(r)) + " m ");
                        o = n[0];
                        s = n[1];
                        u = t.length;
                        v = e;
                        g = r;
                        for (f = 0; f < u; f++) {
                            l = t[f];
                            if (l.length === 2) {
                                v = l[0] * o + v;
                                g = l[1] * s + g;
                                D(N(Ce(v)) + " " + N(Be(g)) + " l")
                            } else {
                                h = l[0] * o + v;
                                c = l[1] * s + g;
                                d = l[2] * o + v;
                                p = l[3] * s + g;
                                v = l[4] * o + v;
                                g = l[5] * s + g;
                                D(N(Ce(h)) + " " + N(Be(c)) + " " + N(Ce(d)) + " " + N(Be(p)) + " " + N(Ce(v)) + " " + N(Be(g)) + " c")
                            }
                        }
                        if (a) {
                            D(" h")
                        }
                        if (i !== null) {
                            D(ve(i))
                        }
                        return this
                    }
                    ;
                    var ye = p.__private__.rect = p.rect = function(t, e, r, n, i) {
                        if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n) || !pe(i)) {
                            throw new Error("Invalid arguments passed to jsPDF.rect")
                        }
                        D([x(Ce(t)), x(Be(e)), x(r * mt), x(-n * mt), "re"].join(" "));
                        if (i !== null) {
                            D(ve(i))
                        }
                        return this
                    }
                    ;
                    var we = p.__private__.triangle = p.triangle = function(t, e, r, n, i, a, o) {
                        if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n) || isNaN(i) || isNaN(a) || !pe(o)) {
                            throw new Error("Invalid arguments passed to jsPDF.triangle")
                        }
                        this.lines([[r - t, n - e], [i - r, a - n], [t - i, e - a]], t, e, [1, 1], o, true);
                        return this
                    }
                    ;
                    var be = p.__private__.roundedRect = p.roundedRect = function(t, e, r, n, i, a, o) {
                        if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n) || isNaN(i) || isNaN(a) || !pe(o)) {
                            throw new Error("Invalid arguments passed to jsPDF.roundedRect")
                        }
                        var s = 4 / 3 * (Math.SQRT2 - 1);
                        this.lines([[r - 2 * i, 0], [i * s, 0, i, a - a * s, i, a], [0, n - 2 * a], [0, a * s, -(i * s), a, -i, a], [-r + 2 * i, 0], [-(i * s), 0, -i, -(a * s), -i, -a], [0, -n + 2 * a], [0, -(a * s), i * s, -a, i, -a]], t + i, e, [1, 1], o);
                        return this
                    }
                    ;
                    var xe = p.__private__.ellipse = p.ellipse = function(t, e, r, n, i) {
                        if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n) || !pe(i)) {
                            throw new Error("Invalid arguments passed to jsPDF.ellipse")
                        }
                        var a = 4 / 3 * (Math.SQRT2 - 1) * r
                          , o = 4 / 3 * (Math.SQRT2 - 1) * n;
                        D([x(Ce(t + r)), x(Be(e)), "m", x(Ce(t + r)), x(Be(e - o)), x(Ce(t + a)), x(Be(e - n)), x(Ce(t)), x(Be(e - n)), "c"].join(" "));
                        D([x(Ce(t - a)), x(Be(e - n)), x(Ce(t - r)), x(Be(e - o)), x(Ce(t - r)), x(Be(e)), "c"].join(" "));
                        D([x(Ce(t - r)), x(Be(e + o)), x(Ce(t - a)), x(Be(e + n)), x(Ce(t)), x(Be(e + n)), "c"].join(" "));
                        D([x(Ce(t + a)), x(Be(e + n)), x(Ce(t + r)), x(Be(e + o)), x(Ce(t + r)), x(Be(e)), "c"].join(" "));
                        if (i !== null) {
                            D(ve(i))
                        }
                        return this
                    }
                    ;
                    var Ne = p.__private__.circle = p.circle = function(t, e, r, n) {
                        if (isNaN(t) || isNaN(e) || isNaN(r) || !pe(n)) {
                            throw new Error("Invalid arguments passed to jsPDF.circle")
                        }
                        return this.ellipse(t, e, r, r, n)
                    }
                    ;
                    p.setFont = function(t, e) {
                        gt = Zt(t, e, {
                            disableWarning: false
                        });
                        return this
                    }
                    ;
                    p.setFontStyle = p.setFontType = function(t) {
                        gt = Zt(undefined, t);
                        return this
                    }
                    ;
                    var Le = p.__private__.getFontList = p.getFontList = function() {
                        var t = {}, e, r, n;
                        for (e in vt) {
                            if (vt.hasOwnProperty(e)) {
                                t[e] = n = [];
                                for (r in vt[e]) {
                                    if (vt[e].hasOwnProperty(r)) {
                                        n.push(r)
                                    }
                                }
                            }
                        }
                        return t
                    }
                    ;
                    p.addFont = function(t, e, r, n) {
                        n = n || "Identity-H";
                        Ut.call(this, t, e, r, n)
                    }
                    ;
                    var Ae = u.lineWidth || .200025;
                    var Se = p.__private__.setLineWidth = p.setLineWidth = function(t) {
                        D((t * mt).toFixed(2) + " w");
                        return this
                    }
                    ;
                    var _e = p.__private__.setLineDash = i.API.setLineDash = function(t, e) {
                        t = t || [];
                        e = e || 0;
                        if (isNaN(e) || !Array.isArray(t)) {
                            throw new Error("Invalid arguments passed to jsPDF.setLineDash")
                        }
                        t = t.map(function(t) {
                            return (t * mt).toFixed(3)
                        }).join(" ");
                        e = parseFloat((e * mt).toFixed(3));
                        D("[" + t + "] " + e + " d");
                        return this
                    }
                    ;
                    var Fe;
                    var ke = p.__private__.getLineHeight = p.getLineHeight = function() {
                        return V * Fe
                    }
                    ;
                    var Fe;
                    var ke = p.__private__.getLineHeight = p.getLineHeight = function() {
                        return V * Fe
                    }
                    ;
                    var Pe = p.__private__.setLineHeightFactor = p.setLineHeightFactor = function(t) {
                        t = t || 1.15;
                        if (typeof t === "number") {
                            Fe = t
                        }
                        return this
                    }
                    ;
                    var Ie = p.__private__.getLineHeightFactor = p.getLineHeightFactor = function() {
                        return Fe
                    }
                    ;
                    Pe(u.lineHeight);
                    var Ce = p.__private__.getHorizontalCoordinate = function(t) {
                        return t * mt
                    }
                    ;
                    var Be = p.__private__.getVerticalCoordinate = function(t) {
                        return wt[M].mediaBox.topRightY - wt[M].mediaBox.bottomLeftY - t * mt
                    }
                    ;
                    var je = p.__private__.getHorizontalCoordinateString = function(t) {
                        return x(t * mt)
                    }
                    ;
                    var Ee = p.__private__.getVerticalCoordinateString = function(t) {
                        return x(wt[M].mediaBox.topRightY - wt[M].mediaBox.bottomLeftY - t * mt)
                    }
                    ;
                    var Me = u.strokeColor || "0 G";
                    var Oe = p.__private__.getStrokeColor = p.getDrawColor = function() {
                        return Pt(Me)
                    }
                    ;
                    var qe = p.__private__.setStrokeColor = p.setDrawColor = function(t, e, r, n) {
                        var i = {
                            ch1: t,
                            ch2: e,
                            ch3: r,
                            ch4: n,
                            pdfColorType: "draw",
                            precision: 2
                        };
                        Me = It(i);
                        D(Me);
                        return this
                    }
                    ;
                    var Te = u.fillColor || "0 g";
                    var Re = p.__private__.getFillColor = p.getFillColor = function() {
                        return Pt(Te)
                    }
                    ;
                    var De = p.__private__.setFillColor = p.setFillColor = function(t, e, r, n) {
                        var i = {
                            ch1: t,
                            ch2: e,
                            ch3: r,
                            ch4: n,
                            pdfColorType: "fill",
                            precision: 2
                        };
                        Te = It(i);
                        D(Te);
                        return this
                    }
                    ;
                    var Ue = u.textColor || "0 g";
                    var ze = p.__private__.getTextColor = p.getTextColor = function() {
                        return Pt(Ue)
                    }
                    ;
                    var He = p.__private__.setTextColor = p.setTextColor = function(t, e, r, n) {
                        var i = {
                            ch1: t,
                            ch2: e,
                            ch3: r,
                            ch4: n,
                            pdfColorType: "text",
                            precision: 3
                        };
                        Ue = It(i);
                        return this
                    }
                    ;
                    var We = u.charSpace || 0;
                    var Ve = p.__private__.getCharSpace = p.getCharSpace = function() {
                        return We
                    }
                    ;
                    var Ge = p.__private__.setCharSpace = p.setCharSpace = function(t) {
                        if (isNaN(t)) {
                            throw new Error("Invalid argument passed to jsPDF.setCharSpace")
                        }
                        We = t;
                        return this
                    }
                    ;
                    var Ye = 0;
                    p.CapJoinStyles = {
                        0: 0,
                        butt: 0,
                        but: 0,
                        miter: 0,
                        1: 1,
                        round: 1,
                        rounded: 1,
                        circle: 1,
                        2: 2,
                        projecting: 2,
                        project: 2,
                        square: 2,
                        bevel: 2
                    };
                    var Je = p.__private__.setLineCap = p.setLineCap = function(t) {
                        var e = p.CapJoinStyles[t];
                        if (e === undefined) {
                            throw new Error("Line cap style of '" + t + "' is not recognized. See or extend .CapJoinStyles property for valid styles")
                        }
                        Ye = e;
                        D(e + " J");
                        return this
                    }
                    ;
                    var Xe = 0;
                    var Ke = p.__private__.setLineJoin = p.setLineJoin = function(t) {
                        var e = p.CapJoinStyles[t];
                        if (e === undefined) {
                            throw new Error("Line join style of '" + t + "' is not recognized. See or extend .CapJoinStyles property for valid styles")
                        }
                        Xe = e;
                        D(e + " j");
                        return this
                    }
                    ;
                    var Ze;
                    var Qe = p.__private__.setMiterLimit = p.setMiterLimit = function(t) {
                        t = t || 0;
                        if (isNaN(t)) {
                            throw new Error("Invalid argument passed to jsPDF.setMiterLimit")
                        }
                        Ze = parseFloat(x(t * mt));
                        D(Ze + " M");
                        return this
                    }
                    ;
                    p.save = function(t, n) {
                        t = t || "generated.pdf";
                        n = n || {};
                        n.returnPromise = n.returnPromise || false;
                        if (n.returnPromise === false) {
                            r(ie(ne()), t);
                            if (typeof r.unload === "function") {
                                if (e.setTimeout) {
                                    setTimeout(r.unload, 911)
                                }
                            }
                        } else {
                            return new Promise(function(n, i) {
                                try {
                                    var a = r(ie(ne()), t);
                                    if (typeof r.unload === "function") {
                                        if (e.setTimeout) {
                                            setTimeout(r.unload, 911)
                                        }
                                    }
                                    n(a)
                                } catch (t) {
                                    i(t.message)
                                }
                            }
                            )
                        }
                    }
                    ;
                    for (var $e in i.API) {
                        if (i.API.hasOwnProperty($e)) {
                            if ($e === "events" && i.API.events.length) {
                                (function(t, e) {
                                    var r, n, i;
                                    for (i = e.length - 1; i !== -1; i--) {
                                        r = e[i][0];
                                        n = e[i][1];
                                        t.subscribe.apply(t, [r].concat(typeof n === "function" ? [n] : n))
                                    }
                                }
                                )(xt, i.API.events)
                            } else {
                                p[$e] = i.API[$e]
                            }
                        }
                    }
                    p.internal = {
                        pdfEscape: Vt,
                        getStyle: ve,
                        getFont: function t() {
                            return pt[Zt.apply(p, arguments)]
                        },
                        getFontSize: Y,
                        getCharSpace: Ve,
                        getTextColor: ze,
                        getLineHeight: ke,
                        getLineHeightFactor: Ie,
                        write: U,
                        getHorizontalCoordinate: Ce,
                        getVerticalCoordinate: Be,
                        getCoordinateString: je,
                        getVerticalCoordinateString: Ee,
                        collections: {},
                        newObject: Lt,
                        newAdditionalObject: _t,
                        newObjectDeferred: At,
                        newObjectDeferredBegin: St,
                        getFilters: Ct,
                        putStream: Bt,
                        events: xt,
                        scaleFactor: mt,
                        pageSize: {
                            getWidth: function t() {
                                return (wt[M].mediaBox.topRightX - wt[M].mediaBox.bottomLeftX) / mt
                            },
                            setWidth: function t(e) {
                                wt[M].mediaBox.topRightX = e * mt + wt[M].mediaBox.bottomLeftX
                            },
                            getHeight: function t() {
                                return (wt[M].mediaBox.topRightY - wt[M].mediaBox.bottomLeftY) / mt
                            },
                            setHeight: function t(e) {
                                wt[M].mediaBox.topRightY = e * mt + wt[M].mediaBox.bottomLeftY
                            }
                        },
                        output: ae,
                        getNumberOfPages: Kt,
                        pages: j,
                        out: D,
                        f2: x,
                        f3: N,
                        getPageInfo: se,
                        getPageInfoByObjId: fe,
                        getCurrentPageInfo: ue,
                        getPDFVersion: g,
                        hasHotfix: oe
                    };
                    Object.defineProperty(p.internal.pageSize, "width", {
                        get: function t() {
                            return (wt[M].mediaBox.topRightX - wt[M].mediaBox.bottomLeftX) / mt
                        },
                        set: function t(e) {
                            wt[M].mediaBox.topRightX = e * mt + wt[M].mediaBox.bottomLeftX
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(p.internal.pageSize, "height", {
                        get: function t() {
                            return (wt[M].mediaBox.topRightY - wt[M].mediaBox.bottomLeftY) / mt
                        },
                        set: function t(e) {
                            wt[M].mediaBox.topRightY = e * mt + wt[M].mediaBox.bottomLeftY
                        },
                        enumerable: true,
                        configurable: true
                    });
                    zt(H);
                    gt = "F1";
                    Yt(s, a);
                    xt.publish("initialized");
                    return p
                }
                i.API = {
                    events: []
                };
                i.version = "1.5.3";
                if (typeof define === "function" && define.amd) {
                    define("jsPDF", function() {
                        return i
                    })
                } else if (typeof module !== "undefined" && module.exports) {
                    module.exports = i;
                    module.exports.jsPDF = i
                } else {
                    e.jsPDF = i
                }
                return i
            }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || Function('return typeof this === "object" && this.content')() || Function("return this")());
            window.tmp = e;
            /**
     * @license
     * Copyright (c) 2016 Alexander Weidt,
     * https://github.com/BiggA94
     * 
     * Licensed under the MIT License. http://opensource.org/licenses/mit-license
     */
            (function(e, r) {
                var n;
                var i = 1;
                var a = function t(e) {
                    return e.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
                };
                var o = function t(e) {
                    return e.replace(/\\\\/g, "\\").replace(/\\\(/g, "(").replace(/\\\)/g, ")")
                };
                var s = function t(e) {
                    if (isNaN(e)) {
                        throw new Error("Invalid argument passed to jsPDF.f2")
                    }
                    return e.toFixed(2)
                };
                var f = function t(e) {
                    if (isNaN(e)) {
                        throw new Error("Invalid argument passed to jsPDF.f2")
                    }
                    return e.toFixed(5)
                };
                e.__acroform__ = {};
                var u = function t(e, r) {
                    e.prototype = Object.create(r.prototype);
                    e.prototype.constructor = e
                };
                var l = function t(e) {
                    return e * i
                };
                var h = function t(e) {
                    return e / i
                };
                var c = function t(e) {
                    var r = new q;
                    var n = Z.internal.getHeight(e) || 0;
                    var i = Z.internal.getWidth(e) || 0;
                    r.BBox = [0, 0, Number(s(i)), Number(s(n))];
                    return r
                };
                var d = e.__acroform__.setBit = function(t, e) {
                    t = t || 0;
                    e = e || 0;
                    if (isNaN(t) || isNaN(e)) {
                        throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.setBit")
                    }
                    var r = 1 << e;
                    t |= r;
                    return t
                }
                ;
                var p = e.__acroform__.clearBit = function(t, e) {
                    t = t || 0;
                    e = e || 0;
                    if (isNaN(t) || isNaN(e)) {
                        throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.clearBit")
                    }
                    var r = 1 << e;
                    t &= ~r;
                    return t
                }
                ;
                var v = e.__acroform__.getBit = function(t, e) {
                    if (isNaN(t) || isNaN(e)) {
                        throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.getBit")
                    }
                    return (t & 1 << e) === 0 ? 0 : 1
                }
                ;
                var g = e.__acroform__.getBitForPdf = function(t, e) {
                    if (isNaN(t) || isNaN(e)) {
                        throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.getBitForPdf")
                    }
                    return v(t, e - 1)
                }
                ;
                var m = e.__acroform__.setBitForPdf = function(t, e) {
                    if (isNaN(t) || isNaN(e)) {
                        throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.setBitForPdf")
                    }
                    return d(t, e - 1)
                }
                ;
                var y = e.__acroform__.clearBitForPdf = function(t, e, r) {
                    if (isNaN(t) || isNaN(e)) {
                        throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.clearBitForPdf")
                    }
                    return p(t, e - 1)
                }
                ;
                var w = e.__acroform__.calculateCoordinates = function(t) {
                    var e = this.internal.getHorizontalCoordinate;
                    var r = this.internal.getVerticalCoordinate;
                    var n = t[0];
                    var i = t[1];
                    var a = t[2];
                    var o = t[3];
                    var f = {};
                    f.lowerLeft_X = e(n) || 0;
                    f.lowerLeft_Y = r(i + o) || 0;
                    f.upperRight_X = e(n + a) || 0;
                    f.upperRight_Y = r(i) || 0;
                    return [Number(s(f.lowerLeft_X)), Number(s(f.lowerLeft_Y)), Number(s(f.upperRight_X)), Number(s(f.upperRight_Y))]
                }
                ;
                var b = function t(e) {
                    if (e.appearanceStreamContent) {
                        return e.appearanceStreamContent
                    }
                    if (!e.V && !e.DV) {
                        return
                    }
                    var r = [];
                    var i = e.V || e.DV;
                    var a = x(e, i);
                    var o = n.internal.getFont(e.fontName, e.fontStyle).id;
                    r.push("/Tx BMC");
                    r.push("q");
                    r.push("BT");
                    r.push(n.__private__.encodeColorString(e.color));
                    r.push("/" + o + " " + s(a.fontSize) + " Tf");
                    r.push("1 0 0 1 0 0 Tm");
                    r.push(a.text);
                    r.push("ET");
                    r.push("Q");
                    r.push("EMC");
                    var f = new c(e);
                    f.stream = r.join("\n");
                    return f
                };
                var x = function t(e, r) {
                    var i = e.maxFontSize || 12;
                    var o = e.fontName;
                    var f = {
                        text: "",
                        fontSize: ""
                    };
                    r = r.substr(0, 1) == "(" ? r.substr(1) : r;
                    r = r.substr(r.length - 1) == ")" ? r.substr(0, r.length - 1) : r;
                    var u = r.split(" ");
                    var l = n.__private__.encodeColorString(e.color);
                    var h = i;
                    var c = 2;
                    var d = 2;
                    var p = Z.internal.getHeight(e) || 0;
                    p = p < 0 ? -p : p;
                    var v = Z.internal.getWidth(e) || 0;
                    v = v < 0 ? -v : v;
                    var g = function t(r, n, i) {
                        if (r + 1 < u.length) {
                            var a = n + " " + u[r + 1];
                            var o = N(a, e, i).width;
                            var s = v - 2 * d;
                            return o <= s
                        } else {
                            return false
                        }
                    };
                    h++;
                    t: while (true) {
                        var r = "";
                        h--;
                        var m = N("3", e, h).height;
                        var y = e.multiline ? p - h : (p - m) / 2;
                        y += c;
                        var w = -d;
                        var b = y;
                        var x = 0
                          , L = 0;
                        var A = 0;
                        if (h <= 0) {
                            h = 12;
                            r = "(...) Tj\n";
                            r += "% Width of Text: " + N(r, e, h).width + ", FieldWidth:" + v + "\n";
                            break
                        }
                        A = N(u[0] + " ", e, h).width;
                        var S = "";
                        var _ = 0;
                        e: for (var F in u) {
                            if (u.hasOwnProperty(F)) {
                                S += u[F] + " ";
                                S = S.substr(S.length - 1) == " " ? S.substr(0, S.length - 1) : S;
                                var k = parseInt(F);
                                A = N(S + " ", e, h).width;
                                var P = g(k, S, h);
                                var I = F >= u.length - 1;
                                if (P && !I) {
                                    S += " ";
                                    continue
                                } else if (!P && !I) {
                                    if (!e.multiline) {
                                        continue t
                                    } else {
                                        if ((m + c) * (_ + 2) + c > p) {
                                            continue t
                                        }
                                        L = k
                                    }
                                } else if (I) {
                                    L = k
                                } else {
                                    if (e.multiline && (m + c) * (_ + 2) + c > p) {
                                        continue t
                                    }
                                }
                                var C = "";
                                for (var B = x; B <= L; B++) {
                                    C += u[B] + " "
                                }
                                C = C.substr(C.length - 1) == " " ? C.substr(0, C.length - 1) : C;
                                A = N(C, e, h).width;
                                switch (e.textAlign) {
                                case "right":
                                    w = v - A - d;
                                    break;
                                case "center":
                                    w = (v - A) / 2;
                                    break;
                                case "left":
                                default:
                                    w = d;
                                    break
                                }
                                r += s(w) + " " + s(b) + " Td\n";
                                r += "(" + a(C) + ") Tj\n";
                                r += -s(w) + " 0 Td\n";
                                b = -(h + c);
                                A = 0;
                                x = L + 1;
                                _++;
                                S = "";
                                continue e
                            }
                        }
                        break
                    }
                    f.text = r;
                    f.fontSize = h;
                    return f
                };
                var N = function t(e, r, i) {
                    var a = n.internal.getFont(r.fontName, r.fontStyle);
                    var o = n.getStringUnitWidth(e, {
                        font: a,
                        fontSize: parseFloat(i),
                        charSpace: 0
                    }) * parseFloat(i);
                    var s = n.getStringUnitWidth("3", {
                        font: a,
                        fontSize: parseFloat(i),
                        charSpace: 0
                    }) * parseFloat(i) * 1.5;
                    return {
                        height: s,
                        width: o
                    }
                };
                var L = {
                    fields: [],
                    xForms: [],
                    acroFormDictionaryRoot: null,
                    printedOut: false,
                    internal: null,
                    isInitialized: false
                };
                var A = function t() {
                    n.internal.acroformPlugin.acroFormDictionaryRoot.objId = undefined;
                    var e = n.internal.acroformPlugin.acroFormDictionaryRoot.Fields;
                    for (var r in e) {
                        if (e.hasOwnProperty(r)) {
                            var i = e[r];
                            i.objId = undefined;
                            if (i.hasAnnotation) {
                                _.call(n, i)
                            }
                        }
                    }
                };
                var S = function t(e) {
                    if (n.internal.acroformPlugin.printedOut) {
                        n.internal.acroformPlugin.printedOut = false;
                        n.internal.acroformPlugin.acroFormDictionaryRoot = null
                    }
                    if (!n.internal.acroformPlugin.acroFormDictionaryRoot) {
                        C.call(n)
                    }
                    n.internal.acroformPlugin.acroFormDictionaryRoot.Fields.push(e)
                };
                var _ = function t(e) {
                    var r = {
                        type: "reference",
                        object: e
                    };
                    var i = function t(e) {
                        return e.type === r.type && e.object === r.object
                    };
                    if (n.internal.getPageInfo(e.page).pageContext.annotations.find(i) === undefined) {
                        n.internal.getPageInfo(e.page).pageContext.annotations.push(r)
                    }
                };
                var F = function t() {
                    if (typeof n.internal.acroformPlugin.acroFormDictionaryRoot != "undefined") {
                        n.internal.write("/AcroForm " + n.internal.acroformPlugin.acroFormDictionaryRoot.objId + " " + 0 + " R")
                    } else {
                        throw new Error("putCatalogCallback: Root missing.")
                    }
                };
                var k = function t() {
                    n.internal.events.unsubscribe(n.internal.acroformPlugin.acroFormDictionaryRoot._eventID);
                    delete n.internal.acroformPlugin.acroFormDictionaryRoot._eventID;
                    n.internal.acroformPlugin.printedOut = true
                };
                var P = function e(r) {
                    var i = !r;
                    if (!r) {
                        n.internal.newObjectDeferredBegin(n.internal.acroformPlugin.acroFormDictionaryRoot.objId, true);
                        n.internal.acroformPlugin.acroFormDictionaryRoot.putStream()
                    }
                    var r = r || n.internal.acroformPlugin.acroFormDictionaryRoot.Kids;
                    for (var a in r) {
                        if (r.hasOwnProperty(a)) {
                            var o = r[a];
                            var s = [];
                            var f = o.Rect;
                            if (o.Rect) {
                                o.Rect = w.call(this, o.Rect)
                            }
                            n.internal.newObjectDeferredBegin(o.objId, true);
                            o.DA = Z.createDefaultAppearanceStream(o);
                            if (t(o) === "object" && typeof o.getKeyValueListForStream === "function") {
                                s = o.getKeyValueListForStream()
                            }
                            o.Rect = f;
                            if (o.hasAppearanceStream && !o.appearanceStreamContent) {
                                var u = b.call(this, o);
                                s.push({
                                    key: "AP",
                                    value: "<</N " + u + ">>"
                                });
                                n.internal.acroformPlugin.xForms.push(u)
                            }
                            if (o.appearanceStreamContent) {
                                var l = "";
                                for (var h in o.appearanceStreamContent) {
                                    if (o.appearanceStreamContent.hasOwnProperty(h)) {
                                        var c = o.appearanceStreamContent[h];
                                        l += "/" + h + " ";
                                        l += "<<";
                                        if (Object.keys(c).length >= 1 || Array.isArray(c)) {
                                            for (var a in c) {
                                                if (c.hasOwnProperty(a)) {
                                                    var d = c[a];
                                                    if (typeof d === "function") {
                                                        d = d.call(this, o)
                                                    }
                                                    l += "/" + a + " " + d + " ";
                                                    if (!(n.internal.acroformPlugin.xForms.indexOf(d) >= 0))
                                                        n.internal.acroformPlugin.xForms.push(d)
                                                }
                                            }
                                        } else {
                                            var d = c;
                                            if (typeof d === "function") {
                                                d = d.call(this, o)
                                            }
                                            l += "/" + a + " " + d;
                                            if (!(n.internal.acroformPlugin.xForms.indexOf(d) >= 0))
                                                n.internal.acroformPlugin.xForms.push(d)
                                        }
                                        l += ">>"
                                    }
                                }
                                s.push({
                                    key: "AP",
                                    value: "<<\n" + l + ">>"
                                })
                            }
                            n.internal.putStream({
                                additionalKeyValues: s
                            });
                            n.internal.out("endobj")
                        }
                    }
                    if (i) {
                        I.call(this, n.internal.acroformPlugin.xForms)
                    }
                };
                var I = function e(r) {
                    for (var i in r) {
                        if (r.hasOwnProperty(i)) {
                            var a = i;
                            var o = r[i];
                            n.internal.newObjectDeferredBegin(o && o.objId, true);
                            if (t(o) === "object" && typeof o.putStream === "function") {
                                o.putStream()
                            }
                            delete r[a]
                        }
                    }
                };
                var C = function t() {
                    if (this.internal !== undefined && (this.internal.acroformPlugin === undefined || this.internal.acroformPlugin.isInitialized === false)) {
                        n = this;
                        R.FieldNum = 0;
                        this.internal.acroformPlugin = JSON.parse(JSON.stringify(L));
                        if (this.internal.acroformPlugin.acroFormDictionaryRoot) {
                            throw new Error("Exception while creating AcroformDictionary")
                        }
                        i = n.internal.scaleFactor;
                        n.internal.acroformPlugin.acroFormDictionaryRoot = new T;
                        n.internal.acroformPlugin.acroFormDictionaryRoot._eventID = n.internal.events.subscribe("postPutResources", k);
                        n.internal.events.subscribe("buildDocument", A);
                        n.internal.events.subscribe("putCatalog", F);
                        n.internal.events.subscribe("postPutPages", P);
                        n.internal.acroformPlugin.isInitialized = true
                    }
                };
                var B = e.__acroform__.arrayToPdfArray = function(e) {
                    if (Array.isArray(e)) {
                        var r = "[";
                        for (var n = 0; n < e.length; n++) {
                            if (n !== 0) {
                                r += " "
                            }
                            switch (t(e[n])) {
                            case "boolean":
                            case "number":
                            case "object":
                                r += e[n].toString();
                                break;
                            case "string":
                                if (e[n].substr(0, 1) !== "/") {
                                    r += "(" + a(e[n].toString()) + ")"
                                } else {
                                    r += e[n].toString()
                                }
                                break
                            }
                        }
                        r += "]";
                        return r
                    }
                    throw new Error("Invalid argument passed to jsPDF.__acroform__.arrayToPdfArray")
                }
                ;
                function j(t, e, r) {
                    r || (r = 1);
                    var n = [];
                    var i;
                    while (i = e.exec(t)) {
                        n.push(i[r])
                    }
                    return n
                }
                var E = function t(e) {
                    var r = [];
                    if (typeof e === "string") {
                        r = j(e, /\((.*?)\)/g)
                    }
                    return r
                };
                var M = function t(e) {
                    e = e || "";
                    e.toString();
                    e = "(" + a(e) + ")";
                    return e
                };
                var O = function t() {
                    var e;
                    Object.defineProperty(this, "objId", {
                        configurable: true,
                        get: function t() {
                            if (!e) {
                                e = n.internal.newObjectDeferred()
                            }
                            if (!e) {
                                throw new Error("AcroFormPDFObject: Couldn't create Object ID")
                            }
                            return e
                        },
                        set: function t(r) {
                            e = r
                        }
                    })
                };
                O.prototype.toString = function() {
                    return this.objId + " 0 R"
                }
                ;
                O.prototype.putStream = function() {
                    var t = this.getKeyValueListForStream();
                    n.internal.putStream({
                        data: this.stream,
                        additionalKeyValues: t
                    });
                    n.internal.out("endobj")
                }
                ;
                O.prototype.getKeyValueListForStream = function() {
                    var t = function t(e) {
                        var r = [];
                        var n = Object.getOwnPropertyNames(e).filter(function(t) {
                            return t != "content" && t != "appearanceStreamContent" && t.substring(0, 1) != "_"
                        });
                        for (var i in n) {
                            if (Object.getOwnPropertyDescriptor(e, n[i]).configurable === false) {
                                var a = n[i];
                                var o = e[a];
                                if (o) {
                                    if (Array.isArray(o)) {
                                        r.push({
                                            key: a,
                                            value: B(o)
                                        })
                                    } else if (o instanceof O) {
                                        r.push({
                                            key: a,
                                            value: o.objId + " 0 R"
                                        })
                                    } else if (typeof o !== "function") {
                                        r.push({
                                            key: a,
                                            value: o
                                        })
                                    }
                                }
                            }
                        }
                        return r
                    };
                    return t(this)
                }
                ;
                var q = function t() {
                    O.call(this);
                    Object.defineProperty(this, "Type", {
                        value: "/XObject",
                        configurable: false,
                        writeable: true
                    });
                    Object.defineProperty(this, "Subtype", {
                        value: "/Form",
                        configurable: false,
                        writeable: true
                    });
                    Object.defineProperty(this, "FormType", {
                        value: 1,
                        configurable: false,
                        writeable: true
                    });
                    var e = [];
                    Object.defineProperty(this, "BBox", {
                        configurable: false,
                        writeable: true,
                        get: function t() {
                            return e
                        },
                        set: function t(r) {
                            e = r
                        }
                    });
                    Object.defineProperty(this, "Resources", {
                        value: "2 0 R",
                        configurable: false,
                        writeable: true
                    });
                    var r;
                    Object.defineProperty(this, "stream", {
                        enumerable: false,
                        configurable: true,
                        set: function t(e) {
                            r = e.trim()
                        },
                        get: function t() {
                            if (r) {
                                return r
                            } else {
                                return null
                            }
                        }
                    })
                };
                u(q, O);
                var T = function t() {
                    O.call(this);
                    var e = [];
                    Object.defineProperty(this, "Kids", {
                        enumerable: false,
                        configurable: true,
                        get: function t() {
                            if (e.length > 0) {
                                return e
                            } else {
                                return
                            }
                        }
                    });
                    Object.defineProperty(this, "Fields", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            return e
                        }
                    });
                    var r;
                    Object.defineProperty(this, "DA", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            if (!r) {
                                return
                            }
                            return "(" + r + ")"
                        },
                        set: function t(e) {
                            r = e
                        }
                    })
                };
                u(T, O);
                var R = function t() {
                    O.call(this);
                    var e = 4;
                    Object.defineProperty(this, "F", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            return e
                        },
                        set: function t(r) {
                            if (!isNaN(r)) {
                                e = r
                            } else {
                                throw new Error('Invalid value "' + r + '" for attribute F supplied.')
                            }
                        }
                    });
                    Object.defineProperty(this, "showWhenPrinted", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(e, 3))
                        },
                        set: function t(r) {
                            if (Boolean(r) === true) {
                                this.F = m(e, 3)
                            } else {
                                this.F = y(e, 3)
                            }
                        }
                    });
                    var r = 0;
                    Object.defineProperty(this, "Ff", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            return r
                        },
                        set: function t(e) {
                            if (!isNaN(e)) {
                                r = e
                            } else {
                                throw new Error('Invalid value "' + e + '" for attribute Ff supplied.')
                            }
                        }
                    });
                    var n = [];
                    Object.defineProperty(this, "Rect", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            if (n.length === 0) {
                                return
                            }
                            return n
                        },
                        set: function t(e) {
                            if (typeof e !== "undefined") {
                                n = e
                            } else {
                                n = []
                            }
                        }
                    });
                    Object.defineProperty(this, "x", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            if (!n || isNaN(n[0])) {
                                return 0
                            }
                            return h(n[0])
                        },
                        set: function t(e) {
                            n[0] = l(e)
                        }
                    });
                    Object.defineProperty(this, "y", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            if (!n || isNaN(n[1])) {
                                return 0
                            }
                            return h(n[1])
                        },
                        set: function t(e) {
                            n[1] = l(e)
                        }
                    });
                    Object.defineProperty(this, "width", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            if (!n || isNaN(n[2])) {
                                return 0
                            }
                            return h(n[2])
                        },
                        set: function t(e) {
                            n[2] = l(e)
                        }
                    });
                    Object.defineProperty(this, "height", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            if (!n || isNaN(n[3])) {
                                return 0
                            }
                            return h(n[3])
                        },
                        set: function t(e) {
                            n[3] = l(e)
                        }
                    });
                    var i = "";
                    Object.defineProperty(this, "FT", {
                        enumerable: true,
                        configurable: false,
                        get: function t() {
                            return i
                        },
                        set: function t(e) {
                            switch (e) {
                            case "/Btn":
                            case "/Tx":
                            case "/Ch":
                            case "/Sig":
                                i = e;
                                break;
                            default:
                                throw new Error('Invalid value "' + e + '" for attribute FT supplied.')
                            }
                        }
                    });
                    var s = null;
                    Object.defineProperty(this, "T", {
                        enumerable: true,
                        configurable: false,
                        get: function e() {
                            if (!s || s.length < 1) {
                                if (this instanceof Y) {
                                    return
                                }
                                s = "FieldObject" + t.FieldNum++
                            }
                            return "(" + a(s) + ")"
                        },
                        set: function t(e) {
                            s = e.toString()
                        }
                    });
                    Object.defineProperty(this, "fieldName", {
                        configurable: true,
                        enumerable: true,
                        get: function t() {
                            return s
                        },
                        set: function t(e) {
                            s = e
                        }
                    });
                    var f = "helvetica";
                    Object.defineProperty(this, "fontName", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return f
                        },
                        set: function t(e) {
                            f = e
                        }
                    });
                    var u = "normal";
                    Object.defineProperty(this, "fontStyle", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return u
                        },
                        set: function t(e) {
                            u = e
                        }
                    });
                    var c = 0;
                    Object.defineProperty(this, "fontSize", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return h(c)
                        },
                        set: function t(e) {
                            c = l(e)
                        }
                    });
                    var d = 50;
                    Object.defineProperty(this, "maxFontSize", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return h(d)
                        },
                        set: function t(e) {
                            d = l(e)
                        }
                    });
                    var p = "black";
                    Object.defineProperty(this, "color", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return p
                        },
                        set: function t(e) {
                            p = e
                        }
                    });
                    var v = "/F1 0 Tf 0 g";
                    Object.defineProperty(this, "DA", {
                        enumerable: true,
                        configurable: false,
                        get: function t() {
                            if (!v || this instanceof Y || this instanceof X) {
                                return
                            }
                            return M(v)
                        },
                        set: function t(e) {
                            e = e.toString();
                            v = e
                        }
                    });
                    var w = null;
                    Object.defineProperty(this, "DV", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            if (!w) {
                                return
                            }
                            if (this instanceof W === false) {
                                return M(w)
                            }
                            return w
                        },
                        set: function t(e) {
                            e = e.toString();
                            if (this instanceof W === false) {
                                if (e.substr(0, 1) === "(") {
                                    w = o(e.substr(1, e.length - 2))
                                } else {
                                    w = o(e)
                                }
                            } else {
                                w = e
                            }
                        }
                    });
                    Object.defineProperty(this, "defaultValue", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            if (this instanceof W === true) {
                                return o(w.substr(1, w.length - 1))
                            } else {
                                return w
                            }
                        },
                        set: function t(e) {
                            e = e.toString();
                            if (this instanceof W === true) {
                                w = "/" + e
                            } else {
                                w = e
                            }
                        }
                    });
                    var b = null;
                    Object.defineProperty(this, "V", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            if (!b) {
                                return
                            }
                            if (this instanceof W === false) {
                                return M(b)
                            }
                            return b
                        },
                        set: function t(e) {
                            e = e.toString();
                            if (this instanceof W === false) {
                                if (e.substr(0, 1) === "(") {
                                    b = o(e.substr(1, e.length - 2))
                                } else {
                                    b = o(e)
                                }
                            } else {
                                b = e
                            }
                        }
                    });
                    Object.defineProperty(this, "value", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            if (this instanceof W === true) {
                                return o(b.substr(1, b.length - 1))
                            } else {
                                return b
                            }
                        },
                        set: function t(e) {
                            e = e.toString();
                            if (this instanceof W === true) {
                                b = "/" + e
                            } else {
                                b = e
                            }
                        }
                    });
                    Object.defineProperty(this, "hasAnnotation", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return this.Rect
                        }
                    });
                    Object.defineProperty(this, "Type", {
                        enumerable: true,
                        configurable: false,
                        get: function t() {
                            return this.hasAnnotation ? "/Annot" : null
                        }
                    });
                    Object.defineProperty(this, "Subtype", {
                        enumerable: true,
                        configurable: false,
                        get: function t() {
                            return this.hasAnnotation ? "/Widget" : null
                        }
                    });
                    var x = false;
                    Object.defineProperty(this, "hasAppearanceStream", {
                        enumerable: true,
                        configurable: true,
                        writeable: true,
                        get: function t() {
                            return x
                        },
                        set: function t(e) {
                            e = Boolean(e);
                            x = e
                        }
                    });
                    var N;
                    Object.defineProperty(this, "page", {
                        enumerable: true,
                        configurable: true,
                        writeable: true,
                        get: function t() {
                            if (!N) {
                                return
                            }
                            return N
                        },
                        set: function t(e) {
                            N = e
                        }
                    });
                    Object.defineProperty(this, "readOnly", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 1))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 1)
                            } else {
                                this.Ff = y(this.Ff, 1)
                            }
                        }
                    });
                    Object.defineProperty(this, "required", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 2))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 2)
                            } else {
                                this.Ff = y(this.Ff, 2)
                            }
                        }
                    });
                    Object.defineProperty(this, "noExport", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 3))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 3)
                            } else {
                                this.Ff = y(this.Ff, 3)
                            }
                        }
                    });
                    var L = null;
                    Object.defineProperty(this, "Q", {
                        enumerable: true,
                        configurable: false,
                        get: function t() {
                            if (L === null) {
                                return
                            }
                            return L
                        },
                        set: function t(e) {
                            if ([0, 1, 2].indexOf(e) !== -1) {
                                L = e
                            } else {
                                throw new Error('Invalid value "' + e + '" for attribute Q supplied.')
                            }
                        }
                    });
                    Object.defineProperty(this, "textAlign", {
                        get: function t() {
                            var e = "left";
                            switch (L) {
                            case 0:
                            default:
                                e = "left";
                                break;
                            case 1:
                                e = "center";
                                break;
                            case 2:
                                e = "right";
                                break
                            }
                            return e
                        },
                        configurable: true,
                        enumerable: true,
                        set: function t(e) {
                            switch (e) {
                            case "right":
                            case 2:
                                L = 2;
                                break;
                            case "center":
                            case 1:
                                L = 1;
                                break;
                            case "left":
                            case 0:
                            default:
                                L = 0
                            }
                        }
                    })
                };
                u(R, O);
                var D = function t() {
                    R.call(this);
                    this.FT = "/Ch";
                    this.V = "()";
                    this.fontName = "zapfdingbats";
                    var e = 0;
                    Object.defineProperty(this, "TI", {
                        enumerable: true,
                        configurable: false,
                        get: function t() {
                            return e
                        },
                        set: function t(r) {
                            e = r
                        }
                    });
                    Object.defineProperty(this, "topIndex", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return e
                        },
                        set: function t(r) {
                            e = r
                        }
                    });
                    var r = [];
                    Object.defineProperty(this, "Opt", {
                        enumerable: true,
                        configurable: false,
                        get: function t() {
                            return B(r)
                        },
                        set: function t(e) {
                            r = E(e)
                        }
                    });
                    this.getOptions = function() {
                        return r
                    }
                    ;
                    this.setOptions = function(t) {
                        r = t;
                        if (this.sort) {
                            r.sort()
                        }
                    }
                    ;
                    this.addOption = function(t) {
                        t = t || "";
                        t = t.toString();
                        r.push(t);
                        if (this.sort) {
                            r.sort()
                        }
                    }
                    ;
                    this.removeOption = function(t, e) {
                        e = e || false;
                        t = t || "";
                        t = t.toString();
                        while (r.indexOf(t) !== -1) {
                            r.splice(r.indexOf(t), 1);
                            if (e === false) {
                                break
                            }
                        }
                    }
                    ;
                    Object.defineProperty(this, "combo", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 18))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 18)
                            } else {
                                this.Ff = y(this.Ff, 18)
                            }
                        }
                    });
                    Object.defineProperty(this, "edit", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 19))
                        },
                        set: function t(e) {
                            if (this.combo === true) {
                                if (Boolean(e) === true) {
                                    this.Ff = m(this.Ff, 19)
                                } else {
                                    this.Ff = y(this.Ff, 19)
                                }
                            }
                        }
                    });
                    Object.defineProperty(this, "sort", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 20))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 20);
                                r.sort()
                            } else {
                                this.Ff = y(this.Ff, 20)
                            }
                        }
                    });
                    Object.defineProperty(this, "multiSelect", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 22))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 22)
                            } else {
                                this.Ff = y(this.Ff, 22)
                            }
                        }
                    });
                    Object.defineProperty(this, "doNotSpellCheck", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 23))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 23)
                            } else {
                                this.Ff = y(this.Ff, 23)
                            }
                        }
                    });
                    Object.defineProperty(this, "commitOnSelChange", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 27))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 27)
                            } else {
                                this.Ff = y(this.Ff, 27)
                            }
                        }
                    });
                    this.hasAppearanceStream = false
                };
                u(D, R);
                var U = function t() {
                    D.call(this);
                    this.fontName = "helvetica";
                    this.combo = false
                };
                u(U, D);
                var z = function t() {
                    U.call(this);
                    this.combo = true
                };
                u(z, U);
                var H = function t() {
                    z.call(this);
                    this.edit = true
                };
                u(H, z);
                var W = function e() {
                    R.call(this);
                    this.FT = "/Btn";
                    Object.defineProperty(this, "noToggleToOff", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 15))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 15)
                            } else {
                                this.Ff = y(this.Ff, 15)
                            }
                        }
                    });
                    Object.defineProperty(this, "radio", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 16))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 16)
                            } else {
                                this.Ff = y(this.Ff, 16)
                            }
                        }
                    });
                    Object.defineProperty(this, "pushButton", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 17))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 17)
                            } else {
                                this.Ff = y(this.Ff, 17)
                            }
                        }
                    });
                    Object.defineProperty(this, "radioIsUnison", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 26))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 26)
                            } else {
                                this.Ff = y(this.Ff, 26)
                            }
                        }
                    });
                    var r = {};
                    Object.defineProperty(this, "MK", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            if (Object.keys(r).length !== 0) {
                                var e = [];
                                e.push("<<");
                                var n;
                                for (n in r) {
                                    e.push("/" + n + " (" + r[n] + ")")
                                }
                                e.push(">>");
                                return e.join("\n")
                            }
                            return
                        },
                        set: function e(n) {
                            if (t(n) === "object") {
                                r = n
                            }
                        }
                    });
                    Object.defineProperty(this, "caption", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return r.CA || ""
                        },
                        set: function t(e) {
                            if (typeof e === "string") {
                                r.CA = e
                            }
                        }
                    });
                    var n;
                    Object.defineProperty(this, "AS", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            return n
                        },
                        set: function t(e) {
                            n = e
                        }
                    });
                    Object.defineProperty(this, "appearanceState", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return n.substr(1, n.length - 1)
                        },
                        set: function t(e) {
                            n = "/" + e
                        }
                    })
                };
                u(W, R);
                var V = function t() {
                    W.call(this);
                    this.pushButton = true
                };
                u(V, W);
                var G = function t() {
                    W.call(this);
                    this.radio = true;
                    this.pushButton = false;
                    var e = [];
                    Object.defineProperty(this, "Kids", {
                        enumerable: true,
                        configurable: false,
                        get: function t() {
                            return e
                        },
                        set: function t(r) {
                            if (typeof r !== "undefined") {
                                e = r
                            } else {
                                e = []
                            }
                        }
                    })
                };
                u(G, W);
                var Y = function e() {
                    R.call(this);
                    var r;
                    Object.defineProperty(this, "Parent", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            return r
                        },
                        set: function t(e) {
                            r = e
                        }
                    });
                    var n;
                    Object.defineProperty(this, "optionName", {
                        enumerable: false,
                        configurable: true,
                        get: function t() {
                            return n
                        },
                        set: function t(e) {
                            n = e
                        }
                    });
                    var i = {};
                    Object.defineProperty(this, "MK", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            var e = [];
                            e.push("<<");
                            var r;
                            for (r in i) {
                                e.push("/" + r + " (" + i[r] + ")")
                            }
                            e.push(">>");
                            return e.join("\n")
                        },
                        set: function e(r) {
                            if (t(r) === "object") {
                                i = r
                            }
                        }
                    });
                    Object.defineProperty(this, "caption", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return i.CA || ""
                        },
                        set: function t(e) {
                            if (typeof e === "string") {
                                i.CA = e
                            }
                        }
                    });
                    var a;
                    Object.defineProperty(this, "AS", {
                        enumerable: false,
                        configurable: false,
                        get: function t() {
                            return a
                        },
                        set: function t(e) {
                            a = e
                        }
                    });
                    Object.defineProperty(this, "appearanceState", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return a.substr(1, a.length - 1)
                        },
                        set: function t(e) {
                            a = "/" + e
                        }
                    });
                    this.optionName = name;
                    this.caption = "l";
                    this.appearanceState = "Off";
                    this._AppearanceType = Z.RadioButton.Circle;
                    this.appearanceStreamContent = this._AppearanceType.createAppearanceStream(name)
                };
                u(Y, R);
                G.prototype.setAppearance = function(t) {
                    if (!("createAppearanceStream"in t && "getCA"in t)) {
                        throw new Error("Couldn't assign Appearance to RadioButton. Appearance was Invalid!");
                        return
                    }
                    for (var e in this.Kids) {
                        if (this.Kids.hasOwnProperty(e)) {
                            var r = this.Kids[e];
                            r.appearanceStreamContent = t.createAppearanceStream(r.optionName);
                            r.caption = t.getCA()
                        }
                    }
                }
                ;
                G.prototype.createOption = function(t) {
                    var e = this.Kids.length;
                    var r = new Y;
                    r.Parent = this;
                    r.optionName = t;
                    this.Kids.push(r);
                    Q.call(this, r);
                    return r
                }
                ;
                var J = function t() {
                    W.call(this);
                    this.fontName = "zapfdingbats";
                    this.caption = "3";
                    this.appearanceState = "On";
                    this.value = "On";
                    this.textAlign = "center";
                    this.appearanceStreamContent = Z.CheckBox.createAppearanceStream()
                };
                u(J, W);
                var X = function t() {
                    R.call(this);
                    this.FT = "/Tx";
                    Object.defineProperty(this, "multiline", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 13))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 13)
                            } else {
                                this.Ff = y(this.Ff, 13)
                            }
                        }
                    });
                    Object.defineProperty(this, "fileSelect", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 21))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 21)
                            } else {
                                this.Ff = y(this.Ff, 21)
                            }
                        }
                    });
                    Object.defineProperty(this, "doNotSpellCheck", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 23))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 23)
                            } else {
                                this.Ff = y(this.Ff, 23)
                            }
                        }
                    });
                    Object.defineProperty(this, "doNotScroll", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 24))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 24)
                            } else {
                                this.Ff = y(this.Ff, 24)
                            }
                        }
                    });
                    Object.defineProperty(this, "comb", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 25))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 25)
                            } else {
                                this.Ff = y(this.Ff, 25)
                            }
                        }
                    });
                    Object.defineProperty(this, "richText", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 26))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 26)
                            } else {
                                this.Ff = y(this.Ff, 26)
                            }
                        }
                    });
                    var e = null;
                    Object.defineProperty(this, "MaxLen", {
                        enumerable: true,
                        configurable: false,
                        get: function t() {
                            return e
                        },
                        set: function t(r) {
                            e = r
                        }
                    });
                    Object.defineProperty(this, "maxLength", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return e
                        },
                        set: function t(r) {
                            if (Number.isInteger(r)) {
                                e = r
                            }
                        }
                    });
                    Object.defineProperty(this, "hasAppearanceStream", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return this.V || this.DV
                        }
                    })
                };
                u(X, R);
                var K = function t() {
                    X.call(this);
                    Object.defineProperty(this, "password", {
                        enumerable: true,
                        configurable: true,
                        get: function t() {
                            return Boolean(g(this.Ff, 14))
                        },
                        set: function t(e) {
                            if (Boolean(e) === true) {
                                this.Ff = m(this.Ff, 14)
                            } else {
                                this.Ff = y(this.Ff, 14)
                            }
                        }
                    });
                    this.password = true
                };
                u(K, X);
                var Z = {
                    CheckBox: {
                        createAppearanceStream: function t() {
                            var e = {
                                N: {
                                    On: Z.CheckBox.YesNormal
                                },
                                D: {
                                    On: Z.CheckBox.YesPushDown,
                                    Off: Z.CheckBox.OffPushDown
                                }
                            };
                            return e
                        },
                        YesPushDown: function t(e) {
                            var r = c(e);
                            var i = [];
                            var a = n.internal.getFont(e.fontName, e.fontStyle).id;
                            var o = n.__private__.encodeColorString(e.color);
                            var f = x(e, e.caption);
                            i.push("0.749023 g");
                            i.push("0 0 " + s(Z.internal.getWidth(e)) + " " + s(Z.internal.getHeight(e)) + " re");
                            i.push("f");
                            i.push("BMC");
                            i.push("q");
                            i.push("0 0 1 rg");
                            i.push("/" + a + " " + s(f.fontSize) + " Tf " + o);
                            i.push("BT");
                            i.push(f.text);
                            i.push("ET");
                            i.push("Q");
                            i.push("EMC");
                            r.stream = i.join("\n");
                            return r
                        },
                        YesNormal: function t(e) {
                            var r = c(e);
                            var i = n.internal.getFont(e.fontName, e.fontStyle).id;
                            var a = n.__private__.encodeColorString(e.color);
                            var o = [];
                            var f = Z.internal.getHeight(e);
                            var u = Z.internal.getWidth(e);
                            var l = x(e, e.caption);
                            o.push("1 g");
                            o.push("0 0 " + s(u) + " " + s(f) + " re");
                            o.push("f");
                            o.push("q");
                            o.push("0 0 1 rg");
                            o.push("0 0 " + s(u - 1) + " " + s(f - 1) + " re");
                            o.push("W");
                            o.push("n");
                            o.push("0 g");
                            o.push("BT");
                            o.push("/" + i + " " + s(l.fontSize) + " Tf " + a);
                            o.push(l.text);
                            o.push("ET");
                            o.push("Q");
                            r.stream = o.join("\n");
                            return r
                        },
                        OffPushDown: function t(e) {
                            var r = c(e);
                            var n = [];
                            n.push("0.749023 g");
                            n.push("0 0 " + s(Z.internal.getWidth(e)) + " " + s(Z.internal.getHeight(e)) + " re");
                            n.push("f");
                            r.stream = n.join("\n");
                            return r
                        }
                    },
                    RadioButton: {
                        Circle: {
                            createAppearanceStream: function t(e) {
                                var r = {
                                    D: {
                                        Off: Z.RadioButton.Circle.OffPushDown
                                    },
                                    N: {}
                                };
                                r.N[e] = Z.RadioButton.Circle.YesNormal;
                                r.D[e] = Z.RadioButton.Circle.YesPushDown;
                                return r
                            },
                            getCA: function t() {
                                return "l"
                            },
                            YesNormal: function t(e) {
                                var r = c(e);
                                var n = [];
                                var i = Z.internal.getWidth(e) <= Z.internal.getHeight(e) ? Z.internal.getWidth(e) / 4 : Z.internal.getHeight(e) / 4;
                                i = Number((i * .9).toFixed(5));
                                var a = Z.internal.Bezier_C;
                                var o = Number((i * a).toFixed(5));
                                n.push("q");
                                n.push("1 0 0 1 " + f(Z.internal.getWidth(e) / 2) + " " + f(Z.internal.getHeight(e) / 2) + " cm");
                                n.push(i + " 0 m");
                                n.push(i + " " + o + " " + o + " " + i + " 0 " + i + " c");
                                n.push("-" + o + " " + i + " -" + i + " " + o + " -" + i + " 0 c");
                                n.push("-" + i + " -" + o + " -" + o + " -" + i + " 0 -" + i + " c");
                                n.push(o + " -" + i + " " + i + " -" + o + " " + i + " 0 c");
                                n.push("f");
                                n.push("Q");
                                r.stream = n.join("\n");
                                return r
                            },
                            YesPushDown: function t(e) {
                                var r = c(e);
                                var n = [];
                                var i = Z.internal.getWidth(e) <= Z.internal.getHeight(e) ? Z.internal.getWidth(e) / 4 : Z.internal.getHeight(e) / 4;
                                var i = Number((i * .9).toFixed(5));
                                var a = Number((i * 2).toFixed(5));
                                var o = Number((a * Z.internal.Bezier_C).toFixed(5));
                                var s = Number((i * Z.internal.Bezier_C).toFixed(5));
                                n.push("0.749023 g");
                                n.push("q");
                                n.push("1 0 0 1 " + f(Z.internal.getWidth(e) / 2) + " " + f(Z.internal.getHeight(e) / 2) + " cm");
                                n.push(a + " 0 m");
                                n.push(a + " " + o + " " + o + " " + a + " 0 " + a + " c");
                                n.push("-" + o + " " + a + " -" + a + " " + o + " -" + a + " 0 c");
                                n.push("-" + a + " -" + o + " -" + o + " -" + a + " 0 -" + a + " c");
                                n.push(o + " -" + a + " " + a + " -" + o + " " + a + " 0 c");
                                n.push("f");
                                n.push("Q");
                                n.push("0 g");
                                n.push("q");
                                n.push("1 0 0 1 " + f(Z.internal.getWidth(e) / 2) + " " + f(Z.internal.getHeight(e) / 2) + " cm");
                                n.push(i + " 0 m");
                                n.push("" + i + " " + s + " " + s + " " + i + " 0 " + i + " c");
                                n.push("-" + s + " " + i + " -" + i + " " + s + " -" + i + " 0 c");
                                n.push("-" + i + " -" + s + " -" + s + " -" + i + " 0 -" + i + " c");
                                n.push(s + " -" + i + " " + i + " -" + s + " " + i + " 0 c");
                                n.push("f");
                                n.push("Q");
                                r.stream = n.join("\n");
                                return r
                            },
                            OffPushDown: function t(e) {
                                var r = c(e);
                                var n = [];
                                var i = Z.internal.getWidth(e) <= Z.internal.getHeight(e) ? Z.internal.getWidth(e) / 4 : Z.internal.getHeight(e) / 4;
                                var i = Number((i * .9).toFixed(5));
                                var a = Number((i * 2).toFixed(5));
                                var o = Number((a * Z.internal.Bezier_C).toFixed(5));
                                n.push("0.749023 g");
                                n.push("q");
                                n.push("1 0 0 1 " + f(Z.internal.getWidth(e) / 2) + " " + f(Z.internal.getHeight(e) / 2) + " cm");
                                n.push(a + " 0 m");
                                n.push(a + " " + o + " " + o + " " + a + " 0 " + a + " c");
                                n.push("-" + o + " " + a + " -" + a + " " + o + " -" + a + " 0 c");
                                n.push("-" + a + " -" + o + " -" + o + " -" + a + " 0 -" + a + " c");
                                n.push(o + " -" + a + " " + a + " -" + o + " " + a + " 0 c");
                                n.push("f");
                                n.push("Q");
                                r.stream = n.join("\n");
                                return r
                            }
                        },
                        Cross: {
                            createAppearanceStream: function t(e) {
                                var r = {
                                    D: {
                                        Off: Z.RadioButton.Cross.OffPushDown
                                    },
                                    N: {}
                                };
                                r.N[e] = Z.RadioButton.Cross.YesNormal;
                                r.D[e] = Z.RadioButton.Cross.YesPushDown;
                                return r
                            },
                            getCA: function t() {
                                return "8"
                            },
                            YesNormal: function t(e) {
                                var r = c(e);
                                var n = [];
                                var i = Z.internal.calculateCross(e);
                                n.push("q");
                                n.push("1 1 " + s(Z.internal.getWidth(e) - 2) + " " + s(Z.internal.getHeight(e) - 2) + " re");
                                n.push("W");
                                n.push("n");
                                n.push(s(i.x1.x) + " " + s(i.x1.y) + " m");
                                n.push(s(i.x2.x) + " " + s(i.x2.y) + " l");
                                n.push(s(i.x4.x) + " " + s(i.x4.y) + " m");
                                n.push(s(i.x3.x) + " " + s(i.x3.y) + " l");
                                n.push("s");
                                n.push("Q");
                                r.stream = n.join("\n");
                                return r
                            },
                            YesPushDown: function t(e) {
                                var r = c(e);
                                var n = Z.internal.calculateCross(e);
                                var i = [];
                                i.push("0.749023 g");
                                i.push("0 0 " + s(Z.internal.getWidth(e)) + " " + s(Z.internal.getHeight(e)) + " re");
                                i.push("f");
                                i.push("q");
                                i.push("1 1 " + s(Z.internal.getWidth(e) - 2) + " " + s(Z.internal.getHeight(e) - 2) + " re");
                                i.push("W");
                                i.push("n");
                                i.push(s(n.x1.x) + " " + s(n.x1.y) + " m");
                                i.push(s(n.x2.x) + " " + s(n.x2.y) + " l");
                                i.push(s(n.x4.x) + " " + s(n.x4.y) + " m");
                                i.push(s(n.x3.x) + " " + s(n.x3.y) + " l");
                                i.push("s");
                                i.push("Q");
                                r.stream = i.join("\n");
                                return r
                            },
                            OffPushDown: function t(e) {
                                var r = c(e);
                                var n = [];
                                n.push("0.749023 g");
                                n.push("0 0 " + s(Z.internal.getWidth(e)) + " " + s(Z.internal.getHeight(e)) + " re");
                                n.push("f");
                                r.stream = n.join("\n");
                                return r
                            }
                        }
                    },
                    createDefaultAppearanceStream: function t(e) {
                        var r = n.internal.getFont(e.fontName, e.fontStyle).id;
                        var i = n.__private__.encodeColorString(e.color);
                        var a = e.fontSize;
                        var o = "/" + r + " " + a + " Tf " + i;
                        return o
                    }
                };
                Z.internal = {
                    Bezier_C: .551915024494,
                    calculateCross: function t(e) {
                        var r = Z.internal.getWidth(e);
                        var n = Z.internal.getHeight(e);
                        var i = Math.min(r, n);
                        var a = {
                            x1: {
                                x: (r - i) / 2,
                                y: (n - i) / 2 + i
                            },
                            x2: {
                                x: (r - i) / 2 + i,
                                y: (n - i) / 2
                            },
                            x3: {
                                x: (r - i) / 2,
                                y: (n - i) / 2
                            },
                            x4: {
                                x: (r - i) / 2 + i,
                                y: (n - i) / 2 + i
                            }
                        };
                        return a
                    }
                };
                Z.internal.getWidth = function(e) {
                    var r = 0;
                    if (t(e) === "object") {
                        r = l(e.Rect[2])
                    }
                    return r
                }
                ;
                Z.internal.getHeight = function(e) {
                    var r = 0;
                    if (t(e) === "object") {
                        r = l(e.Rect[3])
                    }
                    return r
                }
                ;
                var Q = e.addField = function(t) {
                    C.call(this);
                    if (t instanceof R) {
                        S.call(this, t)
                    } else {
                        throw new Error("Invalid argument passed to jsPDF.addField.")
                    }
                    t.page = n.internal.getCurrentPageInfo().pageNumber;
                    return this
                }
                ;
                var $ = e.addButton = function(t) {
                    if (t instanceof W === false) {
                        throw new Error("Invalid argument passed to jsPDF.addButton.")
                    }
                    return Q.call(this, t)
                }
                ;
                var tt = e.addTextField = function(t) {
                    if (t instanceof X === false) {
                        throw new Error("Invalid argument passed to jsPDF.addTextField.")
                    }
                    return Q.call(this, t)
                }
                ;
                var et = e.addChoiceField = function(t) {
                    if (t instanceof D === false) {
                        throw new Error("Invalid argument passed to jsPDF.addChoiceField.")
                    }
                    return Q.call(this, t)
                }
                ;
                if (t(r) == "object" && typeof r["ChoiceField"] === "undefined" && typeof r["ListBox"] === "undefined" && typeof r["ComboBox"] === "undefined" && typeof r["EditBox"] === "undefined" && typeof r["Button"] === "undefined" && typeof r["PushButton"] === "undefined" && typeof r["RadioButton"] === "undefined" && typeof r["CheckBox"] === "undefined" && typeof r["TextField"] === "undefined" && typeof r["PasswordField"] === "undefined") {
                    r["ChoiceField"] = D;
                    r["ListBox"] = U;
                    r["ComboBox"] = z;
                    r["EditBox"] = H;
                    r["Button"] = W;
                    r["PushButton"] = V;
                    r["RadioButton"] = G;
                    r["CheckBox"] = J;
                    r["TextField"] = X;
                    r["PasswordField"] = K;
                    r["AcroForm"] = {
                        Appearance: Z
                    }
                } else {
                    console.warn("AcroForm-Classes are not populated into global-namespace, because the class-Names exist already.")
                }
                e.AcroFormChoiceField = D;
                e.AcroFormListBox = U;
                e.AcroFormComboBox = z;
                e.AcroFormEditBox = H;
                e.AcroFormButton = W;
                e.AcroFormPushButton = V;
                e.AcroFormRadioButton = G;
                e.AcroFormCheckBox = J;
                e.AcroFormTextField = X;
                e.AcroFormPasswordField = K;
                e.AcroFormAppearance = Z;
                e.AcroForm = {
                    ChoiceField: D,
                    ListBox: U,
                    ComboBox: z,
                    EditBox: H,
                    Button: W,
                    PushButton: V,
                    RadioButton: G,
                    CheckBox: J,
                    TextField: X,
                    PasswordField: K,
                    Appearance: Z
                }
            }
            )(e.API, typeof window !== "undefined" && window || typeof global !== "undefined" && global);
            /** @license
     * jsPDF addImage plugin
     * Copyright (c) 2012 Jason Siefken, https://github.com/siefkenj/
     *               2013 Chris Dowling, https://github.com/gingerchris
     *               2013 Trinh Ho, https://github.com/ineedfat
     *               2013 Edwin Alejandro Perez, https://github.com/eaparango
     *               2013 Norah Smith, https://github.com/burnburnrocket
     *               2014 Diego Casorran, https://github.com/diegocr
     *               2014 James Robb, https://github.com/jamesbrobb
     *
     * 
     */
            (function(e) {
                var r = "addImage_";
                var n = {
                    PNG: [[137, 80, 78, 71]],
                    TIFF: [[77, 77, 0, 42], [73, 73, 42, 0]],
                    JPEG: [[255, 216, 255, 224, undefined, undefined, 74, 70, 73, 70, 0], [255, 216, 255, 225, undefined, undefined, 69, 120, 105, 102, 0, 0]],
                    JPEG2000: [[0, 0, 0, 12, 106, 80, 32, 32]],
                    GIF87a: [[71, 73, 70, 56, 55, 97]],
                    GIF89a: [[71, 73, 70, 56, 57, 97]],
                    BMP: [[66, 77], [66, 65], [67, 73], [67, 80], [73, 67], [80, 84]]
                };
                var i = e.getImageFileTypeByImageData = function(t, r) {
                    r = r || "UNKNOWN";
                    var i;
                    var a;
                    var o = "UNKNOWN";
                    var s;
                    var f;
                    var u;
                    if (e.isArrayBufferView(t)) {
                        t = e.arrayBufferToBinaryString(t)
                    }
                    for (u in n) {
                        s = n[u];
                        for (i = 0; i < s.length; i += 1) {
                            f = true;
                            for (a = 0; a < s[i].length; a += 1) {
                                if (s[i][a] === undefined) {
                                    continue
                                }
                                if (s[i][a] !== t.charCodeAt(a)) {
                                    f = false;
                                    break
                                }
                            }
                            if (f === true) {
                                o = u;
                                break
                            }
                        }
                    }
                    if (o === "UNKNOWN" && r !== "UNKNOWN") {
                        console.warn('FileType of Image not recognized. Processing image as "' + r + '".');
                        o = r
                    }
                    return o
                }
                ;
                var a = function t(e) {
                    var r = this.internal.newObject()
                      , n = this.internal.write
                      , i = this.internal.putStream
                      , a = this.internal.getFilters;
                    var o = a();
                    while (o.indexOf("FlateEncode") !== -1) {
                        o.splice(o.indexOf("FlateEncode"), 1)
                    }
                    e["n"] = r;
                    var s = [];
                    s.push({
                        key: "Type",
                        value: "/XObject"
                    });
                    s.push({
                        key: "Subtype",
                        value: "/Image"
                    });
                    s.push({
                        key: "Width",
                        value: e["w"]
                    });
                    s.push({
                        key: "Height",
                        value: e["h"]
                    });
                    if (e["cs"] === this.color_spaces.INDEXED) {
                        s.push({
                            key: "ColorSpace",
                            value: "[/Indexed /DeviceRGB " + (e["pal"].length / 3 - 1) + " " + ("smask"in e ? r + 2 : r + 1) + " 0 R]"
                        })
                    } else {
                        s.push({
                            key: "ColorSpace",
                            value: "/" + e["cs"]
                        });
                        if (e["cs"] === this.color_spaces.DEVICE_CMYK) {
                            s.push({
                                key: "Decode",
                                value: "[1 0 1 0 1 0 1 0]"
                            })
                        }
                    }
                    s.push({
                        key: "BitsPerComponent",
                        value: e["bpc"]
                    });
                    if ("dp"in e) {
                        s.push({
                            key: "DecodeParms",
                            value: "<<" + e["dp"] + ">>"
                        })
                    }
                    if ("trns"in e && e["trns"].constructor == Array) {
                        var f = ""
                          , u = 0
                          , l = e["trns"].length;
                        for (; u < l; u++) {
                            f += e["trns"][u] + " " + e["trns"][u] + " "
                        }
                        s.push({
                            key: "Mask",
                            value: "[" + f + "]"
                        })
                    }
                    if ("smask"in e) {
                        s.push({
                            key: "SMask",
                            value: r + 1 + " 0 R"
                        })
                    }
                    var h = typeof e["f"] !== "undefined" ? ["/" + e["f"]] : undefined;
                    i({
                        data: e["data"],
                        additionalKeyValues: s,
                        alreadyAppliedFilters: h
                    });
                    n("endobj");
                    if ("smask"in e) {
                        var c = "/Predictor " + e["p"] + " /Colors 1 /BitsPerComponent " + e["bpc"] + " /Columns " + e["w"];
                        var d = {
                            w: e["w"],
                            h: e["h"],
                            cs: "DeviceGray",
                            bpc: e["bpc"],
                            dp: c,
                            data: e["smask"]
                        };
                        if ("f"in e)
                            d.f = e["f"];
                        t.call(this, d)
                    }
                    if (e["cs"] === this.color_spaces.INDEXED) {
                        this.internal.newObject();
                        i({
                            data: this.arrayBufferToBinaryString(new Uint8Array(e["pal"]))
                        });
                        n("endobj")
                    }
                }
                  , o = function t() {
                    var e = this.internal.collections[r + "images"];
                    for (var n in e) {
                        a.call(this, e[n])
                    }
                }
                  , s = function t() {
                    var e = this.internal.collections[r + "images"], n = this.internal.write, i;
                    for (var a in e) {
                        i = e[a];
                        n("/I" + i["i"], i["n"], "0", "R")
                    }
                }
                  , f = function t(r) {
                    if (r && typeof r === "string")
                        r = r.toUpperCase();
                    return r in e.image_compression ? r : e.image_compression.NONE
                }
                  , u = function t() {
                    var e = this.internal.collections[r + "images"];
                    if (!e) {
                        this.internal.collections[r + "images"] = e = {};
                        this.internal.events.subscribe("putResources", o);
                        this.internal.events.subscribe("putXobjectDict", s)
                    }
                    return e
                }
                  , l = function t(e) {
                    var r = 0;
                    if (e) {
                        r = Object.keys ? Object.keys(e).length : function(t) {
                            var e = 0;
                            for (var r in t) {
                                if (t.hasOwnProperty(r)) {
                                    e++
                                }
                            }
                            return e
                        }(e)
                    }
                    return r
                }
                  , h = function t(e) {
                    return typeof e === "undefined" || e === null || e.length === 0
                }
                  , c = function t(r) {
                    if (typeof r === "string") {
                        return e.sHashCode(r)
                    }
                    if (e.isArrayBufferView(r)) {
                        return e.sHashCode(e.arrayBufferToBinaryString(r))
                    }
                    return null
                }
                  , d = function t(r) {
                    return typeof e["process" + r.toUpperCase()] === "function"
                }
                  , p = function e(r) {
                    return t(r) === "object" && r.nodeType === 1
                }
                  , v = function t(r, n) {
                    if (r.nodeName === "IMG" && r.hasAttribute("src")) {
                        var i = "" + r.getAttribute("src");
                        if (i.indexOf("data:image/") === 0) {
                            return unescape(i)
                        }
                        var a = e.loadFile(i);
                        if (a !== undefined) {
                            return btoa(a)
                        }
                    }
                    if (r.nodeName === "CANVAS") {
                        var o = r;
                        return r.toDataURL("image/jpeg", 1)
                    }
                    var o = document.createElement("canvas");
                    o.width = r.clientWidth || r.width;
                    o.height = r.clientHeight || r.height;
                    var s = o.getContext("2d");
                    if (!s) {
                        throw "addImage requires canvas to be supported by browser."
                    }
                    s.drawImage(r, 0, 0, o.width, o.height);
                    return o.toDataURL(("" + n).toLowerCase() == "png" ? "image/png" : "image/jpeg")
                }
                  , g = function t(e, r) {
                    var n;
                    if (r) {
                        for (var i in r) {
                            if (e === r[i].alias) {
                                n = r[i];
                                break
                            }
                        }
                    }
                    return n
                }
                  , m = function t(e, r, n) {
                    if (!e && !r) {
                        e = -96;
                        r = -96
                    }
                    if (e < 0) {
                        e = -1 * n["w"] * 72 / e / this.internal.scaleFactor
                    }
                    if (r < 0) {
                        r = -1 * n["h"] * 72 / r / this.internal.scaleFactor
                    }
                    if (e === 0) {
                        e = r * n["w"] / n["h"]
                    }
                    if (r === 0) {
                        r = e * n["h"] / n["w"]
                    }
                    return [e, r]
                }
                  , y = function t(e, r, n, i, a, o, s, f) {
                    var u = m.call(this, n, i, a)
                      , l = this.internal.getCoordinateString
                      , h = this.internal.getVerticalCoordinateString;
                    n = u[0];
                    i = u[1];
                    s[o] = a;
                    if (f) {
                        f *= Math.PI / 180;
                        var c = Math.cos(f);
                        var d = Math.sin(f);
                        var p = function t(e) {
                            return e.toFixed(4)
                        };
                        var v = [p(c), p(d), p(d * -1), p(c), 0, 0, "cm"]
                    }
                    this.internal.write("q");
                    if (f) {
                        this.internal.write([1, "0", "0", 1, l(e), h(r + i), "cm"].join(" "));
                        this.internal.write(v.join(" "));
                        this.internal.write([l(n), "0", "0", l(i), "0", "0", "cm"].join(" "))
                    } else {
                        this.internal.write([l(n), "0", "0", l(i), l(e), h(r + i), "cm"].join(" "))
                    }
                    this.internal.write("/I" + a["i"] + " Do");
                    this.internal.write("Q")
                };
                e.color_spaces = {
                    DEVICE_RGB: "DeviceRGB",
                    DEVICE_GRAY: "DeviceGray",
                    DEVICE_CMYK: "DeviceCMYK",
                    CAL_GREY: "CalGray",
                    CAL_RGB: "CalRGB",
                    LAB: "Lab",
                    ICC_BASED: "ICCBased",
                    INDEXED: "Indexed",
                    PATTERN: "Pattern",
                    SEPARATION: "Separation",
                    DEVICE_N: "DeviceN"
                };
                e.decode = {
                    DCT_DECODE: "DCTDecode",
                    FLATE_DECODE: "FlateDecode",
                    LZW_DECODE: "LZWDecode",
                    JPX_DECODE: "JPXDecode",
                    JBIG2_DECODE: "JBIG2Decode",
                    ASCII85_DECODE: "ASCII85Decode",
                    ASCII_HEX_DECODE: "ASCIIHexDecode",
                    RUN_LENGTH_DECODE: "RunLengthDecode",
                    CCITT_FAX_DECODE: "CCITTFaxDecode"
                };
                e.image_compression = {
                    NONE: "NONE",
                    FAST: "FAST",
                    MEDIUM: "MEDIUM",
                    SLOW: "SLOW"
                };
                e.sHashCode = function(t) {
                    t = t || "";
                    var e = 0, r, n;
                    if (t.length === 0)
                        return e;
                    for (r = 0; r < t.length; r++) {
                        n = t.charCodeAt(r);
                        e = (e << 5) - e + n;
                        e |= 0
                    }
                    return e
                }
                ;
                e.isString = function(t) {
                    return typeof t === "string"
                }
                ;
                e.validateStringAsBase64 = function(t) {
                    t = t || "";
                    t.toString().trim();
                    var e = true;
                    if (t.length === 0) {
                        e = false
                    }
                    if (t.length % 4 !== 0) {
                        e = false
                    }
                    if (/^[A-Za-z0-9+\/]+$/.test(t.substr(0, t.length - 2)) === false) {
                        e = false
                    }
                    if (/^[A-Za-z0-9\/][A-Za-z0-9+\/]|[A-Za-z0-9+\/]=|==$/.test(t.substr(-2)) === false) {
                        e = false
                    }
                    return e
                }
                ;
                e.extractInfoFromBase64DataURI = function(t) {
                    return /^data:([\w]+?\/([\w]+?));\S*;*base64,(.+)$/g.exec(t)
                }
                ;
                e.extractImageFromDataUrl = function(t) {
                    t = t || "";
                    var e = t.split("base64,");
                    var r = null;
                    if (e.length === 2) {
                        var n = /^data:(\w*\/\w*);*(charset=[\w=-]*)*;*$/.exec(e[0]);
                        if (Array.isArray(n)) {
                            r = {
                                mimeType: n[1],
                                charset: n[2],
                                data: e[1]
                            }
                        }
                    }
                    return r
                }
                ;
                e.supportsArrayBuffer = function() {
                    return typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined"
                }
                ;
                e.isArrayBuffer = function(t) {
                    if (!this.supportsArrayBuffer())
                        return false;
                    return t instanceof ArrayBuffer
                }
                ;
                e.isArrayBufferView = function(t) {
                    if (!this.supportsArrayBuffer())
                        return false;
                    if (typeof Uint32Array === "undefined")
                        return false;
                    return t instanceof Int8Array || t instanceof Uint8Array || typeof Uint8ClampedArray !== "undefined" && t instanceof Uint8ClampedArray || t instanceof Int16Array || t instanceof Uint16Array || t instanceof Int32Array || t instanceof Uint32Array || t instanceof Float32Array || t instanceof Float64Array
                }
                ;
                e.binaryStringToUint8Array = function(t) {
                    var e = t.length;
                    var r = new Uint8Array(e);
                    for (var n = 0; n < e; n++) {
                        r[n] = t.charCodeAt(n)
                    }
                    return r
                }
                ;
                e.arrayBufferToBinaryString = function(t) {
                    if (typeof atob === "function") {
                        return atob(this.arrayBufferToBase64(t))
                    }
                }
                ;
                e.arrayBufferToBase64 = function(t) {
                    var e = "";
                    var r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                    var n = new Uint8Array(t);
                    var i = n.byteLength;
                    var a = i % 3;
                    var o = i - a;
                    var s, f, u, l;
                    var h;
                    for (var c = 0; c < o; c = c + 3) {
                        h = n[c] << 16 | n[c + 1] << 8 | n[c + 2];
                        s = (h & 16515072) >> 18;
                        f = (h & 258048) >> 12;
                        u = (h & 4032) >> 6;
                        l = h & 63;
                        e += r[s] + r[f] + r[u] + r[l]
                    }
                    if (a == 1) {
                        h = n[o];
                        s = (h & 252) >> 2;
                        f = (h & 3) << 4;
                        e += r[s] + r[f] + "=="
                    } else if (a == 2) {
                        h = n[o] << 8 | n[o + 1];
                        s = (h & 64512) >> 10;
                        f = (h & 1008) >> 4;
                        u = (h & 15) << 2;
                        e += r[s] + r[f] + r[u] + "="
                    }
                    return e
                }
                ;
                e.createImageInfo = function(t, e, r, n, i, a, o, s, f, u, l, h, c) {
                    var d = {
                        alias: s,
                        w: e,
                        h: r,
                        cs: n,
                        bpc: i,
                        i: o,
                        data: t
                    };
                    if (a)
                        d.f = a;
                    if (f)
                        d.dp = f;
                    if (u)
                        d.trns = u;
                    if (l)
                        d.pal = l;
                    if (h)
                        d.smask = h;
                    if (c)
                        d.p = c;
                    return d
                }
                ;
                e.addImage = function(r, n, i, a, o, s, m, w, b) {
                    var x = "";
                    if (typeof n !== "string") {
                        var N = s;
                        s = o;
                        o = a;
                        a = i;
                        i = n;
                        n = N
                    }
                    if (t(r) === "object" && !p(r) && "imageData"in r) {
                        var L = r;
                        r = L.imageData;
                        n = L.format || n || "UNKNOWN";
                        i = L.x || i || 0;
                        a = L.y || a || 0;
                        o = L.w || o;
                        s = L.h || s;
                        m = L.alias || m;
                        w = L.compression || w;
                        b = L.rotation || L.angle || b
                    }
                    var A = this.internal.getFilters();
                    if (w === undefined && A.indexOf("FlateEncode") !== -1) {
                        w = "SLOW"
                    }
                    if (typeof r === "string") {
                        r = unescape(r)
                    }
                    if (isNaN(i) || isNaN(a)) {
                        console.error("jsPDF.addImage: Invalid coordinates", arguments);
                        throw new Error("Invalid coordinates passed to jsPDF.addImage")
                    }
                    var S = u.call(this), _, F;
                    if (!(_ = g(r, S))) {
                        if (p(r))
                            r = v(r, n);
                        if (h(m))
                            m = c(r);
                        if (!(_ = g(m, S))) {
                            if (this.isString(r)) {
                                x = this.convertStringToImageData(r);
                                if (x !== "") {
                                    r = x
                                } else {
                                    x = e.loadFile(r);
                                    if (x !== undefined) {
                                        r = x
                                    }
                                }
                            }
                            n = this.getImageFileTypeByImageData(r, n);
                            if (!d(n))
                                throw new Error("addImage does not support files of type '" + n + "', please ensure that a plugin for '" + n + "' support is added.");
                            if (this.supportsArrayBuffer()) {
                                if (!(r instanceof Uint8Array)) {
                                    F = r;
                                    r = this.binaryStringToUint8Array(r)
                                }
                            }
                            _ = this["process" + n.toUpperCase()](r, l(S), m, f(w), F);
                            if (!_) {
                                throw new Error("An unknown error occurred whilst processing the image")
                            }
                        }
                    }
                    y.call(this, i, a, o, s, _, _.i, S, b);
                    return this
                }
                ;
                e.convertStringToImageData = function(t) {
                    var r;
                    var n = "";
                    var i;
                    if (this.isString(t)) {
                        var r = this.extractImageFromDataUrl(t);
                        i = r !== null ? r.data : t;
                        try {
                            n = atob(i)
                        } catch (t) {
                            if (!e.validateStringAsBase64(i)) {
                                throw new Error("Supplied Data is not a valid base64-String jsPDF.convertStringToImageData ")
                            } else {
                                throw new Error("atob-Error in jsPDF.convertStringToImageData " + t.message)
                            }
                        }
                    }
                    return n
                }
                ;
                var w = function t(e) {
                    var r, n, a;
                    if (i(e) !== "JPEG") {
                        throw new Error("getJpegSize requires a binary string jpeg file")
                    }
                    var o = e.charCodeAt(4) * 256 + e.charCodeAt(5);
                    var s = 4
                      , f = e.length;
                    while (s < f) {
                        s += o;
                        if (e.charCodeAt(s) !== 255) {
                            throw new Error("getJpegSize could not find the size of the image")
                        }
                        if (e.charCodeAt(s + 1) === 192 || e.charCodeAt(s + 1) === 193 || e.charCodeAt(s + 1) === 194 || e.charCodeAt(s + 1) === 195 || e.charCodeAt(s + 1) === 196 || e.charCodeAt(s + 1) === 197 || e.charCodeAt(s + 1) === 198 || e.charCodeAt(s + 1) === 199) {
                            n = e.charCodeAt(s + 5) * 256 + e.charCodeAt(s + 6);
                            r = e.charCodeAt(s + 7) * 256 + e.charCodeAt(s + 8);
                            a = e.charCodeAt(s + 9);
                            return [r, n, a]
                        } else {
                            s += 2;
                            o = e.charCodeAt(s) * 256 + e.charCodeAt(s + 1)
                        }
                    }
                }
                  , b = function t(e) {
                    var r = e[0] << 8 | e[1];
                    if (r !== 65496)
                        throw new Error("Supplied data is not a JPEG");
                    var n = e.length, i = (e[4] << 8) + e[5], a = 4, o, s, f, u;
                    while (a < n) {
                        a += i;
                        o = x(e, a);
                        i = (o[2] << 8) + o[3];
                        if ((o[1] === 192 || o[1] === 194) && o[0] === 255 && i > 7) {
                            o = x(e, a + 5);
                            s = (o[2] << 8) + o[3];
                            f = (o[0] << 8) + o[1];
                            u = o[4];
                            return {
                                width: s,
                                height: f,
                                numcomponents: u
                            }
                        }
                        a += 2
                    }
                    throw new Error("getJpegSizeFromBytes could not find the size of the image")
                }
                  , x = function t(e, r) {
                    return e.subarray(r, r + 5)
                };
                e.processJPEG = function(t, e, r, n, i, a) {
                    var o = this.decode.DCT_DECODE, s = 8, f;
                    if (!this.isString(t) && !this.isArrayBuffer(t) && !this.isArrayBufferView(t)) {
                        return null
                    }
                    if (this.isString(t)) {
                        f = w(t)
                    }
                    if (this.isArrayBuffer(t)) {
                        t = new Uint8Array(t)
                    }
                    if (this.isArrayBufferView(t)) {
                        f = b(t);
                        t = i || this.arrayBufferToBinaryString(t)
                    }
                    if (a === undefined) {
                        switch (f.numcomponents) {
                        case 1:
                            a = this.color_spaces.DEVICE_GRAY;
                            break;
                        case 4:
                            a = this.color_spaces.DEVICE_CMYK;
                            break;
                        default:
                        case 3:
                            a = this.color_spaces.DEVICE_RGB;
                            break
                        }
                    }
                    return this.createImageInfo(t, f.width, f.height, a, s, o, e, r)
                }
                ;
                e.processJPG = function() {
                    return this.processJPEG.apply(this, arguments)
                }
                ;
                e.getImageProperties = function(t) {
                    var r;
                    var n = "";
                    var i;
                    if (p(t)) {
                        t = v(t)
                    }
                    if (this.isString(t)) {
                        n = this.convertStringToImageData(t);
                        if (n !== "") {
                            t = n
                        } else {
                            n = e.loadFile(t);
                            if (n !== undefined) {
                                t = n
                            }
                        }
                    }
                    i = this.getImageFileTypeByImageData(t);
                    if (!d(i)) {
                        throw new Error("addImage does not support files of type '" + i + "', please ensure that a plugin for '" + i + "' support is added.")
                    }
                    if (this.supportsArrayBuffer()) {
                        if (!(t instanceof Uint8Array)) {
                            t = this.binaryStringToUint8Array(t)
                        }
                    }
                    r = this["process" + i.toUpperCase()](t);
                    if (!r) {
                        throw new Error("An unknown error occurred whilst processing the image")
                    }
                    return {
                        fileType: i,
                        width: r.w,
                        height: r.h,
                        colorSpace: r.cs,
                        compressionMode: r.f,
                        bitsPerComponent: r.bpc
                    }
                }
            }
            )(e.API);
            /**
     * @license
     * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                e.API.events.push(["addPage", function(t) {
                    var e = this.internal.getPageInfo(t.pageNumber);
                    e.pageContext.annotations = []
                }
                ]);
                t.events.push(["putPage", function(t) {
                    var e = this.internal.getPageInfoByObjId(t.objId);
                    var r = t.pageContext.annotations;
                    var n = function t(e) {
                        if (typeof e != "undefined") {
                            if (e != "") {
                                return true
                            }
                        }
                    };
                    var i = false;
                    for (var a = 0; a < r.length && !i; a++) {
                        var o = r[a];
                        switch (o.type) {
                        case "link":
                            if (n(o.options.url) || n(o.options.pageNumber)) {
                                i = true;
                                break
                            }
                        case "reference":
                        case "text":
                        case "freetext":
                            i = true;
                            break
                        }
                    }
                    if (i == false) {
                        return
                    }
                    this.internal.write("/Annots [");
                    var s = this.internal.pageSize.height;
                    var f = this.internal.getCoordinateString;
                    var u = this.internal.getVerticalCoordinateString;
                    for (var a = 0; a < r.length; a++) {
                        var o = r[a];
                        switch (o.type) {
                        case "reference":
                            this.internal.write(" " + o.object.objId + " 0 R ");
                            break;
                        case "text":
                            var l = this.internal.newAdditionalObject();
                            var h = this.internal.newAdditionalObject();
                            var c = o.title || "Note";
                            var d = "/Rect [" + f(o.bounds.x) + " " + u(o.bounds.y + o.bounds.h) + " " + f(o.bounds.x + o.bounds.w) + " " + u(o.bounds.y) + "] ";
                            y = "<</Type /Annot /Subtype /" + "Text" + " " + d + "/Contents (" + o.contents + ")";
                            y += " /Popup " + h.objId + " 0 R";
                            y += " /P " + e.objId + " 0 R";
                            y += " /T (" + c + ") >>";
                            l.content = y;
                            var p = l.objId + " 0 R";
                            var v = 30;
                            var d = "/Rect [" + f(o.bounds.x + v) + " " + u(o.bounds.y + o.bounds.h) + " " + f(o.bounds.x + o.bounds.w + v) + " " + u(o.bounds.y) + "] ";
                            y = "<</Type /Annot /Subtype /" + "Popup" + " " + d + " /Parent " + p;
                            if (o.open) {
                                y += " /Open true"
                            }
                            y += " >>";
                            h.content = y;
                            this.internal.write(l.objId, "0 R", h.objId, "0 R");
                            break;
                        case "freetext":
                            var d = "/Rect [" + f(o.bounds.x) + " " + u(o.bounds.y) + " " + f(o.bounds.x + o.bounds.w) + " " + u(o.bounds.y + o.bounds.h) + "] ";
                            var g = o.color || "#000000";
                            y = "<</Type /Annot /Subtype /" + "FreeText" + " " + d + "/Contents (" + o.contents + ")";
                            y += " /DS(font: Helvetica,sans-serif 12.0pt; text-align:left; color:#" + g + ")";
                            y += " /Border [0 0 0]";
                            y += " >>";
                            this.internal.write(y);
                            break;
                        case "link":
                            if (o.options.name) {
                                var m = this.annotations._nameMap[o.options.name];
                                o.options.pageNumber = m.page;
                                o.options.top = m.y
                            } else {
                                if (!o.options.top) {
                                    o.options.top = 0
                                }
                            }
                            var d = "/Rect [" + f(o.x) + " " + u(o.y) + " " + f(o.x + o.w) + " " + u(o.y + o.h) + "] ";
                            var y = "";
                            if (o.options.url) {
                                y = "<</Type /Annot /Subtype /Link " + d + "/Border [0 0 0] /A <</S /URI /URI (" + o.options.url + ") >>"
                            } else if (o.options.pageNumber) {
                                var w = this.internal.getPageInfo(o.options.pageNumber);
                                y = "<</Type /Annot /Subtype /Link " + d + "/Border [0 0 0] /Dest [" + w.objId + " 0 R";
                                o.options.magFactor = o.options.magFactor || "XYZ";
                                switch (o.options.magFactor) {
                                case "Fit":
                                    y += " /Fit]";
                                    break;
                                case "FitH":
                                    y += " /FitH " + o.options.top + "]";
                                    break;
                                case "FitV":
                                    o.options.left = o.options.left || 0;
                                    y += " /FitV " + o.options.left + "]";
                                    break;
                                case "XYZ":
                                default:
                                    var b = u(o.options.top);
                                    o.options.left = o.options.left || 0;
                                    if (typeof o.options.zoom === "undefined") {
                                        o.options.zoom = 0
                                    }
                                    y += " /XYZ " + o.options.left + " " + b + " " + o.options.zoom + "]";
                                    break
                                }
                            }
                            if (y != "") {
                                y += " >>";
                                this.internal.write(y)
                            }
                            break
                        }
                    }
                    this.internal.write("]")
                }
                ]);
                t.createAnnotation = function(t) {
                    var e = this.internal.getCurrentPageInfo();
                    switch (t.type) {
                    case "link":
                        this.link(t.bounds.x, t.bounds.y, t.bounds.w, t.bounds.h, t);
                        break;
                    case "text":
                    case "freetext":
                        e.pageContext.annotations.push(t);
                        break
                    }
                }
                ;
                t.link = function(t, e, r, n, i) {
                    var a = this.internal.getCurrentPageInfo();
                    a.pageContext.annotations.push({
                        x: t,
                        y: e,
                        w: r,
                        h: n,
                        options: i,
                        type: "link"
                    })
                }
                ;
                t.textWithLink = function(t, e, r, n) {
                    var i = this.getTextWidth(t);
                    var a = this.internal.getLineHeight() / this.internal.scaleFactor;
                    this.text(t, e, r);
                    r += a * .2;
                    this.link(e, r - a, i, a, n);
                    return i
                }
                ;
                t.getTextWidth = function(t) {
                    var e = this.internal.getFontSize();
                    var r = this.getStringUnitWidth(t) * e / this.internal.scaleFactor;
                    return r
                }
                ;
                return this
            }
            )(e.API);
            /**
     * @license
     * Copyright (c) 2017 Aras Abbasi 
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                var e = {
                    1569: [65152],
                    1570: [65153, 65154],
                    1571: [65155, 65156],
                    1572: [65157, 65158],
                    1573: [65159, 65160],
                    1574: [65161, 65162, 65163, 65164],
                    1575: [65165, 65166],
                    1576: [65167, 65168, 65169, 65170],
                    1577: [65171, 65172],
                    1578: [65173, 65174, 65175, 65176],
                    1579: [65177, 65178, 65179, 65180],
                    1580: [65181, 65182, 65183, 65184],
                    1581: [65185, 65186, 65187, 65188],
                    1582: [65189, 65190, 65191, 65192],
                    1583: [65193, 65194],
                    1584: [65195, 65196],
                    1585: [65197, 65198],
                    1586: [65199, 65200],
                    1587: [65201, 65202, 65203, 65204],
                    1588: [65205, 65206, 65207, 65208],
                    1589: [65209, 65210, 65211, 65212],
                    1590: [65213, 65214, 65215, 65216],
                    1591: [65217, 65218, 65219, 65220],
                    1592: [65221, 65222, 65223, 65224],
                    1593: [65225, 65226, 65227, 65228],
                    1594: [65229, 65230, 65231, 65232],
                    1601: [65233, 65234, 65235, 65236],
                    1602: [65237, 65238, 65239, 65240],
                    1603: [65241, 65242, 65243, 65244],
                    1604: [65245, 65246, 65247, 65248],
                    1605: [65249, 65250, 65251, 65252],
                    1606: [65253, 65254, 65255, 65256],
                    1607: [65257, 65258, 65259, 65260],
                    1608: [65261, 65262],
                    1609: [65263, 65264, 64488, 64489],
                    1610: [65265, 65266, 65267, 65268],
                    1649: [64336, 64337],
                    1655: [64477],
                    1657: [64358, 64359, 64360, 64361],
                    1658: [64350, 64351, 64352, 64353],
                    1659: [64338, 64339, 64340, 64341],
                    1662: [64342, 64343, 64344, 64345],
                    1663: [64354, 64355, 64356, 64357],
                    1664: [64346, 64347, 64348, 64349],
                    1667: [64374, 64375, 64376, 64377],
                    1668: [64370, 64371, 64372, 64373],
                    1670: [64378, 64379, 64380, 64381],
                    1671: [64382, 64383, 64384, 64385],
                    1672: [64392, 64393],
                    1676: [64388, 64389],
                    1677: [64386, 64387],
                    1678: [64390, 64391],
                    1681: [64396, 64397],
                    1688: [64394, 64395],
                    1700: [64362, 64363, 64364, 64365],
                    1702: [64366, 64367, 64368, 64369],
                    1705: [64398, 64399, 64400, 64401],
                    1709: [64467, 64468, 64469, 64470],
                    1711: [64402, 64403, 64404, 64405],
                    1713: [64410, 64411, 64412, 64413],
                    1715: [64406, 64407, 64408, 64409],
                    1722: [64414, 64415],
                    1723: [64416, 64417, 64418, 64419],
                    1726: [64426, 64427, 64428, 64429],
                    1728: [64420, 64421],
                    1729: [64422, 64423, 64424, 64425],
                    1733: [64480, 64481],
                    1734: [64473, 64474],
                    1735: [64471, 64472],
                    1736: [64475, 64476],
                    1737: [64482, 64483],
                    1739: [64478, 64479],
                    1740: [64508, 64509, 64510, 64511],
                    1744: [64484, 64485, 64486, 64487],
                    1746: [64430, 64431],
                    1747: [64432, 64433]
                };
                var r = {
                    65247: {
                        65154: 65269,
                        65156: 65271,
                        65160: 65273,
                        65166: 65275
                    },
                    65248: {
                        65154: 65270,
                        65156: 65272,
                        65160: 65274,
                        65166: 65276
                    },
                    65165: {
                        65247: {
                            65248: {
                                65258: 65010
                            }
                        }
                    },
                    1617: {
                        1612: 64606,
                        1613: 64607,
                        1614: 64608,
                        1615: 64609,
                        1616: 64610
                    }
                };
                var n = {
                    1612: 64606,
                    1613: 64607,
                    1614: 64608,
                    1615: 64609,
                    1616: 64610
                };
                var i = [1570, 1571, 1573, 1575];
                var a = -1;
                var o = 0;
                var s = 1;
                var f = 2;
                var u = 3;
                t.__arabicParser__ = {};
                var l = t.__arabicParser__.isInArabicSubstitutionA = function(t) {
                    return typeof e[t.charCodeAt(0)] !== "undefined"
                }
                ;
                var h = t.__arabicParser__.isArabicLetter = function(t) {
                    return typeof t === "string" && /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/.test(t)
                }
                ;
                var c = t.__arabicParser__.isArabicEndLetter = function(t) {
                    return h(t) && l(t) && e[t.charCodeAt(0)].length <= 2
                }
                ;
                var d = t.__arabicParser__.isArabicAlfLetter = function(t) {
                    return h(t) && i.indexOf(t.charCodeAt(0)) >= 0
                }
                ;
                var p = t.__arabicParser__.arabicLetterHasIsolatedForm = function(t) {
                    return h(t) && l(t) && e[t.charCodeAt(0)].length >= 1
                }
                ;
                var v = t.__arabicParser__.arabicLetterHasFinalForm = function(t) {
                    return h(t) && l(t) && e[t.charCodeAt(0)].length >= 2
                }
                ;
                var g = t.__arabicParser__.arabicLetterHasInitialForm = function(t) {
                    return h(t) && l(t) && e[t.charCodeAt(0)].length >= 3
                }
                ;
                var m = t.__arabicParser__.arabicLetterHasMedialForm = function(t) {
                    return h(t) && l(t) && e[t.charCodeAt(0)].length == 4
                }
                ;
                var y = t.__arabicParser__.resolveLigatures = function(t) {
                    var e = 0;
                    var n = r;
                    var i = o;
                    var a = "";
                    var s = 0;
                    for (e = 0; e < t.length; e += 1) {
                        if (typeof n[t.charCodeAt(e)] !== "undefined") {
                            s++;
                            n = n[t.charCodeAt(e)];
                            if (typeof n === "number") {
                                i = b(t.charAt(e), t.charAt(e - s), t.charAt(e + 1));
                                i = i !== -1 ? i : 0;
                                a += String.fromCharCode(n);
                                n = r;
                                s = 0
                            }
                            if (e === t.length - 1) {
                                n = r;
                                a += t.charAt(e - (s - 1));
                                e = e - (s - 1);
                                s = 0
                            }
                        } else {
                            n = r;
                            a += t.charAt(e - s);
                            e = e - s;
                            s = 0
                        }
                    }
                    return a
                }
                ;
                var w = t.__arabicParser__.isArabicDiacritic = function(t) {
                    return t !== undefined && n[t.charCodeAt(0)] !== undefined
                }
                ;
                var b = t.__arabicParser__.getCorrectForm = function(t, e, r) {
                    if (!h(t)) {
                        return -1
                    }
                    if (l(t) === false) {
                        return a
                    }
                    if (!v(t) || !h(e) && !h(r) || !h(r) && c(e) || c(t) && !h(e) || c(t) && d(e) || c(t) && c(e)) {
                        return o
                    }
                    if (m(t) && h(e) && !c(e) && h(r) && v(r)) {
                        return u
                    }
                    if (c(t) || !h(r)) {
                        return s
                    }
                    return f
                }
                ;
                var x = t.__arabicParser__.processArabic = t.processArabic = function(t) {
                    t = t || "";
                    var r = "";
                    var n = 0;
                    var i = 0;
                    var a = 0;
                    var o = "";
                    var s = "";
                    var f = "";
                    var u = t.split("\\s+");
                    var l = [];
                    for (n = 0; n < u.length; n += 1) {
                        l.push("");
                        for (i = 0; i < u[n].length; i += 1) {
                            o = u[n][i];
                            s = u[n][i - 1];
                            f = u[n][i + 1];
                            if (h(o)) {
                                a = b(o, s, f);
                                if (a !== -1) {
                                    l[n] += String.fromCharCode(e[o.charCodeAt(0)][a])
                                } else {
                                    l[n] += o
                                }
                            } else {
                                l[n] += o
                            }
                        }
                        l[n] = y(l[n])
                    }
                    r = l.join(" ");
                    return r
                }
                ;
                var N = function t(e) {
                    var r = e.text;
                    var n = e.x;
                    var i = e.y;
                    var a = e.options || {};
                    var o = e.mutex || {};
                    var s = a.lang;
                    var f = [];
                    if (Object.prototype.toString.call(r) === "[object Array]") {
                        var u = 0;
                        f = [];
                        for (u = 0; u < r.length; u += 1) {
                            if (Object.prototype.toString.call(r[u]) === "[object Array]") {
                                f.push([x(r[u][0]), r[u][1], r[u][2]])
                            } else {
                                f.push([x(r[u])])
                            }
                        }
                        e.text = f
                    } else {
                        e.text = x(r)
                    }
                };
                t.events.push(["preProcessText", N])
            }
            )(e.API);
            /** @license
     * jsPDF Autoprint Plugin
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                t.autoPrint = function(t) {
                    var e;
                    t = t || {};
                    t.variant = t.variant || "non-conform";
                    switch (t.variant) {
                    case "javascript":
                        this.addJS("print({});");
                        break;
                    case "non-conform":
                    default:
                        this.internal.events.subscribe("postPutResources", function() {
                            e = this.internal.newObject();
                            this.internal.out("<<");
                            this.internal.out("/S /Named");
                            this.internal.out("/Type /Action");
                            this.internal.out("/N /Print");
                            this.internal.out(">>");
                            this.internal.out("endobj")
                        });
                        this.internal.events.subscribe("putCatalog", function() {
                            this.internal.out("/OpenAction " + e + " 0 R")
                        });
                        break
                    }
                    return this
                }
            }
            )(e.API);
            /**
     * @license
     * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                var e = function t() {
                    var e = undefined;
                    Object.defineProperty(this, "pdf", {
                        get: function t() {
                            return e
                        },
                        set: function t(r) {
                            e = r
                        }
                    });
                    var r = 150;
                    Object.defineProperty(this, "width", {
                        get: function t() {
                            return r
                        },
                        set: function t(e) {
                            if (isNaN(e) || Number.isInteger(e) === false || e < 0) {
                                r = 150
                            } else {
                                r = e
                            }
                            if (this.getContext("2d").pageWrapXEnabled) {
                                this.getContext("2d").pageWrapX = r + 1
                            }
                        }
                    });
                    var n = 300;
                    Object.defineProperty(this, "height", {
                        get: function t() {
                            return n
                        },
                        set: function t(e) {
                            if (isNaN(e) || Number.isInteger(e) === false || e < 0) {
                                n = 300
                            } else {
                                n = e
                            }
                            if (this.getContext("2d").pageWrapYEnabled) {
                                this.getContext("2d").pageWrapY = n + 1
                            }
                        }
                    });
                    var i = [];
                    Object.defineProperty(this, "childNodes", {
                        get: function t() {
                            return i
                        },
                        set: function t(e) {
                            i = e
                        }
                    });
                    var a = {};
                    Object.defineProperty(this, "style", {
                        get: function t() {
                            return a
                        },
                        set: function t(e) {
                            a = e
                        }
                    });
                    Object.defineProperty(this, "parentNode", {
                        get: function t() {
                            return false
                        }
                    })
                };
                e.prototype.getContext = function(t, e) {
                    t = t || "2d";
                    var r;
                    if (t !== "2d") {
                        return null
                    }
                    for (r in e) {
                        if (this.pdf.context2d.hasOwnProperty(r)) {
                            this.pdf.context2d[r] = e[r]
                        }
                    }
                    this.pdf.context2d._canvas = this;
                    return this.pdf.context2d
                }
                ;
                e.prototype.toDataURL = function() {
                    throw new Error("toDataURL is not implemented.")
                }
                ;
                t.events.push(["initialized", function() {
                    this.canvas = new e;
                    this.canvas.pdf = this
                }
                ]);
                return this
            }
            )(e.API);
            /** 
     * @license
     * ====================================================================
     * Copyright (c) 2013 Youssef Beddad, youssef.beddad@gmail.com
     *               2013 Eduardo Menezes de Morais, eduardo.morais@usp.br
     *               2013 Lee Driscoll, https://github.com/lsdriscoll
     *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
     *               2014 James Hall, james@parall.ax
     *               2014 Diego Casorran, https://github.com/diegocr
     *
     * 
     * ====================================================================
     */
            (function(t) {
                var e = 3, r = 13, n, i = {
                    x: undefined,
                    y: undefined,
                    w: undefined,
                    h: undefined,
                    ln: undefined
                }, a = 1, o = function t(e, r, n, a, o) {
                    i = {
                        x: e,
                        y: r,
                        w: n,
                        h: a,
                        ln: o
                    }
                }, s = function t() {
                    return i
                }, f = {
                    left: 0,
                    top: 0,
                    bottom: 0
                };
                t.setHeaderFunction = function(t) {
                    n = t
                }
                ;
                t.getTextDimensions = function(t, e) {
                    var r = this.table_font_size || this.internal.getFontSize();
                    var n = this.internal.getFont().fontStyle;
                    e = e || {};
                    var i = e.scaleFactor || this.internal.scaleFactor;
                    var a = 0;
                    var o = 0;
                    var s = 0;
                    var f = 0;
                    if (typeof t === "string") {
                        a = this.getStringUnitWidth(t) * r;
                        if (a !== 0) {
                            o = 1
                        }
                    } else if (Object.prototype.toString.call(t) === "[object Array]") {
                        for (var u = 0; u < t.length; u++) {
                            f = this.getStringUnitWidth(t[u]) * r;
                            if (a < f) {
                                a = f
                            }
                        }
                        if (a !== 0) {
                            o = t.length
                        }
                    } else {
                        throw new Error("getTextDimensions expects text-parameter to be of type String or an Array of Strings.")
                    }
                    a = a / i;
                    s = Math.max((o * r * this.getLineHeightFactor() - r * (this.getLineHeightFactor() - 1)) / i, 0);
                    return {
                        w: a,
                        h: s
                    }
                }
                ;
                t.cellAddPage = function() {
                    var t = this.margins || f;
                    this.addPage();
                    o(t.left, t.top, undefined, undefined);
                    a += 1
                }
                ;
                t.cellInitialize = function() {
                    i = {
                        x: undefined,
                        y: undefined,
                        w: undefined,
                        h: undefined,
                        ln: undefined
                    };
                    a = 1
                }
                ;
                t.cell = function(t, n, i, a, u, l, h) {
                    var c = s();
                    var d = false;
                    if (c.ln !== undefined) {
                        if (c.ln === l) {
                            t = c.x + c.w;
                            n = c.y
                        } else {
                            var p = this.margins || f;
                            if (c.y + c.h + a + r >= this.internal.pageSize.getHeight() - p.bottom) {
                                this.cellAddPage();
                                d = true;
                                if (this.printHeaders && this.tableHeaderRow) {
                                    this.printHeaderRow(l, true)
                                }
                            }
                            n = s().y + s().h;
                            if (d)
                                n = r + 10
                        }
                    }
                    if (u[0] !== undefined) {
                        if (this.printingHeaderRow) {
                            this.rect(t, n, i, a, "FD")
                        } else {
                            this.rect(t, n, i, a)
                        }
                        if (h === "right") {
                            if (!(u instanceof Array)) {
                                u = [u]
                            }
                            for (var v = 0; v < u.length; v++) {
                                var g = u[v];
                                var m = this.getStringUnitWidth(g) * this.internal.getFontSize() / this.internal.scaleFactor;
                                this.text(g, t + i - m - e, n + this.internal.getLineHeight() * (v + 1))
                            }
                        } else {
                            this.text(u, t + e, n + this.internal.getLineHeight())
                        }
                    }
                    o(t, n, i, a, l);
                    return this
                }
                ;
                t.arrayMax = function(t, e) {
                    var r = t[0], n, i, a;
                    for (n = 0,
                    i = t.length; n < i; n += 1) {
                        a = t[n];
                        if (e) {
                            if (e(r, a) === -1) {
                                r = a
                            }
                        } else {
                            if (a > r) {
                                r = a
                            }
                        }
                    }
                    return r
                }
                ;
                t.table = function(e, r, n, o, s) {
                    if (!n) {
                        throw "No data for PDF table"
                    }
                    var u = [], l = [], h, c, d, p, v = {}, g = {}, m, y, w = [], b, x = [], N, L, A, S = false, _ = true, F = 12, k = f;
                    k.width = this.internal.pageSize.getWidth();
                    if (s) {
                        if (s.autoSize === true) {
                            S = true
                        }
                        if (s.printHeaders === false) {
                            _ = false
                        }
                        if (s.fontSize) {
                            F = s.fontSize
                        }
                        if (s.css && typeof s.css["font-size"] !== "undefined") {
                            F = s.css["font-size"] * 16
                        }
                        if (s.margins) {
                            k = s.margins
                        }
                    }
                    this.lnMod = 0;
                    i = {
                        x: undefined,
                        y: undefined,
                        w: undefined,
                        h: undefined,
                        ln: undefined
                    },
                    a = 1;
                    this.printHeaders = _;
                    this.margins = k;
                    this.setFontSize(F);
                    this.table_font_size = F;
                    if (o === undefined || o === null) {
                        u = Object.keys(n[0])
                    } else if (o[0] && typeof o[0] !== "string") {
                        var P = .264583 * 72 / 25.4;
                        for (c = 0,
                        d = o.length; c < d; c += 1) {
                            h = o[c];
                            u.push(h.name);
                            l.push(h.prompt);
                            g[h.name] = h.width * P
                        }
                    } else {
                        u = o
                    }
                    if (S) {
                        A = function t(e) {
                            return e[h]
                        }
                        ;
                        for (c = 0,
                        d = u.length; c < d; c += 1) {
                            h = u[c];
                            v[h] = n.map(A);
                            w.push(this.getTextDimensions(l[c] || h, {
                                scaleFactor: 1
                            }).w);
                            y = v[h];
                            for (b = 0,
                            p = y.length; b < p; b += 1) {
                                m = y[b];
                                w.push(this.getTextDimensions(m, {
                                    scaleFactor: 1
                                }).w)
                            }
                            g[h] = t.arrayMax(w);
                            w = []
                        }
                    }
                    if (_) {
                        var I = this.calculateLineHeight(u, g, l.length ? l : u);
                        for (c = 0,
                        d = u.length; c < d; c += 1) {
                            h = u[c];
                            x.push([e, r, g[h], I, String(l.length ? l[c] : h)])
                        }
                        this.setTableHeaderRow(x);
                        this.printHeaderRow(1, false)
                    }
                    for (c = 0,
                    d = n.length; c < d; c += 1) {
                        var I;
                        N = n[c];
                        I = this.calculateLineHeight(u, g, N);
                        for (b = 0,
                        L = u.length; b < L; b += 1) {
                            h = u[b];
                            this.cell(e, r, g[h], I, N[h], c + 2, h.align)
                        }
                    }
                    this.lastCellPos = i;
                    this.table_x = e;
                    this.table_y = r;
                    return this
                }
                ;
                t.calculateLineHeight = function(t, r, n) {
                    var i, a = 0;
                    for (var o = 0; o < t.length; o++) {
                        i = t[o];
                        n[i] = this.splitTextToSize(String(n[i]), r[i] - e);
                        var s = this.internal.getLineHeight() * n[i].length + e;
                        if (s > a)
                            a = s
                    }
                    return a
                }
                ;
                t.setTableHeaderRow = function(t) {
                    this.tableHeaderRow = t
                }
                ;
                t.printHeaderRow = function(t, e) {
                    if (!this.tableHeaderRow) {
                        throw "Property tableHeaderRow does not exist."
                    }
                    var i, s, f, u;
                    this.printingHeaderRow = true;
                    if (n !== undefined) {
                        var l = n(this, a);
                        o(l[0], l[1], l[2], l[3], -1)
                    }
                    this.setFontStyle("bold");
                    var h = [];
                    for (f = 0,
                    u = this.tableHeaderRow.length; f < u; f += 1) {
                        this.setFillColor(200, 200, 200);
                        i = this.tableHeaderRow[f];
                        if (e) {
                            this.margins.top = r;
                            i[1] = this.margins && this.margins.top || 0;
                            h.push(i)
                        }
                        s = [].concat(i);
                        this.cell.apply(this, s.concat(t))
                    }
                    if (h.length > 0) {
                        this.setTableHeaderRow(h)
                    }
                    this.setFontStyle("normal");
                    this.printingHeaderRow = false
                }
            }
            )(e.API);
            /**
     * jsPDF Context2D PlugIn Copyright (c) 2014 Steven Spungin (TwelveTone LLC) steven@twelvetone.tv
     *
     * Licensed under the MIT License. http://opensource.org/licenses/mit-license
     */
            (function(e, r) {
                var n = function t(e) {
                    e = e || {};
                    this.isStrokeTransparent = e.isStrokeTransparent || false;
                    this.strokeOpacity = e.strokeOpacity || 1;
                    this.strokeStyle = e.strokeStyle || "#000000";
                    this.fillStyle = e.fillStyle || "#000000";
                    this.isFillTransparent = e.isFillTransparent || false;
                    this.fillOpacity = e.fillOpacity || 1;
                    this.font = e.font || "10px sans-serif";
                    this.textBaseline = e.textBaseline || "alphabetic";
                    this.textAlign = e.textAlign || "left";
                    this.lineWidth = e.lineWidth || 1;
                    this.lineJoin = e.lineJoin || "miter";
                    this.lineCap = e.lineCap || "butt";
                    this.path = e.path || [];
                    this.transform = typeof e.transform !== "undefined" ? e.transform.clone() : new O;
                    this.globalCompositeOperation = e.globalCompositeOperation || "normal";
                    this.globalAlpha = e.globalAlpha || 1;
                    this.clip_path = e.clip_path || [];
                    this.currentPoint = e.currentPoint || new E;
                    this.miterLimit = e.miterLimit || 10;
                    this.lastPoint = e.lastPoint || new E;
                    this.ignoreClearRect = typeof e.ignoreClearRect === "boolean" ? e.ignoreClearRect : true;
                    return this
                };
                var i, a, o, s, f, u;
                e.events.push(["initialized", function() {
                    this.context2d = new l(this);
                    i = this.internal.f2;
                    a = this.internal.f3;
                    o = this.internal.getCoordinateString;
                    s = this.internal.getVerticalCoordinateString;
                    f = this.internal.getHorizontalCoordinate;
                    u = this.internal.getVerticalCoordinate
                }
                ]);
                var l = function t(e) {
                    Object.defineProperty(this, "canvas", {
                        get: function t() {
                            return {
                                parentNode: false,
                                style: false
                            }
                        }
                    });
                    Object.defineProperty(this, "pdf", {
                        get: function t() {
                            return e
                        }
                    });
                    var r = false;
                    Object.defineProperty(this, "pageWrapXEnabled", {
                        get: function t() {
                            return r
                        },
                        set: function t(e) {
                            r = Boolean(e)
                        }
                    });
                    var i = false;
                    Object.defineProperty(this, "pageWrapYEnabled", {
                        get: function t() {
                            return i
                        },
                        set: function t(e) {
                            i = Boolean(e)
                        }
                    });
                    var a = 0;
                    Object.defineProperty(this, "posX", {
                        get: function t() {
                            return a
                        },
                        set: function t(e) {
                            if (!isNaN(e)) {
                                a = e
                            }
                        }
                    });
                    var o = 0;
                    Object.defineProperty(this, "posY", {
                        get: function t() {
                            return o
                        },
                        set: function t(e) {
                            if (!isNaN(e)) {
                                o = e
                            }
                        }
                    });
                    var s = false;
                    Object.defineProperty(this, "autoPaging", {
                        get: function t() {
                            return s
                        },
                        set: function t(e) {
                            s = Boolean(e)
                        }
                    });
                    var f = 0;
                    Object.defineProperty(this, "lastBreak", {
                        get: function t() {
                            return f
                        },
                        set: function t(e) {
                            f = e
                        }
                    });
                    var u = [];
                    Object.defineProperty(this, "pageBreaks", {
                        get: function t() {
                            return u
                        },
                        set: function t(e) {
                            u = e
                        }
                    });
                    var l = new n;
                    Object.defineProperty(this, "ctx", {
                        get: function t() {
                            return l
                        },
                        set: function t(e) {
                            if (e instanceof n) {
                                l = e
                            }
                        }
                    });
                    Object.defineProperty(this, "path", {
                        get: function t() {
                            return l.path
                        },
                        set: function t(e) {
                            l.path = e
                        }
                    });
                    var c = [];
                    Object.defineProperty(this, "ctxStack", {
                        get: function t() {
                            return c
                        },
                        set: function t(e) {
                            c = e
                        }
                    });
                    Object.defineProperty(this, "fillStyle", {
                        get: function t() {
                            return this.ctx.fillStyle
                        },
                        set: function t(e) {
                            var r;
                            r = h(e);
                            this.ctx.fillStyle = r.style;
                            this.ctx.isFillTransparent = r.a === 0;
                            this.ctx.fillOpacity = r.a;
                            this.pdf.setFillColor(r.r, r.g, r.b, {
                                a: r.a
                            });
                            this.pdf.setTextColor(r.r, r.g, r.b, {
                                a: r.a
                            })
                        }
                    });
                    Object.defineProperty(this, "strokeStyle", {
                        get: function t() {
                            return this.ctx.strokeStyle
                        },
                        set: function t(e) {
                            var r = h(e);
                            this.ctx.strokeStyle = r.style;
                            this.ctx.isStrokeTransparent = r.a === 0;
                            this.ctx.strokeOpacity = r.a;
                            if (r.a === 0) {
                                this.pdf.setDrawColor(255, 255, 255)
                            } else if (r.a === 1) {
                                this.pdf.setDrawColor(r.r, r.g, r.b)
                            } else {
                                this.pdf.setDrawColor(r.r, r.g, r.b)
                            }
                        }
                    });
                    Object.defineProperty(this, "lineCap", {
                        get: function t() {
                            return this.ctx.lineCap
                        },
                        set: function t(e) {
                            if (["butt", "round", "square"].indexOf(e) !== -1) {
                                this.ctx.lineCap = e;
                                this.pdf.setLineCap(e)
                            }
                        }
                    });
                    Object.defineProperty(this, "lineWidth", {
                        get: function t() {
                            return this.ctx.lineWidth
                        },
                        set: function t(e) {
                            if (!isNaN(e)) {
                                this.ctx.lineWidth = e;
                                this.pdf.setLineWidth(e)
                            }
                        }
                    });
                    Object.defineProperty(this, "lineJoin", {
                        get: function t() {
                            return this.ctx.lineJoin
                        },
                        set: function t(e) {
                            if (["bevel", "round", "miter"].indexOf(e) !== -1) {
                                this.ctx.lineJoin = e;
                                this.pdf.setLineJoin(e)
                            }
                        }
                    });
                    Object.defineProperty(this, "miterLimit", {
                        get: function t() {
                            return this.ctx.miterLimit
                        },
                        set: function t(e) {
                            if (!isNaN(e)) {
                                this.ctx.miterLimit = e;
                                this.pdf.setMiterLimit(e)
                            }
                        }
                    });
                    Object.defineProperty(this, "textBaseline", {
                        get: function t() {
                            return this.ctx.textBaseline
                        },
                        set: function t(e) {
                            this.ctx.textBaseline = e
                        }
                    });
                    Object.defineProperty(this, "textAlign", {
                        get: function t() {
                            return this.ctx.textAlign
                        },
                        set: function t(e) {
                            if (["right", "end", "center", "left", "start"].indexOf(e) !== -1) {
                                this.ctx.textAlign = e
                            }
                        }
                    });
                    Object.defineProperty(this, "font", {
                        get: function t() {
                            return this.ctx.font
                        },
                        set: function t(e) {
                            this.ctx.font = e;
                            var r, n;
                            r = /^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-_,\"\'\sa-z]+?)\s*$/i;
                            n = r.exec(e);
                            if (n !== null) {
                                var i = n[1];
                                var a = n[2];
                                var o = n[3];
                                var s = n[4];
                                var f = n[5];
                                var u = n[6]
                            } else {
                                return
                            }
                            if ("px" === f) {
                                s = Math.floor(parseFloat(s))
                            } else if ("em" === f) {
                                s = Math.floor(parseFloat(s) * this.pdf.getFontSize())
                            } else {
                                s = Math.floor(parseFloat(s))
                            }
                            this.pdf.setFontSize(s);
                            var l = "";
                            if (o === "bold" || parseInt(o, 10) >= 700 || i === "bold") {
                                l = "bold"
                            }
                            if (i === "italic") {
                                l += "italic"
                            }
                            if (l.length === 0) {
                                l = "normal"
                            }
                            var h = "";
                            var c = u.toLowerCase().replace(/"|'/g, "").split(/\s*,\s*/);
                            var d = {
                                arial: "Helvetica",
                                verdana: "Helvetica",
                                helvetica: "Helvetica",
                                "sans-serif": "Helvetica",
                                fixed: "Courier",
                                monospace: "Courier",
                                terminal: "Courier",
                                courier: "Courier",
                                times: "Times",
                                cursive: "Times",
                                fantasy: "Times",
                                serif: "Times"
                            };
                            for (var p = 0; p < c.length; p++) {
                                if (this.pdf.internal.getFont(c[p], l, {
                                    noFallback: true,
                                    disableWarning: true
                                }) !== undefined) {
                                    h = c[p];
                                    break
                                } else if (l === "bolditalic" && this.pdf.internal.getFont(c[p], "bold", {
                                    noFallback: true,
                                    disableWarning: true
                                }) !== undefined) {
                                    h = c[p];
                                    l = "bold"
                                } else if (this.pdf.internal.getFont(c[p], "normal", {
                                    noFallback: true,
                                    disableWarning: true
                                }) !== undefined) {
                                    h = c[p];
                                    l = "normal";
                                    break
                                }
                            }
                            if (h === "") {
                                for (var p = 0; p < c.length; p++) {
                                    if (d[c[p]]) {
                                        h = d[c[p]];
                                        break
                                    }
                                }
                            }
                            h = h === "" ? "Times" : h;
                            this.pdf.setFont(h, l)
                        }
                    });
                    Object.defineProperty(this, "globalCompositeOperation", {
                        get: function t() {
                            return this.ctx.globalCompositeOperation
                        },
                        set: function t(e) {
                            this.ctx.globalCompositeOperation = e
                        }
                    });
                    Object.defineProperty(this, "globalAlpha", {
                        get: function t() {
                            return this.ctx.globalAlpha
                        },
                        set: function t(e) {
                            this.ctx.globalAlpha = e
                        }
                    });
                    Object.defineProperty(this, "ignoreClearRect", {
                        get: function t() {
                            return this.ctx.ignoreClearRect
                        },
                        set: function t(e) {
                            this.ctx.ignoreClearRect = Boolean(e)
                        }
                    })
                };
                l.prototype.fill = function() {
                    m.call(this, "fill", false)
                }
                ;
                l.prototype.stroke = function() {
                    m.call(this, "stroke", false)
                }
                ;
                l.prototype.beginPath = function() {
                    this.path = [{
                        type: "begin"
                    }]
                }
                ;
                l.prototype.moveTo = function(t, e) {
                    if (isNaN(t) || isNaN(e)) {
                        console.error("jsPDF.context2d.moveTo: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.moveTo")
                    }
                    var r = this.ctx.transform.applyToPoint(new E(t,e));
                    this.path.push({
                        type: "mt",
                        x: r.x,
                        y: r.y
                    });
                    this.ctx.lastPoint = new E(t,e)
                }
                ;
                l.prototype.closePath = function() {
                    var e = new E(0,0);
                    var r = 0;
                    for (r = this.path.length - 1; r !== -1; r--) {
                        if (this.path[r].type === "begin") {
                            if (t(this.path[r + 1]) === "object" && typeof this.path[r + 1].x === "number") {
                                e = new E(this.path[r + 1].x,this.path[r + 1].y);
                                this.path.push({
                                    type: "lt",
                                    x: e.x,
                                    y: e.y
                                });
                                break
                            }
                        }
                    }
                    if (t(this.path[r + 2]) === "object" && typeof this.path[r + 2].x === "number") {
                        this.path.push(JSON.parse(JSON.stringify(this.path[r + 2])))
                    }
                    this.path.push({
                        type: "close"
                    });
                    this.ctx.lastPoint = new E(e.x,e.y)
                }
                ;
                l.prototype.lineTo = function(t, e) {
                    if (isNaN(t) || isNaN(e)) {
                        console.error("jsPDF.context2d.lineTo: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.lineTo")
                    }
                    var r = this.ctx.transform.applyToPoint(new E(t,e));
                    this.path.push({
                        type: "lt",
                        x: r.x,
                        y: r.y
                    });
                    this.ctx.lastPoint = new E(r.x,r.y)
                }
                ;
                l.prototype.clip = function() {
                    this.ctx.clip_path = JSON.parse(JSON.stringify(this.path));
                    m.call(this, null, true)
                }
                ;
                l.prototype.quadraticCurveTo = function(t, e, r, n) {
                    if (isNaN(r) || isNaN(n) || isNaN(t) || isNaN(e)) {
                        console.error("jsPDF.context2d.quadraticCurveTo: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.quadraticCurveTo")
                    }
                    var i = this.ctx.transform.applyToPoint(new E(r,n));
                    var a = this.ctx.transform.applyToPoint(new E(t,e));
                    this.path.push({
                        type: "qct",
                        x1: a.x,
                        y1: a.y,
                        x: i.x,
                        y: i.y
                    });
                    this.ctx.lastPoint = new E(i.x,i.y)
                }
                ;
                l.prototype.bezierCurveTo = function(t, e, r, n, i, a) {
                    if (isNaN(i) || isNaN(a) || isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n)) {
                        console.error("jsPDF.context2d.bezierCurveTo: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.bezierCurveTo")
                    }
                    var o = this.ctx.transform.applyToPoint(new E(i,a));
                    var s = this.ctx.transform.applyToPoint(new E(t,e));
                    var f = this.ctx.transform.applyToPoint(new E(r,n));
                    this.path.push({
                        type: "bct",
                        x1: s.x,
                        y1: s.y,
                        x2: f.x,
                        y2: f.y,
                        x: o.x,
                        y: o.y
                    });
                    this.ctx.lastPoint = new E(o.x,o.y)
                }
                ;
                l.prototype.arc = function(t, e, r, n, i, a) {
                    if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n) || isNaN(i)) {
                        console.error("jsPDF.context2d.arc: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.arc")
                    }
                    a = Boolean(a);
                    if (!this.ctx.transform.isIdentity) {
                        var o = this.ctx.transform.applyToPoint(new E(t,e));
                        t = o.x;
                        e = o.y;
                        var s = this.ctx.transform.applyToPoint(new E(0,r));
                        var f = this.ctx.transform.applyToPoint(new E(0,0));
                        r = Math.sqrt(Math.pow(s.x - f.x, 2) + Math.pow(s.y - f.y, 2))
                    }
                    if (Math.abs(i - n) >= 2 * Math.PI) {
                        n = 0;
                        i = 2 * Math.PI
                    }
                    this.path.push({
                        type: "arc",
                        x: t,
                        y: e,
                        radius: r,
                        startAngle: n,
                        endAngle: i,
                        counterclockwise: a
                    })
                }
                ;
                l.prototype.arcTo = function(t, e, r, n, i) {
                    throw new Error("arcTo not implemented.")
                }
                ;
                l.prototype.rect = function(t, e, r, n) {
                    if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n)) {
                        console.error("jsPDF.context2d.rect: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.rect")
                    }
                    this.moveTo(t, e);
                    this.lineTo(t + r, e);
                    this.lineTo(t + r, e + n);
                    this.lineTo(t, e + n);
                    this.lineTo(t, e);
                    this.lineTo(t + r, e);
                    this.lineTo(t, e)
                }
                ;
                l.prototype.fillRect = function(t, e, r, n) {
                    if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n)) {
                        console.error("jsPDF.context2d.fillRect: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.fillRect")
                    }
                    if (c.call(this)) {
                        return
                    }
                    var i = {};
                    if (this.lineCap !== "butt") {
                        i.lineCap = this.lineCap;
                        this.lineCap = "butt"
                    }
                    if (this.lineJoin !== "miter") {
                        i.lineJoin = this.lineJoin;
                        this.lineJoin = "miter"
                    }
                    this.beginPath();
                    this.rect(t, e, r, n);
                    this.fill();
                    if (i.hasOwnProperty("lineCap")) {
                        this.lineCap = i.lineCap
                    }
                    if (i.hasOwnProperty("lineJoin")) {
                        this.lineJoin = i.lineJoin
                    }
                }
                ;
                l.prototype.strokeRect = function t(e, r, n, i) {
                    if (isNaN(e) || isNaN(r) || isNaN(n) || isNaN(i)) {
                        console.error("jsPDF.context2d.strokeRect: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.strokeRect")
                    }
                    if (d.call(this)) {
                        return
                    }
                    this.beginPath();
                    this.rect(e, r, n, i);
                    this.stroke()
                }
                ;
                l.prototype.clearRect = function(t, e, r, n) {
                    if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n)) {
                        console.error("jsPDF.context2d.clearRect: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.clearRect")
                    }
                    if (this.ignoreClearRect) {
                        return
                    }
                    this.fillStyle = "#ffffff";
                    this.fillRect(t, e, r, n)
                }
                ;
                l.prototype.save = function(t) {
                    t = typeof t === "boolean" ? t : true;
                    var e = this.pdf.internal.getCurrentPageInfo().pageNumber;
                    for (var r = 0; r < this.pdf.internal.getNumberOfPages(); r++) {
                        this.pdf.setPage(r + 1);
                        this.pdf.internal.out("q")
                    }
                    this.pdf.setPage(e);
                    if (t) {
                        this.ctx.fontSize = this.pdf.internal.getFontSize();
                        var i = new n(this.ctx);
                        this.ctxStack.push(this.ctx);
                        this.ctx = i
                    }
                }
                ;
                l.prototype.restore = function(t) {
                    t = typeof t === "boolean" ? t : true;
                    var e = this.pdf.internal.getCurrentPageInfo().pageNumber;
                    for (var r = 0; r < this.pdf.internal.getNumberOfPages(); r++) {
                        this.pdf.setPage(r + 1);
                        this.pdf.internal.out("Q")
                    }
                    this.pdf.setPage(e);
                    if (t && this.ctxStack.length !== 0) {
                        this.ctx = this.ctxStack.pop();
                        this.fillStyle = this.ctx.fillStyle;
                        this.strokeStyle = this.ctx.strokeStyle;
                        this.font = this.ctx.font;
                        this.lineCap = this.ctx.lineCap;
                        this.lineWidth = this.ctx.lineWidth;
                        this.lineJoin = this.ctx.lineJoin
                    }
                }
                ;
                l.prototype.toDataURL = function() {
                    throw new Error("toDataUrl not implemented.")
                }
                ;
                var h = function t(e) {
                    var r = /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
                    var n = /rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/;
                    var i = /transparent|rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0+\s*\)/;
                    var a, o, s, f;
                    if (e.isCanvasGradient === true) {
                        e = e.getColor()
                    }
                    if (!e) {
                        return {
                            r: 0,
                            g: 0,
                            b: 0,
                            a: 0,
                            style: e
                        }
                    }
                    if (i.test(e)) {
                        a = 0;
                        o = 0;
                        s = 0;
                        f = 0
                    } else {
                        var u = r.exec(e);
                        if (u !== null) {
                            a = parseInt(u[1]);
                            o = parseInt(u[2]);
                            s = parseInt(u[3]);
                            f = 1
                        } else {
                            u = n.exec(e);
                            if (u !== null) {
                                a = parseInt(u[1]);
                                o = parseInt(u[2]);
                                s = parseInt(u[3]);
                                f = parseFloat(u[4])
                            } else {
                                f = 1;
                                if (typeof e === "string" && e.charAt(0) !== "#") {
                                    var l = new RGBColor(e);
                                    if (l.ok) {
                                        e = l.toHex()
                                    } else {
                                        e = "#000000"
                                    }
                                }
                                if (e.length === 4) {
                                    a = e.substring(1, 2);
                                    a += a;
                                    o = e.substring(2, 3);
                                    o += o;
                                    s = e.substring(3, 4);
                                    s += s
                                } else {
                                    a = e.substring(1, 3);
                                    o = e.substring(3, 5);
                                    s = e.substring(5, 7)
                                }
                                a = parseInt(a, 16);
                                o = parseInt(o, 16);
                                s = parseInt(s, 16)
                            }
                        }
                    }
                    return {
                        r: a,
                        g: o,
                        b: s,
                        a: f,
                        style: e
                    }
                };
                var c = function t() {
                    return this.ctx.isFillTransparent || this.globalAlpha == 0
                };
                var d = function t() {
                    return Boolean(this.ctx.isStrokeTransparent || this.globalAlpha == 0)
                };
                l.prototype.fillText = function(t, e, r, n) {
                    if (isNaN(e) || isNaN(r) || typeof t !== "string") {
                        console.error("jsPDF.context2d.fillText: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.fillText")
                    }
                    n = isNaN(n) ? undefined : n;
                    if (c.call(this)) {
                        return
                    }
                    r = w.call(this, r);
                    var i = I(this.ctx.transform.rotation);
                    var a = this.ctx.transform.scaleX;
                    A.call(this, {
                        text: t,
                        x: e,
                        y: r,
                        scale: a,
                        angle: i,
                        align: this.textAlign,
                        maxWidth: n
                    })
                }
                ;
                l.prototype.strokeText = function(t, e, r, n) {
                    if (isNaN(e) || isNaN(r) || typeof t !== "string") {
                        console.error("jsPDF.context2d.strokeText: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.strokeText")
                    }
                    if (d.call(this)) {
                        return
                    }
                    n = isNaN(n) ? undefined : n;
                    r = w.call(this, r);
                    var i = I(this.ctx.transform.rotation);
                    var a = this.ctx.transform.scaleX;
                    A.call(this, {
                        text: t,
                        x: e,
                        y: r,
                        scale: a,
                        renderingMode: "stroke",
                        angle: i,
                        align: this.textAlign,
                        maxWidth: n
                    })
                }
                ;
                l.prototype.measureText = function(t) {
                    if (typeof t !== "string") {
                        console.error("jsPDF.context2d.measureText: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.measureText")
                    }
                    var e = this.pdf;
                    var r = this.pdf.internal.scaleFactor;
                    var n = e.internal.getFontSize();
                    var i = e.getStringUnitWidth(t) * n / e.internal.scaleFactor;
                    i *= Math.round(r * 96 / 72 * 1e4) / 1e4;
                    var a = function t(e) {
                        e = e || {};
                        var r = e.width || 0;
                        Object.defineProperty(this, "width", {
                            get: function t() {
                                return r
                            }
                        });
                        return this
                    };
                    return new a({
                        width: i
                    })
                }
                ;
                l.prototype.scale = function(t, e) {
                    if (isNaN(t) || isNaN(e)) {
                        console.error("jsPDF.context2d.scale: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.scale")
                    }
                    var r = new O(t,0,0,e,0,0);
                    this.ctx.transform = this.ctx.transform.multiply(r)
                }
                ;
                l.prototype.rotate = function(t) {
                    if (isNaN(t)) {
                        console.error("jsPDF.context2d.rotate: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.rotate")
                    }
                    var e = new O(Math.cos(t),Math.sin(t),-Math.sin(t),Math.cos(t),0,0);
                    this.ctx.transform = this.ctx.transform.multiply(e)
                }
                ;
                l.prototype.translate = function(t, e) {
                    if (isNaN(t) || isNaN(e)) {
                        console.error("jsPDF.context2d.translate: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.translate")
                    }
                    var r = new O(1,0,0,1,t,e);
                    this.ctx.transform = this.ctx.transform.multiply(r)
                }
                ;
                l.prototype.transform = function(t, e, r, n, i, a) {
                    if (isNaN(t) || isNaN(e) || isNaN(r) || isNaN(n) || isNaN(i) || isNaN(a)) {
                        console.error("jsPDF.context2d.transform: Invalid arguments", arguments);
                        throw new Error("Invalid arguments passed to jsPDF.context2d.transform")
                    }
                    var o = new O(t,e,r,n,i,a);
                    this.ctx.transform = this.ctx.transform.multiply(o)
                }
                ;
                l.prototype.setTransform = function(t, e, r, n, i, a) {
                    t = isNaN(t) ? 1 : t;
                    e = isNaN(e) ? 0 : e;
                    r = isNaN(r) ? 0 : r;
                    n = isNaN(n) ? 1 : n;
                    i = isNaN(i) ? 0 : i;
                    a = isNaN(a) ? 0 : a;
                    this.ctx.transform = new O(t,e,r,n,i,a)
                }
                ;
                l.prototype.drawImage = function(t, e, r, n, i, a, o, s, f) {
                    var u = this.pdf.getImageProperties(t);
                    var l = 1;
                    var h = 1;
                    var c = 1;
                    var d = 1;
                    var v = 1;
                    if (typeof n !== "undefined" && typeof s !== "undefined") {
                        c = s / n;
                        d = f / i;
                        l = u.width / n * s / n;
                        h = u.height / i * f / i
                    }
                    if (typeof a === "undefined") {
                        a = e;
                        o = r;
                        e = 0;
                        r = 0
                    }
                    if (typeof n !== "undefined" && typeof s === "undefined") {
                        s = n;
                        f = i
                    }
                    if (typeof n === "undefined" && typeof s === "undefined") {
                        s = u.width;
                        f = u.height
                    }
                    var m = this.ctx.transform.decompose();
                    var w = I(m.rotate.shx);
                    v = m.scale.sx;
                    v = m.scale.sy;
                    var b = new O;
                    b = b.multiply(m.translate);
                    b = b.multiply(m.skew);
                    b = b.multiply(m.scale);
                    var x = b.applyToPoint(new E(s,f));
                    var N = b.applyToRectangle(new M(a - e * c,o - r * d,n * l,i * h));
                    var L = p.call(this, N);
                    var A = [];
                    for (var S = 0; S < L.length; S += 1) {
                        if (A.indexOf(L[S]) === -1) {
                            A.push(L[S])
                        }
                    }
                    A.sort();
                    var _;
                    if (this.autoPaging) {
                        var F = A[0];
                        var k = A[A.length - 1];
                        for (var P = F; P < k + 1; P++) {
                            this.pdf.setPage(P);
                            if (this.ctx.clip_path.length !== 0) {
                                var C = this.path;
                                _ = JSON.parse(JSON.stringify(this.ctx.clip_path));
                                this.path = g(_, this.posX, -1 * this.pdf.internal.pageSize.height * (P - 1) + this.posY);
                                y.call(this, "fill", true);
                                this.path = C
                            }
                            var B = JSON.parse(JSON.stringify(N));
                            B = g([B], this.posX, -1 * this.pdf.internal.pageSize.height * (P - 1) + this.posY)[0];
                            this.pdf.addImage(t, "jpg", B.x, B.y, B.w, B.h, null, null, w)
                        }
                    } else {
                        this.pdf.addImage(t, "jpg", N.x, N.y, N.w, N.h, null, null, w)
                    }
                }
                ;
                var p = function t(e, r, n) {
                    var i = [];
                    r = r || this.pdf.internal.pageSize.width;
                    n = n || this.pdf.internal.pageSize.height;
                    switch (e.type) {
                    default:
                    case "mt":
                    case "lt":
                        i.push(Math.floor((e.y + this.posY) / n) + 1);
                        break;
                    case "arc":
                        i.push(Math.floor((e.y + this.posY - e.radius) / n) + 1);
                        i.push(Math.floor((e.y + this.posY + e.radius) / n) + 1);
                        break;
                    case "qct":
                        var a = B(this.ctx.lastPoint.x, this.ctx.lastPoint.y, e.x1, e.y1, e.x, e.y);
                        i.push(Math.floor(a.y / n) + 1);
                        i.push(Math.floor((a.y + a.h) / n) + 1);
                        break;
                    case "bct":
                        var o = j(this.ctx.lastPoint.x, this.ctx.lastPoint.y, e.x1, e.y1, e.x2, e.y2, e.x, e.y);
                        i.push(Math.floor(o.y / n) + 1);
                        i.push(Math.floor((o.y + o.h) / n) + 1);
                        break;
                    case "rect":
                        i.push(Math.floor((e.y + this.posY) / n) + 1);
                        i.push(Math.floor((e.y + e.h + this.posY) / n) + 1)
                    }
                    for (var s = 0; s < i.length; s += 1) {
                        while (this.pdf.internal.getNumberOfPages() < i[s]) {
                            v.call(this)
                        }
                    }
                    return i
                };
                var v = function t() {
                    var e = this.fillStyle;
                    var r = this.strokeStyle;
                    var n = this.font;
                    var i = this.lineCap;
                    var a = this.lineWidth;
                    var o = this.lineJoin;
                    this.pdf.addPage();
                    this.fillStyle = e;
                    this.strokeStyle = r;
                    this.font = n;
                    this.lineCap = i;
                    this.lineWidth = a;
                    this.lineJoin = o
                };
                var g = function t(e, r, n) {
                    for (var i = 0; i < e.length; i++) {
                        switch (e[i].type) {
                        case "bct":
                            e[i].x2 += r;
                            e[i].y2 += n;
                        case "qct":
                            e[i].x1 += r;
                            e[i].y1 += n;
                        case "mt":
                        case "lt":
                        case "arc":
                        default:
                            e[i].x += r;
                            e[i].y += n
                        }
                    }
                    return e
                };
                var m = function t(e, r) {
                    var n = this.fillStyle;
                    var i = this.strokeStyle;
                    var a = this.font;
                    var o = this.lineCap;
                    var s = this.lineWidth;
                    var f = this.lineJoin;
                    var u = JSON.parse(JSON.stringify(this.path));
                    var l = JSON.parse(JSON.stringify(this.path));
                    var h;
                    var c;
                    var d = [];
                    for (var m = 0; m < l.length; m++) {
                        if (typeof l[m].x !== "undefined") {
                            var w = p.call(this, l[m]);
                            for (var b = 0; b < w.length; b += 1) {
                                if (d.indexOf(w[b]) === -1) {
                                    d.push(w[b])
                                }
                            }
                        }
                    }
                    for (var m = 0; m < d.length; m++) {
                        while (this.pdf.internal.getNumberOfPages() < d[m]) {
                            v.call(this)
                        }
                    }
                    d.sort();
                    if (this.autoPaging) {
                        var x = d[0];
                        var N = d[d.length - 1];
                        for (var m = x; m < N + 1; m++) {
                            this.pdf.setPage(m);
                            this.fillStyle = n;
                            this.strokeStyle = i;
                            this.lineCap = o;
                            this.lineWidth = s;
                            this.lineJoin = f;
                            if (this.ctx.clip_path.length !== 0) {
                                var L = this.path;
                                h = JSON.parse(JSON.stringify(this.ctx.clip_path));
                                this.path = g(h, this.posX, -1 * this.pdf.internal.pageSize.height * (m - 1) + this.posY);
                                y.call(this, e, true);
                                this.path = L
                            }
                            c = JSON.parse(JSON.stringify(u));
                            this.path = g(c, this.posX, -1 * this.pdf.internal.pageSize.height * (m - 1) + this.posY);
                            if (r === false || m === 0) {
                                y.call(this, e, r)
                            }
                        }
                    } else {
                        y.call(this, e, r)
                    }
                    this.path = u
                };
                var y = function t(e, r) {
                    if (e === "stroke" && !r && d.call(this)) {
                        return
                    }
                    if (e !== "stroke" && !r && c.call(this)) {
                        return
                    }
                    var n = [];
                    var i = this.ctx.globalAlpha;
                    if (this.ctx.fillOpacity < 1) {
                        i = this.ctx.fillOpacity
                    }
                    var a = this.path;
                    for (var o = 0; o < a.length; o++) {
                        var s = a[o];
                        switch (s.type) {
                        case "begin":
                            n.push({
                                begin: true
                            });
                            break;
                        case "close":
                            n.push({
                                close: true
                            });
                            break;
                        case "mt":
                            n.push({
                                start: s,
                                deltas: [],
                                abs: []
                            });
                            break;
                        case "lt":
                            var f = n.length;
                            if (!isNaN(a[o - 1].x)) {
                                var u = [s.x - a[o - 1].x, s.y - a[o - 1].y];
                                if (f > 0) {
                                    for (f; f >= 0; f--) {
                                        if (n[f - 1].close !== true && n[f - 1].begin !== true) {
                                            n[f - 1].deltas.push(u);
                                            n[f - 1].abs.push(s);
                                            break
                                        }
                                    }
                                }
                            }
                            break;
                        case "bct":
                            var u = [s.x1 - a[o - 1].x, s.y1 - a[o - 1].y, s.x2 - a[o - 1].x, s.y2 - a[o - 1].y, s.x - a[o - 1].x, s.y - a[o - 1].y];
                            n[n.length - 1].deltas.push(u);
                            break;
                        case "qct":
                            var l = a[o - 1].x + 2 / 3 * (s.x1 - a[o - 1].x);
                            var h = a[o - 1].y + 2 / 3 * (s.y1 - a[o - 1].y);
                            var p = s.x + 2 / 3 * (s.x1 - s.x);
                            var v = s.y + 2 / 3 * (s.y1 - s.y);
                            var g = s.x;
                            var m = s.y;
                            var u = [l - a[o - 1].x, h - a[o - 1].y, p - a[o - 1].x, v - a[o - 1].y, g - a[o - 1].x, m - a[o - 1].y];
                            n[n.length - 1].deltas.push(u);
                            break;
                        case "arc":
                            n.push({
                                deltas: [],
                                abs: [],
                                arc: true
                            });
                            if (Array.isArray(n[n.length - 1].abs)) {
                                n[n.length - 1].abs.push(s)
                            }
                            break
                        }
                    }
                    var y;
                    if (!r) {
                        if (e === "stroke") {
                            y = "stroke"
                        } else {
                            y = "fill"
                        }
                    } else {
                        y = null
                    }
                    for (var o = 0; o < n.length; o++) {
                        if (n[o].arc) {
                            var w = n[o].abs;
                            for (var L = 0; L < w.length; L++) {
                                var A = w[L];
                                if (typeof A.startAngle !== "undefined") {
                                    var F = I(A.startAngle);
                                    var k = I(A.endAngle);
                                    var P = A.x;
                                    var C = A.y;
                                    b.call(this, P, C, A.radius, F, k, A.counterclockwise, y, r)
                                } else {
                                    S.call(this, A.x, A.y)
                                }
                            }
                        }
                        if (!n[o].arc) {
                            if (n[o].close !== true && n[o].begin !== true) {
                                var P = n[o].start.x;
                                var C = n[o].start.y;
                                _.call(this, n[o].deltas, P, C, null, null)
                            }
                        }
                    }
                    if (y) {
                        x.call(this, y)
                    }
                    if (r) {
                        N.call(this)
                    }
                };
                var w = function t(e) {
                    var r = this.pdf.internal.getFontSize() / this.pdf.internal.scaleFactor;
                    var n = r * (this.pdf.internal.getLineHeightFactor() - 1);
                    switch (this.ctx.textBaseline) {
                    case "bottom":
                        return e - n;
                    case "top":
                        return e + r - n;
                    case "hanging":
                        return e + r - 2 * n;
                    case "middle":
                        return e + r / 2 - n;
                    case "ideographic":
                        return e;
                    case "alphabetic":
                    default:
                        return e
                    }
                };
                l.prototype.createLinearGradient = function t() {
                    var e = function t() {};
                    e.colorStops = [];
                    e.addColorStop = function(t, e) {
                        this.colorStops.push([t, e])
                    }
                    ;
                    e.getColor = function() {
                        if (this.colorStops.length === 0) {
                            return "#000000"
                        }
                        return this.colorStops[0][1]
                    }
                    ;
                    e.isCanvasGradient = true;
                    return e
                }
                ;
                l.prototype.createPattern = function t() {
                    return this.createLinearGradient()
                }
                ;
                l.prototype.createRadialGradient = function t() {
                    return this.createLinearGradient()
                }
                ;
                var b = function t(e, r, n, i, a, o, s, f) {
                    var u = this.pdf.internal.scaleFactor;
                    var l = C(i);
                    var h = C(a);
                    var c = k.call(this, n, l, h, o);
                    for (var d = 0; d < c.length; d++) {
                        var p = c[d];
                        if (d === 0) {
                            L.call(this, p.x1 + e, p.y1 + r)
                        }
                        F.call(this, e, r, p.x2, p.y2, p.x3, p.y3, p.x4, p.y4)
                    }
                    if (!f) {
                        x.call(this, s)
                    } else {
                        N.call(this)
                    }
                };
                var x = function t(e) {
                    switch (e) {
                    case "stroke":
                        this.pdf.internal.out("S");
                        break;
                    case "fill":
                        this.pdf.internal.out("f");
                        break
                    }
                };
                var N = function t() {
                    this.pdf.clip()
                };
                var L = function t(e, r) {
                    this.pdf.internal.out(o(e) + " " + s(r) + " m")
                };
                var A = function t(e) {
                    var r;
                    switch (e.align) {
                    case "right":
                    case "end":
                        r = "right";
                        break;
                    case "center":
                        r = "center";
                        break;
                    case "left":
                    case "start":
                    default:
                        r = "left";
                        break
                    }
                    var n = this.ctx.transform.applyToPoint(new E(e.x,e.y));
                    var i = this.ctx.transform.decompose();
                    var a = new O;
                    a = a.multiply(i.translate);
                    a = a.multiply(i.skew);
                    a = a.multiply(i.scale);
                    var o = this.pdf.getTextDimensions(e.text);
                    var s = this.ctx.transform.applyToRectangle(new M(e.x,e.y,o.w,o.h));
                    var f = a.applyToRectangle(new M(e.x,e.y - o.h,o.w,o.h));
                    var u = p.call(this, f);
                    var l = [];
                    for (var h = 0; h < u.length; h += 1) {
                        if (l.indexOf(u[h]) === -1) {
                            l.push(u[h])
                        }
                    }
                    l.sort();
                    var c;
                    if (this.autoPaging === true) {
                        var d = l[0];
                        var v = l[l.length - 1];
                        for (var m = d; m < v + 1; m++) {
                            this.pdf.setPage(m);
                            if (this.ctx.clip_path.length !== 0) {
                                var w = this.path;
                                c = JSON.parse(JSON.stringify(this.ctx.clip_path));
                                this.path = g(c, this.posX, -1 * this.pdf.internal.pageSize.height * (m - 1) + this.posY);
                                y.call(this, "fill", true);
                                this.path = w
                            }
                            var b = JSON.parse(JSON.stringify(s));
                            b = g([b], this.posX, -1 * this.pdf.internal.pageSize.height * (m - 1) + this.posY)[0];
                            if (e.scale >= .01) {
                                var x = this.pdf.internal.getFontSize();
                                this.pdf.setFontSize(x * e.scale)
                            }
                            this.pdf.text(e.text, b.x, b.y, {
                                angle: e.angle,
                                align: r,
                                renderingMode: e.renderingMode,
                                maxWidth: e.maxWidth
                            });
                            if (e.scale >= .01) {
                                this.pdf.setFontSize(x)
                            }
                        }
                    } else {
                        if (e.scale >= .01) {
                            var x = this.pdf.internal.getFontSize();
                            this.pdf.setFontSize(x * e.scale)
                        }
                        this.pdf.text(e.text, n.x + this.posX, n.y + this.posY, {
                            angle: e.angle,
                            align: r,
                            renderingMode: e.renderingMode,
                            maxWidth: e.maxWidth
                        });
                        if (e.scale >= .01) {
                            this.pdf.setFontSize(x)
                        }
                    }
                };
                var S = function t(e, r, n, i) {
                    n = n || 0;
                    i = i || 0;
                    this.pdf.internal.out(o(e + n) + " " + s(r + i) + " l")
                };
                var _ = function t(e, r, n) {
                    return this.pdf.lines(e, r, n, null, null)
                };
                var F = function t(e, r, n, a, o, s, l, h) {
                    this.pdf.internal.out([i(f(n + e)), i(u(a + r)), i(f(o + e)), i(u(s + r)), i(f(l + e)), i(u(h + r)), "c"].join(" "))
                };
                var k = function t(e, r, n, i) {
                    var a = 1e-5;
                    var o = Math.PI * 2;
                    var s = r;
                    if (s < o || s > o) {
                        s = s % o
                    }
                    var f = n;
                    if (f < o || f > o) {
                        f = f % o
                    }
                    var u = [];
                    var l = Math.PI / 2;
                    var h = i ? -1 : +1;
                    var c = r;
                    for (var d = Math.min(o, Math.abs(f - s)); d > a; ) {
                        var p = c + h * Math.min(d, l);
                        u.push(P.call(this, e, c, p));
                        d -= Math.abs(p - c);
                        c = p
                    }
                    return u
                };
                var P = function t(e, r, n) {
                    var i = (n - r) / 2;
                    var a = e * Math.cos(i);
                    var o = e * Math.sin(i);
                    var s = a;
                    var f = -o;
                    var u = s * s + f * f;
                    var l = u + s * a + f * o;
                    var h = 4 / 3 * (Math.sqrt(2 * u * l) - l) / (s * o - f * a);
                    var c = s - h * f;
                    var d = f + h * s;
                    var p = c;
                    var v = -d;
                    var g = i + r;
                    var m = Math.cos(g);
                    var y = Math.sin(g);
                    return {
                        x1: e * Math.cos(r),
                        y1: e * Math.sin(r),
                        x2: c * m - d * y,
                        y2: c * y + d * m,
                        x3: p * m - v * y,
                        y3: p * y + v * m,
                        x4: e * Math.cos(n),
                        y4: e * Math.sin(n)
                    }
                };
                var I = function t(e) {
                    return e * 180 / Math.PI
                };
                var C = function t(e) {
                    return e * Math.PI / 180
                };
                var B = function t(e, r, n, i, a, o) {
                    var s = e + (n - e) * .5;
                    var f = r + (i - r) * .5;
                    var u = a + (n - a) * .5;
                    var l = o + (i - o) * .5;
                    var h = Math.min(e, a, s, u);
                    var c = Math.max(e, a, s, u);
                    var d = Math.min(r, o, f, l);
                    var p = Math.max(r, o, f, l);
                    return new M(h,d,c - h,p - d)
                };
                var j = function t(e, r, n, i, a, o, s, f) {
                    var u = n - e;
                    var l = i - r;
                    var h = a - n;
                    var c = o - i;
                    var d = s - a;
                    var p = f - o;
                    var v = 40;
                    var g, m, y, w, b, x, N, L, A, S, _, F, k, P, I, C, B, j, E, O, q, T, R, D;
                    for (var P = 0; P < v + 1; P++) {
                        g = P / v;
                        m = e + g * u;
                        y = r + g * l;
                        w = n + g * h;
                        b = i + g * c;
                        x = a + g * d;
                        N = o + g * p;
                        E = w - m;
                        O = b - y;
                        q = x - w;
                        T = N - b;
                        S = m + g * E;
                        _ = y + g * O;
                        L = w + g * q;
                        A = b + g * T;
                        R = L - S;
                        D = A - _;
                        F = S + g * R;
                        k = _ + g * D;
                        if (P == 0) {
                            I = F;
                            C = k;
                            B = F;
                            j = k
                        } else {
                            I = Math.min(I, F);
                            C = Math.min(C, k);
                            B = Math.max(B, F);
                            j = Math.max(j, k)
                        }
                    }
                    return new M(Math.round(I),Math.round(C),Math.round(B - I),Math.round(j - C))
                };
                var E = function t(e, r) {
                    var n = e || 0;
                    Object.defineProperty(this, "x", {
                        enumerable: true,
                        get: function t() {
                            return n
                        },
                        set: function t(e) {
                            if (!isNaN(e)) {
                                n = parseFloat(e)
                            }
                        }
                    });
                    var i = r || 0;
                    Object.defineProperty(this, "y", {
                        enumerable: true,
                        get: function t() {
                            return i
                        },
                        set: function t(e) {
                            if (!isNaN(e)) {
                                i = parseFloat(e)
                            }
                        }
                    });
                    var a = "pt";
                    Object.defineProperty(this, "type", {
                        enumerable: true,
                        get: function t() {
                            return a
                        },
                        set: function t(e) {
                            a = e.toString()
                        }
                    });
                    return this
                };
                var M = function t(e, r, n, i) {
                    E.call(this, e, r);
                    this.type = "rect";
                    var a = n || 0;
                    Object.defineProperty(this, "w", {
                        enumerable: true,
                        get: function t() {
                            return a
                        },
                        set: function t(e) {
                            if (!isNaN(e)) {
                                a = parseFloat(e)
                            }
                        }
                    });
                    var o = i || 0;
                    Object.defineProperty(this, "h", {
                        enumerable: true,
                        get: function t() {
                            return o
                        },
                        set: function t(e) {
                            if (!isNaN(e)) {
                                o = parseFloat(e)
                            }
                        }
                    });
                    return this
                };
                var O = function t(e, r, n, i, a, o) {
                    var s = [];
                    Object.defineProperty(this, "sx", {
                        get: function t() {
                            return s[0]
                        },
                        set: function t(e) {
                            s[0] = Math.round(e * 1e5) / 1e5
                        }
                    });
                    Object.defineProperty(this, "shy", {
                        get: function t() {
                            return s[1]
                        },
                        set: function t(e) {
                            s[1] = Math.round(e * 1e5) / 1e5
                        }
                    });
                    Object.defineProperty(this, "shx", {
                        get: function t() {
                            return s[2]
                        },
                        set: function t(e) {
                            s[2] = Math.round(e * 1e5) / 1e5
                        }
                    });
                    Object.defineProperty(this, "sy", {
                        get: function t() {
                            return s[3]
                        },
                        set: function t(e) {
                            s[3] = Math.round(e * 1e5) / 1e5
                        }
                    });
                    Object.defineProperty(this, "tx", {
                        get: function t() {
                            return s[4]
                        },
                        set: function t(e) {
                            s[4] = Math.round(e * 1e5) / 1e5
                        }
                    });
                    Object.defineProperty(this, "ty", {
                        get: function t() {
                            return s[5]
                        },
                        set: function t(e) {
                            s[5] = Math.round(e * 1e5) / 1e5
                        }
                    });
                    Object.defineProperty(this, "rotation", {
                        get: function t() {
                            return Math.atan2(this.shx, this.sx)
                        }
                    });
                    Object.defineProperty(this, "scaleX", {
                        get: function t() {
                            return this.decompose().scale.sx
                        }
                    });
                    Object.defineProperty(this, "scaleY", {
                        get: function t() {
                            return this.decompose().scale.sy
                        }
                    });
                    Object.defineProperty(this, "isIdentity", {
                        get: function t() {
                            if (this.sx !== 1) {
                                return false
                            }
                            if (this.shy !== 0) {
                                return false
                            }
                            if (this.shx !== 0) {
                                return false
                            }
                            if (this.sy !== 1) {
                                return false
                            }
                            if (this.tx !== 0) {
                                return false
                            }
                            if (this.ty !== 0) {
                                return false
                            }
                            return true
                        }
                    });
                    this.sx = !isNaN(e) ? e : 1;
                    this.shy = !isNaN(r) ? r : 0;
                    this.shx = !isNaN(n) ? n : 0;
                    this.sy = !isNaN(i) ? i : 1;
                    this.tx = !isNaN(a) ? a : 0;
                    this.ty = !isNaN(o) ? o : 0;
                    return this
                };
                O.prototype.multiply = function(t) {
                    var e = t.sx * this.sx + t.shy * this.shx;
                    var r = t.sx * this.shy + t.shy * this.sy;
                    var n = t.shx * this.sx + t.sy * this.shx;
                    var i = t.shx * this.shy + t.sy * this.sy;
                    var a = t.tx * this.sx + t.ty * this.shx + this.tx;
                    var o = t.tx * this.shy + t.ty * this.sy + this.ty;
                    return new O(e,r,n,i,a,o)
                }
                ;
                O.prototype.decompose = function() {
                    var t = this.sx;
                    var e = this.shy;
                    var r = this.shx;
                    var n = this.sy;
                    var i = this.tx;
                    var a = this.ty;
                    var o = Math.sqrt(t * t + e * e);
                    t /= o;
                    e /= o;
                    var s = t * r + e * n;
                    r -= t * s;
                    n -= e * s;
                    var f = Math.sqrt(r * r + n * n);
                    r /= f;
                    n /= f;
                    s /= f;
                    if (t * n < e * r) {
                        t = -t;
                        e = -e;
                        s = -s;
                        o = -o
                    }
                    return {
                        scale: new O(o,0,0,f,0,0),
                        translate: new O(1,0,0,1,i,a),
                        rotate: new O(t,e,-e,t,0,0),
                        skew: new O(1,0,s,1,0,0)
                    }
                }
                ;
                O.prototype.applyToPoint = function(t) {
                    var e = t.x * this.sx + t.y * this.shx + this.tx;
                    var r = t.x * this.shy + t.y * this.sy + this.ty;
                    return new E(e,r)
                }
                ;
                O.prototype.applyToRectangle = function(t) {
                    var e = this.applyToPoint(t);
                    var r = this.applyToPoint(new E(t.x + t.w,t.y + t.h));
                    return new M(e.x,e.y,r.x - e.x,r.y - e.y)
                }
                ;
                O.prototype.clone = function() {
                    var t = this.sx;
                    var e = this.shy;
                    var r = this.shx;
                    var n = this.sy;
                    var i = this.tx;
                    var a = this.ty;
                    return new O(t,e,r,n,i,a)
                }
            }
            )(e.API, typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || Function('return typeof this === "object" && this.content')() || Function("return this")());
            /**
     * jsPDF filters PlugIn
     * Copyright (c) 2014 Aras Abbasi 
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                var e = function t(e) {
                    var r, n, i, a, o, s, f, u, l, h;
                    for (!/[^\x00-\xFF]/.test(e),
                    r = "\0\0\0\0".slice(e.length % 4 || 4),
                    e += r,
                    n = [],
                    i = 0,
                    a = e.length; a > i; i += 4) {
                        o = (e.charCodeAt(i) << 24) + (e.charCodeAt(i + 1) << 16) + (e.charCodeAt(i + 2) << 8) + e.charCodeAt(i + 3),
                        0 !== o ? (h = o % 85,
                        o = (o - h) / 85,
                        l = o % 85,
                        o = (o - l) / 85,
                        u = o % 85,
                        o = (o - u) / 85,
                        f = o % 85,
                        o = (o - f) / 85,
                        s = o % 85,
                        n.push(s + 33, f + 33, u + 33, l + 33, h + 33)) : n.push(122)
                    }
                    return function(t, e) {
                        for (var r = e; r > 0; r--) {
                            t.pop()
                        }
                    }(n, r.length),
                    String.fromCharCode.apply(String, n) + "~>"
                };
                var r = function t(e) {
                    var r, n, i, a, o, s = String, f = "length", u = 255, l = "charCodeAt", h = "slice", c = "replace";
                    for ("~>" === e[h](-2),
                    e = e[h](0, -2)[c](/\s/g, "")[c]("z", "!!!!!"),
                    r = "uuuuu"[h](e[f] % 5 || 5),
                    e += r,
                    i = [],
                    a = 0,
                    o = e[f]; o > a; a += 5) {
                        n = 52200625 * (e[l](a) - 33) + 614125 * (e[l](a + 1) - 33) + 7225 * (e[l](a + 2) - 33) + 85 * (e[l](a + 3) - 33) + (e[l](a + 4) - 33),
                        i.push(u & n >> 24, u & n >> 16, u & n >> 8, u & n)
                    }
                    return function(t, e) {
                        for (var r = e; r > 0; r--) {
                            t.pop()
                        }
                    }(i, r[f]),
                    s.fromCharCode.apply(s, i)
                };
                var n = function t(e) {
                    var r = "";
                    var n;
                    for (var n = 0; n < e.length; n += 1) {
                        r += ("0" + e.charCodeAt(n).toString(16)).slice(-2)
                    }
                    r += ">";
                    return r
                };
                var i = function t(e) {
                    var r = new RegExp(/^([0-9A-Fa-f]{2})+$/);
                    e = e.replace(/\s/g, "");
                    if (e.indexOf(">") !== -1) {
                        e = e.substr(0, e.indexOf(">"))
                    }
                    if (e.length % 2) {
                        e += "0"
                    }
                    if (r.test(e) === false) {
                        return ""
                    }
                    var n = "";
                    var i;
                    for (var i = 0; i < e.length; i += 2) {
                        n += String.fromCharCode("0x" + (e[i] + e[i + 1]))
                    }
                    return n
                };
                var a = function e(r, n) {
                    n = Object.assign({
                        predictor: 1,
                        colors: 1,
                        bitsPerComponent: 8,
                        columns: 1
                    }, n);
                    var i = [];
                    var a = r.length;
                    var o;
                    var s;
                    while (a--) {
                        i[a] = r.charCodeAt(a)
                    }
                    o = t.adler32cs.from(r);
                    s = new Deflater(6);
                    s.append(new Uint8Array(i));
                    r = s.flush();
                    i = new Uint8Array(r.length + 6);
                    i.set(new Uint8Array([120, 156])),
                    i.set(r, 2);
                    i.set(new Uint8Array([o & 255, o >> 8 & 255, o >> 16 & 255, o >> 24 & 255]), r.length + 2);
                    r = String.fromCharCode.apply(null, i);
                    return r
                };
                t.processDataByFilters = function(t, o) {
                    var s = 0;
                    var f = t || "";
                    var u = [];
                    o = o || [];
                    if (typeof o === "string") {
                        o = [o]
                    }
                    for (s = 0; s < o.length; s += 1) {
                        switch (o[s]) {
                        case "ASCII85Decode":
                        case "/ASCII85Decode":
                            f = r(f);
                            u.push("/ASCII85Encode");
                            break;
                        case "ASCII85Encode":
                        case "/ASCII85Encode":
                            f = e(f);
                            u.push("/ASCII85Decode");
                            break;
                        case "ASCIIHexDecode":
                        case "/ASCIIHexDecode":
                            f = i(f);
                            u.push("/ASCIIHexEncode");
                            break;
                        case "ASCIIHexEncode":
                        case "/ASCIIHexEncode":
                            f = n(f);
                            u.push("/ASCIIHexDecode");
                            break;
                        case "FlateEncode":
                        case "/FlateEncode":
                            f = a(f);
                            u.push("/FlateDecode");
                            break;
                        default:
                            throw 'The filter: "' + o[s] + '" is not implemented'
                        }
                    }
                    return {
                        data: f,
                        reverseChain: u.reverse().join(" ")
                    }
                }
            }
            )(e.API);
            /**
     * jsPDF fileloading PlugIn
     * Copyright (c) 2018 Aras Abbasi (aras.abbasi@gmail.com)
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                t.loadFile = function(t, e, r) {
                    e = e || true;
                    r = r || function() {}
                    ;
                    var n;
                    var i = function t(e, r, n) {
                        var i = new XMLHttpRequest;
                        var a = [];
                        var o = 0;
                        var s = function t(e) {
                            var r = e.length;
                            var n = String.fromCharCode;
                            for (o = 0; o < r; o += 1) {
                                a.push(n(e.charCodeAt(o) & 255))
                            }
                            return a.join("")
                        };
                        i.open("GET", e, !r);
                        i.overrideMimeType("text/plain; charset=x-user-defined");
                        if (r === false) {
                            i.onload = function() {
                                return s(this.responseText)
                            }
                        }
                        i.send(null);
                        if (i.status !== 200) {
                            console.warn('Unable to load file "' + e + '"');
                            return
                        }
                        if (r) {
                            return s(i.responseText)
                        }
                    };
                    try {
                        n = i(t, e, r)
                    } catch (t) {
                        n = undefined
                    }
                    return n
                }
                ;
                t.loadImageFile = t.loadFile
            }
            )(e.API);
            /**
     * Copyright (c) 2018 Erik Koopmans
     * Released under the MIT License.
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(r, n) {
                var i = function e(r) {
                    var n = t(r);
                    if (n === "undefined")
                        return "undefined";
                    else if (n === "string" || r instanceof String)
                        return "string";
                    else if (n === "number" || r instanceof Number)
                        return "number";
                    else if (n === "function" || r instanceof Function)
                        return "function";
                    else if (!!r && r.constructor === Array)
                        return "array";
                    else if (r && r.nodeType === 1)
                        return "element";
                    else if (n === "object")
                        return "object";
                    else
                        return "unknown"
                };
                var a = function t(e, r) {
                    var n = document.createElement(e);
                    if (r.className)
                        n.className = r.className;
                    if (r.innerHTML) {
                        n.innerHTML = r.innerHTML;
                        var i = n.getElementsByTagName("script");
                        for (var a = i.length; a-- > 0; null) {
                            i[a].parentNode.removeChild(i[a])
                        }
                    }
                    for (var o in r.style) {
                        n.style[o] = r.style[o]
                    }
                    return n
                };
                var o = function t(e, r) {
                    var n = e.nodeType === 3 ? document.createTextNode(e.nodeValue) : e.cloneNode(false);
                    for (var i = e.firstChild; i; i = i.nextSibling) {
                        if (r === true || i.nodeType !== 1 || i.nodeName !== "SCRIPT") {
                            n.appendChild(t(i, r))
                        }
                    }
                    if (e.nodeType === 1) {
                        if (e.nodeName === "CANVAS") {
                            n.width = e.width;
                            n.height = e.height;
                            n.getContext("2d").drawImage(e, 0, 0)
                        } else if (e.nodeName === "TEXTAREA" || e.nodeName === "SELECT") {
                            n.value = e.value
                        }
                        n.addEventListener("load", function() {
                            n.scrollTop = e.scrollTop;
                            n.scrollLeft = e.scrollLeft
                        }, true)
                    }
                    return n
                };
                var s = function t(e) {
                    var r = Object.assign(t.convert(Promise.resolve()), JSON.parse(JSON.stringify(t.template)));
                    var n = t.convert(Promise.resolve(), r);
                    n = n.setProgress(1, t, 1, [t]);
                    n = n.set(e);
                    return n
                };
                s.prototype = Object.create(Promise.prototype);
                s.prototype.constructor = s;
                s.convert = function t(e, r) {
                    e.__proto__ = r || s.prototype;
                    return e
                }
                ;
                s.template = {
                    prop: {
                        src: null,
                        container: null,
                        overlay: null,
                        canvas: null,
                        img: null,
                        pdf: null,
                        pageSize: null,
                        callback: function t() {}
                    },
                    progress: {
                        val: 0,
                        state: null,
                        n: 0,
                        stack: []
                    },
                    opt: {
                        filename: "file.pdf",
                        margin: [0, 0, 0, 0],
                        enableLinks: true,
                        x: 0,
                        y: 0,
                        html2canvas: {},
                        jsPDF: {}
                    }
                };
                s.prototype.from = function t(e, r) {
                    function n(t) {
                        switch (i(t)) {
                        case "string":
                            return "string";
                        case "element":
                            return t.nodeName.toLowerCase === "canvas" ? "canvas" : "element";
                        default:
                            return "unknown"
                        }
                    }
                    return this.then(function t() {
                        r = r || n(e);
                        switch (r) {
                        case "string":
                            return this.set({
                                src: a("div", {
                                    innerHTML: e
                                })
                            });
                        case "element":
                            return this.set({
                                src: e
                            });
                        case "canvas":
                            return this.set({
                                canvas: e
                            });
                        case "img":
                            return this.set({
                                img: e
                            });
                        default:
                            return this.error("Unknown source type.")
                        }
                    })
                }
                ;
                s.prototype.to = function t(e) {
                    switch (e) {
                    case "container":
                        return this.toContainer();
                    case "canvas":
                        return this.toCanvas();
                    case "img":
                        return this.toImg();
                    case "pdf":
                        return this.toPdf();
                    default:
                        return this.error("Invalid target.")
                    }
                }
                ;
                s.prototype.toContainer = function t() {
                    var e = [function t() {
                        return this.prop.src || this.error("Cannot duplicate - no source HTML.")
                    }
                    , function t() {
                        return this.prop.pageSize || this.setPageSize()
                    }
                    ];
                    return this.thenList(e).then(function t() {
                        var e = {
                            position: "fixed",
                            overflow: "hidden",
                            zIndex: 1e3,
                            left: "-100000px",
                            right: 0,
                            bottom: 0,
                            top: 0
                        };
                        var r = {
                            position: "relative",
                            display: "inline-block",
                            width: Math.max(this.prop.src.clientWidth, this.prop.src.scrollWidth, this.prop.src.offsetWidth) + "px",
                            left: 0,
                            right: 0,
                            top: 0,
                            margin: "auto",
                            backgroundColor: "white"
                        };
                        var n = o(this.prop.src, this.opt.html2canvas.javascriptEnabled);
                        if (n.tagName === "BODY") {
                            r.height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) + "px"
                        }
                        this.prop.overlay = a("div", {
                            className: "html2pdf__overlay",
                            style: e
                        });
                        this.prop.container = a("div", {
                            className: "html2pdf__container",
                            style: r
                        });
                        this.prop.container.appendChild(n);
                        this.prop.container.firstChild.appendChild(a("div", {
                            style: {
                                clear: "both",
                                border: "0 none transparent",
                                margin: 0,
                                padding: 0,
                                height: 0
                            }
                        }));
                        this.prop.container.style.float = "none";
                        this.prop.overlay.appendChild(this.prop.container);
                        document.body.appendChild(this.prop.overlay);
                        this.prop.container.firstChild.style.position = "relative";
                        this.prop.container.height = Math.max(this.prop.container.firstChild.clientHeight, this.prop.container.firstChild.scrollHeight, this.prop.container.firstChild.offsetHeight) + "px"
                    })
                }
                ;
                s.prototype.toCanvas = function t() {
                    var e = [function t() {
                        return document.body.contains(this.prop.container) || this.toContainer()
                    }
                    ];
                    return this.thenList(e).then(function t() {
                        var e = Object.assign({}, this.opt.html2canvas);
                        delete e.onrendered;
                        if (!this.isHtml2CanvasLoaded()) {
                            return
                        }
                        return html2canvas(this.prop.container, e)
                    }).then(function t(e) {
                        var r = this.opt.html2canvas.onrendered || function() {}
                        ;
                        r(e);
                        this.prop.canvas = e;
                        document.body.removeChild(this.prop.overlay)
                    })
                }
                ;
                s.prototype.toContext2d = function t() {
                    var e = [function t() {
                        return document.body.contains(this.prop.container) || this.toContainer()
                    }
                    ];
                    return this.thenList(e).then(function t() {
                        var e = this.opt.jsPDF;
                        var r = Object.assign({
                            async: true,
                            allowTaint: true,
                            backgroundColor: "#ffffff",
                            imageTimeout: 15e3,
                            logging: true,
                            proxy: null,
                            removeContainer: true,
                            foreignObjectRendering: false,
                            useCORS: false
                        }, this.opt.html2canvas);
                        delete r.onrendered;
                        e.context2d.autoPaging = true;
                        e.context2d.posX = this.opt.x;
                        e.context2d.posY = this.opt.y;
                        r.windowHeight = r.windowHeight || 0;
                        r.windowHeight = r.windowHeight == 0 ? Math.max(this.prop.container.clientHeight, this.prop.container.scrollHeight, this.prop.container.offsetHeight) : r.windowHeight;
                        if (!this.isHtml2CanvasLoaded()) {
                            return
                        }
                        return html2canvas(this.prop.container, r)
                    }).then(function t(e) {
                        var r = this.opt.html2canvas.onrendered || function() {}
                        ;
                        r(e);
                        this.prop.canvas = e;
                        document.body.removeChild(this.prop.overlay)
                    })
                }
                ;
                s.prototype.toImg = function t() {
                    var e = [function t() {
                        return this.prop.canvas || this.toCanvas()
                    }
                    ];
                    return this.thenList(e).then(function t() {
                        var e = this.prop.canvas.toDataURL("image/" + this.opt.image.type, this.opt.image.quality);
                        this.prop.img = document.createElement("img");
                        this.prop.img.src = e
                    })
                }
                ;
                s.prototype.toPdf = function t() {
                    var e = [function t() {
                        return this.toContext2d()
                    }
                    ];
                    return this.thenList(e).then(function t() {
                        this.prop.pdf = this.prop.pdf || this.opt.jsPDF
                    })
                }
                ;
                s.prototype.output = function t(e, r, n) {
                    n = n || "pdf";
                    if (n.toLowerCase() === "img" || n.toLowerCase() === "image") {
                        return this.outputImg(e, r)
                    } else {
                        return this.outputPdf(e, r)
                    }
                }
                ;
                s.prototype.outputPdf = function t(e, r) {
                    var n = [function t() {
                        return this.prop.pdf || this.toPdf()
                    }
                    ];
                    return this.thenList(n).then(function t() {
                        return this.prop.pdf.output(e, r)
                    })
                }
                ;
                s.prototype.outputImg = function t(e, r) {
                    var n = [function t() {
                        return this.prop.img || this.toImg()
                    }
                    ];
                    return this.thenList(n).then(function t() {
                        switch (e) {
                        case undefined:
                        case "img":
                            return this.prop.img;
                        case "datauristring":
                        case "dataurlstring":
                            return this.prop.img.src;
                        case "datauri":
                        case "dataurl":
                            return document.location.href = this.prop.img.src;
                        default:
                            throw 'Image output type "' + e + '" is not supported.'
                        }
                    })
                }
                ;
                s.prototype.isHtml2CanvasLoaded = function() {
                    var t = typeof n.html2canvas !== "undefined";
                    if (!t) {
                        console.error("html2canvas not loaded.")
                    }
                    return t
                }
                ;
                s.prototype.save = function t(e) {
                    var r = [function t() {
                        return this.prop.pdf || this.toPdf()
                    }
                    ];
                    if (!this.isHtml2CanvasLoaded()) {
                        return
                    }
                    return this.thenList(r).set(e ? {
                        filename: e
                    } : null).then(function t() {
                        this.prop.pdf.save(this.opt.filename)
                    })
                }
                ;
                s.prototype.doCallback = function t(e) {
                    var r = [function t() {
                        return this.prop.pdf || this.toPdf()
                    }
                    ];
                    if (!this.isHtml2CanvasLoaded()) {
                        return
                    }
                    return this.thenList(r).then(function t() {
                        this.prop.callback(this.prop.pdf)
                    })
                }
                ;
                s.prototype.set = function t(e) {
                    if (i(e) !== "object") {
                        return this
                    }
                    var r = Object.keys(e || {}).map(function(t) {
                        if (t in s.template.prop) {
                            return function r() {
                                this.prop[t] = e[t]
                            }
                        } else {
                            switch (t) {
                            case "margin":
                                return this.setMargin.bind(this, e.margin);
                            case "jsPDF":
                                return function t() {
                                    this.opt.jsPDF = e.jsPDF;
                                    return this.setPageSize()
                                }
                                ;
                            case "pageSize":
                                return this.setPageSize.bind(this, e.pageSize);
                            default:
                                return function r() {
                                    this.opt[t] = e[t]
                                }
                            }
                        }
                    }, this);
                    return this.then(function t() {
                        return this.thenList(r)
                    })
                }
                ;
                s.prototype.get = function t(e, r) {
                    return this.then(function t() {
                        var n = e in s.template.prop ? this.prop[e] : this.opt[e];
                        return r ? r(n) : n
                    })
                }
                ;
                s.prototype.setMargin = function t(e) {
                    return this.then(function t() {
                        switch (i(e)) {
                        case "number":
                            e = [e, e, e, e];
                        case "array":
                            if (e.length === 2) {
                                e = [e[0], e[1], e[0], e[1]]
                            }
                            if (e.length === 4) {
                                break
                            }
                        default:
                            return this.error("Invalid margin array.")
                        }
                        this.opt.margin = e
                    }).then(this.setPageSize)
                }
                ;
                s.prototype.setPageSize = function t(r) {
                    function n(t, e) {
                        return Math.floor(t * e / 72 * 96)
                    }
                    return this.then(function t() {
                        r = r || e.getPageSize(this.opt.jsPDF);
                        if (!r.hasOwnProperty("inner")) {
                            r.inner = {
                                width: r.width - this.opt.margin[1] - this.opt.margin[3],
                                height: r.height - this.opt.margin[0] - this.opt.margin[2]
                            };
                            r.inner.px = {
                                width: n(r.inner.width, r.k),
                                height: n(r.inner.height, r.k)
                            };
                            r.inner.ratio = r.inner.height / r.inner.width
                        }
                        this.prop.pageSize = r
                    })
                }
                ;
                s.prototype.setProgress = function t(e, r, n, i) {
                    if (e != null)
                        this.progress.val = e;
                    if (r != null)
                        this.progress.state = r;
                    if (n != null)
                        this.progress.n = n;
                    if (i != null)
                        this.progress.stack = i;
                    this.progress.ratio = this.progress.val / this.progress.state;
                    return this
                }
                ;
                s.prototype.updateProgress = function t(e, r, n, i) {
                    return this.setProgress(e ? this.progress.val + e : null, r ? r : null, n ? this.progress.n + n : null, i ? this.progress.stack.concat(i) : null)
                }
                ;
                s.prototype.then = function t(e, r) {
                    var n = this;
                    return this.thenCore(e, r, function t(e, r) {
                        n.updateProgress(null, null, 1, [e]);
                        return Promise.prototype.then.call(this, function t(r) {
                            n.updateProgress(null, e);
                            return r
                        }).then(e, r).then(function t(e) {
                            n.updateProgress(1);
                            return e
                        })
                    })
                }
                ;
                s.prototype.thenCore = function t(e, r, n) {
                    n = n || Promise.prototype.then;
                    var i = this;
                    if (e) {
                        e = e.bind(i)
                    }
                    if (r) {
                        r = r.bind(i)
                    }
                    var a = Promise.toString().indexOf("[native code]") !== -1 && Promise.name === "Promise";
                    var o = a ? i : s.convert(Object.assign({}, i), Promise.prototype);
                    var f = n.call(o, e, r);
                    return s.convert(f, i.__proto__)
                }
                ;
                s.prototype.thenExternal = function t(e, r) {
                    return Promise.prototype.then.call(this, e, r)
                }
                ;
                s.prototype.thenList = function t(e) {
                    var r = this;
                    e.forEach(function t(e) {
                        r = r.thenCore(e)
                    });
                    return r
                }
                ;
                s.prototype["catch"] = function(t) {
                    if (t) {
                        t = t.bind(this)
                    }
                    var e = Promise.prototype["catch"].call(this, t);
                    return s.convert(e, this)
                }
                ;
                s.prototype.catchExternal = function t(e) {
                    return Promise.prototype["catch"].call(this, e)
                }
                ;
                s.prototype.error = function t(e) {
                    return this.then(function t() {
                        throw new Error(e)
                    })
                }
                ;
                s.prototype.using = s.prototype.set;
                s.prototype.saveAs = s.prototype.save;
                s.prototype.export = s.prototype.output;
                s.prototype.run = s.prototype.then;
                e.getPageSize = function(e, r, n) {
                    if (t(e) === "object") {
                        var i = e;
                        e = i.orientation;
                        r = i.unit || r;
                        n = i.format || n
                    }
                    r = r || "mm";
                    n = n || "a4";
                    e = ("" + (e || "P")).toLowerCase();
                    var a = ("" + n).toLowerCase();
                    var o = {
                        a0: [2383.94, 3370.39],
                        a1: [1683.78, 2383.94],
                        a2: [1190.55, 1683.78],
                        a3: [841.89, 1190.55],
                        a4: [595.28, 841.89],
                        a5: [419.53, 595.28],
                        a6: [297.64, 419.53],
                        a7: [209.76, 297.64],
                        a8: [147.4, 209.76],
                        a9: [104.88, 147.4],
                        a10: [73.7, 104.88],
                        b0: [2834.65, 4008.19],
                        b1: [2004.09, 2834.65],
                        b2: [1417.32, 2004.09],
                        b3: [1000.63, 1417.32],
                        b4: [708.66, 1000.63],
                        b5: [498.9, 708.66],
                        b6: [354.33, 498.9],
                        b7: [249.45, 354.33],
                        b8: [175.75, 249.45],
                        b9: [124.72, 175.75],
                        b10: [87.87, 124.72],
                        c0: [2599.37, 3676.54],
                        c1: [1836.85, 2599.37],
                        c2: [1298.27, 1836.85],
                        c3: [918.43, 1298.27],
                        c4: [649.13, 918.43],
                        c5: [459.21, 649.13],
                        c6: [323.15, 459.21],
                        c7: [229.61, 323.15],
                        c8: [161.57, 229.61],
                        c9: [113.39, 161.57],
                        c10: [79.37, 113.39],
                        dl: [311.81, 623.62],
                        letter: [612, 792],
                        "government-letter": [576, 756],
                        legal: [612, 1008],
                        "junior-legal": [576, 360],
                        ledger: [1224, 792],
                        tabloid: [792, 1224],
                        "credit-card": [153, 243]
                    };
                    switch (r) {
                    case "pt":
                        var s = 1;
                        break;
                    case "mm":
                        var s = 72 / 25.4;
                        break;
                    case "cm":
                        var s = 72 / 2.54;
                        break;
                    case "in":
                        var s = 72;
                        break;
                    case "px":
                        var s = 72 / 96;
                        break;
                    case "pc":
                        var s = 12;
                        break;
                    case "em":
                        var s = 12;
                        break;
                    case "ex":
                        var s = 6;
                        break;
                    default:
                        throw "Invalid unit: " + r
                    }
                    if (o.hasOwnProperty(a)) {
                        var f = o[a][1] / s;
                        var u = o[a][0] / s
                    } else {
                        try {
                            var f = n[1];
                            var u = n[0]
                        } catch (t) {
                            throw new Error("Invalid format: " + n)
                        }
                    }
                    if (e === "p" || e === "portrait") {
                        e = "p";
                        if (u > f) {
                            var l = u;
                            u = f;
                            f = l
                        }
                    } else if (e === "l" || e === "landscape") {
                        e = "l";
                        if (f > u) {
                            var l = u;
                            u = f;
                            f = l
                        }
                    } else {
                        throw "Invalid orientation: " + e
                    }
                    var h = {
                        width: u,
                        height: f,
                        unit: r,
                        k: s
                    };
                    return h
                }
                ;
                r.html = function(t, e) {
                    e = e || {};
                    e.callback = e.callback || function() {}
                    ;
                    e.html2canvas = e.html2canvas || {};
                    e.html2canvas.canvas = e.html2canvas.canvas || this.canvas;
                    e.jsPDF = e.jsPDF || this;
                    var r = e.jsPDF;
                    var n = new s(e);
                    if (!e.worker) {
                        return n.from(t).doCallback()
                    } else {
                        return n
                    }
                    return this
                }
            }
            )(e.API, typeof window !== "undefined" && window || typeof global !== "undefined" && global);
            /**
     * @license
     * ==================================================================== 
     * Copyright (c) 2013 Youssef Beddad, youssef.beddad@gmail.com
     * 
     * 
     * ====================================================================
     */
            (function(t) {
                var e, r, n;
                t.addJS = function(t) {
                    n = t;
                    this.internal.events.subscribe("postPutResources", function(t) {
                        e = this.internal.newObject();
                        this.internal.out("<<");
                        this.internal.out("/Names [(EmbeddedJS) " + (e + 1) + " 0 R]");
                        this.internal.out(">>");
                        this.internal.out("endobj");
                        r = this.internal.newObject();
                        this.internal.out("<<");
                        this.internal.out("/S /JavaScript");
                        this.internal.out("/JS (" + n + ")");
                        this.internal.out(">>");
                        this.internal.out("endobj")
                    });
                    this.internal.events.subscribe("putCatalog", function() {
                        if (e !== undefined && r !== undefined) {
                            this.internal.out("/Names <</JavaScript " + e + " 0 R>>")
                        }
                    });
                    return this
                }
            }
            )(e.API);
            /**
     * @license
     * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                t.events.push(["postPutResources", function() {
                    var t = this;
                    var e = /^(\d+) 0 obj$/;
                    if (this.outline.root.children.length > 0) {
                        var r = t.outline.render().split(/\r\n/);
                        for (var n = 0; n < r.length; n++) {
                            var i = r[n];
                            var a = e.exec(i);
                            if (a != null) {
                                var o = a[1];
                                t.internal.newObjectDeferredBegin(o, false)
                            }
                            t.internal.write(i)
                        }
                    }
                    if (this.outline.createNamedDestinations) {
                        var s = this.internal.pages.length;
                        var f = [];
                        for (var n = 0; n < s; n++) {
                            var u = t.internal.newObject();
                            f.push(u);
                            var l = t.internal.getPageInfo(n + 1);
                            t.internal.write("<< /D[" + l.objId + " 0 R /XYZ null null null]>> endobj")
                        }
                        var h = t.internal.newObject();
                        t.internal.write("<< /Names [ ");
                        for (var n = 0; n < f.length; n++) {
                            t.internal.write("(page_" + (n + 1) + ")" + f[n] + " 0 R")
                        }
                        t.internal.write(" ] >>", "endobj");
                        var c = t.internal.newObject();
                        t.internal.write("<< /Dests " + h + " 0 R");
                        t.internal.write(">>", "endobj")
                    }
                }
                ]);
                t.events.push(["putCatalog", function() {
                    var t = this;
                    if (t.outline.root.children.length > 0) {
                        t.internal.write("/Outlines", this.outline.makeRef(this.outline.root));
                        if (this.outline.createNamedDestinations) {
                            t.internal.write("/Names " + namesOid + " 0 R")
                        }
                    }
                }
                ]);
                t.events.push(["initialized", function() {
                    var t = this;
                    t.outline = {
                        createNamedDestinations: false,
                        root: {
                            children: []
                        }
                    };
                    t.outline.add = function(t, e, r) {
                        var n = {
                            title: e,
                            options: r,
                            children: []
                        };
                        if (t == null) {
                            t = this.root
                        }
                        t.children.push(n);
                        return n
                    }
                    ;
                    t.outline.render = function() {
                        this.ctx = {};
                        this.ctx.val = "";
                        this.ctx.pdf = t;
                        this.genIds_r(this.root);
                        this.renderRoot(this.root);
                        this.renderItems(this.root);
                        return this.ctx.val
                    }
                    ;
                    t.outline.genIds_r = function(e) {
                        e.id = t.internal.newObjectDeferred();
                        for (var r = 0; r < e.children.length; r++) {
                            this.genIds_r(e.children[r])
                        }
                    }
                    ;
                    t.outline.renderRoot = function(t) {
                        this.objStart(t);
                        this.line("/Type /Outlines");
                        if (t.children.length > 0) {
                            this.line("/First " + this.makeRef(t.children[0]));
                            this.line("/Last " + this.makeRef(t.children[t.children.length - 1]))
                        }
                        this.line("/Count " + this.count_r({
                            count: 0
                        }, t));
                        this.objEnd()
                    }
                    ;
                    t.outline.renderItems = function(e) {
                        var r = this.ctx.pdf.internal.getCoordinateString;
                        var n = this.ctx.pdf.internal.getVerticalCoordinateString;
                        for (var i = 0; i < e.children.length; i++) {
                            var a = e.children[i];
                            this.objStart(a);
                            this.line("/Title " + this.makeString(a.title));
                            this.line("/Parent " + this.makeRef(e));
                            if (i > 0) {
                                this.line("/Prev " + this.makeRef(e.children[i - 1]))
                            }
                            if (i < e.children.length - 1) {
                                this.line("/Next " + this.makeRef(e.children[i + 1]))
                            }
                            if (a.children.length > 0) {
                                this.line("/First " + this.makeRef(a.children[0]));
                                this.line("/Last " + this.makeRef(a.children[a.children.length - 1]))
                            }
                            var o = this.count = this.count_r({
                                count: 0
                            }, a);
                            if (o > 0) {
                                this.line("/Count " + o)
                            }
                            if (a.options) {
                                if (a.options.pageNumber) {
                                    var s = t.internal.getPageInfo(a.options.pageNumber);
                                    this.line("/Dest " + "[" + s.objId + " 0 R /XYZ 0 " + n(0) + " 0]")
                                }
                            }
                            this.objEnd()
                        }
                        for (var i = 0; i < e.children.length; i++) {
                            var a = e.children[i];
                            this.renderItems(a)
                        }
                    }
                    ;
                    t.outline.line = function(t) {
                        this.ctx.val += t + "\r\n"
                    }
                    ;
                    t.outline.makeRef = function(t) {
                        return t.id + " 0 R"
                    }
                    ;
                    t.outline.makeString = function(e) {
                        return "(" + t.internal.pdfEscape(e) + ")"
                    }
                    ;
                    t.outline.objStart = function(t) {
                        this.ctx.val += "\r\n" + t.id + " 0 obj" + "\r\n<<\r\n"
                    }
                    ;
                    t.outline.objEnd = function(t) {
                        this.ctx.val += ">> \r\n" + "endobj" + "\r\n"
                    }
                    ;
                    t.outline.count_r = function(t, e) {
                        for (var r = 0; r < e.children.length; r++) {
                            t.count++;
                            this.count_r(t, e.children[r])
                        }
                        return t.count
                    }
                }
                ]);
                return this
            }
            )(e.API);
            /**
     * @license
     * 
     * Copyright (c) 2014 James Robb, https://github.com/jamesbrobb
     *
     * 
     * ====================================================================
     */
            (function(t) {
                var e = function t() {
                    return typeof PNG !== "function" || typeof l !== "function"
                }
                  , r = function e(r) {
                    return r !== t.image_compression.NONE && n()
                }
                  , n = function t() {
                    var e = typeof Deflater === "function";
                    if (!e)
                        throw new Error("requires deflate.js for compression");
                    return e
                }
                  , i = function e(r, n, i, f) {
                    var l = 5
                      , p = h;
                    switch (f) {
                    case t.image_compression.FAST:
                        l = 3;
                        p = u;
                        break;
                    case t.image_compression.MEDIUM:
                        l = 6;
                        p = c;
                        break;
                    case t.image_compression.SLOW:
                        l = 9;
                        p = d;
                        break
                    }
                    r = s(r, n, i, p);
                    var v = new Uint8Array(a(l));
                    var g = o(r);
                    var m = new Deflater(l);
                    var y = m.append(r);
                    var w = m.flush();
                    var b = v.length + y.length + w.length;
                    var x = new Uint8Array(b + 4);
                    x.set(v);
                    x.set(y, v.length);
                    x.set(w, v.length + y.length);
                    x[b++] = g >>> 24 & 255;
                    x[b++] = g >>> 16 & 255;
                    x[b++] = g >>> 8 & 255;
                    x[b++] = g & 255;
                    return t.arrayBufferToBinaryString(x)
                }
                  , a = function t(e, r) {
                    var n = 8;
                    var i = Math.LOG2E * Math.log(32768) - 8;
                    var a = i << 4 | n;
                    var o = a << 8;
                    var s = Math.min(3, (r - 1 & 255) >> 1);
                    o |= s << 6;
                    o |= 0;
                    o += 31 - o % 31;
                    return [a, o & 255 & 255]
                }
                  , o = function t(e, r) {
                    var n = 1;
                    var i = n & 65535
                      , a = n >>> 16 & 65535;
                    var o = e.length;
                    var s;
                    var f = 0;
                    while (o > 0) {
                        s = o > r ? r : o;
                        o -= s;
                        do {
                            i += e[f++];
                            a += i
                        } while (--s);
                        i %= 65521;
                        a %= 65521
                    }
                    return (a << 16 | i) >>> 0
                }
                  , s = function t(e, r, n, i) {
                    var a = e.length / r, o = new Uint8Array(e.length + a), s = v(), f = 0, u, l, h;
                    for (; f < a; f++) {
                        h = f * r;
                        u = e.subarray(h, h + r);
                        if (i) {
                            o.set(i(u, n, l), h + f)
                        } else {
                            var c = 0
                              , d = s.length
                              , p = [];
                            for (; c < d; c++) {
                                p[c] = s[c](u, n, l)
                            }
                            var m = g(p.concat());
                            o.set(p[m], h + f)
                        }
                        l = u
                    }
                    return o
                }
                  , f = function t(e, r, n) {
                    var i = Array.apply([], e);
                    i.unshift(0);
                    return i
                }
                  , u = function t(e, r, n) {
                    var i = [], a = 0, o = e.length, s;
                    i[0] = 1;
                    for (; a < o; a++) {
                        s = e[a - r] || 0;
                        i[a + 1] = e[a] - s + 256 & 255
                    }
                    return i
                }
                  , h = function t(e, r, n) {
                    var i = [], a = 0, o = e.length, s;
                    i[0] = 2;
                    for (; a < o; a++) {
                        s = n && n[a] || 0;
                        i[a + 1] = e[a] - s + 256 & 255
                    }
                    return i
                }
                  , c = function t(e, r, n) {
                    var i = [], a = 0, o = e.length, s, f;
                    i[0] = 3;
                    for (; a < o; a++) {
                        s = e[a - r] || 0;
                        f = n && n[a] || 0;
                        i[a + 1] = e[a] + 256 - (s + f >>> 1) & 255
                    }
                    return i
                }
                  , d = function t(e, r, n) {
                    var i = [], a = 0, o = e.length, s, f, u, l;
                    i[0] = 4;
                    for (; a < o; a++) {
                        s = e[a - r] || 0;
                        f = n && n[a] || 0;
                        u = n && n[a - r] || 0;
                        l = p(s, f, u);
                        i[a + 1] = e[a] - l + 256 & 255
                    }
                    return i
                }
                  , p = function t(e, r, n) {
                    var i = e + r - n
                      , a = Math.abs(i - e)
                      , o = Math.abs(i - r)
                      , s = Math.abs(i - n);
                    return a <= o && a <= s ? e : o <= s ? r : n
                }
                  , v = function t() {
                    return [f, u, h, c, d]
                }
                  , g = function t(e) {
                    var r = 0, n = e.length, i, a, o;
                    while (r < n) {
                        i = m(e[r].slice(1));
                        if (i < a || !a) {
                            a = i;
                            o = r
                        }
                        r++
                    }
                    return o
                }
                  , m = function t(e) {
                    var r = 0
                      , n = e.length
                      , i = 0;
                    while (r < n) {
                        i += Math.abs(e[r++])
                    }
                    return i
                }
                  , y = function e(r) {
                    var n;
                    switch (r) {
                    case t.image_compression.FAST:
                        n = 11;
                        break;
                    case t.image_compression.MEDIUM:
                        n = 13;
                        break;
                    case t.image_compression.SLOW:
                        n = 14;
                        break;
                    default:
                        n = 12;
                        break
                    }
                    return n
                };
                t.processPNG = function(t, n, a, o, s) {
                    var f = this.color_spaces.DEVICE_RGB, u = this.decode.FLATE_DECODE, l = 8, h, c, d, p, v, g;
                    if (this.isArrayBuffer(t))
                        t = new Uint8Array(t);
                    if (this.isArrayBufferView(t)) {
                        if (e())
                            throw new Error("PNG support requires png.js and zlib.js");
                        h = new PNG(t);
                        t = h.imgData;
                        l = h.bits;
                        f = h.colorSpace;
                        p = h.colors;
                        if ([4, 6].indexOf(h.colorType) !== -1) {
                            if (h.bits === 8) {
                                var m = h.pixelBitlength == 32 ? new Uint32Array(h.decodePixels().buffer) : h.pixelBitlength == 16 ? new Uint16Array(h.decodePixels().buffer) : new Uint8Array(h.decodePixels().buffer), w = m.length, b = new Uint8Array(w * h.colors), x = new Uint8Array(w), N = h.pixelBitlength - h.bits, L = 0, A = 0, S, _;
                                for (; L < w; L++) {
                                    S = m[L];
                                    _ = 0;
                                    while (_ < N) {
                                        b[A++] = S >>> _ & 255;
                                        _ = _ + h.bits
                                    }
                                    x[L] = S >>> _ & 255
                                }
                            }
                            if (h.bits === 16) {
                                var m = new Uint32Array(h.decodePixels().buffer), w = m.length, b = new Uint8Array(w * (32 / h.pixelBitlength) * h.colors), x = new Uint8Array(w * (32 / h.pixelBitlength)), F = h.colors > 1, L = 0, A = 0, k = 0, S;
                                while (L < w) {
                                    S = m[L++];
                                    b[A++] = S >>> 0 & 255;
                                    if (F) {
                                        b[A++] = S >>> 16 & 255;
                                        S = m[L++];
                                        b[A++] = S >>> 0 & 255
                                    }
                                    x[k++] = S >>> 16 & 255
                                }
                                l = 8
                            }
                            if (r(o)) {
                                t = i(b, h.width * h.colors, h.colors, o);
                                g = i(x, h.width, 1, o)
                            } else {
                                t = b;
                                g = x;
                                u = null
                            }
                        }
                        if (h.colorType === 3) {
                            f = this.color_spaces.INDEXED;
                            v = h.palette;
                            if (h.transparency.indexed) {
                                var P = h.transparency.indexed;
                                var I = 0
                                  , L = 0
                                  , w = P.length;
                                for (; L < w; ++L) {
                                    I += P[L]
                                }
                                I = I / 255;
                                if (I === w - 1 && P.indexOf(0) !== -1) {
                                    d = [P.indexOf(0)]
                                } else if (I !== w) {
                                    var m = h.decodePixels()
                                      , x = new Uint8Array(m.length)
                                      , L = 0
                                      , w = m.length;
                                    for (; L < w; L++) {
                                        x[L] = P[m[L]]
                                    }
                                    g = i(x, h.width, 1)
                                }
                            }
                        }
                        var C = y(o);
                        if (u === this.decode.FLATE_DECODE)
                            c = "/Predictor " + C + " /Colors " + p + " /BitsPerComponent " + l + " /Columns " + h.width;
                        else
                            c = "/Colors " + p + " /BitsPerComponent " + l + " /Columns " + h.width;
                        if (this.isArrayBuffer(t) || this.isArrayBufferView(t))
                            t = this.arrayBufferToBinaryString(t);
                        if (g && this.isArrayBuffer(g) || this.isArrayBufferView(g))
                            g = this.arrayBufferToBinaryString(g);
                        return this.createImageInfo(t, h.width, h.height, f, l, u, n, a, c, d, v, g, C)
                    }
                    throw new Error("Unsupported PNG image data, try using JPEG instead.")
                }
            }
            )(e.API);
            /**
     * @license
     * Copyright (c) 2017 Aras Abbasi 
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                t.processGIF89A = function(e, r, n, i, o) {
                    var f = new a(e);
                    var u = f.width
                      , l = f.height;
                    var h = 100;
                    var c = [];
                    f.decodeAndBlitFrameRGBA(0, c);
                    var d = {
                        data: c,
                        width: u,
                        height: l
                    };
                    var p = new s(h);
                    var v = p.encode(d, h);
                    return t.processJPEG.call(this, v, r, n, i)
                }
                ;
                t.processGIF87A = t.processGIF89A
            }
            )(e.API);
            /**
     * Copyright (c) 2018 Aras Abbasi 
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                t.processBMP = function(e, r, n, i, a) {
                    var o = new f(e,false);
                    var u = o.width
                      , l = o.height;
                    var h = 100;
                    var c = o.getData();
                    var d = {
                        data: c,
                        width: u,
                        height: l
                    };
                    var p = new s(h);
                    var v = p.encode(d, h);
                    return t.processJPEG.call(this, v, r, n, i)
                }
            }
            )(e.API);
            /**
     * @license
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                t.setLanguage = function(t) {
                    var e = {
                        af: "Afrikaans",
                        sq: "Albanian",
                        ar: "Arabic (Standard)",
                        "ar-DZ": "Arabic (Algeria)",
                        "ar-BH": "Arabic (Bahrain)",
                        "ar-EG": "Arabic (Egypt)",
                        "ar-IQ": "Arabic (Iraq)",
                        "ar-JO": "Arabic (Jordan)",
                        "ar-KW": "Arabic (Kuwait)",
                        "ar-LB": "Arabic (Lebanon)",
                        "ar-LY": "Arabic (Libya)",
                        "ar-MA": "Arabic (Morocco)",
                        "ar-OM": "Arabic (Oman)",
                        "ar-QA": "Arabic (Qatar)",
                        "ar-SA": "Arabic (Saudi Arabia)",
                        "ar-SY": "Arabic (Syria)",
                        "ar-TN": "Arabic (Tunisia)",
                        "ar-AE": "Arabic (U.A.E.)",
                        "ar-YE": "Arabic (Yemen)",
                        an: "Aragonese",
                        hy: "Armenian",
                        as: "Assamese",
                        ast: "Asturian",
                        az: "Azerbaijani",
                        eu: "Basque",
                        be: "Belarusian",
                        bn: "Bengali",
                        bs: "Bosnian",
                        br: "Breton",
                        bg: "Bulgarian",
                        my: "Burmese",
                        ca: "Catalan",
                        ch: "Chamorro",
                        ce: "Chechen",
                        zh: "Chinese",
                        "zh-HK": "Chinese (Hong Kong)",
                        "zh-CN": "Chinese (PRC)",
                        "zh-SG": "Chinese (Singapore)",
                        "zh-TW": "Chinese (Taiwan)",
                        cv: "Chuvash",
                        co: "Corsican",
                        cr: "Cree",
                        hr: "Croatian",
                        cs: "Czech",
                        da: "Danish",
                        nl: "Dutch (Standard)",
                        "nl-BE": "Dutch (Belgian)",
                        en: "English",
                        "en-AU": "English (Australia)",
                        "en-BZ": "English (Belize)",
                        "en-CA": "English (Canada)",
                        "en-IE": "English (Ireland)",
                        "en-JM": "English (Jamaica)",
                        "en-NZ": "English (New Zealand)",
                        "en-PH": "English (Philippines)",
                        "en-ZA": "English (South Africa)",
                        "en-TT": "English (Trinidad & Tobago)",
                        "en-GB": "English (United Kingdom)",
                        "en-US": "English (United States)",
                        "en-ZW": "English (Zimbabwe)",
                        eo: "Esperanto",
                        et: "Estonian",
                        fo: "Faeroese",
                        fj: "Fijian",
                        fi: "Finnish",
                        fr: "French (Standard)",
                        "fr-BE": "French (Belgium)",
                        "fr-CA": "French (Canada)",
                        "fr-FR": "French (France)",
                        "fr-LU": "French (Luxembourg)",
                        "fr-MC": "French (Monaco)",
                        "fr-CH": "French (Switzerland)",
                        fy: "Frisian",
                        fur: "Friulian",
                        gd: "Gaelic (Scots)",
                        "gd-IE": "Gaelic (Irish)",
                        gl: "Galacian",
                        ka: "Georgian",
                        de: "German (Standard)",
                        "de-AT": "German (Austria)",
                        "de-DE": "German (Germany)",
                        "de-LI": "German (Liechtenstein)",
                        "de-LU": "German (Luxembourg)",
                        "de-CH": "German (Switzerland)",
                        el: "Greek",
                        gu: "Gujurati",
                        ht: "Haitian",
                        he: "Hebrew",
                        hi: "Hindi",
                        hu: "Hungarian",
                        is: "Icelandic",
                        id: "Indonesian",
                        iu: "Inuktitut",
                        ga: "Irish",
                        it: "Italian (Standard)",
                        "it-CH": "Italian (Switzerland)",
                        ja: "Japanese",
                        kn: "Kannada",
                        ks: "Kashmiri",
                        kk: "Kazakh",
                        km: "Khmer",
                        ky: "Kirghiz",
                        tlh: "Klingon",
                        ko: "Korean",
                        "ko-KP": "Korean (North Korea)",
                        "ko-KR": "Korean (South Korea)",
                        la: "Latin",
                        lv: "Latvian",
                        lt: "Lithuanian",
                        lb: "Luxembourgish",
                        mk: "FYRO Macedonian",
                        ms: "Malay",
                        ml: "Malayalam",
                        mt: "Maltese",
                        mi: "Maori",
                        mr: "Marathi",
                        mo: "Moldavian",
                        nv: "Navajo",
                        ng: "Ndonga",
                        ne: "Nepali",
                        no: "Norwegian",
                        nb: "Norwegian (Bokmal)",
                        nn: "Norwegian (Nynorsk)",
                        oc: "Occitan",
                        or: "Oriya",
                        om: "Oromo",
                        fa: "Persian",
                        "fa-IR": "Persian/Iran",
                        pl: "Polish",
                        pt: "Portuguese",
                        "pt-BR": "Portuguese (Brazil)",
                        pa: "Punjabi",
                        "pa-IN": "Punjabi (India)",
                        "pa-PK": "Punjabi (Pakistan)",
                        qu: "Quechua",
                        rm: "Rhaeto-Romanic",
                        ro: "Romanian",
                        "ro-MO": "Romanian (Moldavia)",
                        ru: "Russian",
                        "ru-MO": "Russian (Moldavia)",
                        sz: "Sami (Lappish)",
                        sg: "Sango",
                        sa: "Sanskrit",
                        sc: "Sardinian",
                        sd: "Sindhi",
                        si: "Singhalese",
                        sr: "Serbian",
                        sk: "Slovak",
                        sl: "Slovenian",
                        so: "Somani",
                        sb: "Sorbian",
                        es: "Spanish",
                        "es-AR": "Spanish (Argentina)",
                        "es-BO": "Spanish (Bolivia)",
                        "es-CL": "Spanish (Chile)",
                        "es-CO": "Spanish (Colombia)",
                        "es-CR": "Spanish (Costa Rica)",
                        "es-DO": "Spanish (Dominican Republic)",
                        "es-EC": "Spanish (Ecuador)",
                        "es-SV": "Spanish (El Salvador)",
                        "es-GT": "Spanish (Guatemala)",
                        "es-HN": "Spanish (Honduras)",
                        "es-MX": "Spanish (Mexico)",
                        "es-NI": "Spanish (Nicaragua)",
                        "es-PA": "Spanish (Panama)",
                        "es-PY": "Spanish (Paraguay)",
                        "es-PE": "Spanish (Peru)",
                        "es-PR": "Spanish (Puerto Rico)",
                        "es-ES": "Spanish (Spain)",
                        "es-UY": "Spanish (Uruguay)",
                        "es-VE": "Spanish (Venezuela)",
                        sx: "Sutu",
                        sw: "Swahili",
                        sv: "Swedish",
                        "sv-FI": "Swedish (Finland)",
                        "sv-SV": "Swedish (Sweden)",
                        ta: "Tamil",
                        tt: "Tatar",
                        te: "Teluga",
                        th: "Thai",
                        tig: "Tigre",
                        ts: "Tsonga",
                        tn: "Tswana",
                        tr: "Turkish",
                        tk: "Turkmen",
                        uk: "Ukrainian",
                        hsb: "Upper Sorbian",
                        ur: "Urdu",
                        ve: "Venda",
                        vi: "Vietnamese",
                        vo: "Volapuk",
                        wa: "Walloon",
                        cy: "Welsh",
                        xh: "Xhosa",
                        ji: "Yiddish",
                        zu: "Zulu"
                    };
                    if (this.internal.languageSettings === undefined) {
                        this.internal.languageSettings = {};
                        this.internal.languageSettings.isSubscribed = false
                    }
                    if (e[t] !== undefined) {
                        this.internal.languageSettings.languageCode = t;
                        if (this.internal.languageSettings.isSubscribed === false) {
                            this.internal.events.subscribe("putCatalog", function() {
                                this.internal.write("/Lang (" + this.internal.languageSettings.languageCode + ")")
                            });
                            this.internal.languageSettings.isSubscribed = true
                        }
                    }
                    return this
                }
            }
            )(e.API);
            /** @license
     * MIT license.
     * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
     *               2014 Diego Casorran, https://github.com/diegocr
     *
     * 
     * ====================================================================
     */
            (function(t) {
                var e = t.getCharWidthsArray = function(t, e) {
                    e = e || {};
                    var r = e.font || this.internal.getFont();
                    var n = e.fontSize || this.internal.getFontSize();
                    var i = e.charSpace || this.internal.getCharSpace();
                    var a = e.widths ? e.widths : r.metadata.Unicode.widths;
                    var o = a.fof ? a.fof : 1;
                    var s = e.kerning ? e.kerning : r.metadata.Unicode.kerning;
                    var f = s.fof ? s.fof : 1;
                    var u;
                    var l;
                    var h;
                    var c = 0;
                    var d = a[0] || o;
                    var p = [];
                    for (u = 0,
                    l = t.length; u < l; u++) {
                        h = t.charCodeAt(u);
                        if (typeof r.metadata.widthOfString === "function") {
                            p.push((r.metadata.widthOfGlyph(r.metadata.characterToGlyph(h)) + i * (1e3 / n) || 0) / 1e3)
                        } else {
                            p.push((a[h] || d) / o + (s[h] && s[h][c] || 0) / f)
                        }
                        c = h
                    }
                    return p
                }
                ;
                var r = t.getArraySum = function(t) {
                    var e = t.length
                      , r = 0;
                    while (e) {
                        e--;
                        r += t[e]
                    }
                    return r
                }
                ;
                var n = t.getStringUnitWidth = function(t, n) {
                    n = n || {};
                    var i = n.fontSize || this.internal.getFontSize();
                    var a = n.font || this.internal.getFont();
                    var o = n.charSpace || this.internal.getCharSpace();
                    var s = 0;
                    if (typeof a.metadata.widthOfString === "function") {
                        s = a.metadata.widthOfString(t, i, o) / i
                    } else {
                        s = r(e.apply(this, arguments))
                    }
                    return s
                }
                ;
                var i = function t(e, r, n, i) {
                    var a = [];
                    var o = 0
                      , s = e.length
                      , f = 0;
                    while (o !== s && f + r[o] < n) {
                        f += r[o];
                        o++
                    }
                    a.push(e.slice(0, o));
                    var u = o;
                    f = 0;
                    while (o !== s) {
                        if (f + r[o] > i) {
                            a.push(e.slice(u, o));
                            f = 0;
                            u = o
                        }
                        f += r[o];
                        o++
                    }
                    if (u !== o) {
                        a.push(e.slice(u, o))
                    }
                    return a
                };
                var a = function t(a, o, s) {
                    if (!s) {
                        s = {}
                    }
                    var f = [], u = [f], l = s.textIndent || 0, h = 0, c = 0, d, p, v = a.split(" "), g = e.apply(this, [" ", s])[0], m, y, w, b;
                    if (s.lineIndent === -1) {
                        b = v[0].length + 2
                    } else {
                        b = s.lineIndent || 0
                    }
                    if (b) {
                        var x = Array(b).join(" ")
                          , N = [];
                        v.map(function(t) {
                            t = t.split(/\s*\n/);
                            if (t.length > 1) {
                                N = N.concat(t.map(function(t, e) {
                                    return (e && t.length ? "\n" : "") + t
                                }))
                            } else {
                                N.push(t[0])
                            }
                        });
                        v = N;
                        b = n.apply(this, [x, s])
                    }
                    for (m = 0,
                    y = v.length; m < y; m++) {
                        var L = 0;
                        d = v[m];
                        if (b && d[0] == "\n") {
                            d = d.substr(1);
                            L = 1
                        }
                        p = e.apply(this, [d, s]);
                        c = r(p);
                        if (l + h + c > o || L) {
                            if (c > o) {
                                w = i.apply(this, [d, p, o - (l + h), o]);
                                f.push(w.shift());
                                f = [w.pop()];
                                while (w.length) {
                                    u.push([w.shift()])
                                }
                                c = r(p.slice(d.length - (f[0] ? f[0].length : 0)))
                            } else {
                                f = [d]
                            }
                            u.push(f);
                            l = c + b;
                            h = g
                        } else {
                            f.push(d);
                            l += h + c;
                            h = g
                        }
                    }
                    if (b) {
                        var A = function t(e, r) {
                            return (r ? x : "") + e.join(" ")
                        }
                    } else {
                        var A = function t(e) {
                            return e.join(" ")
                        }
                    }
                    return u.map(A)
                };
                t.splitTextToSize = function(t, e, r) {
                    r = r || {};
                    var n = r.fontSize || this.internal.getFontSize()
                      , i = function(t) {
                        var e = {
                            0: 1
                        }
                          , r = {};
                        if (!t.widths || !t.kerning) {
                            var n = this.internal.getFont(t.fontName, t.fontStyle)
                              , i = "Unicode";
                            if (n.metadata[i]) {
                                return {
                                    widths: n.metadata[i].widths || e,
                                    kerning: n.metadata[i].kerning || r
                                }
                            } else {
                                return {
                                    font: n.metadata,
                                    fontSize: this.internal.getFontSize(),
                                    charSpace: this.internal.getCharSpace()
                                }
                            }
                        } else {
                            return {
                                widths: t.widths,
                                kerning: t.kerning
                            }
                        }
                        return {
                            widths: e,
                            kerning: r
                        }
                    }
                    .call(this, r);
                    var o;
                    if (Array.isArray(t)) {
                        o = t
                    } else {
                        o = t.split(/\r?\n/)
                    }
                    var s = 1 * this.internal.scaleFactor * e / n;
                    i.textIndent = r.textIndent ? r.textIndent * 1 * this.internal.scaleFactor / n : 0;
                    i.lineIndent = r.lineIndent;
                    var f, u, l = [];
                    for (f = 0,
                    u = o.length; f < u; f++) {
                        l = l.concat(a.apply(this, [o[f], s, i]))
                    }
                    return l
                }
            }
            )(e.API);
            /** @license
     jsPDF standard_fonts_metrics plugin
     * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
     * MIT license.
     * 
     * ====================================================================
     */
            (function(t) {
                var e = function t(e) {
                    var r = "0123456789abcdef"
                      , n = "klmnopqrstuvwxyz"
                      , i = {};
                    for (var a = 0; a < n.length; a++) {
                        i[n[a]] = r[a]
                    }
                    var o, s = {}, f = 1, u, l = s, h = [], c, d = "", p = "", v, g = e.length - 1, m;
                    a = 1;
                    while (a != g) {
                        m = e[a];
                        a += 1;
                        if (m == "'") {
                            if (u) {
                                v = u.join("");
                                u = o
                            } else {
                                u = []
                            }
                        } else if (u) {
                            u.push(m)
                        } else if (m == "{") {
                            h.push([l, v]);
                            l = {};
                            v = o
                        } else if (m == "}") {
                            c = h.pop();
                            c[0][c[1]] = l;
                            v = o;
                            l = c[0]
                        } else if (m == "-") {
                            f = -1
                        } else {
                            if (v === o) {
                                if (i.hasOwnProperty(m)) {
                                    d += i[m];
                                    v = parseInt(d, 16) * f;
                                    f = +1;
                                    d = ""
                                } else {
                                    d += m
                                }
                            } else {
                                if (i.hasOwnProperty(m)) {
                                    p += i[m];
                                    l[v] = parseInt(p, 16) * f;
                                    f = +1;
                                    v = o;
                                    p = ""
                                } else {
                                    p += m
                                }
                            }
                        }
                    }
                    return s
                };
                var r = {
                    codePages: ["WinAnsiEncoding"],
                    WinAnsiEncoding: e("{19m8n201n9q201o9r201s9l201t9m201u8m201w9n201x9o201y8o202k8q202l8r202m9p202q8p20aw8k203k8t203t8v203u9v2cq8s212m9t15m8w15n9w2dw9s16k8u16l9u17s9z17x8y17y9y}")
                }
                  , n = {
                    Unicode: {
                        Courier: r,
                        "Courier-Bold": r,
                        "Courier-BoldOblique": r,
                        "Courier-Oblique": r,
                        Helvetica: r,
                        "Helvetica-Bold": r,
                        "Helvetica-BoldOblique": r,
                        "Helvetica-Oblique": r,
                        "Times-Roman": r,
                        "Times-Bold": r,
                        "Times-BoldItalic": r,
                        "Times-Italic": r
                    }
                }
                  , i = {
                    Unicode: {
                        "Courier-Oblique": e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),
                        "Times-BoldItalic": e("{'widths'{k3o2q4ycx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2r202m2n2n3m2o3m2p5n202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5n4l4m4m4m4n4m4o4s4p4m4q4m4r4s4s4y4t2r4u3m4v4m4w3x4x5t4y4s4z4s5k3x5l4s5m4m5n3r5o3x5p4s5q4m5r5t5s4m5t3x5u3x5v2l5w1w5x2l5y3t5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q2l6r3m6s3r6t1w6u1w6v3m6w1w6x4y6y3r6z3m7k3m7l3m7m2r7n2r7o1w7p3r7q2w7r4m7s3m7t2w7u2r7v2n7w1q7x2n7y3t202l3mcl4mal2ram3man3mao3map3mar3mas2lat4uau1uav3maw3way4uaz2lbk2sbl3t'fof'6obo2lbp3tbq3mbr1tbs2lbu1ybv3mbz3mck4m202k3mcm4mcn4mco4mcp4mcq5ycr4mcs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz2w203k6o212m6o2dw2l2cq2l3t3m3u2l17s3x19m3m}'kerning'{cl{4qu5kt5qt5rs17ss5ts}201s{201ss}201t{cks4lscmscnscoscpscls2wu2yu201ts}201x{2wu2yu}2k{201ts}2w{4qx5kx5ou5qx5rs17su5tu}2x{17su5tu5ou}2y{4qx5kx5ou5qx5rs17ss5ts}'fof'-6ofn{17sw5tw5ou5qw5rs}7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qs}3v{17su5tu5os5qs}7p{17su5tu}ck{4qu5kt5qt5rs17ss5ts}4l{4qu5kt5qt5rs17ss5ts}cm{4qu5kt5qt5rs17ss5ts}cn{4qu5kt5qt5rs17ss5ts}co{4qu5kt5qt5rs17ss5ts}cp{4qu5kt5qt5rs17ss5ts}6l{4qu5ou5qw5rt17su5tu}5q{ckuclucmucnucoucpu4lu}5r{ckuclucmucnucoucpu4lu}7q{cksclscmscnscoscps4ls}6p{4qu5ou5qw5rt17sw5tw}ek{4qu5ou5qw5rt17su5tu}el{4qu5ou5qw5rt17su5tu}em{4qu5ou5qw5rt17su5tu}en{4qu5ou5qw5rt17su5tu}eo{4qu5ou5qw5rt17su5tu}ep{4qu5ou5qw5rt17su5tu}es{17ss5ts5qs4qu}et{4qu5ou5qw5rt17sw5tw}eu{4qu5ou5qw5rt17ss5ts}ev{17ss5ts5qs4qu}6z{17sw5tw5ou5qw5rs}fm{17sw5tw5ou5qw5rs}7n{201ts}fo{17sw5tw5ou5qw5rs}fp{17sw5tw5ou5qw5rs}fq{17sw5tw5ou5qw5rs}7r{cksclscmscnscoscps4ls}fs{17sw5tw5ou5qw5rs}ft{17su5tu}fu{17su5tu}fv{17su5tu}fw{17su5tu}fz{cksclscmscnscoscps4ls}}}"),
                        "Helvetica-Bold": e("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),
                        Courier: e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),
                        "Courier-BoldOblique": e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),
                        "Times-Bold": e("{'widths'{k3q2q5ncx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2l202m2n2n3m2o3m2p6o202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5x4l4s4m4m4n4s4o4s4p4m4q3x4r4y4s4y4t2r4u3m4v4y4w4m4x5y4y4s4z4y5k3x5l4y5m4s5n3r5o4m5p4s5q4s5r6o5s4s5t4s5u4m5v2l5w1w5x2l5y3u5z3m6k2l6l3m6m3r6n2w6o3r6p2w6q2l6r3m6s3r6t1w6u2l6v3r6w1w6x5n6y3r6z3m7k3r7l3r7m2w7n2r7o2l7p3r7q3m7r4s7s3m7t3m7u2w7v2r7w1q7x2r7y3o202l3mcl4sal2lam3man3mao3map3mar3mas2lat4uau1yav3maw3tay4uaz2lbk2sbl3t'fof'6obo2lbp3rbr1tbs2lbu2lbv3mbz3mck4s202k3mcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3rek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3m3u2l17s4s19m3m}'kerning'{cl{4qt5ks5ot5qy5rw17sv5tv}201t{cks4lscmscnscoscpscls4wv}2k{201ts}2w{4qu5ku7mu5os5qx5ru17su5tu}2x{17su5tu5ou5qs}2y{4qv5kv7mu5ot5qz5ru17su5tu}'fof'-6o7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qu}3v{17su5tu5os5qu}fu{17su5tu5ou5qu}7p{17su5tu5ou5qu}ck{4qt5ks5ot5qy5rw17sv5tv}4l{4qt5ks5ot5qy5rw17sv5tv}cm{4qt5ks5ot5qy5rw17sv5tv}cn{4qt5ks5ot5qy5rw17sv5tv}co{4qt5ks5ot5qy5rw17sv5tv}cp{4qt5ks5ot5qy5rw17sv5tv}6l{17st5tt5ou5qu}17s{ckuclucmucnucoucpu4lu4wu}5o{ckuclucmucnucoucpu4lu4wu}5q{ckzclzcmzcnzcozcpz4lz4wu}5r{ckxclxcmxcnxcoxcpx4lx4wu}5t{ckuclucmucnucoucpu4lu4wu}7q{ckuclucmucnucoucpu4lu}6p{17sw5tw5ou5qu}ek{17st5tt5qu}el{17st5tt5ou5qu}em{17st5tt5qu}en{17st5tt5qu}eo{17st5tt5qu}ep{17st5tt5ou5qu}es{17ss5ts5qu}et{17sw5tw5ou5qu}eu{17sw5tw5ou5qu}ev{17ss5ts5qu}6z{17sw5tw5ou5qu5rs}fm{17sw5tw5ou5qu5rs}fn{17sw5tw5ou5qu5rs}fo{17sw5tw5ou5qu5rs}fp{17sw5tw5ou5qu5rs}fq{17sw5tw5ou5qu5rs}7r{cktcltcmtcntcotcpt4lt5os}fs{17sw5tw5ou5qu5rs}ft{17su5tu5ou5qu}7m{5os}fv{17su5tu5ou5qu}fw{17su5tu5ou5qu}fz{cksclscmscnscoscps4ls}}}"),
                        Symbol: e("{'widths'{k3uaw4r19m3m2k1t2l2l202m2y2n3m2p5n202q6o3k3m2s2l2t2l2v3r2w1t3m3m2y1t2z1wbk2sbl3r'fof'6o3n3m3o3m3p3m3q3m3r3m3s3m3t3m3u1w3v1w3w3r3x3r3y3r3z2wbp3t3l3m5v2l5x2l5z3m2q4yfr3r7v3k7w1o7x3k}'kerning'{'fof'-6o}}"),
                        Helvetica: e("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}"),
                        "Helvetica-BoldOblique": e("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),
                        ZapfDingbats: e("{'widths'{k4u2k1w'fof'6o}'kerning'{'fof'-6o}}"),
                        "Courier-Bold": e("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),
                        "Times-Italic": e("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202m2n2n3m2o3m2p5n202q5t2r1p2s2l2t2l2u3m2v4n2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w4n3x4n3y4n3z3m4k5w4l3x4m3x4n4m4o4s4p3x4q3x4r4s4s4s4t2l4u2w4v4m4w3r4x5n4y4m4z4s5k3x5l4s5m3x5n3m5o3r5p4s5q3x5r5n5s3x5t3r5u3r5v2r5w1w5x2r5y2u5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q1w6r3m6s3m6t1w6u1w6v2w6w1w6x4s6y3m6z3m7k3m7l3m7m2r7n2r7o1w7p3m7q2w7r4m7s2w7t2w7u2r7v2s7w1v7x2s7y3q202l3mcl3xal2ram3man3mao3map3mar3mas2lat4wau1vav3maw4nay4waz2lbk2sbl4n'fof'6obo2lbp3mbq3obr1tbs2lbu1zbv3mbz3mck3x202k3mcm3xcn3xco3xcp3xcq5tcr4mcs3xct3xcu3xcv3xcw2l2m2ucy2lcz2ldl4mdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr4nfs3mft3mfu3mfv3mfw3mfz2w203k6o212m6m2dw2l2cq2l3t3m3u2l17s3r19m3m}'kerning'{cl{5kt4qw}201s{201sw}201t{201tw2wy2yy6q-t}201x{2wy2yy}2k{201tw}2w{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}2x{17ss5ts5os}2y{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}'fof'-6o6t{17ss5ts5qs}7t{5os}3v{5qs}7p{17su5tu5qs}ck{5kt4qw}4l{5kt4qw}cm{5kt4qw}cn{5kt4qw}co{5kt4qw}cp{5kt4qw}6l{4qs5ks5ou5qw5ru17su5tu}17s{2ks}5q{ckvclvcmvcnvcovcpv4lv}5r{ckuclucmucnucoucpu4lu}5t{2ks}6p{4qs5ks5ou5qw5ru17su5tu}ek{4qs5ks5ou5qw5ru17su5tu}el{4qs5ks5ou5qw5ru17su5tu}em{4qs5ks5ou5qw5ru17su5tu}en{4qs5ks5ou5qw5ru17su5tu}eo{4qs5ks5ou5qw5ru17su5tu}ep{4qs5ks5ou5qw5ru17su5tu}es{5ks5qs4qs}et{4qs5ks5ou5qw5ru17su5tu}eu{4qs5ks5qw5ru17su5tu}ev{5ks5qs4qs}ex{17ss5ts5qs}6z{4qv5ks5ou5qw5ru17su5tu}fm{4qv5ks5ou5qw5ru17su5tu}fn{4qv5ks5ou5qw5ru17su5tu}fo{4qv5ks5ou5qw5ru17su5tu}fp{4qv5ks5ou5qw5ru17su5tu}fq{4qv5ks5ou5qw5ru17su5tu}7r{5os}fs{4qv5ks5ou5qw5ru17su5tu}ft{17su5tu5qs}fu{17su5tu5qs}fv{17su5tu5qs}fw{17su5tu5qs}}}"),
                        "Times-Roman": e("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v1w3w3s3x3s3y3s3z2w4k5w4l4s4m4m4n4m4o4s4p3x4q3r4r4s4s4s4t2l4u2r4v4s4w3x4x5t4y4s4z4s5k3r5l4s5m4m5n3r5o3x5p4s5q4s5r5y5s4s5t4s5u3x5v2l5w1w5x2l5y2z5z3m6k2l6l2w6m3m6n2w6o3m6p2w6q2l6r3m6s3m6t1w6u1w6v3m6w1w6x4y6y3m6z3m7k3m7l3m7m2l7n2r7o1w7p3m7q3m7r4s7s3m7t3m7u2w7v3k7w1o7x3k7y3q202l3mcl4sal2lam3man3mao3map3mar3mas2lat4wau1vav3maw3say4waz2lbk2sbl3s'fof'6obo2lbp3mbq2xbr1tbs2lbu1zbv3mbz2wck4s202k3mcm4scn4sco4scp4scq5tcr4mcs3xct3xcu3xcv3xcw2l2m2tcy2lcz2ldl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek2wel2wem2wen2weo2wep2weq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr3sfs3mft3mfu3mfv3mfw3mfz3m203k6o212m6m2dw2l2cq2l3t3m3u1w17s4s19m3m}'kerning'{cl{4qs5ku17sw5ou5qy5rw201ss5tw201ws}201s{201ss}201t{ckw4lwcmwcnwcowcpwclw4wu201ts}2k{201ts}2w{4qs5kw5os5qx5ru17sx5tx}2x{17sw5tw5ou5qu}2y{4qs5kw5os5qx5ru17sx5tx}'fof'-6o7t{ckuclucmucnucoucpu4lu5os5rs}3u{17su5tu5qs}3v{17su5tu5qs}7p{17sw5tw5qs}ck{4qs5ku17sw5ou5qy5rw201ss5tw201ws}4l{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cm{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cn{4qs5ku17sw5ou5qy5rw201ss5tw201ws}co{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cp{4qs5ku17sw5ou5qy5rw201ss5tw201ws}6l{17su5tu5os5qw5rs}17s{2ktclvcmvcnvcovcpv4lv4wuckv}5o{ckwclwcmwcnwcowcpw4lw4wu}5q{ckyclycmycnycoycpy4ly4wu5ms}5r{cktcltcmtcntcotcpt4lt4ws}5t{2ktclvcmvcnvcovcpv4lv4wuckv}7q{cksclscmscnscoscps4ls}6p{17su5tu5qw5rs}ek{5qs5rs}el{17su5tu5os5qw5rs}em{17su5tu5os5qs5rs}en{17su5qs5rs}eo{5qs5rs}ep{17su5tu5os5qw5rs}es{5qs}et{17su5tu5qw5rs}eu{17su5tu5qs5rs}ev{5qs}6z{17sv5tv5os5qx5rs}fm{5os5qt5rs}fn{17sv5tv5os5qx5rs}fo{17sv5tv5os5qx5rs}fp{5os5qt5rs}fq{5os5qt5rs}7r{ckuclucmucnucoucpu4lu5os}fs{17sv5tv5os5qx5rs}ft{17ss5ts5qs}fu{17sw5tw5qs}fv{17sw5tw5qs}fw{17ss5ts5qs}fz{ckuclucmucnucoucpu4lu5os5rs}}}"),
                        "Helvetica-Oblique": e("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")
                    }
                };
                t.events.push(["addFont", function(t) {
                    var e = t.font;
                    var r, a, o = "Unicode", s;
                    r = i[o][e.postScriptName];
                    if (r) {
                        if (e.metadata[o]) {
                            a = e.metadata[o]
                        } else {
                            a = e.metadata[o] = {}
                        }
                        a.widths = r.widths;
                        a.kerning = r.kerning
                    }
                    s = n[o][e.postScriptName];
                    if (s) {
                        if (e.metadata[o]) {
                            a = e.metadata[o]
                        } else {
                            a = e.metadata[o] = {}
                        }
                        a.encoding = s;
                        if (s.codePages && s.codePages.length) {
                            e.encoding = s.codePages[0]
                        }
                    }
                }
                ])
            }
            )(e.API);
            /**
     * @license
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t, e) {
                t.API.events.push(["addFont", function(e) {
                    var r = e.font;
                    var n = e.instance;
                    if (typeof n !== "undefined" && n.existsFileInVFS(r.postScriptName)) {
                        var i = n.getFileFromVFS(r.postScriptName);
                        if (typeof i !== "string") {
                            throw new Error("Font is not stored as string-data in vFS, import fonts or remove declaration doc.addFont('" + r.postScriptName + "').")
                        }
                        r.metadata = t.API.TTFFont.open(r.postScriptName, r.fontName, i, r.encoding);
                        r.metadata.Unicode = r.metadata.Unicode || {
                            encoding: {},
                            kerning: {},
                            widths: []
                        };
                        r.metadata.glyIdsUsed = [0]
                    } else if (r.isStandardFont === false) {
                        throw new Error("Font does not exist in vFS, import fonts or remove declaration doc.addFont('" + r.postScriptName + "').")
                    }
                }
                ])
            }
            )(e, typeof self !== "undefined" && self || typeof global !== "undefined" && global || typeof window !== "undefined" && window || Function("return this")());
            /** @license
     * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
     * 
     * 
     * ====================================================================
     */
            (function(t) {
                t.addSvg = function(t, e, r, n, i) {
                    var a;
                    if (e === a || r === a) {
                        throw new Error("addSVG needs values for 'x' and 'y'")
                    }
                    function o(t, e) {
                        var r = e.createElement("style");
                        r.type = "text/css";
                        if (r.styleSheet) {
                            r.styleSheet.cssText = t
                        } else {
                            r.appendChild(e.createTextNode(t))
                        }
                        e.getElementsByTagName("head")[0].appendChild(r)
                    }
                    function s(t) {
                        var e = "childframe"
                          , r = t.createElement("iframe");
                        o(".jsPDF_sillysvg_iframe {display:none;position:absolute;}", t);
                        r.name = e;
                        r.setAttribute("width", 0);
                        r.setAttribute("height", 0);
                        r.setAttribute("frameborder", "0");
                        r.setAttribute("scrolling", "no");
                        r.setAttribute("seamless", "seamless");
                        r.setAttribute("class", "jsPDF_sillysvg_iframe");
                        t.body.appendChild(r);
                        return r
                    }
                    function f(t, e) {
                        var r = (e.contentWindow || e.contentDocument).document;
                        r.write(t);
                        r.close();
                        return r.getElementsByTagName("svg")[0]
                    }
                    function u(t) {
                        var e = parseFloat(t[1])
                          , r = parseFloat(t[2])
                          , n = []
                          , i = 3
                          , a = t.length;
                        while (i < a) {
                            if (t[i] === "c") {
                                n.push([parseFloat(t[i + 1]), parseFloat(t[i + 2]), parseFloat(t[i + 3]), parseFloat(t[i + 4]), parseFloat(t[i + 5]), parseFloat(t[i + 6])]);
                                i += 7
                            } else if (t[i] === "l") {
                                n.push([parseFloat(t[i + 1]), parseFloat(t[i + 2])]);
                                i += 3
                            } else {
                                i += 1
                            }
                        }
                        return [e, r, n]
                    }
                    var l = s(document)
                      , h = f(t, l)
                      , c = [1, 1]
                      , d = parseFloat(h.getAttribute("width"))
                      , p = parseFloat(h.getAttribute("height"));
                    if (d && p) {
                        if (n && i) {
                            c = [n / d, i / p]
                        } else if (n) {
                            c = [n / d, n / d]
                        } else if (i) {
                            c = [i / p, i / p]
                        }
                    }
                    var v, g, m, y, w = h.childNodes;
                    for (v = 0,
                    g = w.length; v < g; v++) {
                        m = w[v];
                        if (m.tagName && m.tagName.toUpperCase() === "PATH") {
                            y = u(m.getAttribute("d").split(" "));
                            y[0] = y[0] * c[0] + e;
                            y[1] = y[1] * c[1] + r;
                            this.lines.call(this, y[2], y[0], y[1], c)
                        }
                    }
                    return this
                }
                ;
                t.addSVG = t.addSvg;
                t.addSvgAsImage = function(t, e, r, n, i, a, o, s) {
                    if (isNaN(e) || isNaN(r)) {
                        console.error("jsPDF.addSvgAsImage: Invalid coordinates", arguments);
                        throw new Error("Invalid coordinates passed to jsPDF.addSvgAsImage")
                    }
                    if (isNaN(n) || isNaN(i)) {
                        console.error("jsPDF.addSvgAsImage: Invalid measurements", arguments);
                        throw new Error("Invalid measurements (width and/or height) passed to jsPDF.addSvgAsImage")
                    }
                    var f = document.createElement("canvas");
                    f.width = n;
                    f.height = i;
                    var u = f.getContext("2d");
                    u.fillStyle = "#fff";
                    u.fillRect(0, 0, f.width, f.height);
                    canvg(f, t, {
                        ignoreMouse: true,
                        ignoreAnimation: true,
                        ignoreDimensions: true,
                        ignoreClear: true
                    });
                    this.addImage(f.toDataURL("image/jpeg", 1), e, r, n, i, o, s);
                    return this
                }
            }
            )(e.API);
            /** 
     * @license
     * ==================================================================== 
     * Copyright (c) 2013 Eduardo Menezes de Morais, eduardo.morais@usp.br
     * 
     * 
     * ====================================================================
     */
            (function(t) {
                t.putTotalPages = function(t) {
                    var e;
                    var r = 0;
                    if (parseInt(this.internal.getFont().id.substr(1), 10) < 15) {
                        e = new RegExp(t,"g");
                        r = this.internal.getNumberOfPages()
                    } else {
                        e = new RegExp(this.pdfEscape16(t, this.internal.getFont()),"g");
                        r = this.pdfEscape16(this.internal.getNumberOfPages() + "", this.internal.getFont())
                    }
                    for (var n = 1; n <= this.internal.getNumberOfPages(); n++) {
                        for (var i = 0; i < this.internal.pages[n].length; i++) {
                            this.internal.pages[n][i] = this.internal.pages[n][i].replace(e, r)
                        }
                    }
                    return this
                }
            }
            )(e.API);
            /**
     * jsPDF viewerPreferences Plugin
     * @author Aras Abbasi (github.com/arasabbasi)
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(e) {
                e.viewerPreferences = function(e, r) {
                    e = e || {};
                    r = r || false;
                    var n;
                    var i = {
                        HideToolbar: {
                            defaultValue: false,
                            value: false,
                            type: "boolean",
                            explicitSet: false,
                            valueSet: [true, false],
                            pdfVersion: 1.3
                        },
                        HideMenubar: {
                            defaultValue: false,
                            value: false,
                            type: "boolean",
                            explicitSet: false,
                            valueSet: [true, false],
                            pdfVersion: 1.3
                        },
                        HideWindowUI: {
                            defaultValue: false,
                            value: false,
                            type: "boolean",
                            explicitSet: false,
                            valueSet: [true, false],
                            pdfVersion: 1.3
                        },
                        FitWindow: {
                            defaultValue: false,
                            value: false,
                            type: "boolean",
                            explicitSet: false,
                            valueSet: [true, false],
                            pdfVersion: 1.3
                        },
                        CenterWindow: {
                            defaultValue: false,
                            value: false,
                            type: "boolean",
                            explicitSet: false,
                            valueSet: [true, false],
                            pdfVersion: 1.3
                        },
                        DisplayDocTitle: {
                            defaultValue: false,
                            value: false,
                            type: "boolean",
                            explicitSet: false,
                            valueSet: [true, false],
                            pdfVersion: 1.4
                        },
                        NonFullScreenPageMode: {
                            defaultValue: "UseNone",
                            value: "UseNone",
                            type: "name",
                            explicitSet: false,
                            valueSet: ["UseNone", "UseOutlines", "UseThumbs", "UseOC"],
                            pdfVersion: 1.3
                        },
                        Direction: {
                            defaultValue: "L2R",
                            value: "L2R",
                            type: "name",
                            explicitSet: false,
                            valueSet: ["L2R", "R2L"],
                            pdfVersion: 1.3
                        },
                        ViewArea: {
                            defaultValue: "CropBox",
                            value: "CropBox",
                            type: "name",
                            explicitSet: false,
                            valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"],
                            pdfVersion: 1.4
                        },
                        ViewClip: {
                            defaultValue: "CropBox",
                            value: "CropBox",
                            type: "name",
                            explicitSet: false,
                            valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"],
                            pdfVersion: 1.4
                        },
                        PrintArea: {
                            defaultValue: "CropBox",
                            value: "CropBox",
                            type: "name",
                            explicitSet: false,
                            valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"],
                            pdfVersion: 1.4
                        },
                        PrintClip: {
                            defaultValue: "CropBox",
                            value: "CropBox",
                            type: "name",
                            explicitSet: false,
                            valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"],
                            pdfVersion: 1.4
                        },
                        PrintScaling: {
                            defaultValue: "AppDefault",
                            value: "AppDefault",
                            type: "name",
                            explicitSet: false,
                            valueSet: ["AppDefault", "None"],
                            pdfVersion: 1.6
                        },
                        Duplex: {
                            defaultValue: "",
                            value: "none",
                            type: "name",
                            explicitSet: false,
                            valueSet: ["Simplex", "DuplexFlipShortEdge", "DuplexFlipLongEdge", "none"],
                            pdfVersion: 1.7
                        },
                        PickTrayByPDFSize: {
                            defaultValue: false,
                            value: false,
                            type: "boolean",
                            explicitSet: false,
                            valueSet: [true, false],
                            pdfVersion: 1.7
                        },
                        PrintPageRange: {
                            defaultValue: "",
                            value: "",
                            type: "array",
                            explicitSet: false,
                            valueSet: null,
                            pdfVersion: 1.7
                        },
                        NumCopies: {
                            defaultValue: 1,
                            value: 1,
                            type: "integer",
                            explicitSet: false,
                            valueSet: null,
                            pdfVersion: 1.7
                        }
                    };
                    var a = Object.keys(i);
                    var o = [];
                    var s = 0;
                    var f = 0;
                    var u = 0;
                    var l = true;
                    var h;
                    var c;
                    function d(t, e) {
                        var r;
                        var n = false;
                        for (r = 0; r < t.length; r += 1) {
                            if (t[r] === e) {
                                n = true
                            }
                        }
                        return n
                    }
                    if (this.internal.viewerpreferences === undefined) {
                        this.internal.viewerpreferences = {};
                        this.internal.viewerpreferences.configuration = JSON.parse(JSON.stringify(i));
                        this.internal.viewerpreferences.isSubscribed = false
                    }
                    n = this.internal.viewerpreferences.configuration;
                    if (e === "reset" || r === true) {
                        var p = a.length;
                        for (u = 0; u < p; u += 1) {
                            n[a[u]].value = n[a[u]].defaultValue;
                            n[a[u]].explicitSet = false
                        }
                    }
                    if (t(e) === "object") {
                        for (h in e) {
                            c = e[h];
                            if (d(a, h) && c !== undefined) {
                                if (n[h].type === "boolean" && typeof c === "boolean") {
                                    n[h].value = c
                                } else if (n[h].type === "name" && d(n[h].valueSet, c)) {
                                    n[h].value = c
                                } else if (n[h].type === "integer" && Number.isInteger(c)) {
                                    n[h].value = c
                                } else if (n[h].type === "array") {
                                    for (s = 0; s < c.length; s += 1) {
                                        l = true;
                                        if (c[s].length === 1 && typeof c[s][0] === "number") {
                                            o.push(String(c[s] - 1))
                                        } else if (c[s].length > 1) {
                                            for (f = 0; f < c[s].length; f += 1) {
                                                if (typeof c[s][f] !== "number") {
                                                    l = false
                                                }
                                            }
                                            if (l === true) {
                                                o.push([c[s][0] - 1, c[s][1] - 1].join(" "))
                                            }
                                        }
                                    }
                                    n[h].value = "[" + o.join(" ") + "]"
                                } else {
                                    n[h].value = n[h].defaultValue
                                }
                                n[h].explicitSet = true
                            }
                        }
                    }
                    if (this.internal.viewerpreferences.isSubscribed === false) {
                        this.internal.events.subscribe("putCatalog", function() {
                            var t = [];
                            var e;
                            for (e in n) {
                                if (n[e].explicitSet === true) {
                                    if (n[e].type === "name") {
                                        t.push("/" + e + " /" + n[e].value)
                                    } else {
                                        t.push("/" + e + " " + n[e].value)
                                    }
                                }
                            }
                            if (t.length !== 0) {
                                this.internal.write("/ViewerPreferences\n<<\n" + t.join("\n") + "\n>>")
                            }
                        });
                        this.internal.viewerpreferences.isSubscribed = true
                    }
                    this.internal.viewerpreferences.configuration = n;
                    return this
                }
            }
            )(e.API);
            /** ==================================================================== 
     * jsPDF XMP metadata plugin
     * Copyright (c) 2016 Jussi Utunen, u-jussi@suomi24.fi
     * 
     * 
     * ====================================================================
     */
            (function(t) {
                var e = "";
                var r = "";
                var n = "";
                t.addMetadata = function(t, i) {
                    r = i || "http://jspdf.default.namespaceuri/";
                    e = t;
                    this.internal.events.subscribe("postPutResources", function() {
                        if (!e) {
                            n = ""
                        } else {
                            var t = '<x:xmpmeta xmlns:x="adobe:ns:meta/">';
                            var i = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:jspdf="' + r + '"><jspdf:metadata>';
                            var a = "</jspdf:metadata></rdf:Description></rdf:RDF>";
                            var o = "</x:xmpmeta>";
                            var s = unescape(encodeURIComponent(t));
                            var f = unescape(encodeURIComponent(i));
                            var u = unescape(encodeURIComponent(e));
                            var l = unescape(encodeURIComponent(a));
                            var h = unescape(encodeURIComponent(o));
                            var c = f.length + u.length + l.length + s.length + h.length;
                            n = this.internal.newObject();
                            this.internal.write("<< /Type /Metadata /Subtype /XML /Length " + c + " >>");
                            this.internal.write("stream");
                            this.internal.write(s + f + u + l + h);
                            this.internal.write("endstream");
                            this.internal.write("endobj")
                        }
                    });
                    this.internal.events.subscribe("putCatalog", function() {
                        if (n) {
                            this.internal.write("/Metadata " + n + " 0 R")
                        }
                    });
                    return this
                }
            }
            )(e.API);
            (function(t, e) {
                var r = t.API;
                function n(t) {
                    var e = "";
                    for (var r = 0; r < t.length; r++) {
                        e += "" + t.charCodeAt(r).toString(16)
                    }
                    return e
                }
                var i = r.pdfEscape16 = function(t, e) {
                    var r = e.metadata.Unicode.widths;
                    var n = ["", "0", "00", "000", "0000"];
                    var i = [""];
                    for (var a = 0, o = t.length, s; a < o; ++a) {
                        s = e.metadata.characterToGlyph(t.charCodeAt(a));
                        e.metadata.glyIdsUsed.push(s);
                        e.metadata.toUnicode[s] = t.charCodeAt(a);
                        if (r.indexOf(s) == -1) {
                            r.push(s);
                            r.push([parseInt(e.metadata.widthOfGlyph(s), 10)])
                        }
                        if (s == "0") {
                            return i.join("")
                        } else {
                            s = s.toString(16);
                            i.push(n[4 - s.length], s)
                        }
                    }
                    return i.join("")
                }
                ;
                var a = function t(e) {
                    var r, n, i, a, o, s, f;
                    o = "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo <<\n  /Registry (Adobe)\n  /Ordering (UCS)\n  /Supplement 0\n>> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000><ffff>\nendcodespacerange";
                    n = Object.keys(e).sort(function(t, e) {
                        return t - e
                    });
                    i = [];
                    for (s = 0,
                    f = n.length; s < f; s++) {
                        r = n[s];
                        if (i.length >= 100) {
                            o += "\n" + i.length + " beginbfchar\n" + i.join("\n") + "\nendbfchar";
                            i = []
                        }
                        a = ("0000" + e[r].toString(16)).slice(-4);
                        r = ("0000" + (+r).toString(16)).slice(-4);
                        i.push("<" + r + "><" + a + ">")
                    }
                    if (i.length) {
                        o += "\n" + i.length + " beginbfchar\n" + i.join("\n") + "\nendbfchar\n"
                    }
                    o += "endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend";
                    return o
                };
                var o = function e(r, n, i, o) {
                    if (r.metadata instanceof t.API.TTFFont && r.encoding === "Identity-H") {
                        var s = r.metadata.Unicode.widths;
                        var f = r.metadata.subset.encode(r.metadata.glyIdsUsed, 1);
                        var u = f;
                        var l = "";
                        for (var h = 0; h < u.length; h++) {
                            l += String.fromCharCode(u[h])
                        }
                        var c = i();
                        o({
                            data: l,
                            addLength1: true
                        });
                        n("endobj");
                        var d = i();
                        var p = a(r.metadata.toUnicode);
                        o({
                            data: p,
                            addLength1: true
                        });
                        n("endobj");
                        var v = i();
                        n("<<");
                        n("/Type /FontDescriptor");
                        n("/FontName /" + r.fontName);
                        n("/FontFile2 " + c + " 0 R");
                        n("/FontBBox " + t.API.PDFObject.convert(r.metadata.bbox));
                        n("/Flags " + r.metadata.flags);
                        n("/StemV " + r.metadata.stemV);
                        n("/ItalicAngle " + r.metadata.italicAngle);
                        n("/Ascent " + r.metadata.ascender);
                        n("/Descent " + r.metadata.decender);
                        n("/CapHeight " + r.metadata.capHeight);
                        n(">>");
                        n("endobj");
                        var g = i();
                        n("<<");
                        n("/Type /Font");
                        n("/BaseFont /" + r.fontName);
                        n("/FontDescriptor " + v + " 0 R");
                        n("/W " + t.API.PDFObject.convert(s));
                        n("/CIDToGIDMap /Identity");
                        n("/DW 1000");
                        n("/Subtype /CIDFontType2");
                        n("/CIDSystemInfo");
                        n("<<");
                        n("/Supplement 0");
                        n("/Registry (Adobe)");
                        n("/Ordering (" + r.encoding + ")");
                        n(">>");
                        n(">>");
                        n("endobj");
                        r.objectNumber = i();
                        n("<<");
                        n("/Type /Font");
                        n("/Subtype /Type0");
                        n("/ToUnicode " + d + " 0 R");
                        n("/BaseFont /" + r.fontName);
                        n("/Encoding /" + r.encoding);
                        n("/DescendantFonts [" + g + " 0 R]");
                        n(">>");
                        n("endobj");
                        r.isAlreadyPutted = true
                    }
                };
                r.events.push(["putFont", function(t) {
                    o(t.font, t.out, t.newObject, t.putStream)
                }
                ]);
                var s = function e(r, n, i, o) {
                    if (r.metadata instanceof t.API.TTFFont && r.encoding === "WinAnsiEncoding") {
                        var s = r.metadata.Unicode.widths;
                        var f = r.metadata.rawData;
                        var u = f;
                        var l = "";
                        for (var h = 0; h < u.length; h++) {
                            l += String.fromCharCode(u[h])
                        }
                        var c = i();
                        o({
                            data: l,
                            addLength1: true
                        });
                        n("endobj");
                        var d = i();
                        var p = a(r.metadata.toUnicode);
                        o({
                            data: p,
                            addLength1: true
                        });
                        n("endobj");
                        var v = i();
                        n("<<");
                        n("/Descent " + r.metadata.decender);
                        n("/CapHeight " + r.metadata.capHeight);
                        n("/StemV " + r.metadata.stemV);
                        n("/Type /FontDescriptor");
                        n("/FontFile2 " + c + " 0 R");
                        n("/Flags 96");
                        n("/FontBBox " + t.API.PDFObject.convert(r.metadata.bbox));
                        n("/FontName /" + r.fontName);
                        n("/ItalicAngle " + r.metadata.italicAngle);
                        n("/Ascent " + r.metadata.ascender);
                        n(">>");
                        n("endobj");
                        r.objectNumber = i();
                        for (var h = 0; h < r.metadata.hmtx.widths.length; h++) {
                            r.metadata.hmtx.widths[h] = parseInt(r.metadata.hmtx.widths[h] * (1e3 / r.metadata.head.unitsPerEm))
                        }
                        n("<</Subtype/TrueType/Type/Font/ToUnicode " + d + " 0 R/BaseFont/" + r.fontName + "/FontDescriptor " + v + " 0 R" + "/Encoding/" + r.encoding + " /FirstChar 29 /LastChar 255 /Widths " + t.API.PDFObject.convert(r.metadata.hmtx.widths) + ">>");
                        n("endobj");
                        r.isAlreadyPutted = true
                    }
                };
                r.events.push(["putFont", function(t) {
                    s(t.font, t.out, t.newObject, t.putStream)
                }
                ]);
                var f = function t(e) {
                    var r = e.text || "";
                    var a = e.x;
                    var o = e.y;
                    var s = e.options || {};
                    var f = e.mutex || {};
                    var u = f.pdfEscape;
                    var l = f.activeFontKey;
                    var h = f.fonts;
                    var c, d = f.activeFontSize;
                    var p = "", v = 0, g;
                    var m = "";
                    var c = l;
                    var y = h[c].encoding;
                    if (h[c].encoding !== "Identity-H") {
                        return {
                            text: r,
                            x: a,
                            y: o,
                            options: s,
                            mutex: f
                        }
                    }
                    m = r;
                    c = l;
                    if (Object.prototype.toString.call(r) === "[object Array]") {
                        m = r[0]
                    }
                    for (v = 0; v < m.length; v += 1) {
                        if (h[c].metadata.hasOwnProperty("cmap")) {
                            g = h[c].metadata.cmap.unicode.codeMap[m[v].charCodeAt(0)]
                        }
                        if (!g) {
                            if (m[v].charCodeAt(0) < 256 && h[c].metadata.hasOwnProperty("Unicode")) {
                                p += m[v]
                            } else {
                                p += ""
                            }
                        } else {
                            p += m[v]
                        }
                    }
                    var w = "";
                    if (parseInt(c.slice(1)) < 14 || y === "WinAnsiEncoding") {
                        w = n(u(p, c))
                    } else if (y === "Identity-H") {
                        w = i(p, h[c])
                    }
                    f.isHex = true;
                    return {
                        text: w,
                        x: a,
                        y: o,
                        options: s,
                        mutex: f
                    }
                };
                var u = function t(e) {
                    var r = e.text || ""
                      , n = e.x
                      , i = e.y
                      , a = e.options
                      , o = e.mutex;
                    var s = a.lang;
                    var u = [];
                    var l = {
                        text: r,
                        x: n,
                        y: i,
                        options: a,
                        mutex: o
                    };
                    if (Object.prototype.toString.call(r) === "[object Array]") {
                        var h = 0;
                        for (h = 0; h < r.length; h += 1) {
                            if (Object.prototype.toString.call(r[h]) === "[object Array]") {
                                if (r[h].length === 3) {
                                    u.push([f(Object.assign({}, l, {
                                        text: r[h][0]
                                    })).text, r[h][1], r[h][2]])
                                } else {
                                    u.push(f(Object.assign({}, l, {
                                        text: r[h]
                                    })).text)
                                }
                            } else {
                                u.push(f(Object.assign({}, l, {
                                    text: r[h]
                                })).text)
                            }
                        }
                        e.text = u
                    } else {
                        e.text = f(Object.assign({}, l, {
                            text: r
                        })).text
                    }
                };
                r.events.push(["postProcessText", u])
            }
            )(e, typeof self !== "undefined" && self || typeof global !== "undefined" && global || typeof window !== "undefined" && window || Function("return this")());
            /**
     * jsPDF virtual FileSystem functionality
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                var e = function t(e) {
                    if (typeof e === "undefined") {
                        return false
                    }
                    if (typeof e.vFS === "undefined") {
                        e.vFS = {}
                    }
                    return true
                };
                t.existsFileInVFS = function(t) {
                    if (e(this.internal)) {
                        return typeof this.internal.vFS[t] !== "undefined"
                    }
                    return false
                }
                ;
                t.addFileToVFS = function(t, r) {
                    e(this.internal);
                    this.internal.vFS[t] = r;
                    return this
                }
                ;
                t.getFileFromVFS = function(t) {
                    e(this.internal);
                    if (typeof this.internal.vFS[t] !== "undefined") {
                        return this.internal.vFS[t]
                    }
                    return null
                }
            }
            )(e.API);
            /**
     * jsPDF addHTML PlugIn
     * Copyright (c) 2014 Diego Casorran
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t) {
                t.addHTML = function(t, e, r, n, i) {
                    if (typeof html2canvas === "undefined" && typeof rasterizeHTML === "undefined")
                        throw new Error("You need either " + "https://github.com/niklasvh/html2canvas" + " or https://github.com/cburgmer/rasterizeHTML.js");
                    if (typeof e !== "number") {
                        n = e;
                        i = r
                    }
                    if (typeof n === "function") {
                        i = n;
                        n = null
                    }
                    if (typeof i !== "function") {
                        i = function t() {}
                    }
                    var a = this.internal
                      , o = a.scaleFactor
                      , s = a.pageSize.getWidth()
                      , f = a.pageSize.getHeight();
                    n = n || {};
                    n.onrendered = function(t) {
                        e = parseInt(e) || 0;
                        r = parseInt(r) || 0;
                        var a = n.dim || {};
                        var u = Object.assign({
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            useFor: "content"
                        }, n.margin);
                        var l = a.h || Math.min(f, t.height / o);
                        var h = a.w || Math.min(s, t.width / o) - e;
                        var c = n.format || "JPEG";
                        var d = n.imageCompression || "SLOW";
                        var p = t.height > f - u.top - u.bottom;
                        if (p && n.pagesplit) {
                            var v = function t(e, r, i, a, o) {
                                var s = document.createElement("canvas");
                                s.height = o;
                                s.width = a;
                                var f = s.getContext("2d");
                                f.mozImageSmoothingEnabled = false;
                                f.webkitImageSmoothingEnabled = false;
                                f.msImageSmoothingEnabled = false;
                                f.imageSmoothingEnabled = false;
                                f.fillStyle = n.backgroundColor || "#ffffff";
                                f.fillRect(0, 0, a, o);
                                f.drawImage(e, r, i, a, o, 0, 0, a, o);
                                return s
                            };
                            var g = function() {
                                var n = 0;
                                var a = 0;
                                var l = {};
                                var p = false;
                                var g;
                                var m;
                                while (1) {
                                    a = 0;
                                    l.top = n !== 0 ? u.top : r;
                                    l.left = n !== 0 ? u.left : e;
                                    p = (s - u.left - u.right) * o < t.width;
                                    if (u.useFor === "content") {
                                        if (n === 0) {
                                            g = Math.min((s - u.left) * o, t.width);
                                            m = Math.min((f - u.top) * o, t.height - n)
                                        } else {
                                            g = Math.min(s * o, t.width);
                                            m = Math.min(f * o, t.height - n);
                                            l.top = 0
                                        }
                                    } else {
                                        g = Math.min((s - u.left - u.right) * o, t.width);
                                        m = Math.min((f - u.bottom - u.top) * o, t.height - n)
                                    }
                                    if (p) {
                                        while (1) {
                                            if (u.useFor === "content") {
                                                if (a === 0) {
                                                    g = Math.min((s - u.left) * o, t.width)
                                                } else {
                                                    g = Math.min(s * o, t.width - a);
                                                    l.left = 0
                                                }
                                            }
                                            var y = v(t, a, n, g, m);
                                            var w = [y, l.left, l.top, y.width / o, y.height / o, c, null, d];
                                            this.addImage.apply(this, w);
                                            a += g;
                                            if (a >= t.width) {
                                                break
                                            }
                                            this.addPage()
                                        }
                                    } else {
                                        var y = v(t, 0, n, g, m);
                                        var w = [y, l.left, l.top, y.width / o, y.height / o, c, null, d];
                                        this.addImage.apply(this, w)
                                    }
                                    n += m;
                                    if (n >= t.height) {
                                        break
                                    }
                                    this.addPage()
                                }
                                i(h, n, null, w)
                            }
                            .bind(this);
                            if (t.nodeName === "CANVAS") {
                                var m = new Image;
                                m.onload = g;
                                m.src = t.toDataURL("image/png");
                                t = m
                            } else {
                                g()
                            }
                        } else {
                            var y = Math.random().toString(35);
                            var w = [t, e, r, h, l, c, y, d];
                            this.addImage.apply(this, w);
                            i(h, l, y, w)
                        }
                    }
                    .bind(this);
                    if (typeof html2canvas !== "undefined" && !n.rstz) {
                        return html2canvas(t, n)
                    }
                    if (typeof rasterizeHTML !== "undefined") {
                        var u = "drawDocument";
                        if (typeof t === "string") {
                            u = /^http/.test(t) ? "drawURL" : "drawHTML"
                        }
                        n.width = n.width || s * o;
                        return rasterizeHTML[u](t, void 0, n).then(function(t) {
                            n.onrendered(t.image)
                        }, function(t) {
                            i(null, t)
                        })
                    }
                    return null
                }
            }
            )(e.API);
            /**
     * jsPDF fromHTML plugin. BETA stage. API subject to change. Needs browser
     * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
     *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
     *               2014 Diego Casorran, https://github.com/diegocr
     *               2014 Daniel Husar, https://github.com/danielhusar
     *               2014 Wolfgang Gassler, https://github.com/woolfg
     *               2014 Steven Spungin, https://github.com/flamenco
     *
     * @license
     * 
     * ====================================================================
     */
            (function(e) {
                var r, n, i, a, o, s, f, u, l, h, c, d, p, v, g, m, y, w, b, x;
                r = function() {
                    return function(e) {
                        t.prototype = e;
                        return new t
                    }
                    ;
                    function t() {}
                }();
                h = function t(e) {
                    var r, n, i, a, o, s, f;
                    n = 0;
                    i = e.length;
                    r = void 0;
                    a = false;
                    s = false;
                    while (!a && n !== i) {
                        r = e[n] = e[n].trimLeft();
                        if (r) {
                            a = true
                        }
                        n++
                    }
                    n = i - 1;
                    while (i && !s && n !== -1) {
                        r = e[n] = e[n].trimRight();
                        if (r) {
                            s = true
                        }
                        n--
                    }
                    o = /\s+$/g;
                    f = true;
                    n = 0;
                    while (n !== i) {
                        if (e[n] != "\u2028") {
                            r = e[n].replace(/\s+/g, " ");
                            if (f) {
                                r = r.trimLeft()
                            }
                            if (r) {
                                f = o.test(r)
                            }
                            e[n] = r
                        }
                        n++
                    }
                    return e
                }
                ;
                c = function t(e, r, n, i) {
                    this.pdf = e;
                    this.x = r;
                    this.y = n;
                    this.settings = i;
                    this.watchFunctions = [];
                    this.init();
                    return this
                }
                ;
                d = function t(e) {
                    var r, n, a;
                    r = void 0;
                    a = e.split(",");
                    n = a.shift();
                    while (!r && n) {
                        r = i[n.trim().toLowerCase()];
                        n = a.shift()
                    }
                    return r
                }
                ;
                p = function t(e) {
                    e = e === "auto" ? "0px" : e;
                    if (e.indexOf("em") > -1 && !isNaN(Number(e.replace("em", "")))) {
                        e = Number(e.replace("em", "")) * 18.719 + "px"
                    }
                    if (e.indexOf("pt") > -1 && !isNaN(Number(e.replace("pt", "")))) {
                        e = Number(e.replace("pt", "")) * 1.333 + "px"
                    }
                    var r, n, i;
                    n = void 0;
                    r = 16;
                    i = v[e];
                    if (i) {
                        return i
                    }
                    i = {
                        "xx-small": 9,
                        "x-small": 11,
                        small: 13,
                        medium: 16,
                        large: 19,
                        "x-large": 23,
                        "xx-large": 28,
                        auto: 0
                    }[e];
                    if (i !== n) {
                        return v[e] = i / r
                    }
                    if (i = parseFloat(e)) {
                        return v[e] = i / r
                    }
                    i = e.match(/([\d\.]+)(px)/);
                    if (Array.isArray(i) && i.length === 3) {
                        return v[e] = parseFloat(i[1]) / r
                    }
                    return v[e] = 1
                }
                ;
                l = function t(e) {
                    var r, n, i;
                    i = function(t) {
                        var e;
                        e = function(t) {
                            if (document.defaultView && document.defaultView.getComputedStyle) {
                                return document.defaultView.getComputedStyle(t, null)
                            } else if (t.currentStyle) {
                                return t.currentStyle
                            } else {
                                return t.style
                            }
                        }(t);
                        return function(t) {
                            t = t.replace(/-\D/g, function(t) {
                                return t.charAt(1).toUpperCase()
                            });
                            return e[t]
                        }
                    }(e);
                    r = {};
                    n = void 0;
                    r["font-family"] = d(i("font-family")) || "times";
                    r["font-style"] = a[i("font-style")] || "normal";
                    r["text-align"] = o[i("text-align")] || "left";
                    n = s[i("font-weight")] || "normal";
                    if (n === "bold") {
                        if (r["font-style"] === "normal") {
                            r["font-style"] = n
                        } else {
                            r["font-style"] = n + r["font-style"]
                        }
                    }
                    r["font-size"] = p(i("font-size")) || 1;
                    r["line-height"] = p(i("line-height")) || 1;
                    r["display"] = i("display") === "inline" ? "inline" : "block";
                    n = r["display"] === "block";
                    r["margin-top"] = n && p(i("margin-top")) || 0;
                    r["margin-bottom"] = n && p(i("margin-bottom")) || 0;
                    r["padding-top"] = n && p(i("padding-top")) || 0;
                    r["padding-bottom"] = n && p(i("padding-bottom")) || 0;
                    r["margin-left"] = n && p(i("margin-left")) || 0;
                    r["margin-right"] = n && p(i("margin-right")) || 0;
                    r["padding-left"] = n && p(i("padding-left")) || 0;
                    r["padding-right"] = n && p(i("padding-right")) || 0;
                    r["page-break-before"] = i("page-break-before") || "auto";
                    r["float"] = f[i("cssFloat")] || "none";
                    r["clear"] = u[i("clear")] || "none";
                    r["color"] = i("color");
                    return r
                }
                ;
                g = function t(e, r, n) {
                    var i, a, o, s, f;
                    o = false;
                    a = void 0;
                    s = void 0;
                    i = n["#" + e.id];
                    if (i) {
                        if (typeof i === "function") {
                            o = i(e, r)
                        } else {
                            a = 0;
                            s = i.length;
                            while (!o && a !== s) {
                                o = i[a](e, r);
                                a++
                            }
                        }
                    }
                    i = n[e.nodeName];
                    if (!o && i) {
                        if (typeof i === "function") {
                            o = i(e, r)
                        } else {
                            a = 0;
                            s = i.length;
                            while (!o && a !== s) {
                                o = i[a](e, r);
                                a++
                            }
                        }
                    }
                    f = typeof e.className === "string" ? e.className.split(" ") : [];
                    for (a = 0; a < f.length; a++) {
                        i = n["." + f[a]];
                        if (!o && i) {
                            if (typeof i === "function") {
                                o = i(e, r)
                            } else {
                                a = 0;
                                s = i.length;
                                while (!o && a !== s) {
                                    o = i[a](e, r);
                                    a++
                                }
                            }
                        }
                    }
                    return o
                }
                ;
                x = function t(e, r) {
                    var n, i, a, o, s, f, u, l, h, c;
                    n = [];
                    i = [];
                    a = 0;
                    c = e.rows[0].cells.length;
                    l = e.clientWidth;
                    while (a < c) {
                        h = e.rows[0].cells[a];
                        i[a] = {
                            name: h.textContent.toLowerCase().replace(/\s+/g, ""),
                            prompt: h.textContent.replace(/\r?\n/g, ""),
                            width: h.clientWidth / l * r.pdf.internal.pageSize.getWidth()
                        };
                        a++
                    }
                    a = 1;
                    while (a < e.rows.length) {
                        f = e.rows[a];
                        s = {};
                        o = 0;
                        while (o < f.cells.length) {
                            s[i[o].name] = f.cells[o].textContent.replace(/\r?\n/g, "");
                            o++
                        }
                        n.push(s);
                        a++
                    }
                    return u = {
                        rows: n,
                        headers: i
                    }
                }
                ;
                var N = {
                    SCRIPT: 1,
                    STYLE: 1,
                    NOSCRIPT: 1,
                    OBJECT: 1,
                    EMBED: 1,
                    SELECT: 1
                };
                var L = 1;
                n = function e(i, a, o) {
                    var s, f, u, h, c, d, p, v;
                    f = i.childNodes;
                    s = void 0;
                    u = l(i);
                    c = u.display === "block";
                    if (c) {
                        a.setBlockBoundary();
                        a.setBlockStyle(u)
                    }
                    h = 0;
                    d = f.length;
                    while (h < d) {
                        s = f[h];
                        if (t(s) === "object") {
                            a.executeWatchFunctions(s);
                            if (s.nodeType === 1 && s.nodeName === "HEADER") {
                                var y = s;
                                var w = a.pdf.margins_doc.top;
                                a.pdf.internal.events.subscribe("addPage", function(t) {
                                    a.y = w;
                                    n(y, a, o);
                                    a.pdf.margins_doc.top = a.y + 10;
                                    a.y += 10
                                }, false)
                            }
                            if (s.nodeType === 8 && s.nodeName === "#comment") {
                                if (~s.textContent.indexOf("ADD_PAGE")) {
                                    a.pdf.addPage();
                                    a.y = a.pdf.margins_doc.top
                                }
                            } else if (s.nodeType === 1 && !N[s.nodeName]) {
                                var b;
                                if (s.nodeName === "IMG") {
                                    var A = s.getAttribute("src");
                                    b = m[a.pdf.sHashCode(A) || A]
                                }
                                if (b) {
                                    if (a.pdf.internal.pageSize.getHeight() - a.pdf.margins_doc.bottom < a.y + s.height && a.y > a.pdf.margins_doc.top) {
                                        a.pdf.addPage();
                                        a.y = a.pdf.margins_doc.top;
                                        a.executeWatchFunctions(s)
                                    }
                                    var S = l(s);
                                    var _ = a.x;
                                    var F = 12 / a.pdf.internal.scaleFactor;
                                    var k = (S["margin-left"] + S["padding-left"]) * F;
                                    var P = (S["margin-right"] + S["padding-right"]) * F;
                                    var I = (S["margin-top"] + S["padding-top"]) * F;
                                    var C = (S["margin-bottom"] + S["padding-bottom"]) * F;
                                    if (S["float"] !== undefined && S["float"] === "right") {
                                        _ += a.settings.width - s.width - P
                                    } else {
                                        _ += k
                                    }
                                    a.pdf.addImage(b, _, a.y + I, s.width, s.height);
                                    b = undefined;
                                    if (S["float"] === "right" || S["float"] === "left") {
                                        a.watchFunctions.push(function(t, e, r, n) {
                                            if (a.y >= e) {
                                                a.x += t;
                                                a.settings.width += r;
                                                return true
                                            } else if (n && n.nodeType === 1 && !N[n.nodeName] && a.x + n.width > a.pdf.margins_doc.left + a.pdf.margins_doc.width) {
                                                a.x += t;
                                                a.y = e;
                                                a.settings.width += r;
                                                return true
                                            } else {
                                                return false
                                            }
                                        }
                                        .bind(this, S["float"] === "left" ? -s.width - k - P : 0, a.y + s.height + I + C, s.width));
                                        a.watchFunctions.push(function(t, e, r) {
                                            if (a.y < t && e === a.pdf.internal.getNumberOfPages()) {
                                                if (r.nodeType === 1 && l(r).clear === "both") {
                                                    a.y = t;
                                                    return true
                                                } else {
                                                    return false
                                                }
                                            } else {
                                                return true
                                            }
                                        }
                                        .bind(this, a.y + s.height, a.pdf.internal.getNumberOfPages()));
                                        a.settings.width -= s.width + k + P;
                                        if (S["float"] === "left") {
                                            a.x += s.width + k + P
                                        }
                                    } else {
                                        a.y += s.height + I + C
                                    }
                                } else if (s.nodeName === "TABLE") {
                                    p = x(s, a);
                                    a.y += 10;
                                    a.pdf.table(a.x, a.y, p.rows, p.headers, {
                                        autoSize: false,
                                        printHeaders: o.printHeaders,
                                        margins: a.pdf.margins_doc,
                                        css: l(s)
                                    });
                                    a.y = a.pdf.lastCellPos.y + a.pdf.lastCellPos.h + 20
                                } else if (s.nodeName === "OL" || s.nodeName === "UL") {
                                    L = 1;
                                    if (!g(s, a, o)) {
                                        n(s, a, o)
                                    }
                                    a.y += 10
                                } else if (s.nodeName === "LI") {
                                    var B = a.x;
                                    a.x += 20 / a.pdf.internal.scaleFactor;
                                    a.y += 3;
                                    if (!g(s, a, o)) {
                                        n(s, a, o)
                                    }
                                    a.x = B
                                } else if (s.nodeName === "BR") {
                                    a.y += u["font-size"] * a.pdf.internal.scaleFactor;
                                    a.addText("\u2028", r(u))
                                } else {
                                    if (!g(s, a, o)) {
                                        n(s, a, o)
                                    }
                                }
                            } else if (s.nodeType === 3) {
                                var j = s.nodeValue;
                                if (s.nodeValue && s.parentNode.nodeName === "LI") {
                                    if (s.parentNode.parentNode.nodeName === "OL") {
                                        j = L++ + ". " + j
                                    } else {
                                        var E = u["font-size"];
                                        var M = (3 - E * .75) * a.pdf.internal.scaleFactor;
                                        var O = E * .75 * a.pdf.internal.scaleFactor;
                                        var q = E * 1.74 / a.pdf.internal.scaleFactor;
                                        v = function t(e, r) {
                                            this.pdf.circle(e + M, r + O, q, "FD")
                                        }
                                    }
                                }
                                if (!!(s.ownerDocument.body.compareDocumentPosition(s) & 16)) {
                                    a.addText(j, u)
                                }
                            } else if (typeof s === "string") {
                                a.addText(s, u)
                            }
                        }
                        h++
                    }
                    o.outY = a.y;
                    if (c) {
                        return a.setBlockBoundary(v)
                    }
                }
                ;
                m = {};
                y = function t(e, r, n, i) {
                    var a = e.getElementsByTagName("img"), o = a.length, s, f = 0;
                    function u() {
                        r.pdf.internal.events.publish("imagesLoaded");
                        i(s)
                    }
                    function l(t, e, n) {
                        if (!t)
                            return;
                        var i = new Image;
                        s = ++f;
                        i.crossOrigin = "";
                        i.onerror = i.onload = function() {
                            if (i.complete) {
                                if (i.src.indexOf("data:image/") === 0) {
                                    i.width = e || i.width || 0;
                                    i.height = n || i.height || 0
                                }
                                if (i.width + i.height) {
                                    var a = r.pdf.sHashCode(t) || t;
                                    m[a] = m[a] || i
                                }
                            }
                            if (!--f) {
                                u()
                            }
                        }
                        ;
                        i.src = t
                    }
                    while (o--) {
                        l(a[o].getAttribute("src"), a[o].width, a[o].height)
                    }
                    return f || u()
                }
                ;
                w = function t(e, r, i) {
                    var a = e.getElementsByTagName("footer");
                    if (a.length > 0) {
                        a = a[0];
                        var o = r.pdf.internal.write;
                        var s = r.y;
                        r.pdf.internal.write = function() {}
                        ;
                        n(a, r, i);
                        var f = Math.ceil(r.y - s) + 5;
                        r.y = s;
                        r.pdf.internal.write = o;
                        r.pdf.margins_doc.bottom += f;
                        var u = function t(e) {
                            var o = e !== undefined ? e.pageNumber : 1;
                            var s = r.y;
                            r.y = r.pdf.internal.pageSize.getHeight() - r.pdf.margins_doc.bottom;
                            r.pdf.margins_doc.bottom -= f;
                            var u = a.getElementsByTagName("span");
                            for (var l = 0; l < u.length; ++l) {
                                if ((" " + u[l].className + " ").replace(/[\n\t]/g, " ").indexOf(" pageCounter ") > -1) {
                                    u[l].innerHTML = o
                                }
                                if ((" " + u[l].className + " ").replace(/[\n\t]/g, " ").indexOf(" totalPages ") > -1) {
                                    u[l].innerHTML = "###jsPDFVarTotalPages###"
                                }
                            }
                            n(a, r, i);
                            r.pdf.margins_doc.bottom += f;
                            r.y = s
                        };
                        var l = a.getElementsByTagName("span");
                        for (var h = 0; h < l.length; ++h) {
                            if ((" " + l[h].className + " ").replace(/[\n\t]/g, " ").indexOf(" totalPages ") > -1) {
                                r.pdf.internal.events.subscribe("htmlRenderingFinished", r.pdf.putTotalPages.bind(r.pdf, "###jsPDFVarTotalPages###"), true)
                            }
                        }
                        r.pdf.internal.events.subscribe("addPage", u, false);
                        u();
                        N["FOOTER"] = 1
                    }
                }
                ;
                b = function t(e, r, i, a, o, s) {
                    if (!r)
                        return false;
                    if (typeof r !== "string" && !r.parentNode)
                        r = "" + r.innerHTML;
                    if (typeof r === "string") {
                        r = function(t) {
                            var e, r, n, i;
                            n = "jsPDFhtmlText" + Date.now().toString() + (Math.random() * 1e3).toFixed(0);
                            i = "position: absolute !important;" + "clip: rect(1px 1px 1px 1px); /* IE6, IE7 */" + "clip: rect(1px, 1px, 1px, 1px);" + "padding:0 !important;" + "border:0 !important;" + "height: 1px !important;" + "width: 1px !important; " + "top:auto;" + "left:-100px;" + "overflow: hidden;";
                            r = document.createElement("div");
                            r.style.cssText = i;
                            r.innerHTML = '<iframe style="height:1px;width:1px" name="' + n + '" />';
                            document.body.appendChild(r);
                            e = window.frames[n];
                            e.document.open();
                            e.document.writeln(t);
                            e.document.close();
                            return e.document.body
                        }(r.replace(/<\/?script[^>]*?>/gi, ""))
                    }
                    var f = new c(e,i,a,o), u;
                    y.call(this, r, f, o.elementHandlers, function(t) {
                        w(r, f, o.elementHandlers);
                        n(r, f, o.elementHandlers);
                        f.pdf.internal.events.publish("htmlRenderingFinished");
                        u = f.dispose();
                        if (typeof s === "function")
                            s(u);
                        else if (t)
                            console.error("jsPDF Warning: rendering issues? provide a callback to fromHTML!")
                    });
                    return u || {
                        x: f.x,
                        y: f.y
                    }
                }
                ;
                c.prototype.init = function() {
                    this.paragraph = {
                        text: [],
                        style: []
                    };
                    return this.pdf.internal.write("q")
                }
                ;
                c.prototype.dispose = function() {
                    this.pdf.internal.write("Q");
                    return {
                        x: this.x,
                        y: this.y,
                        ready: true
                    }
                }
                ;
                c.prototype.executeWatchFunctions = function(t) {
                    var e = false;
                    var r = [];
                    if (this.watchFunctions.length > 0) {
                        for (var n = 0; n < this.watchFunctions.length; ++n) {
                            if (this.watchFunctions[n](t) === true) {
                                e = true
                            } else {
                                r.push(this.watchFunctions[n])
                            }
                        }
                        this.watchFunctions = r
                    }
                    return e
                }
                ;
                c.prototype.splitFragmentsIntoLines = function(t, e) {
                    var n, i, a, o, s, f, u, l, h, c, d, p, v, g, m;
                    i = 12;
                    d = this.pdf.internal.scaleFactor;
                    s = {};
                    a = void 0;
                    c = void 0;
                    o = void 0;
                    f = void 0;
                    m = void 0;
                    h = void 0;
                    l = void 0;
                    u = void 0;
                    p = [];
                    v = [p];
                    n = 0;
                    g = this.settings.width;
                    while (t.length) {
                        f = t.shift();
                        m = e.shift();
                        if (f) {
                            a = m["font-family"];
                            c = m["font-style"];
                            o = s[a + c];
                            if (!o) {
                                o = this.pdf.internal.getFont(a, c).metadata.Unicode;
                                s[a + c] = o
                            }
                            h = {
                                widths: o.widths,
                                kerning: o.kerning,
                                fontSize: m["font-size"] * i,
                                textIndent: n
                            };
                            l = this.pdf.getStringUnitWidth(f, h) * h.fontSize / d;
                            if (f == "\u2028") {
                                p = [];
                                v.push(p)
                            } else if (n + l > g) {
                                u = this.pdf.splitTextToSize(f, g, h);
                                p.push([u.shift(), m]);
                                while (u.length) {
                                    p = [[u.shift(), m]];
                                    v.push(p)
                                }
                                n = this.pdf.getStringUnitWidth(p[0][0], h) * h.fontSize / d
                            } else {
                                p.push([f, m]);
                                n += l
                            }
                        }
                    }
                    if (m["text-align"] !== undefined && (m["text-align"] === "center" || m["text-align"] === "right" || m["text-align"] === "justify")) {
                        for (var y = 0; y < v.length; ++y) {
                            var w = this.pdf.getStringUnitWidth(v[y][0][0], h) * h.fontSize / d;
                            if (y > 0) {
                                v[y][0][1] = r(v[y][0][1])
                            }
                            var b = g - w;
                            if (m["text-align"] === "right") {
                                v[y][0][1]["margin-left"] = b
                            } else if (m["text-align"] === "center") {
                                v[y][0][1]["margin-left"] = b / 2
                            } else if (m["text-align"] === "justify") {
                                var x = v[y][0][0].split(" ").length - 1;
                                v[y][0][1]["word-spacing"] = b / x;
                                if (y === v.length - 1) {
                                    v[y][0][1]["word-spacing"] = 0
                                }
                            }
                        }
                    }
                    return v
                }
                ;
                c.prototype.RenderTextFragment = function(t, e) {
                    var r, n, i;
                    i = 0;
                    r = 12;
                    if (this.pdf.internal.pageSize.getHeight() - this.pdf.margins_doc.bottom < this.y + this.pdf.internal.getFontSize()) {
                        this.pdf.internal.write("ET", "Q");
                        this.pdf.addPage();
                        this.y = this.pdf.margins_doc.top;
                        this.pdf.internal.write("q", "BT", this.getPdfColor(e.color), this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");
                        i = Math.max(i, e["line-height"], e["font-size"]);
                        this.pdf.internal.write(0, (-1 * r * i).toFixed(2), "Td")
                    }
                    n = this.pdf.internal.getFont(e["font-family"], e["font-style"]);
                    var a = this.getPdfColor(e["color"]);
                    if (a !== this.lastTextColor) {
                        this.pdf.internal.write(a);
                        this.lastTextColor = a
                    }
                    if (e["word-spacing"] !== undefined && e["word-spacing"] > 0) {
                        this.pdf.internal.write(e["word-spacing"].toFixed(2), "Tw")
                    }
                    this.pdf.internal.write("/" + n.id, (r * e["font-size"]).toFixed(2), "Tf", "(" + this.pdf.internal.pdfEscape(t) + ") Tj");
                    if (e["word-spacing"] !== undefined) {
                        this.pdf.internal.write(0, "Tw")
                    }
                }
                ;
                c.prototype.getPdfColor = function(t) {
                    var e;
                    var r, n, i;
                    var a = /rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+\s*)\)/;
                    var o = a.exec(t);
                    if (o != null) {
                        r = parseInt(o[1]);
                        n = parseInt(o[2]);
                        i = parseInt(o[3])
                    } else {
                        if (typeof t === "string" && t.charAt(0) != "#") {
                            var s = new RGBColor(t);
                            if (s.ok) {
                                t = s.toHex()
                            } else {
                                t = "#000000"
                            }
                        }
                        r = t.substring(1, 3);
                        r = parseInt(r, 16);
                        n = t.substring(3, 5);
                        n = parseInt(n, 16);
                        i = t.substring(5, 7);
                        i = parseInt(i, 16)
                    }
                    if (typeof r === "string" && /^#[0-9A-Fa-f]{6}$/.test(r)) {
                        var f = parseInt(r.substr(1), 16);
                        r = f >> 16 & 255;
                        n = f >> 8 & 255;
                        i = f & 255
                    }
                    var u = this.f3;
                    if (r === 0 && n === 0 && i === 0 || typeof n === "undefined") {
                        e = u(r / 255) + " g"
                    } else {
                        e = [u(r / 255), u(n / 255), u(i / 255), "rg"].join(" ")
                    }
                    return e
                }
                ;
                c.prototype.f3 = function(t) {
                    return t.toFixed(3)
                }
                ,
                c.prototype.renderParagraph = function(t) {
                    var e, r, n, i, a, o, s, f, u, l, c, d, p, v, g;
                    i = h(this.paragraph.text);
                    v = this.paragraph.style;
                    e = this.paragraph.blockstyle;
                    p = this.paragraph.priorblockstyle || {};
                    this.paragraph = {
                        text: [],
                        style: [],
                        blockstyle: {},
                        priorblockstyle: e
                    };
                    if (!i.join("").trim()) {
                        return
                    }
                    f = this.splitFragmentsIntoLines(i, v);
                    s = void 0;
                    u = void 0;
                    r = 12;
                    n = r / this.pdf.internal.scaleFactor;
                    this.priorMarginBottom = this.priorMarginBottom || 0;
                    d = (Math.max((e["margin-top"] || 0) - this.priorMarginBottom, 0) + (e["padding-top"] || 0)) * n;
                    c = ((e["margin-bottom"] || 0) + (e["padding-bottom"] || 0)) * n;
                    this.priorMarginBottom = e["margin-bottom"] || 0;
                    if (e["page-break-before"] === "always") {
                        this.pdf.addPage();
                        this.y = 0;
                        d = ((e["margin-top"] || 0) + (e["padding-top"] || 0)) * n
                    }
                    l = this.pdf.internal.write;
                    a = void 0;
                    o = void 0;
                    this.y += d;
                    l("q", "BT 0 g", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");
                    var m = 0;
                    while (f.length) {
                        s = f.shift();
                        u = 0;
                        a = 0;
                        o = s.length;
                        while (a !== o) {
                            if (s[a][0].trim()) {
                                u = Math.max(u, s[a][1]["line-height"], s[a][1]["font-size"]);
                                g = s[a][1]["font-size"] * 7
                            }
                            a++
                        }
                        var y = 0;
                        var w = 0;
                        if (s[0][1]["margin-left"] !== undefined && s[0][1]["margin-left"] > 0) {
                            w = this.pdf.internal.getCoordinateString(s[0][1]["margin-left"]);
                            y = w - m;
                            m = w
                        }
                        var b = Math.max(e["margin-left"] || 0, 0) * n;
                        l(y + b, (-1 * r * u).toFixed(2), "Td");
                        a = 0;
                        o = s.length;
                        while (a !== o) {
                            if (s[a][0]) {
                                this.RenderTextFragment(s[a][0], s[a][1])
                            }
                            a++
                        }
                        this.y += u * n;
                        if (this.executeWatchFunctions(s[0][1]) && f.length > 0) {
                            var x = [];
                            var N = [];
                            f.forEach(function(t) {
                                var e = 0;
                                var r = t.length;
                                while (e !== r) {
                                    if (t[e][0]) {
                                        x.push(t[e][0] + " ");
                                        N.push(t[e][1])
                                    }
                                    ++e
                                }
                            });
                            f = this.splitFragmentsIntoLines(h(x), N);
                            l("ET", "Q");
                            l("q", "BT 0 g", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td")
                        }
                    }
                    if (t && typeof t === "function") {
                        t.call(this, this.x - 9, this.y - g / 2)
                    }
                    l("ET", "Q");
                    return this.y += c
                }
                ;
                c.prototype.setBlockBoundary = function(t) {
                    return this.renderParagraph(t)
                }
                ;
                c.prototype.setBlockStyle = function(t) {
                    return this.paragraph.blockstyle = t
                }
                ;
                c.prototype.addText = function(t, e) {
                    this.paragraph.text.push(t);
                    return this.paragraph.style.push(e)
                }
                ;
                i = {
                    helvetica: "helvetica",
                    "sans-serif": "helvetica",
                    "times new roman": "times",
                    serif: "times",
                    times: "times",
                    monospace: "courier",
                    courier: "courier"
                };
                s = {
                    100: "normal",
                    200: "normal",
                    300: "normal",
                    400: "normal",
                    500: "bold",
                    600: "bold",
                    700: "bold",
                    800: "bold",
                    900: "bold",
                    normal: "normal",
                    bold: "bold",
                    bolder: "bold",
                    lighter: "normal"
                };
                a = {
                    normal: "normal",
                    italic: "italic",
                    oblique: "italic"
                };
                o = {
                    left: "left",
                    right: "right",
                    center: "center",
                    justify: "justify"
                };
                f = {
                    none: "none",
                    right: "right",
                    left: "left"
                };
                u = {
                    none: "none",
                    both: "both"
                };
                v = {
                    normal: 1
                };
                e.fromHTML = function(t, e, r, n, i, a) {
                    this.margins_doc = a || {
                        top: 0,
                        bottom: 0
                    };
                    if (!n)
                        n = {};
                    if (!n.elementHandlers)
                        n.elementHandlers = {};
                    return b(this, t, isNaN(e) ? 4 : e, isNaN(r) ? 4 : r, n, i)
                }
            }
            )(e.API);
            /**
     * html2pdf.js
     * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t, e) {
                e.html2pdf = function(t, e, r) {
                    var n = e.canvas;
                    if (!n) {
                        alert("jsPDF canvas plugin not installed");
                        return
                    }
                    n.pdf = e;
                    e.annotations = {
                        _nameMap: [],
                        createAnnotation: function t(r, n) {
                            var i = e.context2d._wrapX(n.left);
                            var a = e.context2d._wrapY(n.top);
                            var o = e.context2d._page(n.top);
                            var s;
                            var f = r.indexOf("#");
                            if (f >= 0) {
                                s = {
                                    name: r.substring(f + 1)
                                }
                            } else {
                                s = {
                                    url: r
                                }
                            }
                            e.link(i, a, n.right - n.left, n.bottom - n.top, s)
                        },
                        setName: function t(r, n) {
                            var i = e.context2d._wrapX(n.left);
                            var a = e.context2d._wrapY(n.top);
                            var o = e.context2d._page(n.top);
                            this._nameMap[r] = {
                                page: o,
                                x: i,
                                y: a
                            }
                        }
                    };
                    n.annotations = e.annotations;
                    e.context2d._pageBreakAt = function(t) {
                        this.pageBreaks.push(t)
                    }
                    ;
                    e.context2d._gotoPage = function(t) {
                        while (e.internal.getNumberOfPages() < t) {
                            e.addPage()
                        }
                        e.setPage(t)
                    }
                    ;
                    var i;
                    var a;
                    if (typeof t === "string") {
                        t = t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
                        var o = document.createElement("iframe");
                        document.body.appendChild(o);
                        var s;
                        var f;
                        s = o.contentDocument;
                        if (s == undefined || s == null) {
                            s = o.contentWindow.document
                        }
                        s.open();
                        s.write(t);
                        s.close();
                        i = s.body;
                        f = s.body || {},
                        t = s.documentElement || {};
                        a = Math.max(f.scrollHeight, f.offsetHeight, t.clientHeight, t.scrollHeight, t.offsetHeight)
                    } else {
                        i = t;
                        f = t.body || {},
                        a = Math.max(f.scrollHeight, f.offsetHeight, t.clientHeight, t.scrollHeight, t.offsetHeight)
                    }
                    a = e.internal.pageSize.getHeight();
                    var u = {
                        async: true,
                        allowTaint: true,
                        backgroundColor: "#ffffff",
                        canvas: n,
                        imageTimeout: 15e3,
                        logging: true,
                        proxy: null,
                        removeContainer: true,
                        foreignObjectRendering: false,
                        useCORS: false,
                        windowHeight: a,
                        scrollY: a
                    };
                    e.context2d.pageWrapYEnabled = true;
                    e.context2d.pageWrapY = e.internal.pageSize.getHeight();
                    var l = html2canvas(i, u).then(function(t) {
                        if (r) {
                            if (o) {
                                o.parentElement.removeChild(o)
                            }
                            r(e)
                        }
                    })
                }
            }
            )(e.API, typeof window !== "undefined" && window || typeof global !== "undefined" && global);
            window.tmp = html2pdf;
            /* Blob.js
     * A Blob, File, FileReader & URL implementation.
     * 2018-08-09
     *
     * By Eli Grey, http://eligrey.com
     * By Jimmy Wärting, https://github.com/jimmywarting
     * License: MIT
     *   See https://github.com/eligrey/Blob.js/blob/master/LICENSE.md
     */
            (function(t) {
                var e = t.BlobBuilder || t.WebKitBlobBuilder || t.MSBlobBuilder || t.MozBlobBuilder;
                t.URL = t.URL || t.webkitURL || function(t, e) {
                    e = document.createElement("a");
                    e.href = t;
                    return e
                }
                ;
                var r = t.Blob;
                var n = URL.createObjectURL;
                var i = URL.revokeObjectURL;
                var a = t.Symbol && t.Symbol.toStringTag;
                var o = false;
                var s = false;
                var f = !!t.ArrayBuffer;
                var u = e && e.prototype.append && e.prototype.getBlob;
                try {
                    o = new Blob(["ä"]).size === 2;
                    s = new Blob([new Uint8Array([1, 2])]).size === 2
                } catch (t) {}
                function l(t) {
                    return t.map(function(t) {
                        if (t.buffer instanceof ArrayBuffer) {
                            var e = t.buffer;
                            if (t.byteLength !== e.byteLength) {
                                var r = new Uint8Array(t.byteLength);
                                r.set(new Uint8Array(e,t.byteOffset,t.byteLength));
                                e = r.buffer
                            }
                            return e
                        }
                        return t
                    })
                }
                function h(t, r) {
                    r = r || {};
                    var n = new e;
                    l(t).forEach(function(t) {
                        n.append(t)
                    });
                    return r.type ? n.getBlob(r.type) : n.getBlob()
                }
                function c(t, e) {
                    return new r(l(t),e || {})
                }
                if (t.Blob) {
                    h.prototype = Blob.prototype;
                    c.prototype = Blob.prototype
                }
                function d() {
                    function e(t) {
                        var e = [];
                        for (var r = 0; r < t.length; r++) {
                            var n = t.charCodeAt(r);
                            if (n < 128)
                                e.push(n);
                            else if (n < 2048) {
                                e.push(192 | n >> 6, 128 | n & 63)
                            } else if (n < 55296 || n >= 57344) {
                                e.push(224 | n >> 12, 128 | n >> 6 & 63, 128 | n & 63)
                            } else {
                                r++;
                                n = 65536 + ((n & 1023) << 10 | t.charCodeAt(r) & 1023);
                                e.push(240 | n >> 18, 128 | n >> 12 & 63, 128 | n >> 6 & 63, 128 | n & 63)
                            }
                        }
                        return e
                    }
                    function r(t) {
                        var e, r, n, i;
                        var a, o;
                        e = "";
                        n = t.length;
                        r = 0;
                        while (r < n) {
                            i = t[r++];
                            switch (i >> 4) {
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                            case 5:
                            case 6:
                            case 7:
                                e += String.fromCharCode(i);
                                break;
                            case 12:
                            case 13:
                                a = t[r++];
                                e += String.fromCharCode((i & 31) << 6 | a & 63);
                                break;
                            case 14:
                                a = t[r++];
                                o = t[r++];
                                e += String.fromCharCode((i & 15) << 12 | (a & 63) << 6 | (o & 63) << 0);
                                break
                            }
                        }
                        return e
                    }
                    function a(t) {
                        return t && DataView.prototype.isPrototypeOf(t)
                    }
                    function o(t) {
                        var e = new Array(t.byteLength);
                        var r = new Uint8Array(t);
                        var n = e.length;
                        while (n--) {
                            e[n] = r[n]
                        }
                        return e
                    }
                    function s(t) {
                        var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        var r = [];
                        for (var n = 0; n < t.length; n += 3) {
                            var i = t[n];
                            var a = n + 1 < t.length;
                            var o = a ? t[n + 1] : 0;
                            var s = n + 2 < t.length;
                            var f = s ? t[n + 2] : 0;
                            var u = i >> 2;
                            var l = (i & 3) << 4 | o >> 4;
                            var h = (o & 15) << 2 | f >> 6;
                            var c = f & 63;
                            if (!s) {
                                c = 64;
                                if (!a) {
                                    h = 64
                                }
                            }
                            r.push(e[u], e[l], e[h], e[c])
                        }
                        return r.join("")
                    }
                    var u = Object.create || function(t) {
                        function e() {}
                        e.prototype = t;
                        return new e
                    }
                    ;
                    if (f) {
                        var l = ["[object Int8Array]", "[object Uint8Array]", "[object Uint8ClampedArray]", "[object Int16Array]", "[object Uint16Array]", "[object Int32Array]", "[object Uint32Array]", "[object Float32Array]", "[object Float64Array]"];
                        var h = ArrayBuffer.isView || function(t) {
                            return t && l.indexOf(Object.prototype.toString.call(t)) > -1
                        }
                    }
                    function c(t, r) {
                        t = t || [];
                        for (var n = 0, i = t.length; n < i; n++) {
                            var s = t[n];
                            if (s instanceof c) {
                                t[n] = s._buffer
                            } else if (typeof s === "string") {
                                t[n] = e(s)
                            } else if (f && (ArrayBuffer.prototype.isPrototypeOf(s) || h(s))) {
                                t[n] = o(s)
                            } else if (f && a(s)) {
                                t[n] = o(s.buffer)
                            } else {
                                t[n] = e(String(s))
                            }
                        }
                        this._buffer = [].concat.apply([], t);
                        this.size = this._buffer.length;
                        this.type = r ? r.type || "" : ""
                    }
                    c.prototype.slice = function(t, e, r) {
                        var n = this._buffer.slice(t || 0, e || this._buffer.length);
                        return new c([n],{
                            type: r
                        })
                    }
                    ;
                    c.prototype.toString = function() {
                        return "[object Blob]"
                    }
                    ;
                    function d(t, e, r) {
                        r = r || {};
                        var n = c.call(this, t, r) || this;
                        n.name = e;
                        n.lastModifiedDate = r.lastModified ? new Date(r.lastModified) : new Date;
                        n.lastModified = +n.lastModifiedDate;
                        return n
                    }
                    d.prototype = u(c.prototype);
                    d.prototype.constructor = d;
                    if (Object.setPrototypeOf)
                        Object.setPrototypeOf(d, c);
                    else {
                        try {
                            d.__proto__ = c
                        } catch (t) {}
                    }
                    d.prototype.toString = function() {
                        return "[object File]"
                    }
                    ;
                    function p() {
                        if (!(this instanceof p))
                            throw new TypeError("Failed to construct 'FileReader': Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
                        var t = document.createDocumentFragment();
                        this.addEventListener = t.addEventListener;
                        this.dispatchEvent = function(e) {
                            var r = this["on" + e.type];
                            if (typeof r === "function")
                                r(e);
                            t.dispatchEvent(e)
                        }
                        ;
                        this.removeEventListener = t.removeEventListener
                    }
                    function v(t, e, r) {
                        if (!(e instanceof c))
                            throw new TypeError("Failed to execute '" + r + "' on 'FileReader': parameter 1 is not of type 'Blob'.");
                        t.result = "";
                        setTimeout(function() {
                            this.readyState = p.LOADING;
                            t.dispatchEvent(new Event("load"));
                            t.dispatchEvent(new Event("loadend"))
                        })
                    }
                    p.EMPTY = 0;
                    p.LOADING = 1;
                    p.DONE = 2;
                    p.prototype.error = null;
                    p.prototype.onabort = null;
                    p.prototype.onerror = null;
                    p.prototype.onload = null;
                    p.prototype.onloadend = null;
                    p.prototype.onloadstart = null;
                    p.prototype.onprogress = null;
                    p.prototype.readAsDataURL = function(t) {
                        v(this, t, "readAsDataURL");
                        this.result = "data:" + t.type + ";base64," + s(t._buffer)
                    }
                    ;
                    p.prototype.readAsText = function(t) {
                        v(this, t, "readAsText");
                        this.result = r(t._buffer)
                    }
                    ;
                    p.prototype.readAsArrayBuffer = function(t) {
                        v(this, t, "readAsText");
                        this.result = t._buffer.slice()
                    }
                    ;
                    p.prototype.abort = function() {}
                    ;
                    URL.createObjectURL = function(t) {
                        return t instanceof c ? "data:" + t.type + ";base64," + s(t._buffer) : n.call(URL, t)
                    }
                    ;
                    URL.revokeObjectURL = function(t) {
                        i && i.call(URL, t)
                    }
                    ;
                    var g = t.XMLHttpRequest && t.XMLHttpRequest.prototype.send;
                    if (g) {
                        XMLHttpRequest.prototype.send = function(t) {
                            if (t instanceof c) {
                                this.setRequestHeader("Content-Type", t.type);
                                g.call(this, r(t._buffer))
                            } else {
                                g.call(this, t)
                            }
                        }
                    }
                    t.FileReader = p;
                    t.File = d;
                    t.Blob = c
                }
                if (a) {
                    try {
                        File.prototype[a] = "File";
                        Blob.prototype[a] = "Blob";
                        FileReader.prototype[a] = "FileReader"
                    } catch (t) {}
                }
                function p() {
                    var e = !!t.ActiveXObject || "-ms-scroll-limit"in document.documentElement.style && "-ms-ime-align"in document.documentElement.style;
                    var r = t.XMLHttpRequest && t.XMLHttpRequest.prototype.send;
                    if (e && r) {
                        XMLHttpRequest.prototype.send = function(t) {
                            if (t instanceof Blob) {
                                this.setRequestHeader("Content-Type", t.type);
                                r.call(this, t)
                            } else {
                                r.call(this, t)
                            }
                        }
                    }
                    try {
                        new File([],"")
                    } catch (e) {
                        try {
                            var n = new Function("class File extends Blob {" + "constructor(chunks, name, opts) {" + "opts = opts || {};" + "super(chunks, opts || {});" + "this.name = name;" + "this.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date;" + "this.lastModified = +this.lastModifiedDate;" + "}};" + 'return new File([], ""), File')();
                            t.File = n
                        } catch (e) {
                            var n = function t(e, r, n) {
                                var i = new Blob(e,n);
                                var o = n && void 0 !== n.lastModified ? new Date(n.lastModified) : new Date;
                                i.name = r;
                                i.lastModifiedDate = o;
                                i.lastModified = +o;
                                i.toString = function() {
                                    return "[object File]"
                                }
                                ;
                                if (a)
                                    i[a] = "File";
                                return i
                            };
                            t.File = n
                        }
                    }
                }
                if (o) {
                    p();
                    t.Blob = s ? t.Blob : c
                } else if (u) {
                    p();
                    t.Blob = h
                } else {
                    d()
                }
            }
            )(typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || Function('return typeof this === "object" && this.content')() || Function("return this")());
            /* FileSaver.js
     * A saveAs() FileSaver implementation.
     * 1.3.8
     * 2018-03-22 14:03:47
     *
     * By Eli Grey, https://eligrey.com
     * License: MIT
     *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
     */
            var r = r || function(t) {
                if (typeof t === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
                    return
                }
                var e = t.document
                  , r = function() {
                    return t.URL || t.webkitURL || t
                }
                  , n = e.createElementNS("http://www.w3.org/1999/xhtml", "a")
                  , i = "download"in n
                  , a = function(t) {
                    var e = new MouseEvent("click");
                    t.dispatchEvent(e)
                }
                  , o = /constructor/i.test(t.HTMLElement) || t.safari
                  , s = /CriOS\/[\d]+/.test(navigator.userAgent)
                  , f = t.setImmediate || t.setTimeout
                  , u = function(t) {
                    f(function() {
                        throw t
                    }, 0)
                }
                  , l = "application/octet-stream"
                  , h = 1e3 * 40
                  , c = function(t) {
                    var e = function() {
                        if (typeof t === "string") {
                            r().revokeObjectURL(t)
                        } else {
                            t.remove()
                        }
                    };
                    setTimeout(e, h)
                }
                  , d = function(t, e, r) {
                    e = [].concat(e);
                    var n = e.length;
                    while (n--) {
                        var i = t["on" + e[n]];
                        if (typeof i === "function") {
                            try {
                                i.call(t, r || t)
                            } catch (t) {
                                u(t)
                            }
                        }
                    }
                }
                  , p = function(t) {
                    if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)) {
                        return new Blob([String.fromCharCode(65279), t],{
                            type: t.type
                        })
                    }
                    return t
                }
                  , v = function(e, u, h) {
                    if (!h) {
                        e = p(e)
                    }
                    var v = this, g = e.type, m = g === l, y, w = function() {
                        d(v, "writestart progress write writeend".split(" "))
                    }, b = function() {
                        if ((s || m && o) && t.FileReader) {
                            var n = new FileReader;
                            n.onloadend = function() {
                                var e = s ? n.result : n.result.replace(/^data:[^;]*;/, "data:attachment/file;");
                                var r = t.open(e, "_blank");
                                if (!r)
                                    t.location.href = e;
                                e = undefined;
                                v.readyState = v.DONE;
                                w()
                            }
                            ;
                            n.readAsDataURL(e);
                            v.readyState = v.INIT;
                            return
                        }
                        if (!y) {
                            y = r().createObjectURL(e)
                        }
                        if (m) {
                            t.location.href = y
                        } else {
                            var i = t.open(y, "_blank");
                            if (!i) {
                                t.location.href = y
                            }
                        }
                        v.readyState = v.DONE;
                        w();
                        c(y)
                    };
                    v.readyState = v.INIT;
                    if (i) {
                        y = r().createObjectURL(e);
                        f(function() {
                            n.href = y;
                            n.download = u;
                            a(n);
                            w();
                            c(y);
                            v.readyState = v.DONE
                        }, 0);
                        return
                    }
                    b()
                }
                  , g = v.prototype
                  , m = function(t, e, r) {
                    return new v(t,e || t.name || "download",r)
                };
                if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
                    return function(t, e, r) {
                        e = e || t.name || "download";
                        if (!r) {
                            t = p(t)
                        }
                        return navigator.msSaveOrOpenBlob(t, e)
                    }
                }
                g.abort = function() {}
                ;
                g.readyState = g.INIT = 0;
                g.WRITING = 1;
                g.DONE = 2;
                g.error = g.onwritestart = g.onprogress = g.onwrite = g.onabort = g.onerror = g.onwriteend = null;
                return m
            }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || undefined);
            // (c) Dean McNamee <dean@gmail.com>, 2013.
            function n(t, e, r, n) {
                var a = 0;
                var n = n === undefined ? {} : n;
                var o = n.loop === undefined ? null : n.loop;
                var s = n.palette === undefined ? null : n.palette;
                if (e <= 0 || r <= 0 || e > 65535 || r > 65535)
                    throw "Width/Height invalid.";
                function f(t) {
                    var e = t.length;
                    if (e < 2 || e > 256 || e & e - 1)
                        throw "Invalid code/color length, must be power of 2 and 2 .. 256.";
                    return e
                }
                t[a++] = 71;
                t[a++] = 73;
                t[a++] = 70;
                t[a++] = 56;
                t[a++] = 57;
                t[a++] = 97;
                var u = 0;
                var l = 0;
                if (s !== null) {
                    var h = f(s);
                    while (h >>= 1)
                        ++u;
                    h = 1 << u;
                    --u;
                    if (n.background !== undefined) {
                        l = n.background;
                        if (l >= h)
                            throw "Background index out of range.";
                        if (l === 0)
                            throw "Background index explicitly passed as 0."
                    }
                }
                t[a++] = e & 255;
                t[a++] = e >> 8 & 255;
                t[a++] = r & 255;
                t[a++] = r >> 8 & 255;
                t[a++] = (s !== null ? 128 : 0) | u;
                t[a++] = l;
                t[a++] = 0;
                if (s !== null) {
                    for (var c = 0, d = s.length; c < d; ++c) {
                        var p = s[c];
                        t[a++] = p >> 16 & 255;
                        t[a++] = p >> 8 & 255;
                        t[a++] = p & 255
                    }
                }
                if (o !== null) {
                    if (o < 0 || o > 65535)
                        throw "Loop count invalid.";
                    t[a++] = 33;
                    t[a++] = 255;
                    t[a++] = 11;
                    t[a++] = 78;
                    t[a++] = 69;
                    t[a++] = 84;
                    t[a++] = 83;
                    t[a++] = 67;
                    t[a++] = 65;
                    t[a++] = 80;
                    t[a++] = 69;
                    t[a++] = 50;
                    t[a++] = 46;
                    t[a++] = 48;
                    t[a++] = 3;
                    t[a++] = 1;
                    t[a++] = o & 255;
                    t[a++] = o >> 8 & 255;
                    t[a++] = 0
                }
                var v = false;
                this.addFrame = function(e, r, n, o, u, l) {
                    if (v === true) {
                        --a;
                        v = false
                    }
                    l = l === undefined ? {} : l;
                    if (e < 0 || r < 0 || e > 65535 || r > 65535)
                        throw "x/y invalid.";
                    if (n <= 0 || o <= 0 || n > 65535 || o > 65535)
                        throw "Width/Height invalid.";
                    if (u.length < n * o)
                        throw "Not enough pixels for the frame size.";
                    var h = true;
                    var c = l.palette;
                    if (c === undefined || c === null) {
                        h = false;
                        c = s
                    }
                    if (c === undefined || c === null)
                        throw "Must supply either a local or global palette.";
                    var d = f(c);
                    var p = 0;
                    while (d >>= 1)
                        ++p;
                    d = 1 << p;
                    var g = l.delay === undefined ? 0 : l.delay;
                    var m = l.disposal === undefined ? 0 : l.disposal;
                    if (m < 0 || m > 3)
                        throw "Disposal out of range.";
                    var y = false;
                    var w = 0;
                    if (l.transparent !== undefined && l.transparent !== null) {
                        y = true;
                        w = l.transparent;
                        if (w < 0 || w >= d)
                            throw "Transparent color index."
                    }
                    if (m !== 0 || y || g !== 0) {
                        t[a++] = 33;
                        t[a++] = 249;
                        t[a++] = 4;
                        t[a++] = m << 2 | (y === true ? 1 : 0);
                        t[a++] = g & 255;
                        t[a++] = g >> 8 & 255;
                        t[a++] = w;
                        t[a++] = 0
                    }
                    t[a++] = 44;
                    t[a++] = e & 255;
                    t[a++] = e >> 8 & 255;
                    t[a++] = r & 255;
                    t[a++] = r >> 8 & 255;
                    t[a++] = n & 255;
                    t[a++] = n >> 8 & 255;
                    t[a++] = o & 255;
                    t[a++] = o >> 8 & 255;
                    t[a++] = h === true ? 128 | p - 1 : 0;
                    if (h === true) {
                        for (var b = 0, x = c.length; b < x; ++b) {
                            var N = c[b];
                            t[a++] = N >> 16 & 255;
                            t[a++] = N >> 8 & 255;
                            t[a++] = N & 255
                        }
                    }
                    a = i(t, a, p < 2 ? 2 : p, u)
                }
                ;
                this.end = function() {
                    if (v === false) {
                        t[a++] = 59;
                        v = true
                    }
                    return a
                }
            }
            function i(t, e, r, n) {
                t[e++] = r;
                var i = e++;
                var a = 1 << r;
                var o = a - 1;
                var s = a + 1;
                var f = s + 1;
                var u = r + 1;
                var l = 0;
                var h = 0;
                function c(r) {
                    while (l >= r) {
                        t[e++] = h & 255;
                        h >>= 8;
                        l -= 8;
                        if (e === i + 256) {
                            t[i] = 255;
                            i = e++
                        }
                    }
                }
                function d(t) {
                    h |= t << l;
                    l += u;
                    c(8)
                }
                var p = n[0] & o;
                var v = {};
                d(a);
                for (var g = 1, m = n.length; g < m; ++g) {
                    var y = n[g] & o;
                    var w = p << 8 | y;
                    var b = v[w];
                    if (b === undefined) {
                        h |= p << l;
                        l += u;
                        while (l >= 8) {
                            t[e++] = h & 255;
                            h >>= 8;
                            l -= 8;
                            if (e === i + 256) {
                                t[i] = 255;
                                i = e++
                            }
                        }
                        if (f === 4096) {
                            d(a);
                            f = s + 1;
                            u = r + 1;
                            v = {}
                        } else {
                            if (f >= 1 << u)
                                ++u;
                            v[w] = f++
                        }
                        p = y
                    } else {
                        p = b
                    }
                }
                d(p);
                d(s);
                c(1);
                if (i + 1 === e) {
                    t[i] = 0
                } else {
                    t[i] = e - i - 1;
                    t[e++] = 0
                }
                return e
            }
            function a(t) {
                var e = 0;
                if (t[e++] !== 71 || t[e++] !== 73 || t[e++] !== 70 || t[e++] !== 56 || (t[e++] + 1 & 253) !== 56 || t[e++] !== 97) {
                    throw "Invalid GIF 87a/89a header."
                }
                var r = t[e++] | t[e++] << 8;
                var n = t[e++] | t[e++] << 8;
                var i = t[e++];
                var a = i >> 7;
                var s = i & 7;
                var f = 1 << s + 1;
                var u = t[e++];
                t[e++];
                var l = null;
                if (a) {
                    l = e;
                    e += f * 3
                }
                var h = true;
                var c = [];
                var d = 0;
                var p = null;
                var v = 0;
                var g = null;
                this.width = r;
                this.height = n;
                while (h && e < t.length) {
                    switch (t[e++]) {
                    case 33:
                        switch (t[e++]) {
                        case 255:
                            if (t[e] !== 11 || t[e + 1] == 78 && t[e + 2] == 69 && t[e + 3] == 84 && t[e + 4] == 83 && t[e + 5] == 67 && t[e + 6] == 65 && t[e + 7] == 80 && t[e + 8] == 69 && t[e + 9] == 50 && t[e + 10] == 46 && t[e + 11] == 48 && t[e + 12] == 3 && t[e + 13] == 1 && t[e + 16] == 0) {
                                e += 14;
                                g = t[e++] | t[e++] << 8;
                                e++
                            } else {
                                e += 12;
                                while (true) {
                                    var m = t[e++];
                                    if (m === 0)
                                        break;
                                    e += m
                                }
                            }
                            break;
                        case 249:
                            if (t[e++] !== 4 || t[e + 4] !== 0)
                                throw "Invalid graphics extension block.";
                            var y = t[e++];
                            d = t[e++] | t[e++] << 8;
                            p = t[e++];
                            if ((y & 1) === 0)
                                p = null;
                            v = y >> 2 & 7;
                            e++;
                            break;
                        case 254:
                            while (true) {
                                var m = t[e++];
                                if (m === 0)
                                    break;
                                e += m
                            }
                            break;
                        default:
                            throw "Unknown graphic control label: 0x" + t[e - 1].toString(16)
                        }
                        break;
                    case 44:
                        var w = t[e++] | t[e++] << 8;
                        var b = t[e++] | t[e++] << 8;
                        var x = t[e++] | t[e++] << 8;
                        var N = t[e++] | t[e++] << 8;
                        var L = t[e++];
                        var A = L >> 7;
                        var S = L >> 6 & 1;
                        var _ = L & 7;
                        var F = 1 << _ + 1;
                        var k = l;
                        var P = false;
                        if (A) {
                            var P = true;
                            k = e;
                            e += F * 3
                        }
                        var I = e;
                        e++;
                        while (true) {
                            var m = t[e++];
                            if (m === 0)
                                break;
                            e += m
                        }
                        c.push({
                            x: w,
                            y: b,
                            width: x,
                            height: N,
                            has_local_palette: P,
                            palette_offset: k,
                            data_offset: I,
                            data_length: e - I,
                            transparent_index: p,
                            interlaced: !!S,
                            delay: d,
                            disposal: v
                        });
                        break;
                    case 59:
                        h = false;
                        break;
                    default:
                        throw "Unknown gif block: 0x" + t[e - 1].toString(16);
                        break
                    }
                }
                this.numFrames = function() {
                    return c.length
                }
                ;
                this.loopCount = function() {
                    return g
                }
                ;
                this.frameInfo = function(t) {
                    if (t < 0 || t >= c.length)
                        throw "Frame index out of range.";
                    return c[t]
                }
                ;
                this.decodeAndBlitFrameBGRA = function(e, n) {
                    var i = this.frameInfo(e);
                    var a = i.width * i.height;
                    var s = new Uint8Array(a);
                    o(t, i.data_offset, s, a);
                    var f = i.palette_offset;
                    var u = i.transparent_index;
                    if (u === null)
                        u = 256;
                    var l = i.width;
                    var h = r - l;
                    var c = l;
                    var d = (i.y * r + i.x) * 4;
                    var p = ((i.y + i.height) * r + i.x) * 4;
                    var v = d;
                    var g = h * 4;
                    if (i.interlaced === true) {
                        g += (l + h) * 4 * 7
                    }
                    var m = 8;
                    for (var y = 0, w = s.length; y < w; ++y) {
                        var b = s[y];
                        if (c === 0) {
                            v += g;
                            c = l;
                            if (v >= p) {
                                g = h + (l + h) * 4 * (m - 1);
                                v = d + (l + h) * (m << 1);
                                m >>= 1
                            }
                        }
                        if (b === u) {
                            v += 4
                        } else {
                            var x = t[f + b * 3];
                            var N = t[f + b * 3 + 1];
                            var L = t[f + b * 3 + 2];
                            n[v++] = L;
                            n[v++] = N;
                            n[v++] = x;
                            n[v++] = 255
                        }
                        --c
                    }
                }
                ;
                this.decodeAndBlitFrameRGBA = function(e, n) {
                    var i = this.frameInfo(e);
                    var a = i.width * i.height;
                    var s = new Uint8Array(a);
                    o(t, i.data_offset, s, a);
                    var f = i.palette_offset;
                    var u = i.transparent_index;
                    if (u === null)
                        u = 256;
                    var l = i.width;
                    var h = r - l;
                    var c = l;
                    var d = (i.y * r + i.x) * 4;
                    var p = ((i.y + i.height) * r + i.x) * 4;
                    var v = d;
                    var g = h * 4;
                    if (i.interlaced === true) {
                        g += (l + h) * 4 * 7
                    }
                    var m = 8;
                    for (var y = 0, w = s.length; y < w; ++y) {
                        var b = s[y];
                        if (c === 0) {
                            v += g;
                            c = l;
                            if (v >= p) {
                                g = h + (l + h) * 4 * (m - 1);
                                v = d + (l + h) * (m << 1);
                                m >>= 1
                            }
                        }
                        if (b === u) {
                            v += 4
                        } else {
                            var x = t[f + b * 3];
                            var N = t[f + b * 3 + 1];
                            var L = t[f + b * 3 + 2];
                            n[v++] = x;
                            n[v++] = N;
                            n[v++] = L;
                            n[v++] = 255
                        }
                        --c
                    }
                }
            }
            function o(t, e, r, n) {
                var i = t[e++];
                var a = 1 << i;
                var o = a + 1;
                var s = o + 1;
                var f = i + 1;
                var u = (1 << f) - 1;
                var l = 0;
                var h = 0;
                var c = 0;
                var d = t[e++];
                var p = new Int32Array(4096);
                var v = null;
                while (true) {
                    while (l < 16) {
                        if (d === 0)
                            break;
                        h |= t[e++] << l;
                        l += 8;
                        if (d === 1) {
                            d = t[e++]
                        } else {
                            --d
                        }
                    }
                    if (l < f)
                        break;
                    var g = h & u;
                    h >>= f;
                    l -= f;
                    if (g === a) {
                        s = o + 1;
                        f = i + 1;
                        u = (1 << f) - 1;
                        v = null;
                        continue
                    } else if (g === o) {
                        break
                    }
                    var m = g < s ? g : v;
                    var y = 0;
                    var w = m;
                    while (w > a) {
                        w = p[w] >> 8;
                        ++y
                    }
                    var b = w;
                    var x = c + y + (m !== g ? 1 : 0);
                    if (x > n) {
                        console.log("Warning, gif stream longer than expected.");
                        return
                    }
                    r[c++] = b;
                    c += y;
                    var N = c;
                    if (m !== g)
                        r[c++] = b;
                    w = m;
                    while (y--) {
                        w = p[w];
                        r[--N] = w & 255;
                        w >>= 8
                    }
                    if (v !== null && s < 4096) {
                        p[s++] = v << 8 | b;
                        if (s >= u + 1 && f < 12) {
                            ++f;
                            u = u << 1 | 1
                        }
                    }
                    v = g
                }
                if (c !== n) {
                    console.log("Warning, gif stream shorter than expected.")
                }
                return r
            }
            try {
                exports.GifWriter = n;
                exports.GifReader = a
            } catch (t) {}
            window.tmp = a;
            /*
     * Copyright (c) 2012 chick307 <chick307@gmail.com>
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
            (function(t, e) {
                t.API.adler32cs = e()
            }
            )(e, function() {
                var t = typeof ArrayBuffer === "function" && typeof Uint8Array === "function";
                var e = null
                  , r = function() {
                    if (!t)
                        return function t() {
                            return false
                        }
                        ;
                    try {
                        var r = {};
                        if (typeof r.Buffer === "function")
                            e = r.Buffer
                    } catch (t) {}
                    return function t(r) {
                        return r instanceof ArrayBuffer || e !== null && r instanceof e
                    }
                }();
                var n = function() {
                    if (e !== null) {
                        return function t(r) {
                            return new e(r,"utf8").toString("binary")
                        }
                    } else {
                        return function t(e) {
                            return unescape(encodeURIComponent(e))
                        }
                    }
                }();
                var i = 65521;
                var a = function t(e, r) {
                    var n = e & 65535
                      , a = e >>> 16;
                    for (var o = 0, s = r.length; o < s; o++) {
                        n = (n + (r.charCodeAt(o) & 255)) % i;
                        a = (a + n) % i
                    }
                    return (a << 16 | n) >>> 0
                };
                var o = function t(e, r) {
                    var n = e & 65535
                      , a = e >>> 16;
                    for (var o = 0, s = r.length; o < s; o++) {
                        n = (n + r[o]) % i;
                        a = (a + n) % i
                    }
                    return (a << 16 | n) >>> 0
                };
                var s = {};
                var f = s.Adler32 = function() {
                    var e = function t(r) {
                        if (!(this instanceof e)) {
                            throw new TypeError("Constructor cannot called be as a function.")
                        }
                        if (!isFinite(r = r == null ? 1 : +r)) {
                            throw new Error("First arguments needs to be a finite number.")
                        }
                        this.checksum = r >>> 0
                    };
                    var i = e.prototype = {};
                    i.constructor = e;
                    e.from = function(t) {
                        t.prototype = i;
                        return t
                    }(function t(r) {
                        if (!(this instanceof e)) {
                            throw new TypeError("Constructor cannot called be as a function.")
                        }
                        if (r == null)
                            throw new Error("First argument needs to be a string.");
                        this.checksum = a(1, r.toString())
                    });
                    e.fromUtf8 = function(t) {
                        t.prototype = i;
                        return t
                    }(function t(r) {
                        if (!(this instanceof e)) {
                            throw new TypeError("Constructor cannot called be as a function.")
                        }
                        if (r == null)
                            throw new Error("First argument needs to be a string.");
                        var i = n(r.toString());
                        this.checksum = a(1, i)
                    });
                    if (t) {
                        e.fromBuffer = function(t) {
                            t.prototype = i;
                            return t
                        }(function t(n) {
                            if (!(this instanceof e)) {
                                throw new TypeError("Constructor cannot called be as a function.")
                            }
                            if (!r(n))
                                throw new Error("First argument needs to be ArrayBuffer.");
                            var i = new Uint8Array(n);
                            return this.checksum = o(1, i)
                        })
                    }
                    i.update = function t(e) {
                        if (e == null)
                            throw new Error("First argument needs to be a string.");
                        e = e.toString();
                        return this.checksum = a(this.checksum, e)
                    }
                    ;
                    i.updateUtf8 = function t(e) {
                        if (e == null)
                            throw new Error("First argument needs to be a string.");
                        var r = n(e.toString());
                        return this.checksum = a(this.checksum, r)
                    }
                    ;
                    if (t) {
                        i.updateBuffer = function t(e) {
                            if (!r(e))
                                throw new Error("First argument needs to be ArrayBuffer.");
                            var n = new Uint8Array(e);
                            return this.checksum = o(this.checksum, n)
                        }
                    }
                    i.clone = function t() {
                        return new f(this.checksum)
                    }
                    ;
                    return e
                }();
                s.from = function t(e) {
                    if (e == null)
                        throw new Error("First argument needs to be a string.");
                    return a(1, e.toString())
                }
                ;
                s.fromUtf8 = function t(e) {
                    if (e == null)
                        throw new Error("First argument needs to be a string.");
                    var r = n(e.toString());
                    return a(1, r)
                }
                ;
                if (t) {
                    s.fromBuffer = function t(e) {
                        if (!r(e))
                            throw new Error("First argument need to be ArrayBuffer.");
                        var n = new Uint8Array(e);
                        return o(1, n)
                    }
                }
                return s
            });
            /**
    * Unicode Bidi Engine based on the work of Alex Shensis (@asthensis)
    * MIT License
    */
            (function(t) {
                var e = ["BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "S", "B", "S", "WS", "B", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "B", "B", "B", "S", "WS", "N", "N", "ET", "ET", "ET", "N", "N", "N", "N", "N", "ES", "CS", "ES", "CS", "CS", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "CS", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "BN", "BN", "BN", "BN", "BN", "BN", "B", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "CS", "N", "ET", "ET", "ET", "ET", "N", "N", "N", "N", "L", "N", "N", "BN", "N", "N", "ET", "ET", "EN", "EN", "N", "L", "N", "N", "N", "EN", "L", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "N", "N", "N", "N", "N", "ET", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "R", "NSM", "R", "NSM", "NSM", "R", "NSM", "NSM", "R", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "N", "N", "N", "N", "N", "R", "R", "R", "R", "R", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "AN", "AN", "AN", "AN", "AN", "AN", "N", "N", "AL", "ET", "ET", "AL", "CS", "AL", "N", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AL", "AL", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "ET", "AN", "AN", "AL", "AL", "AL", "NSM", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AN", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AL", "AL", "NSM", "NSM", "N", "NSM", "NSM", "NSM", "NSM", "AL", "AL", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "N", "AL", "AL", "NSM", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AL", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "R", "R", "N", "N", "N", "N", "R", "N", "N", "N", "N", "N", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "BN", "BN", "BN", "L", "R", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "WS", "B", "LRE", "RLE", "PDF", "LRO", "RLO", "CS", "ET", "ET", "ET", "ET", "ET", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "CS", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "WS", "BN", "BN", "BN", "BN", "BN", "N", "LRI", "RLI", "FSI", "PDI", "BN", "BN", "BN", "BN", "BN", "BN", "EN", "L", "N", "N", "EN", "EN", "EN", "EN", "EN", "EN", "ES", "ES", "N", "N", "N", "L", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "ES", "ES", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "R", "NSM", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "ES", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "N", "R", "R", "R", "R", "R", "N", "R", "N", "R", "R", "N", "R", "R", "N", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "CS", "N", "CS", "N", "N", "CS", "N", "N", "N", "N", "N", "N", "N", "N", "N", "ET", "N", "N", "ES", "ES", "N", "N", "N", "N", "N", "ET", "ET", "N", "N", "N", "N", "N", "AL", "AL", "AL", "AL", "AL", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "N", "N", "BN", "N", "N", "N", "ET", "ET", "ET", "N", "N", "N", "N", "N", "ES", "CS", "ES", "CS", "CS", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "CS", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "N", "N", "N", "ET", "ET", "N", "N", "N", "ET", "ET", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N"];
                t.__bidiEngine__ = t.prototype.__bidiEngine__ = function(t) {
                    var e = r;
                    var n = [[0, 3, 0, 1, 0, 0, 0], [0, 3, 0, 1, 2, 2, 0], [0, 3, 0, 17, 2, 0, 1], [0, 3, 5, 5, 4, 1, 0], [0, 3, 21, 21, 4, 0, 1], [0, 3, 5, 5, 4, 2, 0]];
                    var i = [[2, 0, 1, 1, 0, 1, 0], [2, 0, 1, 1, 0, 2, 0], [2, 0, 2, 1, 3, 2, 0], [2, 0, 2, 33, 3, 1, 1]];
                    var a = {
                        L: 0,
                        R: 1,
                        EN: 2,
                        AN: 3,
                        N: 4,
                        B: 5,
                        S: 6
                    };
                    var o = {
                        0: 0,
                        5: 1,
                        6: 2,
                        7: 3,
                        32: 4,
                        251: 5,
                        254: 6,
                        255: 7
                    };
                    var s = ["(", ")", "(", "<", ">", "<", "[", "]", "[", "{", "}", "{", "«", "»", "«", "‹", "›", "‹", "⁅", "⁆", "⁅", "⁽", "⁾", "⁽", "₍", "₎", "₍", "≤", "≥", "≤", "〈", "〉", "〈", "﹙", "﹚", "﹙", "﹛", "﹜", "﹛", "﹝", "﹞", "﹝", "﹤", "﹥", "﹤"];
                    var f = new RegExp(/^([1-4|9]|1[0-9]|2[0-9]|3[0168]|4[04589]|5[012]|7[78]|159|16[0-9]|17[0-2]|21[569]|22[03489]|250)$/);
                    var u = false, l, h, c = 0, d = 1, p, v, g, m, y, w = c;
                    this.__bidiEngine__ = {};
                    var b = function t(e, r) {
                        if (r) {
                            for (var n = 0; n < e.length; n++) {
                                r[n] = n
                            }
                        }
                        if (v === undefined) {
                            v = N(e)
                        }
                        if (m === undefined) {
                            m = N(e)
                        }
                    };
                    var x = function t(r) {
                        var n = r.charCodeAt()
                          , i = n >> 8
                          , a = o[i];
                        if (a !== undefined) {
                            return e[a * 256 + (n & 255)]
                        } else if (i === 252 || i === 253) {
                            return "AL"
                        } else if (f.test(i)) {
                            return "L"
                        } else if (i === 8) {
                            return "R"
                        }
                        return "N"
                    };
                    var N = function t(e) {
                        for (var r = 0, n; r < e.length; r++) {
                            n = x(e.charAt(r));
                            if (n === "L") {
                                return false
                            } else if (n === "R") {
                                return true
                            }
                        }
                        return false
                    };
                    var L = function t(e, r, n, i) {
                        var a = r[i], o, s, f, c;
                        switch (a) {
                        case "L":
                        case "R":
                            u = false;
                            break;
                        case "N":
                        case "AN":
                            break;
                        case "EN":
                            if (u) {
                                a = "AN"
                            }
                            break;
                        case "AL":
                            u = true;
                            a = "R";
                            break;
                        case "WS":
                            a = "N";
                            break;
                        case "CS":
                            if (i < 1 || i + 1 >= r.length || (o = n[i - 1]) !== "EN" && o !== "AN" || (s = r[i + 1]) !== "EN" && s !== "AN") {
                                a = "N"
                            } else if (u) {
                                s = "AN"
                            }
                            a = s === o ? s : "N";
                            break;
                        case "ES":
                            o = i > 0 ? n[i - 1] : "B";
                            a = o === "EN" && i + 1 < r.length && r[i + 1] === "EN" ? "EN" : "N";
                            break;
                        case "ET":
                            if (i > 0 && n[i - 1] === "EN") {
                                a = "EN";
                                break
                            } else if (u) {
                                a = "N";
                                break
                            }
                            f = i + 1;
                            c = r.length;
                            while (f < c && r[f] === "ET") {
                                f++
                            }
                            if (f < c && r[f] === "EN") {
                                a = "EN"
                            } else {
                                a = "N"
                            }
                            break;
                        case "NSM":
                            if (p && !v) {
                                c = r.length;
                                f = i + 1;
                                while (f < c && r[f] === "NSM") {
                                    f++
                                }
                                if (f < c) {
                                    var d = e[i];
                                    var g = d >= 1425 && d <= 2303 || d === 64286;
                                    o = r[f];
                                    if (g && (o === "R" || o === "AL")) {
                                        a = "R";
                                        break
                                    }
                                }
                            }
                            if (i < 1 || (o = r[i - 1]) === "B") {
                                a = "N"
                            } else {
                                a = n[i - 1]
                            }
                            break;
                        case "B":
                            u = false;
                            l = true;
                            a = w;
                            break;
                        case "S":
                            h = true;
                            a = "N";
                            break;
                        case "LRE":
                        case "RLE":
                        case "LRO":
                        case "RLO":
                        case "PDF":
                            u = false;
                            break;
                        case "BN":
                            a = "N";
                            break
                        }
                        return a
                    };
                    var A = function t(e, r, n) {
                        for (var i = 0; i < n; i++) {
                            if (e[i] === "S") {
                                r[i] = w;
                                for (var a = i - 1; a >= 0; a--) {
                                    if (e[a] === "WS") {
                                        r[a] = w
                                    } else {
                                        break
                                    }
                                }
                            }
                        }
                    };
                    var S = function t(e, r, n) {
                        var i = e.split("");
                        if (n) {
                            _(i, n, {
                                hiLevel: w
                            })
                        }
                        i.reverse();
                        r && r.reverse();
                        return i.join("")
                    };
                    var _ = function t(e, r, o) {
                        var s, f, c, d, p, v, g = -1, m = e.length, y = 0, b = [], N = w ? i : n, S = [];
                        u = false;
                        l = false;
                        h = false;
                        for (c = 0; c < m; c++) {
                            S[c] = x(e[c])
                        }
                        for (d = 0; d < m; d++) {
                            v = y;
                            b[d] = L(e, S, b, d);
                            y = N[v][a[b[d]]];
                            s = y & 240;
                            y &= 15;
                            r[d] = p = N[y][5];
                            if (s > 0) {
                                if (s === 16) {
                                    for (c = g; c < d; c++) {
                                        r[c] = 1
                                    }
                                    g = -1
                                } else {
                                    g = -1
                                }
                            }
                            f = N[y][6];
                            if (f) {
                                if (g === -1) {
                                    g = d
                                }
                            } else {
                                if (g > -1) {
                                    for (c = g; c < d; c++) {
                                        r[c] = p
                                    }
                                    g = -1
                                }
                            }
                            if (S[d] === "B") {
                                r[d] = 0
                            }
                            o.hiLevel |= p
                        }
                        if (h) {
                            A(S, r, m)
                        }
                    };
                    var F = function t(e, r, n, i, a) {
                        if (a.hiLevel < e) {
                            return
                        }
                        if (e === 1 && w === d && !l) {
                            r.reverse();
                            n && n.reverse();
                            return
                        }
                        var o, s, f, u, h = r.length, c = 0;
                        while (c < h) {
                            if (i[c] >= e) {
                                f = c + 1;
                                while (f < h && i[f] >= e) {
                                    f++
                                }
                                for (u = c,
                                s = f - 1; u < s; u++,
                                s--) {
                                    o = r[u];
                                    r[u] = r[s];
                                    r[s] = o;
                                    if (n) {
                                        o = n[u];
                                        n[u] = n[s];
                                        n[s] = o
                                    }
                                }
                                c = f
                            }
                            c++
                        }
                    };
                    var k = function t(e, r, n) {
                        if (n.hiLevel !== 0 && y) {
                            for (var i = 0, a; i < e.length; i++) {
                                if (r[i] === 1) {
                                    a = s.indexOf(e[i]);
                                    if (a >= 0) {
                                        e[i] = s[a + 1]
                                    }
                                }
                            }
                        }
                    };
                    var P = function t(e, r, n) {
                        var i = e.split("")
                          , a = {
                            hiLevel: w
                        };
                        if (!n) {
                            n = []
                        }
                        _(i, n, a);
                        k(i, n, a);
                        F(d + 1, i, r, n, a);
                        F(d, i, r, n, a);
                        return i.join("")
                    };
                    this.__bidiEngine__.doBidiReorder = function(t, e, r) {
                        b(t, e);
                        if (!p && g && !m) {
                            w = v ? d : c;
                            t = P(t, e, r)
                        } else if (p && g && v ^ m) {
                            w = v ? d : c;
                            t = S(t, e, r)
                        } else if (!p && g && m) {
                            w = v ? d : c;
                            t = P(t, e, r);
                            t = S(t, e)
                        } else if (p && !v && !g && !m) {
                            w = c;
                            t = P(t, e, r)
                        } else if (p && !g && v ^ m) {
                            t = S(t, e);
                            if (v) {
                                w = c;
                                t = P(t, e, r)
                            } else {
                                w = d;
                                t = P(t, e, r);
                                t = S(t, e)
                            }
                        } else if (p && v && !g && m) {
                            w = d;
                            t = P(t, e, r);
                            t = S(t, e)
                        } else if (!p && !g && v ^ m) {
                            var n = y;
                            if (v) {
                                w = d;
                                t = P(t, e, r);
                                w = c;
                                y = false;
                                t = P(t, e, r);
                                y = n
                            } else {
                                w = c;
                                t = P(t, e, r);
                                t = S(t, e);
                                w = d;
                                y = false;
                                t = P(t, e, r);
                                y = n;
                                t = S(t, e)
                            }
                        }
                        return t
                    }
                    ;
                    this.__bidiEngine__.setOptions = function(t) {
                        if (t) {
                            p = t.isInputVisual;
                            g = t.isOutputVisual;
                            v = t.isInputRtl;
                            m = t.isOutputRtl;
                            y = t.isSymmetricSwapping
                        }
                    }
                    ;
                    this.__bidiEngine__.setOptions(t);
                    return this.__bidiEngine__
                }
                ;
                var r = e;
                var n = new t.__bidiEngine__({
                    isInputVisual: true
                });
                var i = function t(e) {
                    var r = e.text;
                    var i = e.x;
                    var a = e.y;
                    var o = e.options || {};
                    var s = e.mutex || {};
                    var f = o.lang;
                    var u = [];
                    if (Object.prototype.toString.call(r) === "[object Array]") {
                        var l = 0;
                        u = [];
                        for (l = 0; l < r.length; l += 1) {
                            if (Object.prototype.toString.call(r[l]) === "[object Array]") {
                                u.push([n.doBidiReorder(r[l][0]), r[l][1], r[l][2]])
                            } else {
                                u.push([n.doBidiReorder(r[l])])
                            }
                        }
                        e.text = u
                    } else {
                        e.text = n.doBidiReorder(r)
                    }
                };
                t.API.events.push(["postProcessText", i])
            }
            )(e);
            /*
      Copyright (c) 2008, Adobe Systems Incorporated
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without 
      modification, are permitted provided that the following conditions are
      met:
  
      * Redistributions of source code must retain the above copyright notice, 
        this list of conditions and the following disclaimer.
      
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the 
        documentation and/or other materials provided with the distribution.
      
      * Neither the name of Adobe Systems Incorporated nor the names of its 
        contributors may be used to endorse or promote products derived from 
        this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
      IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
      THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
      PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR 
      CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
      EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
      PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
      PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
      LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
      SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */
            function s(t) {
                var e = Math.floor;
                var r = new Array(64);
                var n = new Array(64);
                var i = new Array(64);
                var a = new Array(64);
                var o;
                var s;
                var f;
                var u;
                var l = new Array(65535);
                var h = new Array(65535);
                var c = new Array(64);
                var d = new Array(64);
                var p = [];
                var v = 0;
                var g = 7;
                var m = new Array(64);
                var y = new Array(64);
                var w = new Array(64);
                var b = new Array(256);
                var x = new Array(2048);
                var N;
                var L = [0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63];
                var A = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
                var S = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                var _ = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125];
                var F = [1, 2, 3, 0, 4, 17, 5, 18, 33, 49, 65, 6, 19, 81, 97, 7, 34, 113, 20, 50, 129, 145, 161, 8, 35, 66, 177, 193, 21, 82, 209, 240, 36, 51, 98, 114, 130, 9, 10, 22, 23, 24, 25, 26, 37, 38, 39, 40, 41, 42, 52, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250];
                var k = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
                var P = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                var I = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119];
                var C = [0, 1, 2, 3, 17, 4, 5, 33, 49, 6, 18, 65, 81, 7, 97, 113, 19, 34, 50, 129, 8, 20, 66, 145, 161, 177, 193, 9, 35, 51, 82, 240, 21, 98, 114, 209, 10, 22, 36, 52, 225, 37, 241, 23, 24, 25, 26, 38, 39, 40, 41, 42, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 130, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 226, 227, 228, 229, 230, 231, 232, 233, 234, 242, 243, 244, 245, 246, 247, 248, 249, 250];
                function B(t) {
                    var o = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99];
                    for (var s = 0; s < 64; s++) {
                        var f = e((o[s] * t + 50) / 100);
                        if (f < 1) {
                            f = 1
                        } else if (f > 255) {
                            f = 255
                        }
                        r[L[s]] = f
                    }
                    var u = [17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99];
                    for (var l = 0; l < 64; l++) {
                        var h = e((u[l] * t + 50) / 100);
                        if (h < 1) {
                            h = 1
                        } else if (h > 255) {
                            h = 255
                        }
                        n[L[l]] = h
                    }
                    var c = [1, 1.387039845, 1.306562965, 1.175875602, 1, .785694958, .5411961, .275899379];
                    var d = 0;
                    for (var p = 0; p < 8; p++) {
                        for (var v = 0; v < 8; v++) {
                            i[d] = 1 / (r[L[d]] * c[p] * c[v] * 8);
                            a[d] = 1 / (n[L[d]] * c[p] * c[v] * 8);
                            d++
                        }
                    }
                }
                function j(t, e) {
                    var r = 0;
                    var n = 0;
                    var i = new Array;
                    for (var a = 1; a <= 16; a++) {
                        for (var o = 1; o <= t[a]; o++) {
                            i[e[n]] = [];
                            i[e[n]][0] = r;
                            i[e[n]][1] = a;
                            n++;
                            r++
                        }
                        r *= 2
                    }
                    return i
                }
                function E() {
                    o = j(A, S);
                    s = j(k, P);
                    f = j(_, F);
                    u = j(I, C)
                }
                function M() {
                    var t = 1;
                    var e = 2;
                    for (var r = 1; r <= 15; r++) {
                        for (var n = t; n < e; n++) {
                            h[32767 + n] = r;
                            l[32767 + n] = [];
                            l[32767 + n][1] = r;
                            l[32767 + n][0] = n
                        }
                        for (var i = -(e - 1); i <= -t; i++) {
                            h[32767 + i] = r;
                            l[32767 + i] = [];
                            l[32767 + i][1] = r;
                            l[32767 + i][0] = e - 1 + i
                        }
                        t <<= 1;
                        e <<= 1
                    }
                }
                function O() {
                    for (var t = 0; t < 256; t++) {
                        x[t] = 19595 * t;
                        x[t + 256 >> 0] = 38470 * t;
                        x[t + 512 >> 0] = 7471 * t + 32768;
                        x[t + 768 >> 0] = -11059 * t;
                        x[t + 1024 >> 0] = -21709 * t;
                        x[t + 1280 >> 0] = 32768 * t + 8421375;
                        x[t + 1536 >> 0] = -27439 * t;
                        x[t + 1792 >> 0] = -5329 * t
                    }
                }
                function q(t) {
                    var e = t[0];
                    var r = t[1] - 1;
                    while (r >= 0) {
                        if (e & 1 << r) {
                            v |= 1 << g
                        }
                        r--;
                        g--;
                        if (g < 0) {
                            if (v == 255) {
                                T(255);
                                T(0)
                            } else {
                                T(v)
                            }
                            g = 7;
                            v = 0
                        }
                    }
                }
                function T(t) {
                    p.push(t)
                }
                function R(t) {
                    T(t >> 8 & 255);
                    T(t & 255)
                }
                function D(t, e) {
                    var r, n, i, a, o, s, f, u;
                    var l = 0;
                    var h;
                    var d = 8;
                    var p = 64;
                    for (h = 0; h < d; ++h) {
                        r = t[l];
                        n = t[l + 1];
                        i = t[l + 2];
                        a = t[l + 3];
                        o = t[l + 4];
                        s = t[l + 5];
                        f = t[l + 6];
                        u = t[l + 7];
                        var v = r + u;
                        var g = r - u;
                        var m = n + f;
                        var y = n - f;
                        var w = i + s;
                        var b = i - s;
                        var x = a + o;
                        var N = a - o;
                        var L = v + x;
                        var A = v - x;
                        var S = m + w;
                        var _ = m - w;
                        t[l] = L + S;
                        t[l + 4] = L - S;
                        var F = (_ + A) * .707106781;
                        t[l + 2] = A + F;
                        t[l + 6] = A - F;
                        L = N + b;
                        S = b + y;
                        _ = y + g;
                        var k = (L - _) * .382683433;
                        var P = .5411961 * L + k;
                        var I = 1.306562965 * _ + k;
                        var C = S * .707106781;
                        var B = g + C;
                        var j = g - C;
                        t[l + 5] = j + P;
                        t[l + 3] = j - P;
                        t[l + 1] = B + I;
                        t[l + 7] = B - I;
                        l += 8
                    }
                    l = 0;
                    for (h = 0; h < d; ++h) {
                        r = t[l];
                        n = t[l + 8];
                        i = t[l + 16];
                        a = t[l + 24];
                        o = t[l + 32];
                        s = t[l + 40];
                        f = t[l + 48];
                        u = t[l + 56];
                        var E = r + u;
                        var M = r - u;
                        var O = n + f;
                        var q = n - f;
                        var T = i + s;
                        var R = i - s;
                        var D = a + o;
                        var U = a - o;
                        var z = E + D;
                        var H = E - D;
                        var W = O + T;
                        var V = O - T;
                        t[l] = z + W;
                        t[l + 32] = z - W;
                        var G = (V + H) * .707106781;
                        t[l + 16] = H + G;
                        t[l + 48] = H - G;
                        z = U + R;
                        W = R + q;
                        V = q + M;
                        var Y = (z - V) * .382683433;
                        var J = .5411961 * z + Y;
                        var X = 1.306562965 * V + Y;
                        var K = W * .707106781;
                        var Z = M + K;
                        var Q = M - K;
                        t[l + 40] = Q + J;
                        t[l + 24] = Q - J;
                        t[l + 8] = Z + X;
                        t[l + 56] = Z - X;
                        l++
                    }
                    var $;
                    for (h = 0; h < p; ++h) {
                        $ = t[h] * e[h];
                        c[h] = $ > 0 ? $ + .5 | 0 : $ - .5 | 0
                    }
                    return c
                }
                function U() {
                    R(65504);
                    R(16);
                    T(74);
                    T(70);
                    T(73);
                    T(70);
                    T(0);
                    T(1);
                    T(1);
                    T(0);
                    R(1);
                    R(1);
                    T(0);
                    T(0)
                }
                function z(t, e) {
                    R(65472);
                    R(17);
                    T(8);
                    R(e);
                    R(t);
                    T(3);
                    T(1);
                    T(17);
                    T(0);
                    T(2);
                    T(17);
                    T(1);
                    T(3);
                    T(17);
                    T(1)
                }
                function H() {
                    R(65499);
                    R(132);
                    T(0);
                    for (var t = 0; t < 64; t++) {
                        T(r[t])
                    }
                    T(1);
                    for (var e = 0; e < 64; e++) {
                        T(n[e])
                    }
                }
                function W() {
                    R(65476);
                    R(418);
                    T(0);
                    for (var t = 0; t < 16; t++) {
                        T(A[t + 1])
                    }
                    for (var e = 0; e <= 11; e++) {
                        T(S[e])
                    }
                    T(16);
                    for (var r = 0; r < 16; r++) {
                        T(_[r + 1])
                    }
                    for (var n = 0; n <= 161; n++) {
                        T(F[n])
                    }
                    T(1);
                    for (var i = 0; i < 16; i++) {
                        T(k[i + 1])
                    }
                    for (var a = 0; a <= 11; a++) {
                        T(P[a])
                    }
                    T(17);
                    for (var o = 0; o < 16; o++) {
                        T(I[o + 1])
                    }
                    for (var s = 0; s <= 161; s++) {
                        T(C[s])
                    }
                }
                function V() {
                    R(65498);
                    R(12);
                    T(3);
                    T(1);
                    T(0);
                    T(2);
                    T(17);
                    T(3);
                    T(17);
                    T(0);
                    T(63);
                    T(0)
                }
                function G(t, e, r, n, i) {
                    var a = i[0];
                    var o = i[240];
                    var s;
                    var f = 16;
                    var u = 63;
                    var c = 64;
                    var p = D(t, e);
                    for (var v = 0; v < c; ++v) {
                        d[L[v]] = p[v]
                    }
                    var g = d[0] - r;
                    r = d[0];
                    if (g == 0) {
                        q(n[0])
                    } else {
                        s = 32767 + g;
                        q(n[h[s]]);
                        q(l[s])
                    }
                    var m = 63;
                    for (; m > 0 && d[m] == 0; m--) {}
                    if (m == 0) {
                        q(a);
                        return r
                    }
                    var y = 1;
                    var w;
                    while (y <= m) {
                        var b = y;
                        for (; d[y] == 0 && y <= m; ++y) {}
                        var x = y - b;
                        if (x >= f) {
                            w = x >> 4;
                            for (var N = 1; N <= w; ++N) {
                                q(o)
                            }
                            x = x & 15
                        }
                        s = 32767 + d[y];
                        q(i[(x << 4) + h[s]]);
                        q(l[s]);
                        y++
                    }
                    if (m != u) {
                        q(a)
                    }
                    return r
                }
                function Y() {
                    var t = String.fromCharCode;
                    for (var e = 0; e < 256; e++) {
                        b[e] = t(e)
                    }
                }
                this.encode = function(t, e) {
                    var r = (new Date).getTime();
                    if (e)
                        J(e);
                    p = new Array;
                    v = 0;
                    g = 7;
                    R(65496);
                    U();
                    H();
                    z(t.width, t.height);
                    W();
                    V();
                    var n = 0;
                    var l = 0;
                    var h = 0;
                    v = 0;
                    g = 7;
                    this.encode.displayName = "_encode_";
                    var c = t.data;
                    var d = t.width;
                    var b = t.height;
                    var N = d * 4;
                    var L, A = 0;
                    var S, _, F;
                    var k, P, I, C, B;
                    while (A < b) {
                        L = 0;
                        while (L < N) {
                            k = N * A + L;
                            P = k;
                            I = -1;
                            C = 0;
                            for (B = 0; B < 64; B++) {
                                C = B >> 3;
                                I = (B & 7) * 4;
                                P = k + C * N + I;
                                if (A + C >= b) {
                                    P -= N * (A + 1 + C - b)
                                }
                                if (L + I >= N) {
                                    P -= L + I - N + 4
                                }
                                S = c[P++];
                                _ = c[P++];
                                F = c[P++];
                                m[B] = (x[S] + x[_ + 256 >> 0] + x[F + 512 >> 0] >> 16) - 128;
                                y[B] = (x[S + 768 >> 0] + x[_ + 1024 >> 0] + x[F + 1280 >> 0] >> 16) - 128;
                                w[B] = (x[S + 1280 >> 0] + x[_ + 1536 >> 0] + x[F + 1792 >> 0] >> 16) - 128
                            }
                            n = G(m, i, n, o, f);
                            l = G(y, a, l, s, u);
                            h = G(w, a, h, s, u);
                            L += 32
                        }
                        A += 8
                    }
                    if (g >= 0) {
                        var j = [];
                        j[1] = g + 1;
                        j[0] = (1 << g + 1) - 1;
                        q(j)
                    }
                    R(65497);
                    return new Uint8Array(p)
                }
                ;
                function J(t) {
                    if (t <= 0) {
                        t = 1
                    }
                    if (t > 100) {
                        t = 100
                    }
                    if (N == t)
                        return;
                    var e = 0;
                    if (t < 50) {
                        e = Math.floor(5e3 / t)
                    } else {
                        e = Math.floor(200 - t * 2)
                    }
                    B(e);
                    N = t
                }
                function X() {
                    var e = (new Date).getTime();
                    if (!t)
                        t = 50;
                    Y();
                    E();
                    M();
                    O();
                    J(t);
                    var r = (new Date).getTime() - e
                }
                X()
            }
            window.tmp = s;
            function f(t, e) {
                this.pos = 0;
                this.buffer = t;
                this.datav = new DataView(t.buffer);
                this.is_with_alpha = !!e;
                this.bottom_up = true;
                this.flag = String.fromCharCode(this.buffer[0]) + String.fromCharCode(this.buffer[1]);
                this.pos += 2;
                if (["BM", "BA", "CI", "CP", "IC", "PT"].indexOf(this.flag) === -1)
                    throw new Error("Invalid BMP File");
                this.parseHeader();
                this.parseBGR()
            }
            f.prototype.parseHeader = function() {
                this.fileSize = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.reserved = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.offset = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.headerSize = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.width = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.height = this.datav.getInt32(this.pos, true);
                this.pos += 4;
                this.planes = this.datav.getUint16(this.pos, true);
                this.pos += 2;
                this.bitPP = this.datav.getUint16(this.pos, true);
                this.pos += 2;
                this.compress = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.rawSize = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.hr = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.vr = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.colors = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                this.importantColors = this.datav.getUint32(this.pos, true);
                this.pos += 4;
                if (this.bitPP === 16 && this.is_with_alpha) {
                    this.bitPP = 15
                }
                if (this.bitPP < 15) {
                    var t = this.colors === 0 ? 1 << this.bitPP : this.colors;
                    this.palette = new Array(t);
                    for (var e = 0; e < t; e++) {
                        var r = this.datav.getUint8(this.pos++, true);
                        var n = this.datav.getUint8(this.pos++, true);
                        var i = this.datav.getUint8(this.pos++, true);
                        var a = this.datav.getUint8(this.pos++, true);
                        this.palette[e] = {
                            red: i,
                            green: n,
                            blue: r,
                            quad: a
                        }
                    }
                }
                if (this.height < 0) {
                    this.height *= -1;
                    this.bottom_up = false
                }
            }
            ;
            f.prototype.parseBGR = function() {
                this.pos = this.offset;
                try {
                    var t = "bit" + this.bitPP;
                    var e = this.width * this.height * 4;
                    this.data = new Uint8Array(e);
                    this[t]()
                } catch (t) {
                    console.log("bit decode error:" + t)
                }
            }
            ;
            f.prototype.bit1 = function() {
                var t = Math.ceil(this.width / 8);
                var e = t % 4;
                var r = this.height >= 0 ? this.height - 1 : -this.height;
                for (var r = this.height - 1; r >= 0; r--) {
                    var n = this.bottom_up ? r : this.height - 1 - r;
                    for (var i = 0; i < t; i++) {
                        var a = this.datav.getUint8(this.pos++, true);
                        var o = n * this.width * 4 + i * 8 * 4;
                        for (var s = 0; s < 8; s++) {
                            if (i * 8 + s < this.width) {
                                var f = this.palette[a >> 7 - s & 1];
                                this.data[o + s * 4] = f.blue;
                                this.data[o + s * 4 + 1] = f.green;
                                this.data[o + s * 4 + 2] = f.red;
                                this.data[o + s * 4 + 3] = 255
                            } else {
                                break
                            }
                        }
                    }
                    if (e != 0) {
                        this.pos += 4 - e
                    }
                }
            }
            ;
            f.prototype.bit4 = function() {
                var t = Math.ceil(this.width / 2);
                var e = t % 4;
                for (var r = this.height - 1; r >= 0; r--) {
                    var n = this.bottom_up ? r : this.height - 1 - r;
                    for (var i = 0; i < t; i++) {
                        var a = this.datav.getUint8(this.pos++, true);
                        var o = n * this.width * 4 + i * 2 * 4;
                        var s = a >> 4;
                        var f = a & 15;
                        var u = this.palette[s];
                        this.data[o] = u.blue;
                        this.data[o + 1] = u.green;
                        this.data[o + 2] = u.red;
                        this.data[o + 3] = 255;
                        if (i * 2 + 1 >= this.width)
                            break;
                        u = this.palette[f];
                        this.data[o + 4] = u.blue;
                        this.data[o + 4 + 1] = u.green;
                        this.data[o + 4 + 2] = u.red;
                        this.data[o + 4 + 3] = 255
                    }
                    if (e != 0) {
                        this.pos += 4 - e
                    }
                }
            }
            ;
            f.prototype.bit8 = function() {
                var t = this.width % 4;
                for (var e = this.height - 1; e >= 0; e--) {
                    var r = this.bottom_up ? e : this.height - 1 - e;
                    for (var n = 0; n < this.width; n++) {
                        var i = this.datav.getUint8(this.pos++, true);
                        var a = r * this.width * 4 + n * 4;
                        if (i < this.palette.length) {
                            var o = this.palette[i];
                            this.data[a] = o.red;
                            this.data[a + 1] = o.green;
                            this.data[a + 2] = o.blue;
                            this.data[a + 3] = 255
                        } else {
                            this.data[a] = 255;
                            this.data[a + 1] = 255;
                            this.data[a + 2] = 255;
                            this.data[a + 3] = 255
                        }
                    }
                    if (t != 0) {
                        this.pos += 4 - t
                    }
                }
            }
            ;
            f.prototype.bit15 = function() {
                var t = this.width % 3;
                var e = parseInt("11111", 2)
                  , r = e;
                for (var n = this.height - 1; n >= 0; n--) {
                    var i = this.bottom_up ? n : this.height - 1 - n;
                    for (var a = 0; a < this.width; a++) {
                        var o = this.datav.getUint16(this.pos, true);
                        this.pos += 2;
                        var s = (o & r) / r * 255 | 0;
                        var f = (o >> 5 & r) / r * 255 | 0;
                        var u = (o >> 10 & r) / r * 255 | 0;
                        var l = o >> 15 ? 255 : 0;
                        var h = i * this.width * 4 + a * 4;
                        this.data[h] = u;
                        this.data[h + 1] = f;
                        this.data[h + 2] = s;
                        this.data[h + 3] = l
                    }
                    this.pos += t
                }
            }
            ;
            f.prototype.bit16 = function() {
                var t = this.width % 3;
                var e = parseInt("11111", 2)
                  , r = e;
                var n = parseInt("111111", 2)
                  , i = n;
                for (var a = this.height - 1; a >= 0; a--) {
                    var o = this.bottom_up ? a : this.height - 1 - a;
                    for (var s = 0; s < this.width; s++) {
                        var f = this.datav.getUint16(this.pos, true);
                        this.pos += 2;
                        var u = 255;
                        var l = (f & r) / r * 255 | 0;
                        var h = (f >> 5 & i) / i * 255 | 0;
                        var c = (f >> 11) / r * 255 | 0;
                        var d = o * this.width * 4 + s * 4;
                        this.data[d] = c;
                        this.data[d + 1] = h;
                        this.data[d + 2] = l;
                        this.data[d + 3] = u
                    }
                    this.pos += t
                }
            }
            ;
            f.prototype.bit24 = function() {
                for (var t = this.height - 1; t >= 0; t--) {
                    var e = this.bottom_up ? t : this.height - 1 - t;
                    for (var r = 0; r < this.width; r++) {
                        var n = this.datav.getUint8(this.pos++, true);
                        var i = this.datav.getUint8(this.pos++, true);
                        var a = this.datav.getUint8(this.pos++, true);
                        var o = e * this.width * 4 + r * 4;
                        this.data[o] = a;
                        this.data[o + 1] = i;
                        this.data[o + 2] = n;
                        this.data[o + 3] = 255
                    }
                    this.pos += this.width % 4
                }
            }
            ;
            f.prototype.bit32 = function() {
                for (var t = this.height - 1; t >= 0; t--) {
                    var e = this.bottom_up ? t : this.height - 1 - t;
                    for (var r = 0; r < this.width; r++) {
                        var n = this.datav.getUint8(this.pos++, true);
                        var i = this.datav.getUint8(this.pos++, true);
                        var a = this.datav.getUint8(this.pos++, true);
                        var o = this.datav.getUint8(this.pos++, true);
                        var s = e * this.width * 4 + r * 4;
                        this.data[s] = a;
                        this.data[s + 1] = i;
                        this.data[s + 2] = n;
                        this.data[s + 3] = o
                    }
                }
            }
            ;
            f.prototype.getData = function() {
                return this.data
            }
            ;
            window.tmp = f;
            /*
     Copyright (c) 2013 Gildas Lormeau. All rights reserved.
  
     Redistribution and use in source and binary forms, with or without
     modification, are permitted provided that the following conditions are met:
  
     1. Redistributions of source code must retain the above copyright notice,
     this list of conditions and the following disclaimer.
  
     2. Redistributions in binary form must reproduce the above copyright 
     notice, this list of conditions and the following disclaimer in 
     the documentation and/or other materials provided with the distribution.
  
     3. The names of the authors may not be used to endorse or promote products
     derived from this software without specific prior written permission.
  
     THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
     INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
     FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
     INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
     INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
     OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
     EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
            (function(t) {
                var e = 15;
                var r = 30;
                var n = 19;
                var i = 29;
                var a = 256;
                var o = a + 1 + i;
                var s = 2 * o + 1;
                var f = 256;
                var u = 7;
                var l = 16;
                var h = 17;
                var c = 18;
                var d = 8 * 2;
                var p = -1;
                var v = 1;
                var g = 2;
                var m = 0;
                var y = 0;
                var w = 1;
                var b = 3;
                var x = 4;
                var N = 0;
                var L = 1;
                var A = 2;
                var S = -2;
                var _ = -3;
                var F = -5;
                var k = [0, 1, 2, 3, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 0, 0, 16, 17, 18, 18, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29];
                function P() {
                    var t = this;
                    function r(r) {
                        var n = t.dyn_tree;
                        var i = t.stat_desc.static_tree;
                        var a = t.stat_desc.extra_bits;
                        var o = t.stat_desc.extra_base;
                        var f = t.stat_desc.max_length;
                        var u;
                        var l, h;
                        var c;
                        var d;
                        var p;
                        var v = 0;
                        for (c = 0; c <= e; c++) {
                            r.bl_count[c] = 0
                        }
                        n[r.heap[r.heap_max] * 2 + 1] = 0;
                        for (u = r.heap_max + 1; u < s; u++) {
                            l = r.heap[u];
                            c = n[n[l * 2 + 1] * 2 + 1] + 1;
                            if (c > f) {
                                c = f;
                                v++
                            }
                            n[l * 2 + 1] = c;
                            if (l > t.max_code)
                                continue;
                            r.bl_count[c]++;
                            d = 0;
                            if (l >= o)
                                d = a[l - o];
                            p = n[l * 2];
                            r.opt_len += p * (c + d);
                            if (i)
                                r.static_len += p * (i[l * 2 + 1] + d)
                        }
                        if (v === 0)
                            return;
                        do {
                            c = f - 1;
                            while (r.bl_count[c] === 0) {
                                c--
                            }
                            r.bl_count[c]--;
                            r.bl_count[c + 1] += 2;
                            r.bl_count[f]--;
                            v -= 2
                        } while (v > 0);
                        for (c = f; c !== 0; c--) {
                            l = r.bl_count[c];
                            while (l !== 0) {
                                h = r.heap[--u];
                                if (h > t.max_code)
                                    continue;
                                if (n[h * 2 + 1] != c) {
                                    r.opt_len += (c - n[h * 2 + 1]) * n[h * 2];
                                    n[h * 2 + 1] = c
                                }
                                l--
                            }
                        }
                    }
                    function n(t, e) {
                        var r = 0;
                        do {
                            r |= t & 1;
                            t >>>= 1;
                            r <<= 1
                        } while (--e > 0);
                        return r >>> 1
                    }
                    function i(t, r, i) {
                        var a = [];
                        var o = 0;
                        var s;
                        var f;
                        var u;
                        for (s = 1; s <= e; s++) {
                            a[s] = o = o + i[s - 1] << 1
                        }
                        for (f = 0; f <= r; f++) {
                            u = t[f * 2 + 1];
                            if (u === 0)
                                continue;
                            t[f * 2] = n(a[u]++, u)
                        }
                    }
                    t.build_tree = function(e) {
                        var n = t.dyn_tree;
                        var a = t.stat_desc.static_tree;
                        var o = t.stat_desc.elems;
                        var f, u;
                        var l = -1;
                        var h;
                        e.heap_len = 0;
                        e.heap_max = s;
                        for (f = 0; f < o; f++) {
                            if (n[f * 2] !== 0) {
                                e.heap[++e.heap_len] = l = f;
                                e.depth[f] = 0
                            } else {
                                n[f * 2 + 1] = 0
                            }
                        }
                        while (e.heap_len < 2) {
                            h = e.heap[++e.heap_len] = l < 2 ? ++l : 0;
                            n[h * 2] = 1;
                            e.depth[h] = 0;
                            e.opt_len--;
                            if (a)
                                e.static_len -= a[h * 2 + 1]
                        }
                        t.max_code = l;
                        for (f = Math.floor(e.heap_len / 2); f >= 1; f--) {
                            e.pqdownheap(n, f)
                        }
                        h = o;
                        do {
                            f = e.heap[1];
                            e.heap[1] = e.heap[e.heap_len--];
                            e.pqdownheap(n, 1);
                            u = e.heap[1];
                            e.heap[--e.heap_max] = f;
                            e.heap[--e.heap_max] = u;
                            n[h * 2] = n[f * 2] + n[u * 2];
                            e.depth[h] = Math.max(e.depth[f], e.depth[u]) + 1;
                            n[f * 2 + 1] = n[u * 2 + 1] = h;
                            e.heap[1] = h++;
                            e.pqdownheap(n, 1)
                        } while (e.heap_len >= 2);
                        e.heap[--e.heap_max] = e.heap[1];
                        r(e);
                        i(n, t.max_code, e.bl_count)
                    }
                }
                P._length_code = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28];
                P.base_length = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 0];
                P.base_dist = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024, 1536, 2048, 3072, 4096, 6144, 8192, 12288, 16384, 24576];
                P.d_code = function(t) {
                    return t < 256 ? k[t] : k[256 + (t >>> 7)]
                }
                ;
                P.extra_lbits = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
                P.extra_dbits = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
                P.extra_blbits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];
                P.bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
                function I(t, e, r, n, i) {
                    var a = this;
                    a.static_tree = t;
                    a.extra_bits = e;
                    a.extra_base = r;
                    a.elems = n;
                    a.max_length = i
                }
                I.static_ltree = [12, 8, 140, 8, 76, 8, 204, 8, 44, 8, 172, 8, 108, 8, 236, 8, 28, 8, 156, 8, 92, 8, 220, 8, 60, 8, 188, 8, 124, 8, 252, 8, 2, 8, 130, 8, 66, 8, 194, 8, 34, 8, 162, 8, 98, 8, 226, 8, 18, 8, 146, 8, 82, 8, 210, 8, 50, 8, 178, 8, 114, 8, 242, 8, 10, 8, 138, 8, 74, 8, 202, 8, 42, 8, 170, 8, 106, 8, 234, 8, 26, 8, 154, 8, 90, 8, 218, 8, 58, 8, 186, 8, 122, 8, 250, 8, 6, 8, 134, 8, 70, 8, 198, 8, 38, 8, 166, 8, 102, 8, 230, 8, 22, 8, 150, 8, 86, 8, 214, 8, 54, 8, 182, 8, 118, 8, 246, 8, 14, 8, 142, 8, 78, 8, 206, 8, 46, 8, 174, 8, 110, 8, 238, 8, 30, 8, 158, 8, 94, 8, 222, 8, 62, 8, 190, 8, 126, 8, 254, 8, 1, 8, 129, 8, 65, 8, 193, 8, 33, 8, 161, 8, 97, 8, 225, 8, 17, 8, 145, 8, 81, 8, 209, 8, 49, 8, 177, 8, 113, 8, 241, 8, 9, 8, 137, 8, 73, 8, 201, 8, 41, 8, 169, 8, 105, 8, 233, 8, 25, 8, 153, 8, 89, 8, 217, 8, 57, 8, 185, 8, 121, 8, 249, 8, 5, 8, 133, 8, 69, 8, 197, 8, 37, 8, 165, 8, 101, 8, 229, 8, 21, 8, 149, 8, 85, 8, 213, 8, 53, 8, 181, 8, 117, 8, 245, 8, 13, 8, 141, 8, 77, 8, 205, 8, 45, 8, 173, 8, 109, 8, 237, 8, 29, 8, 157, 8, 93, 8, 221, 8, 61, 8, 189, 8, 125, 8, 253, 8, 19, 9, 275, 9, 147, 9, 403, 9, 83, 9, 339, 9, 211, 9, 467, 9, 51, 9, 307, 9, 179, 9, 435, 9, 115, 9, 371, 9, 243, 9, 499, 9, 11, 9, 267, 9, 139, 9, 395, 9, 75, 9, 331, 9, 203, 9, 459, 9, 43, 9, 299, 9, 171, 9, 427, 9, 107, 9, 363, 9, 235, 9, 491, 9, 27, 9, 283, 9, 155, 9, 411, 9, 91, 9, 347, 9, 219, 9, 475, 9, 59, 9, 315, 9, 187, 9, 443, 9, 123, 9, 379, 9, 251, 9, 507, 9, 7, 9, 263, 9, 135, 9, 391, 9, 71, 9, 327, 9, 199, 9, 455, 9, 39, 9, 295, 9, 167, 9, 423, 9, 103, 9, 359, 9, 231, 9, 487, 9, 23, 9, 279, 9, 151, 9, 407, 9, 87, 9, 343, 9, 215, 9, 471, 9, 55, 9, 311, 9, 183, 9, 439, 9, 119, 9, 375, 9, 247, 9, 503, 9, 15, 9, 271, 9, 143, 9, 399, 9, 79, 9, 335, 9, 207, 9, 463, 9, 47, 9, 303, 9, 175, 9, 431, 9, 111, 9, 367, 9, 239, 9, 495, 9, 31, 9, 287, 9, 159, 9, 415, 9, 95, 9, 351, 9, 223, 9, 479, 9, 63, 9, 319, 9, 191, 9, 447, 9, 127, 9, 383, 9, 255, 9, 511, 9, 0, 7, 64, 7, 32, 7, 96, 7, 16, 7, 80, 7, 48, 7, 112, 7, 8, 7, 72, 7, 40, 7, 104, 7, 24, 7, 88, 7, 56, 7, 120, 7, 4, 7, 68, 7, 36, 7, 100, 7, 20, 7, 84, 7, 52, 7, 116, 7, 3, 8, 131, 8, 67, 8, 195, 8, 35, 8, 163, 8, 99, 8, 227, 8];
                I.static_dtree = [0, 5, 16, 5, 8, 5, 24, 5, 4, 5, 20, 5, 12, 5, 28, 5, 2, 5, 18, 5, 10, 5, 26, 5, 6, 5, 22, 5, 14, 5, 30, 5, 1, 5, 17, 5, 9, 5, 25, 5, 5, 5, 21, 5, 13, 5, 29, 5, 3, 5, 19, 5, 11, 5, 27, 5, 7, 5, 23, 5];
                I.static_l_desc = new I(I.static_ltree,P.extra_lbits,a + 1,o,e);
                I.static_d_desc = new I(I.static_dtree,P.extra_dbits,0,r,e);
                I.static_bl_desc = new I(null,P.extra_blbits,0,n,u);
                var C = 9;
                var B = 8;
                function j(t, e, r, n, i) {
                    var a = this;
                    a.good_length = t;
                    a.max_lazy = e;
                    a.nice_length = r;
                    a.max_chain = n;
                    a.func = i
                }
                var E = 0;
                var M = 1;
                var O = 2;
                var q = [new j(0,0,0,0,E), new j(4,4,8,4,M), new j(4,5,16,8,M), new j(4,6,32,32,M), new j(4,4,16,16,O), new j(8,16,32,32,O), new j(8,16,128,128,O), new j(8,32,128,256,O), new j(32,128,258,1024,O), new j(32,258,258,4096,O)];
                var T = ["need dictionary", "stream end", "", "", "stream error", "data error", "", "buffer error", "", ""];
                var R = 0;
                var D = 1;
                var U = 2;
                var z = 3;
                var H = 32;
                var W = 42;
                var V = 113;
                var G = 666;
                var Y = 8;
                var J = 0;
                var X = 1;
                var K = 2;
                var Z = 3;
                var Q = 258;
                var $ = Q + Z + 1;
                function tt(t, e, r, n) {
                    var i = t[e * 2];
                    var a = t[r * 2];
                    return i < a || i == a && n[e] <= n[r]
                }
                function et() {
                    var t = this;
                    var e;
                    var i;
                    var s;
                    var u;
                    var k;
                    var j;
                    var et;
                    var rt;
                    var nt;
                    var it;
                    var at;
                    var ot;
                    var st;
                    var ft;
                    var ut;
                    var lt;
                    var ht;
                    var ct;
                    var dt;
                    var pt;
                    var vt;
                    var gt;
                    var mt;
                    var yt;
                    var wt;
                    var bt;
                    var xt;
                    var Nt;
                    var Lt;
                    var At;
                    var St;
                    var _t;
                    var Ft;
                    var kt = new P;
                    var Pt = new P;
                    var It = new P;
                    t.depth = [];
                    var Ct;
                    var Bt;
                    var jt;
                    var Et;
                    var Mt;
                    var Ot;
                    var qt;
                    var Tt;
                    t.bl_count = [];
                    t.heap = [];
                    St = [];
                    _t = [];
                    Ft = [];
                    function Rt() {
                        var t;
                        nt = 2 * k;
                        at[st - 1] = 0;
                        for (t = 0; t < st - 1; t++) {
                            at[t] = 0
                        }
                        bt = q[xt].max_lazy;
                        Lt = q[xt].good_length;
                        At = q[xt].nice_length;
                        wt = q[xt].max_chain;
                        vt = 0;
                        ht = 0;
                        mt = 0;
                        ct = yt = Z - 1;
                        pt = 0;
                        ot = 0
                    }
                    function Dt() {
                        var e;
                        for (e = 0; e < o; e++) {
                            St[e * 2] = 0
                        }
                        for (e = 0; e < r; e++) {
                            _t[e * 2] = 0
                        }
                        for (e = 0; e < n; e++) {
                            Ft[e * 2] = 0
                        }
                        St[f * 2] = 1;
                        t.opt_len = t.static_len = 0;
                        jt = Mt = 0
                    }
                    function Ut() {
                        kt.dyn_tree = St;
                        kt.stat_desc = I.static_l_desc;
                        Pt.dyn_tree = _t;
                        Pt.stat_desc = I.static_d_desc;
                        It.dyn_tree = Ft;
                        It.stat_desc = I.static_bl_desc;
                        qt = 0;
                        Tt = 0;
                        Ot = 8;
                        Dt()
                    }
                    t.pqdownheap = function(e, r) {
                        var n = t.heap;
                        var i = n[r];
                        var a = r << 1;
                        while (a <= t.heap_len) {
                            if (a < t.heap_len && tt(e, n[a + 1], n[a], t.depth)) {
                                a++
                            }
                            if (tt(e, i, n[a], t.depth))
                                break;
                            n[r] = n[a];
                            r = a;
                            a <<= 1
                        }
                        n[r] = i
                    }
                    ;
                    function zt(t, e) {
                        var r;
                        var n = -1;
                        var i;
                        var a = t[0 * 2 + 1];
                        var o = 0;
                        var s = 7;
                        var f = 4;
                        if (a === 0) {
                            s = 138;
                            f = 3
                        }
                        t[(e + 1) * 2 + 1] = 65535;
                        for (r = 0; r <= e; r++) {
                            i = a;
                            a = t[(r + 1) * 2 + 1];
                            if (++o < s && i == a) {
                                continue
                            } else if (o < f) {
                                Ft[i * 2] += o
                            } else if (i !== 0) {
                                if (i != n)
                                    Ft[i * 2]++;
                                Ft[l * 2]++
                            } else if (o <= 10) {
                                Ft[h * 2]++
                            } else {
                                Ft[c * 2]++
                            }
                            o = 0;
                            n = i;
                            if (a === 0) {
                                s = 138;
                                f = 3
                            } else if (i == a) {
                                s = 6;
                                f = 3
                            } else {
                                s = 7;
                                f = 4
                            }
                        }
                    }
                    function Ht() {
                        var e;
                        zt(St, kt.max_code);
                        zt(_t, Pt.max_code);
                        It.build_tree(t);
                        for (e = n - 1; e >= 3; e--) {
                            if (Ft[P.bl_order[e] * 2 + 1] !== 0)
                                break
                        }
                        t.opt_len += 3 * (e + 1) + 5 + 5 + 4;
                        return e
                    }
                    function Wt(e) {
                        t.pending_buf[t.pending++] = e
                    }
                    function Vt(t) {
                        Wt(t & 255);
                        Wt(t >>> 8 & 255)
                    }
                    function Gt(t) {
                        Wt(t >> 8 & 255);
                        Wt(t & 255 & 255)
                    }
                    function Yt(t, e) {
                        var r, n = e;
                        if (Tt > d - n) {
                            r = t;
                            qt |= r << Tt & 65535;
                            Vt(qt);
                            qt = r >>> d - Tt;
                            Tt += n - d
                        } else {
                            qt |= t << Tt & 65535;
                            Tt += n
                        }
                    }
                    function Jt(t, e) {
                        var r = t * 2;
                        Yt(e[r] & 65535, e[r + 1] & 65535)
                    }
                    function Xt(t, e) {
                        var r;
                        var n = -1;
                        var i;
                        var a = t[0 * 2 + 1];
                        var o = 0;
                        var s = 7;
                        var f = 4;
                        if (a === 0) {
                            s = 138;
                            f = 3
                        }
                        for (r = 0; r <= e; r++) {
                            i = a;
                            a = t[(r + 1) * 2 + 1];
                            if (++o < s && i == a) {
                                continue
                            } else if (o < f) {
                                do {
                                    Jt(i, Ft)
                                } while (--o !== 0)
                            } else if (i !== 0) {
                                if (i != n) {
                                    Jt(i, Ft);
                                    o--
                                }
                                Jt(l, Ft);
                                Yt(o - 3, 2)
                            } else if (o <= 10) {
                                Jt(h, Ft);
                                Yt(o - 3, 3)
                            } else {
                                Jt(c, Ft);
                                Yt(o - 11, 7)
                            }
                            o = 0;
                            n = i;
                            if (a === 0) {
                                s = 138;
                                f = 3
                            } else if (i == a) {
                                s = 6;
                                f = 3
                            } else {
                                s = 7;
                                f = 4
                            }
                        }
                    }
                    function Kt(t, e, r) {
                        var n;
                        Yt(t - 257, 5);
                        Yt(e - 1, 5);
                        Yt(r - 4, 4);
                        for (n = 0; n < r; n++) {
                            Yt(Ft[P.bl_order[n] * 2 + 1], 3)
                        }
                        Xt(St, t - 1);
                        Xt(_t, e - 1)
                    }
                    function Zt() {
                        if (Tt == 16) {
                            Vt(qt);
                            qt = 0;
                            Tt = 0
                        } else if (Tt >= 8) {
                            Wt(qt & 255);
                            qt >>>= 8;
                            Tt -= 8
                        }
                    }
                    function Qt() {
                        Yt(X << 1, 3);
                        Jt(f, I.static_ltree);
                        Zt();
                        if (1 + Ot + 10 - Tt < 9) {
                            Yt(X << 1, 3);
                            Jt(f, I.static_ltree);
                            Zt()
                        }
                        Ot = 7
                    }
                    function $t(e, n) {
                        var i, o, s;
                        t.pending_buf[Et + jt * 2] = e >>> 8 & 255;
                        t.pending_buf[Et + jt * 2 + 1] = e & 255;
                        t.pending_buf[Ct + jt] = n & 255;
                        jt++;
                        if (e === 0) {
                            St[n * 2]++
                        } else {
                            Mt++;
                            e--;
                            St[(P._length_code[n] + a + 1) * 2]++;
                            _t[P.d_code(e) * 2]++
                        }
                        if ((jt & 8191) === 0 && xt > 2) {
                            i = jt * 8;
                            o = vt - ht;
                            for (s = 0; s < r; s++) {
                                i += _t[s * 2] * (5 + P.extra_dbits[s])
                            }
                            i >>>= 3;
                            if (Mt < Math.floor(jt / 2) && i < Math.floor(o / 2))
                                return true
                        }
                        return jt == Bt - 1
                    }
                    function te(e, r) {
                        var n;
                        var i;
                        var o = 0;
                        var s;
                        var u;
                        if (jt !== 0) {
                            do {
                                n = t.pending_buf[Et + o * 2] << 8 & 65280 | t.pending_buf[Et + o * 2 + 1] & 255;
                                i = t.pending_buf[Ct + o] & 255;
                                o++;
                                if (n === 0) {
                                    Jt(i, e)
                                } else {
                                    s = P._length_code[i];
                                    Jt(s + a + 1, e);
                                    u = P.extra_lbits[s];
                                    if (u !== 0) {
                                        i -= P.base_length[s];
                                        Yt(i, u)
                                    }
                                    n--;
                                    s = P.d_code(n);
                                    Jt(s, r);
                                    u = P.extra_dbits[s];
                                    if (u !== 0) {
                                        n -= P.base_dist[s];
                                        Yt(n, u)
                                    }
                                }
                            } while (o < jt)
                        }
                        Jt(f, e);
                        Ot = e[f * 2 + 1]
                    }
                    function ee() {
                        if (Tt > 8) {
                            Vt(qt)
                        } else if (Tt > 0) {
                            Wt(qt & 255)
                        }
                        qt = 0;
                        Tt = 0
                    }
                    function re(e, r, n) {
                        ee();
                        Ot = 8;
                        if (n) {
                            Vt(r);
                            Vt(~r)
                        }
                        t.pending_buf.set(rt.subarray(e, e + r), t.pending);
                        t.pending += r
                    }
                    function ne(t, e, r) {
                        Yt((J << 1) + (r ? 1 : 0), 3);
                        re(t, e, true)
                    }
                    function ie(e, r, n) {
                        var i, a;
                        var o = 0;
                        if (xt > 0) {
                            kt.build_tree(t);
                            Pt.build_tree(t);
                            o = Ht();
                            i = t.opt_len + 3 + 7 >>> 3;
                            a = t.static_len + 3 + 7 >>> 3;
                            if (a <= i)
                                i = a
                        } else {
                            i = a = r + 5
                        }
                        if (r + 4 <= i && e != -1) {
                            ne(e, r, n)
                        } else if (a == i) {
                            Yt((X << 1) + (n ? 1 : 0), 3);
                            te(I.static_ltree, I.static_dtree)
                        } else {
                            Yt((K << 1) + (n ? 1 : 0), 3);
                            Kt(kt.max_code + 1, Pt.max_code + 1, o + 1);
                            te(St, _t)
                        }
                        Dt();
                        if (n) {
                            ee()
                        }
                    }
                    function ae(t) {
                        ie(ht >= 0 ? ht : -1, vt - ht, t);
                        ht = vt;
                        e.flush_pending()
                    }
                    function oe() {
                        var t, r;
                        var n;
                        var i;
                        do {
                            i = nt - mt - vt;
                            if (i === 0 && vt === 0 && mt === 0) {
                                i = k
                            } else if (i == -1) {
                                i--
                            } else if (vt >= k + k - $) {
                                rt.set(rt.subarray(k, k + k), 0);
                                gt -= k;
                                vt -= k;
                                ht -= k;
                                t = st;
                                n = t;
                                do {
                                    r = at[--n] & 65535;
                                    at[n] = r >= k ? r - k : 0
                                } while (--t !== 0);
                                t = k;
                                n = t;
                                do {
                                    r = it[--n] & 65535;
                                    it[n] = r >= k ? r - k : 0
                                } while (--t !== 0);
                                i += k
                            }
                            if (e.avail_in === 0)
                                return;
                            t = e.read_buf(rt, vt + mt, i);
                            mt += t;
                            if (mt >= Z) {
                                ot = rt[vt] & 255;
                                ot = (ot << lt ^ rt[vt + 1] & 255) & ut
                            }
                        } while (mt < $ && e.avail_in !== 0)
                    }
                    function se(t) {
                        var r = 65535;
                        var n;
                        if (r > s - 5) {
                            r = s - 5
                        }
                        while (true) {
                            if (mt <= 1) {
                                oe();
                                if (mt === 0 && t == y)
                                    return R;
                                if (mt === 0)
                                    break
                            }
                            vt += mt;
                            mt = 0;
                            n = ht + r;
                            if (vt === 0 || vt >= n) {
                                mt = vt - n;
                                vt = n;
                                ae(false);
                                if (e.avail_out === 0)
                                    return R
                            }
                            if (vt - ht >= k - $) {
                                ae(false);
                                if (e.avail_out === 0)
                                    return R
                            }
                        }
                        ae(t == x);
                        if (e.avail_out === 0)
                            return t == x ? U : R;
                        return t == x ? z : D
                    }
                    function fe(t) {
                        var e = wt;
                        var r = vt;
                        var n;
                        var i;
                        var a = yt;
                        var o = vt > k - $ ? vt - (k - $) : 0;
                        var s = At;
                        var f = et;
                        var u = vt + Q;
                        var l = rt[r + a - 1];
                        var h = rt[r + a];
                        if (yt >= Lt) {
                            e >>= 2
                        }
                        if (s > mt)
                            s = mt;
                        do {
                            n = t;
                            if (rt[n + a] != h || rt[n + a - 1] != l || rt[n] != rt[r] || rt[++n] != rt[r + 1])
                                continue;
                            r += 2;
                            n++;
                            do {} while (rt[++r] == rt[++n] && rt[++r] == rt[++n] && rt[++r] == rt[++n] && rt[++r] == rt[++n] && rt[++r] == rt[++n] && rt[++r] == rt[++n] && rt[++r] == rt[++n] && rt[++r] == rt[++n] && r < u);
                            i = Q - (u - r);
                            r = u - Q;
                            if (i > a) {
                                gt = t;
                                a = i;
                                if (i >= s)
                                    break;
                                l = rt[r + a - 1];
                                h = rt[r + a]
                            }
                        } while ((t = it[t & f] & 65535) > o && --e !== 0);
                        if (a <= mt)
                            return a;
                        return mt
                    }
                    function ue(t) {
                        var r = 0;
                        var n;
                        while (true) {
                            if (mt < $) {
                                oe();
                                if (mt < $ && t == y) {
                                    return R
                                }
                                if (mt === 0)
                                    break
                            }
                            if (mt >= Z) {
                                ot = (ot << lt ^ rt[vt + (Z - 1)] & 255) & ut;
                                r = at[ot] & 65535;
                                it[vt & et] = at[ot];
                                at[ot] = vt
                            }
                            if (r !== 0 && (vt - r & 65535) <= k - $) {
                                if (Nt != g) {
                                    ct = fe(r)
                                }
                            }
                            if (ct >= Z) {
                                n = $t(vt - gt, ct - Z);
                                mt -= ct;
                                if (ct <= bt && mt >= Z) {
                                    ct--;
                                    do {
                                        vt++;
                                        ot = (ot << lt ^ rt[vt + (Z - 1)] & 255) & ut;
                                        r = at[ot] & 65535;
                                        it[vt & et] = at[ot];
                                        at[ot] = vt
                                    } while (--ct !== 0);
                                    vt++
                                } else {
                                    vt += ct;
                                    ct = 0;
                                    ot = rt[vt] & 255;
                                    ot = (ot << lt ^ rt[vt + 1] & 255) & ut
                                }
                            } else {
                                n = $t(0, rt[vt] & 255);
                                mt--;
                                vt++
                            }
                            if (n) {
                                ae(false);
                                if (e.avail_out === 0)
                                    return R
                            }
                        }
                        ae(t == x);
                        if (e.avail_out === 0) {
                            if (t == x)
                                return U;
                            else
                                return R
                        }
                        return t == x ? z : D
                    }
                    function le(t) {
                        var r = 0;
                        var n;
                        var i;
                        while (true) {
                            if (mt < $) {
                                oe();
                                if (mt < $ && t == y) {
                                    return R
                                }
                                if (mt === 0)
                                    break
                            }
                            if (mt >= Z) {
                                ot = (ot << lt ^ rt[vt + (Z - 1)] & 255) & ut;
                                r = at[ot] & 65535;
                                it[vt & et] = at[ot];
                                at[ot] = vt
                            }
                            yt = ct;
                            dt = gt;
                            ct = Z - 1;
                            if (r !== 0 && yt < bt && (vt - r & 65535) <= k - $) {
                                if (Nt != g) {
                                    ct = fe(r)
                                }
                                if (ct <= 5 && (Nt == v || ct == Z && vt - gt > 4096)) {
                                    ct = Z - 1
                                }
                            }
                            if (yt >= Z && ct <= yt) {
                                i = vt + mt - Z;
                                n = $t(vt - 1 - dt, yt - Z);
                                mt -= yt - 1;
                                yt -= 2;
                                do {
                                    if (++vt <= i) {
                                        ot = (ot << lt ^ rt[vt + (Z - 1)] & 255) & ut;
                                        r = at[ot] & 65535;
                                        it[vt & et] = at[ot];
                                        at[ot] = vt
                                    }
                                } while (--yt !== 0);
                                pt = 0;
                                ct = Z - 1;
                                vt++;
                                if (n) {
                                    ae(false);
                                    if (e.avail_out === 0)
                                        return R
                                }
                            } else if (pt !== 0) {
                                n = $t(0, rt[vt - 1] & 255);
                                if (n) {
                                    ae(false)
                                }
                                vt++;
                                mt--;
                                if (e.avail_out === 0)
                                    return R
                            } else {
                                pt = 1;
                                vt++;
                                mt--
                            }
                        }
                        if (pt !== 0) {
                            n = $t(0, rt[vt - 1] & 255);
                            pt = 0
                        }
                        ae(t == x);
                        if (e.avail_out === 0) {
                            if (t == x)
                                return U;
                            else
                                return R
                        }
                        return t == x ? z : D
                    }
                    function he(e) {
                        e.total_in = e.total_out = 0;
                        e.msg = null;
                        t.pending = 0;
                        t.pending_out = 0;
                        i = V;
                        u = y;
                        Ut();
                        Rt();
                        return N
                    }
                    t.deflateInit = function(e, r, n, i, a, o) {
                        if (!i)
                            i = Y;
                        if (!a)
                            a = B;
                        if (!o)
                            o = m;
                        e.msg = null;
                        if (r == p)
                            r = 6;
                        if (a < 1 || a > C || i != Y || n < 9 || n > 15 || r < 0 || r > 9 || o < 0 || o > g) {
                            return S
                        }
                        e.dstate = t;
                        j = n;
                        k = 1 << j;
                        et = k - 1;
                        ft = a + 7;
                        st = 1 << ft;
                        ut = st - 1;
                        lt = Math.floor((ft + Z - 1) / Z);
                        rt = new Uint8Array(k * 2);
                        it = [];
                        at = [];
                        Bt = 1 << a + 6;
                        t.pending_buf = new Uint8Array(Bt * 4);
                        s = Bt * 4;
                        Et = Math.floor(Bt / 2);
                        Ct = (1 + 2) * Bt;
                        xt = r;
                        Nt = o;
                        return he(e)
                    }
                    ;
                    t.deflateEnd = function() {
                        if (i != W && i != V && i != G) {
                            return S
                        }
                        t.pending_buf = null;
                        at = null;
                        it = null;
                        rt = null;
                        t.dstate = null;
                        return i == V ? _ : N
                    }
                    ;
                    t.deflateParams = function(t, e, r) {
                        var n = N;
                        if (e == p) {
                            e = 6
                        }
                        if (e < 0 || e > 9 || r < 0 || r > g) {
                            return S
                        }
                        if (q[xt].func != q[e].func && t.total_in !== 0) {
                            n = t.deflate(w)
                        }
                        if (xt != e) {
                            xt = e;
                            bt = q[xt].max_lazy;
                            Lt = q[xt].good_length;
                            At = q[xt].nice_length;
                            wt = q[xt].max_chain
                        }
                        Nt = r;
                        return n
                    }
                    ;
                    t.deflateSetDictionary = function(t, e, r) {
                        var n = r;
                        var a, o = 0;
                        if (!e || i != W)
                            return S;
                        if (n < Z)
                            return N;
                        if (n > k - $) {
                            n = k - $;
                            o = r - n
                        }
                        rt.set(e.subarray(o, o + n), 0);
                        vt = n;
                        ht = n;
                        ot = rt[0] & 255;
                        ot = (ot << lt ^ rt[1] & 255) & ut;
                        for (a = 0; a <= n - Z; a++) {
                            ot = (ot << lt ^ rt[a + (Z - 1)] & 255) & ut;
                            it[a & et] = at[ot];
                            at[ot] = a
                        }
                        return N
                    }
                    ;
                    t.deflate = function(r, n) {
                        var a, o, s, f, l;
                        if (n > x || n < 0) {
                            return S
                        }
                        if (!r.next_out || !r.next_in && r.avail_in !== 0 || i == G && n != x) {
                            r.msg = T[A - S];
                            return S
                        }
                        if (r.avail_out === 0) {
                            r.msg = T[A - F];
                            return F
                        }
                        e = r;
                        f = u;
                        u = n;
                        if (i == W) {
                            o = Y + (j - 8 << 4) << 8;
                            s = (xt - 1 & 255) >> 1;
                            if (s > 3)
                                s = 3;
                            o |= s << 6;
                            if (vt !== 0)
                                o |= H;
                            o += 31 - o % 31;
                            i = V;
                            Gt(o)
                        }
                        if (t.pending !== 0) {
                            e.flush_pending();
                            if (e.avail_out === 0) {
                                u = -1;
                                return N
                            }
                        } else if (e.avail_in === 0 && n <= f && n != x) {
                            e.msg = T[A - F];
                            return F
                        }
                        if (i == G && e.avail_in !== 0) {
                            r.msg = T[A - F];
                            return F
                        }
                        if (e.avail_in !== 0 || mt !== 0 || n != y && i != G) {
                            l = -1;
                            switch (q[xt].func) {
                            case E:
                                l = se(n);
                                break;
                            case M:
                                l = ue(n);
                                break;
                            case O:
                                l = le(n);
                                break;
                            default:
                            }
                            if (l == U || l == z) {
                                i = G
                            }
                            if (l == R || l == U) {
                                if (e.avail_out === 0) {
                                    u = -1
                                }
                                return N
                            }
                            if (l == D) {
                                if (n == w) {
                                    Qt()
                                } else {
                                    ne(0, 0, false);
                                    if (n == b) {
                                        for (a = 0; a < st; a++) {
                                            at[a] = 0
                                        }
                                    }
                                }
                                e.flush_pending();
                                if (e.avail_out === 0) {
                                    u = -1;
                                    return N
                                }
                            }
                        }
                        if (n != x)
                            return N;
                        return L
                    }
                }
                function rt() {
                    var t = this;
                    t.next_in_index = 0;
                    t.next_out_index = 0;
                    t.avail_in = 0;
                    t.total_in = 0;
                    t.avail_out = 0;
                    t.total_out = 0
                }
                rt.prototype = {
                    deflateInit: function t(r, n) {
                        var i = this;
                        i.dstate = new et;
                        if (!n)
                            n = e;
                        return i.dstate.deflateInit(i, r, n)
                    },
                    deflate: function t(e) {
                        var r = this;
                        if (!r.dstate) {
                            return S
                        }
                        return r.dstate.deflate(r, e)
                    },
                    deflateEnd: function t() {
                        var e = this;
                        if (!e.dstate)
                            return S;
                        var r = e.dstate.deflateEnd();
                        e.dstate = null;
                        return r
                    },
                    deflateParams: function t(e, r) {
                        var n = this;
                        if (!n.dstate)
                            return S;
                        return n.dstate.deflateParams(n, e, r)
                    },
                    deflateSetDictionary: function t(e, r) {
                        var n = this;
                        if (!n.dstate)
                            return S;
                        return n.dstate.deflateSetDictionary(n, e, r)
                    },
                    read_buf: function t(e, r, n) {
                        var i = this;
                        var a = i.avail_in;
                        if (a > n)
                            a = n;
                        if (a === 0)
                            return 0;
                        i.avail_in -= a;
                        e.set(i.next_in.subarray(i.next_in_index, i.next_in_index + a), r);
                        i.next_in_index += a;
                        i.total_in += a;
                        return a
                    },
                    flush_pending: function t() {
                        var e = this;
                        var r = e.dstate.pending;
                        if (r > e.avail_out)
                            r = e.avail_out;
                        if (r === 0)
                            return;
                        e.next_out.set(e.dstate.pending_buf.subarray(e.dstate.pending_out, e.dstate.pending_out + r), e.next_out_index);
                        e.next_out_index += r;
                        e.dstate.pending_out += r;
                        e.total_out += r;
                        e.avail_out -= r;
                        e.dstate.pending -= r;
                        if (e.dstate.pending === 0) {
                            e.dstate.pending_out = 0
                        }
                    }
                };
                function nt(t) {
                    var e = this;
                    var r = new rt;
                    var n = 512;
                    var i = y;
                    var a = new Uint8Array(n);
                    var o = t ? t.level : p;
                    if (typeof o == "undefined")
                        o = p;
                    r.deflateInit(o);
                    r.next_out = a;
                    e.append = function(t, e) {
                        var o, s = [], f = 0, u = 0, l = 0, h;
                        if (!t.length)
                            return;
                        r.next_in_index = 0;
                        r.next_in = t;
                        r.avail_in = t.length;
                        do {
                            r.next_out_index = 0;
                            r.avail_out = n;
                            o = r.deflate(i);
                            if (o != N)
                                throw new Error("deflating: " + r.msg);
                            if (r.next_out_index)
                                if (r.next_out_index == n)
                                    s.push(new Uint8Array(a));
                                else
                                    s.push(new Uint8Array(a.subarray(0, r.next_out_index)));
                            l += r.next_out_index;
                            if (e && r.next_in_index > 0 && r.next_in_index != f) {
                                e(r.next_in_index);
                                f = r.next_in_index
                            }
                        } while (r.avail_in > 0 || r.avail_out === 0);
                        h = new Uint8Array(l);
                        s.forEach(function(t) {
                            h.set(t, u);
                            u += t.length
                        });
                        return h
                    }
                    ;
                    e.flush = function() {
                        var t, e = [], i = 0, o = 0, s;
                        do {
                            r.next_out_index = 0;
                            r.avail_out = n;
                            t = r.deflate(x);
                            if (t != L && t != N)
                                throw new Error("deflating: " + r.msg);
                            if (n - r.avail_out > 0)
                                e.push(new Uint8Array(a.subarray(0, r.next_out_index)));
                            o += r.next_out_index
                        } while (r.avail_in > 0 || r.avail_out === 0);
                        r.deflateEnd();
                        s = new Uint8Array(o);
                        e.forEach(function(t) {
                            s.set(t, i);
                            i += t.length
                        });
                        return s
                    }
                }
                var it = t.zip || t;
                it.Deflater = it._jzlib_Deflater = nt
            }
            )(typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || Function('return typeof this === "object" && this.content')() || Function("return this")());
            /**
     * A class to parse color values
     * @author Stoyan Stefanov <sstoo@gmail.com>
     * {@link   http://www.phpied.com/rgb-color-parser-in-javascript/}
     * @license Use it if you like it
     */
            (function(t) {
                function e(t) {
                    t = t || "";
                    this.ok = false;
                    if (t.charAt(0) == "#") {
                        t = t.substr(1, 6)
                    }
                    t = t.replace(/ /g, "");
                    t = t.toLowerCase();
                    var e;
                    var r = {
                        aliceblue: "f0f8ff",
                        antiquewhite: "faebd7",
                        aqua: "00ffff",
                        aquamarine: "7fffd4",
                        azure: "f0ffff",
                        beige: "f5f5dc",
                        bisque: "ffe4c4",
                        black: "000000",
                        blanchedalmond: "ffebcd",
                        blue: "0000ff",
                        blueviolet: "8a2be2",
                        brown: "a52a2a",
                        burlywood: "deb887",
                        cadetblue: "5f9ea0",
                        chartreuse: "7fff00",
                        chocolate: "d2691e",
                        coral: "ff7f50",
                        cornflowerblue: "6495ed",
                        cornsilk: "fff8dc",
                        crimson: "dc143c",
                        cyan: "00ffff",
                        darkblue: "00008b",
                        darkcyan: "008b8b",
                        darkgoldenrod: "b8860b",
                        darkgray: "a9a9a9",
                        darkgreen: "006400",
                        darkkhaki: "bdb76b",
                        darkmagenta: "8b008b",
                        darkolivegreen: "556b2f",
                        darkorange: "ff8c00",
                        darkorchid: "9932cc",
                        darkred: "8b0000",
                        darksalmon: "e9967a",
                        darkseagreen: "8fbc8f",
                        darkslateblue: "483d8b",
                        darkslategray: "2f4f4f",
                        darkturquoise: "00ced1",
                        darkviolet: "9400d3",
                        deeppink: "ff1493",
                        deepskyblue: "00bfff",
                        dimgray: "696969",
                        dodgerblue: "1e90ff",
                        feldspar: "d19275",
                        firebrick: "b22222",
                        floralwhite: "fffaf0",
                        forestgreen: "228b22",
                        fuchsia: "ff00ff",
                        gainsboro: "dcdcdc",
                        ghostwhite: "f8f8ff",
                        gold: "ffd700",
                        goldenrod: "daa520",
                        gray: "808080",
                        green: "008000",
                        greenyellow: "adff2f",
                        honeydew: "f0fff0",
                        hotpink: "ff69b4",
                        indianred: "cd5c5c",
                        indigo: "4b0082",
                        ivory: "fffff0",
                        khaki: "f0e68c",
                        lavender: "e6e6fa",
                        lavenderblush: "fff0f5",
                        lawngreen: "7cfc00",
                        lemonchiffon: "fffacd",
                        lightblue: "add8e6",
                        lightcoral: "f08080",
                        lightcyan: "e0ffff",
                        lightgoldenrodyellow: "fafad2",
                        lightgrey: "d3d3d3",
                        lightgreen: "90ee90",
                        lightpink: "ffb6c1",
                        lightsalmon: "ffa07a",
                        lightseagreen: "20b2aa",
                        lightskyblue: "87cefa",
                        lightslateblue: "8470ff",
                        lightslategray: "778899",
                        lightsteelblue: "b0c4de",
                        lightyellow: "ffffe0",
                        lime: "00ff00",
                        limegreen: "32cd32",
                        linen: "faf0e6",
                        magenta: "ff00ff",
                        maroon: "800000",
                        mediumaquamarine: "66cdaa",
                        mediumblue: "0000cd",
                        mediumorchid: "ba55d3",
                        mediumpurple: "9370d8",
                        mediumseagreen: "3cb371",
                        mediumslateblue: "7b68ee",
                        mediumspringgreen: "00fa9a",
                        mediumturquoise: "48d1cc",
                        mediumvioletred: "c71585",
                        midnightblue: "191970",
                        mintcream: "f5fffa",
                        mistyrose: "ffe4e1",
                        moccasin: "ffe4b5",
                        navajowhite: "ffdead",
                        navy: "000080",
                        oldlace: "fdf5e6",
                        olive: "808000",
                        olivedrab: "6b8e23",
                        orange: "ffa500",
                        orangered: "ff4500",
                        orchid: "da70d6",
                        palegoldenrod: "eee8aa",
                        palegreen: "98fb98",
                        paleturquoise: "afeeee",
                        palevioletred: "d87093",
                        papayawhip: "ffefd5",
                        peachpuff: "ffdab9",
                        peru: "cd853f",
                        pink: "ffc0cb",
                        plum: "dda0dd",
                        powderblue: "b0e0e6",
                        purple: "800080",
                        red: "ff0000",
                        rosybrown: "bc8f8f",
                        royalblue: "4169e1",
                        saddlebrown: "8b4513",
                        salmon: "fa8072",
                        sandybrown: "f4a460",
                        seagreen: "2e8b57",
                        seashell: "fff5ee",
                        sienna: "a0522d",
                        silver: "c0c0c0",
                        skyblue: "87ceeb",
                        slateblue: "6a5acd",
                        slategray: "708090",
                        snow: "fffafa",
                        springgreen: "00ff7f",
                        steelblue: "4682b4",
                        tan: "d2b48c",
                        teal: "008080",
                        thistle: "d8bfd8",
                        tomato: "ff6347",
                        turquoise: "40e0d0",
                        violet: "ee82ee",
                        violetred: "d02090",
                        wheat: "f5deb3",
                        white: "ffffff",
                        whitesmoke: "f5f5f5",
                        yellow: "ffff00",
                        yellowgreen: "9acd32"
                    };
                    for (var n in r) {
                        if (t == n) {
                            t = r[n]
                        }
                    }
                    var i = [{
                        re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                        example: ["rgb(123, 234, 45)", "rgb(255,234,245)"],
                        process: function t(e) {
                            return [parseInt(e[1]), parseInt(e[2]), parseInt(e[3])]
                        }
                    }, {
                        re: /^(\w{2})(\w{2})(\w{2})$/,
                        example: ["#00ff00", "336699"],
                        process: function t(e) {
                            return [parseInt(e[1], 16), parseInt(e[2], 16), parseInt(e[3], 16)]
                        }
                    }, {
                        re: /^(\w{1})(\w{1})(\w{1})$/,
                        example: ["#fb0", "f0f"],
                        process: function t(e) {
                            return [parseInt(e[1] + e[1], 16), parseInt(e[2] + e[2], 16), parseInt(e[3] + e[3], 16)]
                        }
                    }];
                    for (var a = 0; a < i.length; a++) {
                        var o = i[a].re;
                        var s = i[a].process;
                        var f = o.exec(t);
                        if (f) {
                            e = s(f);
                            this.r = e[0];
                            this.g = e[1];
                            this.b = e[2];
                            this.ok = true
                        }
                    }
                    this.r = this.r < 0 || isNaN(this.r) ? 0 : this.r > 255 ? 255 : this.r;
                    this.g = this.g < 0 || isNaN(this.g) ? 0 : this.g > 255 ? 255 : this.g;
                    this.b = this.b < 0 || isNaN(this.b) ? 0 : this.b > 255 ? 255 : this.b;
                    this.toRGB = function() {
                        return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")"
                    }
                    ;
                    this.toHex = function() {
                        var t = this.r.toString(16);
                        var e = this.g.toString(16);
                        var r = this.b.toString(16);
                        if (t.length == 1)
                            t = "0" + t;
                        if (e.length == 1)
                            e = "0" + e;
                        if (r.length == 1)
                            r = "0" + r;
                        return "#" + t + e + r
                    }
                }
                t.RGBColor = e
            }
            )(typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || Function('return typeof this === "object" && this.content')() || Function("return this")());
            (function(t) {
                var e = "+".charCodeAt(0);
                var r = "/".charCodeAt(0);
                var n = "0".charCodeAt(0);
                var i = "a".charCodeAt(0);
                var a = "A".charCodeAt(0);
                var o = "-".charCodeAt(0);
                var s = "_".charCodeAt(0);
                var f = function t(e) {
                    var r, n, i, a, o, s;
                    if (e.length % 4 > 0) {
                        throw new Error("Invalid string. Length must be a multiple of 4")
                    }
                    var f = e.length;
                    o = "=" === e.charAt(f - 2) ? 2 : "=" === e.charAt(f - 1) ? 1 : 0;
                    s = new Uint8Array(e.length * 3 / 4 - o);
                    i = o > 0 ? e.length - 4 : e.length;
                    var l = 0;
                    function h(t) {
                        s[l++] = t
                    }
                    for (r = 0,
                    n = 0; r < i; r += 4,
                    n += 3) {
                        a = u(e.charAt(r)) << 18 | u(e.charAt(r + 1)) << 12 | u(e.charAt(r + 2)) << 6 | u(e.charAt(r + 3));
                        h((a & 16711680) >> 16);
                        h((a & 65280) >> 8);
                        h(a & 255)
                    }
                    if (o === 2) {
                        a = u(e.charAt(r)) << 2 | u(e.charAt(r + 1)) >> 4;
                        h(a & 255)
                    } else if (o === 1) {
                        a = u(e.charAt(r)) << 10 | u(e.charAt(r + 1)) << 4 | u(e.charAt(r + 2)) >> 2;
                        h(a >> 8 & 255);
                        h(a & 255)
                    }
                    return s
                };
                var u = function t(f) {
                    var u = f.charCodeAt(0);
                    if (u === e || u === o)
                        return 62;
                    if (u === r || u === s)
                        return 63;
                    if (u < n)
                        return -1;
                    if (u < n + 10)
                        return u - n + 26 + 26;
                    if (u < a + 26)
                        return u - a;
                    if (u < i + 26)
                        return u - i + 26
                };
                t.API.TTFFont = function() {
                    t.open = function(e, r, n, i) {
                        var a;
                        if (typeof n !== "string") {
                            throw new Error("Invalid argument supplied in TTFFont.open")
                        }
                        a = f(n);
                        return new t(a,r,i)
                    }
                    ;
                    function t(t, e, r) {
                        var n;
                        this.rawData = t;
                        n = this.contents = new l(t);
                        this.contents.pos = 4;
                        if (n.readString(4) === "ttcf") {
                            if (!e) {
                                throw new Error("Must specify a font name for TTC files.")
                            }
                            throw new Error("Font " + e + " not found in TTC file.")
                        } else {
                            n.pos = 0;
                            this.parse();
                            this.subset = new C(this);
                            this.registerTTF()
                        }
                    }
                    t.prototype.parse = function() {
                        this.directory = new h(this.contents);
                        this.head = new v(this);
                        this.name = new N(this);
                        this.cmap = new m(this);
                        this.toUnicode = new Map;
                        this.hhea = new y(this);
                        this.maxp = new L(this);
                        this.hmtx = new A(this);
                        this.post = new b(this);
                        this.os2 = new w(this);
                        this.loca = new P(this);
                        this.glyf = new _(this);
                        this.ascender = this.os2.exists && this.os2.ascender || this.hhea.ascender;
                        this.decender = this.os2.exists && this.os2.decender || this.hhea.decender;
                        this.lineGap = this.os2.exists && this.os2.lineGap || this.hhea.lineGap;
                        return this.bbox = [this.head.xMin, this.head.yMin, this.head.xMax, this.head.yMax]
                    }
                    ;
                    t.prototype.registerTTF = function() {
                        var t, e, r, n, i;
                        this.scaleFactor = 1e3 / this.head.unitsPerEm;
                        this.bbox = function() {
                            var e, r, n, i;
                            n = this.bbox;
                            i = [];
                            for (e = 0,
                            r = n.length; e < r; e++) {
                                t = n[e];
                                i.push(Math.round(t * this.scaleFactor))
                            }
                            return i
                        }
                        .call(this);
                        this.stemV = 0;
                        if (this.post.exists) {
                            n = this.post.italic_angle;
                            e = n >> 16;
                            r = n & 255;
                            if (e & 32768 !== 0) {
                                e = -((e ^ 65535) + 1)
                            }
                            this.italicAngle = +("" + e + "." + r)
                        } else {
                            this.italicAngle = 0
                        }
                        this.ascender = Math.round(this.ascender * this.scaleFactor);
                        this.decender = Math.round(this.decender * this.scaleFactor);
                        this.lineGap = Math.round(this.lineGap * this.scaleFactor);
                        this.capHeight = this.os2.exists && this.os2.capHeight || this.ascender;
                        this.xHeight = this.os2.exists && this.os2.xHeight || 0;
                        this.familyClass = (this.os2.exists && this.os2.familyClass || 0) >> 8;
                        this.isSerif = (i = this.familyClass) === 1 || i === 2 || i === 3 || i === 4 || i === 5 || i === 7;
                        this.isScript = this.familyClass === 10;
                        this.flags = 0;
                        if (this.post.isFixedPitch) {
                            this.flags |= 1 << 0
                        }
                        if (this.isSerif) {
                            this.flags |= 1 << 1
                        }
                        if (this.isScript) {
                            this.flags |= 1 << 3
                        }
                        if (this.italicAngle !== 0) {
                            this.flags |= 1 << 6
                        }
                        this.flags |= 1 << 5;
                        if (!this.cmap.unicode) {
                            throw new Error("No unicode cmap for font")
                        }
                    }
                    ;
                    t.prototype.characterToGlyph = function(t) {
                        var e;
                        return ((e = this.cmap.unicode) != null ? e.codeMap[t] : void 0) || 0
                    }
                    ;
                    t.prototype.widthOfGlyph = function(t) {
                        var e;
                        e = 1e3 / this.head.unitsPerEm;
                        return this.hmtx.forGlyph(t).advance * e
                    }
                    ;
                    t.prototype.widthOfString = function(t, e, r) {
                        var n, i, a, o, s, f, r;
                        t = "" + t;
                        o = 0;
                        for (i = s = 0,
                        f = t.length; 0 <= f ? s < f : s > f; i = 0 <= f ? ++s : --s) {
                            n = t.charCodeAt(i);
                            o += this.widthOfGlyph(this.characterToGlyph(n)) + r * (1e3 / e) || 0
                        }
                        a = e / 1e3;
                        return o * a
                    }
                    ;
                    t.prototype.lineHeight = function(t, e) {
                        var r;
                        if (e == null) {
                            e = false
                        }
                        r = e ? this.lineGap : 0;
                        return (this.ascender + r - this.decender) / 1e3 * t
                    }
                    ;
                    return t
                }();
                var l = function() {
                    function t(t) {
                        this.data = t != null ? t : [];
                        this.pos = 0;
                        this.length = this.data.length
                    }
                    t.prototype.readByte = function() {
                        return this.data[this.pos++]
                    }
                    ;
                    t.prototype.writeByte = function(t) {
                        return this.data[this.pos++] = t
                    }
                    ;
                    t.prototype.readUInt32 = function() {
                        var t, e, r, n;
                        t = this.readByte() * 16777216;
                        e = this.readByte() << 16;
                        r = this.readByte() << 8;
                        n = this.readByte();
                        return t + e + r + n
                    }
                    ;
                    t.prototype.writeUInt32 = function(t) {
                        this.writeByte(t >>> 24 & 255);
                        this.writeByte(t >> 16 & 255);
                        this.writeByte(t >> 8 & 255);
                        return this.writeByte(t & 255)
                    }
                    ;
                    t.prototype.readInt32 = function() {
                        var t;
                        t = this.readUInt32();
                        if (t >= 2147483648) {
                            return t - 4294967296
                        } else {
                            return t
                        }
                    }
                    ;
                    t.prototype.writeInt32 = function(t) {
                        if (t < 0) {
                            t += 4294967296
                        }
                        return this.writeUInt32(t)
                    }
                    ;
                    t.prototype.readUInt16 = function() {
                        var t, e;
                        t = this.readByte() << 8;
                        e = this.readByte();
                        return t | e
                    }
                    ;
                    t.prototype.writeUInt16 = function(t) {
                        this.writeByte(t >> 8 & 255);
                        return this.writeByte(t & 255)
                    }
                    ;
                    t.prototype.readInt16 = function() {
                        var t;
                        t = this.readUInt16();
                        if (t >= 32768) {
                            return t - 65536
                        } else {
                            return t
                        }
                    }
                    ;
                    t.prototype.writeInt16 = function(t) {
                        if (t < 0) {
                            t += 65536
                        }
                        return this.writeUInt16(t)
                    }
                    ;
                    t.prototype.readString = function(t) {
                        var e, r, n;
                        r = [];
                        for (e = n = 0; 0 <= t ? n < t : n > t; e = 0 <= t ? ++n : --n) {
                            r[e] = String.fromCharCode(this.readByte())
                        }
                        return r.join("")
                    }
                    ;
                    t.prototype.writeString = function(t) {
                        var e, r, n, i;
                        i = [];
                        for (e = r = 0,
                        n = t.length; 0 <= n ? r < n : r > n; e = 0 <= n ? ++r : --r) {
                            i.push(this.writeByte(t.charCodeAt(e)))
                        }
                        return i
                    }
                    ;
                    t.prototype.readShort = function() {
                        return this.readInt16()
                    }
                    ;
                    t.prototype.writeShort = function(t) {
                        return this.writeInt16(t)
                    }
                    ;
                    t.prototype.readLongLong = function() {
                        var t, e, r, n, i, a, o, s;
                        t = this.readByte();
                        e = this.readByte();
                        r = this.readByte();
                        n = this.readByte();
                        i = this.readByte();
                        a = this.readByte();
                        o = this.readByte();
                        s = this.readByte();
                        if (t & 128) {
                            return ((t ^ 255) * 72057594037927940 + (e ^ 255) * 281474976710656 + (r ^ 255) * 1099511627776 + (n ^ 255) * 4294967296 + (i ^ 255) * 16777216 + (a ^ 255) * 65536 + (o ^ 255) * 256 + (s ^ 255) + 1) * -1
                        }
                        return t * 72057594037927940 + e * 281474976710656 + r * 1099511627776 + n * 4294967296 + i * 16777216 + a * 65536 + o * 256 + s
                    }
                    ;
                    t.prototype.writeLongLong = function(t) {
                        var e, r;
                        e = Math.floor(t / 4294967296);
                        r = t & 4294967295;
                        this.writeByte(e >> 24 & 255);
                        this.writeByte(e >> 16 & 255);
                        this.writeByte(e >> 8 & 255);
                        this.writeByte(e & 255);
                        this.writeByte(r >> 24 & 255);
                        this.writeByte(r >> 16 & 255);
                        this.writeByte(r >> 8 & 255);
                        return this.writeByte(r & 255)
                    }
                    ;
                    t.prototype.readInt = function() {
                        return this.readInt32()
                    }
                    ;
                    t.prototype.writeInt = function(t) {
                        return this.writeInt32(t)
                    }
                    ;
                    t.prototype.read = function(t) {
                        var e, r, n;
                        e = [];
                        for (r = n = 0; 0 <= t ? n < t : n > t; r = 0 <= t ? ++n : --n) {
                            e.push(this.readByte())
                        }
                        return e
                    }
                    ;
                    t.prototype.write = function(t) {
                        var e, r, n, i;
                        i = [];
                        for (r = 0,
                        n = t.length; r < n; r++) {
                            e = t[r];
                            i.push(this.writeByte(e))
                        }
                        return i
                    }
                    ;
                    return t
                }();
                var h = function() {
                    var t;
                    function e(t) {
                        var e, r, n, i;
                        this.scalarType = t.readInt();
                        this.tableCount = t.readShort();
                        this.searchRange = t.readShort();
                        this.entrySelector = t.readShort();
                        this.rangeShift = t.readShort();
                        this.tables = {};
                        for (r = n = 0,
                        i = this.tableCount; 0 <= i ? n < i : n > i; r = 0 <= i ? ++n : --n) {
                            e = {
                                tag: t.readString(4),
                                checksum: t.readInt(),
                                offset: t.readInt(),
                                length: t.readInt()
                            };
                            this.tables[e.tag] = e
                        }
                    }
                    e.prototype.encode = function(e) {
                        var r, n, i, a, o, s, f, u, h, c, d, p, v, g;
                        p = Object.keys(e).length;
                        s = Math.log(2);
                        h = Math.floor(Math.log(p) / s) * 16;
                        a = Math.floor(h / s);
                        u = p * 16 - h;
                        n = new l;
                        n.writeInt(this.scalarType);
                        n.writeShort(p);
                        n.writeShort(h);
                        n.writeShort(a);
                        n.writeShort(u);
                        i = p * 16;
                        f = n.pos + i;
                        o = null;
                        v = [];
                        for (g in e) {
                            d = e[g];
                            n.writeString(g);
                            n.writeInt(t(d));
                            n.writeInt(f);
                            n.writeInt(d.length);
                            v = v.concat(d);
                            if (g === "head") {
                                o = f
                            }
                            f += d.length;
                            while (f % 4) {
                                v.push(0);
                                f++
                            }
                        }
                        n.write(v);
                        c = t(n.data);
                        r = 2981146554 - c;
                        n.pos = o + 8;
                        n.writeUInt32(r);
                        return n.data
                    }
                    ;
                    t = function t(e) {
                        var r, n, i, a, o;
                        e = S.call(e);
                        while (e.length % 4) {
                            e.push(0)
                        }
                        i = new l(e);
                        n = 0;
                        for (r = a = 0,
                        o = e.length; a < o; r = a += 4) {
                            n += i.readUInt32()
                        }
                        return n & 4294967295
                    }
                    ;
                    return e
                }();
                var c, d = {}.hasOwnProperty, p = function t(e, r) {
                    for (var n in r) {
                        if (d.call(r, n))
                            e[n] = r[n]
                    }
                    function i() {
                        this.constructor = e
                    }
                    i.prototype = r.prototype;
                    e.prototype = new i;
                    e.__super__ = r.prototype;
                    return e
                };
                c = function() {
                    function t(t) {
                        var e;
                        this.file = t;
                        e = this.file.directory.tables[this.tag];
                        this.exists = !!e;
                        if (e) {
                            this.offset = e.offset,
                            this.length = e.length;
                            this.parse(this.file.contents)
                        }
                    }
                    t.prototype.parse = function() {}
                    ;
                    t.prototype.encode = function() {}
                    ;
                    t.prototype.raw = function() {
                        if (!this.exists) {
                            return null
                        }
                        this.file.contents.pos = this.offset;
                        return this.file.contents.read(this.length)
                    }
                    ;
                    return t
                }();
                var v = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "head";
                    e.prototype.parse = function(t) {
                        t.pos = this.offset;
                        this.version = t.readInt();
                        this.revision = t.readInt();
                        this.checkSumAdjustment = t.readInt();
                        this.magicNumber = t.readInt();
                        this.flags = t.readShort();
                        this.unitsPerEm = t.readShort();
                        this.created = t.readLongLong();
                        this.modified = t.readLongLong();
                        this.xMin = t.readShort();
                        this.yMin = t.readShort();
                        this.xMax = t.readShort();
                        this.yMax = t.readShort();
                        this.macStyle = t.readShort();
                        this.lowestRecPPEM = t.readShort();
                        this.fontDirectionHint = t.readShort();
                        this.indexToLocFormat = t.readShort();
                        return this.glyphDataFormat = t.readShort()
                    }
                    ;
                    e.prototype.encode = function(t) {
                        var e;
                        e = new l;
                        e.writeInt(this.version);
                        e.writeInt(this.revision);
                        e.writeInt(this.checkSumAdjustment);
                        e.writeInt(this.magicNumber);
                        e.writeShort(this.flags);
                        e.writeShort(this.unitsPerEm);
                        e.writeLongLong(this.created);
                        e.writeLongLong(this.modified);
                        e.writeShort(this.xMin);
                        e.writeShort(this.yMin);
                        e.writeShort(this.xMax);
                        e.writeShort(this.yMax);
                        e.writeShort(this.macStyle);
                        e.writeShort(this.lowestRecPPEM);
                        e.writeShort(this.fontDirectionHint);
                        e.writeShort(t);
                        e.writeShort(this.glyphDataFormat);
                        return e.data
                    }
                    ;
                    return e
                }(c);
                var g = function() {
                    function t(t, e) {
                        var r, n, i, a, o, s, f, u, l, h, c, d, p, v, g, m, y, w, b;
                        this.platformID = t.readUInt16();
                        this.encodingID = t.readShort();
                        this.offset = e + t.readInt();
                        h = t.pos;
                        t.pos = this.offset;
                        this.format = t.readUInt16();
                        this.length = t.readUInt16();
                        this.language = t.readUInt16();
                        this.isUnicode = this.platformID === 3 && this.encodingID === 1 && this.format === 4 || this.platformID === 0 && this.format === 4;
                        this.codeMap = {};
                        switch (this.format) {
                        case 0:
                            for (s = m = 0; m < 256; s = ++m) {
                                this.codeMap[s] = t.readByte()
                            }
                            break;
                        case 4:
                            d = t.readUInt16();
                            c = d / 2;
                            t.pos += 6;
                            i = function() {
                                var e, r;
                                r = [];
                                for (s = e = 0; 0 <= c ? e < c : e > c; s = 0 <= c ? ++e : --e) {
                                    r.push(t.readUInt16())
                                }
                                return r
                            }();
                            t.pos += 2;
                            v = function() {
                                var e, r;
                                r = [];
                                for (s = e = 0; 0 <= c ? e < c : e > c; s = 0 <= c ? ++e : --e) {
                                    r.push(t.readUInt16())
                                }
                                return r
                            }();
                            f = function() {
                                var e, r;
                                r = [];
                                for (s = e = 0; 0 <= c ? e < c : e > c; s = 0 <= c ? ++e : --e) {
                                    r.push(t.readUInt16())
                                }
                                return r
                            }();
                            u = function() {
                                var e, r;
                                r = [];
                                for (s = e = 0; 0 <= c ? e < c : e > c; s = 0 <= c ? ++e : --e) {
                                    r.push(t.readUInt16())
                                }
                                return r
                            }();
                            n = (this.length - t.pos + this.offset) / 2;
                            o = function() {
                                var e, r;
                                r = [];
                                for (s = e = 0; 0 <= n ? e < n : e > n; s = 0 <= n ? ++e : --e) {
                                    r.push(t.readUInt16())
                                }
                                return r
                            }();
                            for (s = y = 0,
                            b = i.length; y < b; s = ++y) {
                                g = i[s];
                                p = v[s];
                                for (r = w = p; p <= g ? w <= g : w >= g; r = p <= g ? ++w : --w) {
                                    if (u[s] === 0) {
                                        a = r + f[s]
                                    } else {
                                        l = u[s] / 2 + (r - p) - (c - s);
                                        a = o[l] || 0;
                                        if (a !== 0) {
                                            a += f[s]
                                        }
                                    }
                                    this.codeMap[r] = a & 65535
                                }
                            }
                        }
                        t.pos = h
                    }
                    t.encode = function(t, e) {
                        var r, n, i, a, o, s, f, u, h, c, d, p, v, g, m, y, w, b, x, N, L, A, S, _, F, k, P, I, C, B, j, E, M, O, q, T, R, D, U, z, H, W, V, G, Y, J, X;
                        C = new l;
                        a = Object.keys(t).sort(function(t, e) {
                            return t - e
                        });
                        switch (e) {
                        case "macroman":
                            v = 0;
                            g = function() {
                                var t, e;
                                e = [];
                                for (p = t = 0; t < 256; p = ++t) {
                                    e.push(0)
                                }
                                return e
                            }();
                            y = {
                                0: 0
                            };
                            i = {};
                            for (B = 0,
                            O = a.length; B < O; B++) {
                                n = a[B];
                                if (y[G = t[n]] == null) {
                                    y[G] = ++v
                                }
                                i[n] = {
                                    old: t[n],
                                    new: y[t[n]]
                                };
                                g[n] = y[t[n]]
                            }
                            C.writeUInt16(1);
                            C.writeUInt16(0);
                            C.writeUInt32(12);
                            C.writeUInt16(0);
                            C.writeUInt16(262);
                            C.writeUInt16(0);
                            C.write(g);
                            return A = {
                                charMap: i,
                                subtable: C.data,
                                maxGlyphID: v + 1
                            };
                        case "unicode":
                            P = [];
                            h = [];
                            w = 0;
                            y = {};
                            r = {};
                            m = f = null;
                            for (j = 0,
                            q = a.length; j < q; j++) {
                                n = a[j];
                                x = t[n];
                                if (y[x] == null) {
                                    y[x] = ++w
                                }
                                r[n] = {
                                    old: x,
                                    new: y[x]
                                };
                                o = y[x] - n;
                                if (m == null || o !== f) {
                                    if (m) {
                                        h.push(m)
                                    }
                                    P.push(n);
                                    f = o
                                }
                                m = n
                            }
                            if (m) {
                                h.push(m)
                            }
                            h.push(65535);
                            P.push(65535);
                            _ = P.length;
                            F = _ * 2;
                            S = 2 * Math.pow(Math.log(_) / Math.LN2, 2);
                            c = Math.log(S / 2) / Math.LN2;
                            L = 2 * _ - S;
                            s = [];
                            N = [];
                            d = [];
                            for (p = E = 0,
                            T = P.length; E < T; p = ++E) {
                                k = P[p];
                                u = h[p];
                                if (k === 65535) {
                                    s.push(0);
                                    N.push(0);
                                    break
                                }
                                I = r[k]["new"];
                                if (k - I >= 32768) {
                                    s.push(0);
                                    N.push(2 * (d.length + _ - p));
                                    for (n = M = k; k <= u ? M <= u : M >= u; n = k <= u ? ++M : --M) {
                                        d.push(r[n]["new"])
                                    }
                                } else {
                                    s.push(I - k);
                                    N.push(0)
                                }
                            }
                            C.writeUInt16(3);
                            C.writeUInt16(1);
                            C.writeUInt32(12);
                            C.writeUInt16(4);
                            C.writeUInt16(16 + _ * 8 + d.length * 2);
                            C.writeUInt16(0);
                            C.writeUInt16(F);
                            C.writeUInt16(S);
                            C.writeUInt16(c);
                            C.writeUInt16(L);
                            for (W = 0,
                            R = h.length; W < R; W++) {
                                n = h[W];
                                C.writeUInt16(n)
                            }
                            C.writeUInt16(0);
                            for (V = 0,
                            D = P.length; V < D; V++) {
                                n = P[V];
                                C.writeUInt16(n)
                            }
                            for (Y = 0,
                            U = s.length; Y < U; Y++) {
                                o = s[Y];
                                C.writeUInt16(o)
                            }
                            for (J = 0,
                            z = N.length; J < z; J++) {
                                b = N[J];
                                C.writeUInt16(b)
                            }
                            for (X = 0,
                            H = d.length; X < H; X++) {
                                v = d[X];
                                C.writeUInt16(v)
                            }
                            return A = {
                                charMap: r,
                                subtable: C.data,
                                maxGlyphID: w + 1
                            }
                        }
                    }
                    ;
                    return t
                }();
                var m = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "cmap";
                    e.prototype.parse = function(t) {
                        var e, r, n, i;
                        t.pos = this.offset;
                        this.version = t.readUInt16();
                        n = t.readUInt16();
                        this.tables = [];
                        this.unicode = null;
                        for (r = i = 0; 0 <= n ? i < n : i > n; r = 0 <= n ? ++i : --i) {
                            e = new g(t,this.offset);
                            this.tables.push(e);
                            if (e.isUnicode) {
                                if (this.unicode == null) {
                                    this.unicode = e
                                }
                            }
                        }
                        return true
                    }
                    ;
                    e.encode = function(t, e) {
                        var r, n;
                        if (e == null) {
                            e = "macroman"
                        }
                        r = g.encode(t, e);
                        n = new l;
                        n.writeUInt16(0);
                        n.writeUInt16(1);
                        r.table = n.data.concat(r.subtable);
                        return r
                    }
                    ;
                    return e
                }(c);
                var y = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "hhea";
                    e.prototype.parse = function(t) {
                        t.pos = this.offset;
                        this.version = t.readInt();
                        this.ascender = t.readShort();
                        this.decender = t.readShort();
                        this.lineGap = t.readShort();
                        this.advanceWidthMax = t.readShort();
                        this.minLeftSideBearing = t.readShort();
                        this.minRightSideBearing = t.readShort();
                        this.xMaxExtent = t.readShort();
                        this.caretSlopeRise = t.readShort();
                        this.caretSlopeRun = t.readShort();
                        this.caretOffset = t.readShort();
                        t.pos += 4 * 2;
                        this.metricDataFormat = t.readShort();
                        return this.numberOfMetrics = t.readUInt16()
                    }
                    ;
                    return e
                }(c);
                var w = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "OS/2";
                    e.prototype.parse = function(t) {
                        var e;
                        t.pos = this.offset;
                        this.version = t.readUInt16();
                        this.averageCharWidth = t.readShort();
                        this.weightClass = t.readUInt16();
                        this.widthClass = t.readUInt16();
                        this.type = t.readShort();
                        this.ySubscriptXSize = t.readShort();
                        this.ySubscriptYSize = t.readShort();
                        this.ySubscriptXOffset = t.readShort();
                        this.ySubscriptYOffset = t.readShort();
                        this.ySuperscriptXSize = t.readShort();
                        this.ySuperscriptYSize = t.readShort();
                        this.ySuperscriptXOffset = t.readShort();
                        this.ySuperscriptYOffset = t.readShort();
                        this.yStrikeoutSize = t.readShort();
                        this.yStrikeoutPosition = t.readShort();
                        this.familyClass = t.readShort();
                        this.panose = function() {
                            var r, n;
                            n = [];
                            for (e = r = 0; r < 10; e = ++r) {
                                n.push(t.readByte())
                            }
                            return n
                        }();
                        this.charRange = function() {
                            var r, n;
                            n = [];
                            for (e = r = 0; r < 4; e = ++r) {
                                n.push(t.readInt())
                            }
                            return n
                        }();
                        this.vendorID = t.readString(4);
                        this.selection = t.readShort();
                        this.firstCharIndex = t.readShort();
                        this.lastCharIndex = t.readShort();
                        if (this.version > 0) {
                            this.ascent = t.readShort();
                            this.descent = t.readShort();
                            this.lineGap = t.readShort();
                            this.winAscent = t.readShort();
                            this.winDescent = t.readShort();
                            this.codePageRange = function() {
                                var r, n;
                                n = [];
                                for (e = r = 0; r < 2; e = ++r) {
                                    n.push(t.readInt())
                                }
                                return n
                            }();
                            if (this.version > 1) {
                                this.xHeight = t.readShort();
                                this.capHeight = t.readShort();
                                this.defaultChar = t.readShort();
                                this.breakChar = t.readShort();
                                return this.maxContext = t.readShort()
                            }
                        }
                    }
                    ;
                    return e
                }(c);
                var b = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "post";
                    e.prototype.parse = function(t) {
                        var e, r, n, i, a;
                        t.pos = this.offset;
                        this.format = t.readInt();
                        this.italicAngle = t.readInt();
                        this.underlinePosition = t.readShort();
                        this.underlineThickness = t.readShort();
                        this.isFixedPitch = t.readInt();
                        this.minMemType42 = t.readInt();
                        this.maxMemType42 = t.readInt();
                        this.minMemType1 = t.readInt();
                        this.maxMemType1 = t.readInt();
                        switch (this.format) {
                        case 65536:
                            break;
                        case 131072:
                            n = t.readUInt16();
                            this.glyphNameIndex = [];
                            for (e = i = 0; 0 <= n ? i < n : i > n; e = 0 <= n ? ++i : --i) {
                                this.glyphNameIndex.push(t.readUInt16())
                            }
                            this.names = [];
                            a = [];
                            while (t.pos < this.offset + this.length) {
                                r = t.readByte();
                                a.push(this.names.push(t.readString(r)))
                            }
                            return a;
                            break;
                        case 151552:
                            n = t.readUInt16();
                            return this.offsets = t.read(n);
                        case 196608:
                            break;
                        case 262144:
                            return this.map = function() {
                                var r, n, i;
                                i = [];
                                for (e = r = 0,
                                n = this.file.maxp.numGlyphs; 0 <= n ? r < n : r > n; e = 0 <= n ? ++r : --r) {
                                    i.push(t.readUInt32())
                                }
                                return i
                            }
                            .call(this)
                        }
                    }
                    ;
                    return e
                }(c);
                /* comment : Store copyright information, platformID, encodingID, and languageID in the NameEntry object.*/
                var x = function() {
                    function t(t, e) {
                        this.raw = t;
                        this.length = t.length;
                        this.platformID = e.platformID;
                        this.encodingID = e.encodingID;
                        this.languageID = e.languageID
                    }
                    return t
                }();
                var N = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "name";
                    e.prototype.parse = function(t) {
                        var e, r, n, i, a, o, s, f, u, l, h, c, d;
                        t.pos = this.offset;
                        i = t.readShort();
                        e = t.readShort();
                        s = t.readShort();
                        r = [];
                        for (a = l = 0; 0 <= e ? l < e : l > e; a = 0 <= e ? ++l : --l) {
                            r.push({
                                platformID: t.readShort(),
                                encodingID: t.readShort(),
                                languageID: t.readShort(),
                                nameID: t.readShort(),
                                length: t.readShort(),
                                offset: this.offset + s + t.readShort()
                            })
                        }
                        f = {};
                        for (a = h = 0,
                        c = r.length; h < c; a = ++h) {
                            n = r[a];
                            t.pos = n.offset;
                            u = t.readString(n.length);
                            o = new x(u,n);
                            if (f[d = n.nameID] == null) {
                                f[d] = []
                            }
                            f[n.nameID].push(o)
                        }
                        this.strings = f;
                        this.copyright = f[0];
                        this.fontFamily = f[1];
                        this.fontSubfamily = f[2];
                        this.uniqueSubfamily = f[3];
                        this.fontName = f[4];
                        this.version = f[5];
                        try {
                            this.postscriptName = f[6][0].raw.replace(/[\x00-\x19\x80-\xff]/g, "")
                        } catch (t) {
                            this.postscriptName = f[4][0].raw.replace(/[\x00-\x19\x80-\xff]/g, "")
                        }
                        this.trademark = f[7];
                        this.manufacturer = f[8];
                        this.designer = f[9];
                        this.description = f[10];
                        this.vendorUrl = f[11];
                        this.designerUrl = f[12];
                        this.license = f[13];
                        this.licenseUrl = f[14];
                        this.preferredFamily = f[15];
                        this.preferredSubfamily = f[17];
                        this.compatibleFull = f[18];
                        return this.sampleText = f[19]
                    }
                    ;
                    return e
                }(c);
                var L = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "maxp";
                    e.prototype.parse = function(t) {
                        t.pos = this.offset;
                        this.version = t.readInt();
                        this.numGlyphs = t.readUInt16();
                        this.maxPoints = t.readUInt16();
                        this.maxContours = t.readUInt16();
                        this.maxCompositePoints = t.readUInt16();
                        this.maxComponentContours = t.readUInt16();
                        this.maxZones = t.readUInt16();
                        this.maxTwilightPoints = t.readUInt16();
                        this.maxStorage = t.readUInt16();
                        this.maxFunctionDefs = t.readUInt16();
                        this.maxInstructionDefs = t.readUInt16();
                        this.maxStackElements = t.readUInt16();
                        this.maxSizeOfInstructions = t.readUInt16();
                        this.maxComponentElements = t.readUInt16();
                        return this.maxComponentDepth = t.readUInt16()
                    }
                    ;
                    return e
                }(c);
                var A = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "hmtx";
                    e.prototype.parse = function(t) {
                        var e, r, n, i, a, o, s, f;
                        t.pos = this.offset;
                        this.metrics = [];
                        for (e = a = 0,
                        s = this.file.hhea.numberOfMetrics; 0 <= s ? a < s : a > s; e = 0 <= s ? ++a : --a) {
                            this.metrics.push({
                                advance: t.readUInt16(),
                                lsb: t.readInt16()
                            })
                        }
                        n = this.file.maxp.numGlyphs - this.file.hhea.numberOfMetrics;
                        this.leftSideBearings = function() {
                            var r, i;
                            i = [];
                            for (e = r = 0; 0 <= n ? r < n : r > n; e = 0 <= n ? ++r : --r) {
                                i.push(t.readInt16())
                            }
                            return i
                        }();
                        this.widths = function() {
                            var t, e, r, n;
                            r = this.metrics;
                            n = [];
                            for (t = 0,
                            e = r.length; t < e; t++) {
                                i = r[t];
                                n.push(i.advance)
                            }
                            return n
                        }
                        .call(this);
                        r = this.widths[this.widths.length - 1];
                        f = [];
                        for (e = o = 0; 0 <= n ? o < n : o > n; e = 0 <= n ? ++o : --o) {
                            f.push(this.widths.push(r))
                        }
                        return f
                    }
                    ;
                    e.prototype.forGlyph = function(t) {
                        var e;
                        if (t in this.metrics) {
                            return this.metrics[t]
                        }
                        return e = {
                            advance: this.metrics[this.metrics.length - 1].advance,
                            lsb: this.leftSideBearings[t - this.metrics.length]
                        }
                    }
                    ;
                    return e
                }(c);
                var S = [].slice;
                var _ = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "glyf";
                    e.prototype.parse = function(t) {
                        return this.cache = {}
                    }
                    ;
                    e.prototype.glyphFor = function(t) {
                        t = t;
                        var e, r, n, i, a, o, s, f, u, h;
                        if (t in this.cache) {
                            return this.cache[t]
                        }
                        i = this.file.loca;
                        e = this.file.contents;
                        r = i.indexOf(t);
                        n = i.lengthOf(t);
                        if (n === 0) {
                            return this.cache[t] = null
                        }
                        e.pos = this.offset + r;
                        o = new l(e.read(n));
                        a = o.readShort();
                        f = o.readShort();
                        h = o.readShort();
                        s = o.readShort();
                        u = o.readShort();
                        if (a === -1) {
                            this.cache[t] = new k(o,f,h,s,u)
                        } else {
                            this.cache[t] = new F(o,a,f,h,s,u)
                        }
                        return this.cache[t]
                    }
                    ;
                    e.prototype.encode = function(t, e, r) {
                        var n, i, a, o, s, f;
                        o = [];
                        a = [];
                        for (s = 0,
                        f = e.length; s < f; s++) {
                            i = e[s];
                            n = t[i];
                            a.push(o.length);
                            if (n) {
                                o = o.concat(n.encode(r))
                            }
                        }
                        a.push(o.length);
                        return {
                            table: o,
                            offsets: a
                        }
                    }
                    ;
                    return e
                }(c);
                var F = function() {
                    function t(t, e, r, n, i, a) {
                        this.raw = t;
                        this.numberOfContours = e;
                        this.xMin = r;
                        this.yMin = n;
                        this.xMax = i;
                        this.yMax = a;
                        this.compound = false
                    }
                    t.prototype.encode = function() {
                        return this.raw.data
                    }
                    ;
                    return t
                }();
                var k = function() {
                    var t, e, r, n, i;
                    t = 1;
                    n = 8;
                    e = 32;
                    r = 64;
                    i = 128;
                    function a(a, o, s, f, u) {
                        var l, h;
                        this.raw = a;
                        this.xMin = o;
                        this.yMin = s;
                        this.xMax = f;
                        this.yMax = u;
                        this.compound = true;
                        this.glyphIDs = [];
                        this.glyphOffsets = [];
                        l = this.raw;
                        while (true) {
                            h = l.readShort();
                            this.glyphOffsets.push(l.pos);
                            this.glyphIDs.push(l.readShort());
                            if (!(h & e)) {
                                break
                            }
                            if (h & t) {
                                l.pos += 4
                            } else {
                                l.pos += 2
                            }
                            if (h & i) {
                                l.pos += 8
                            } else if (h & r) {
                                l.pos += 4
                            } else if (h & n) {
                                l.pos += 2
                            }
                        }
                    }
                    a.prototype.encode = function(t) {
                        var e, r, n, i, a, o;
                        n = new l(S.call(this.raw.data));
                        o = this.glyphIDs;
                        for (e = i = 0,
                        a = o.length; i < a; e = ++i) {
                            r = o[e];
                            n.pos = this.glyphOffsets[e]
                        }
                        return n.data
                    }
                    ;
                    return a
                }();
                var P = function(t) {
                    p(e, t);
                    function e() {
                        return e.__super__.constructor.apply(this, arguments)
                    }
                    e.prototype.tag = "loca";
                    e.prototype.parse = function(t) {
                        var e, r;
                        t.pos = this.offset;
                        e = this.file.head.indexToLocFormat;
                        if (e === 0) {
                            return this.offsets = function() {
                                var e, n, i;
                                i = [];
                                for (r = e = 0,
                                n = this.length; e < n; r = e += 2) {
                                    i.push(t.readUInt16() * 2)
                                }
                                return i
                            }
                            .call(this)
                        } else {
                            return this.offsets = function() {
                                var e, n, i;
                                i = [];
                                for (r = e = 0,
                                n = this.length; e < n; r = e += 4) {
                                    i.push(t.readUInt32())
                                }
                                return i
                            }
                            .call(this)
                        }
                    }
                    ;
                    e.prototype.indexOf = function(t) {
                        return this.offsets[t]
                    }
                    ;
                    e.prototype.lengthOf = function(t) {
                        return this.offsets[t + 1] - this.offsets[t]
                    }
                    ;
                    e.prototype.encode = function(t, e) {
                        var r = new Uint32Array(this.offsets.length);
                        var n = 0;
                        var i = 0;
                        for (var a = 0; a < r.length; ++a) {
                            r[a] = n;
                            if (i < e.length && e[i] == a) {
                                ++i;
                                r[a] = n;
                                var o = this.offsets[a];
                                var s = this.offsets[a + 1] - o;
                                if (s > 0) {
                                    n += s
                                }
                            }
                        }
                        var f = new Array(r.length * 4);
                        for (var u = 0; u < r.length; ++u) {
                            f[4 * u + 3] = r[u] & 255;
                            f[4 * u + 2] = (r[u] & 65280) >> 8;
                            f[4 * u + 1] = (r[u] & 16711680) >> 16;
                            f[4 * u] = (r[u] & 4278190080) >> 24
                        }
                        return f
                    }
                    ;
                    return e
                }(c);
                var I = function t(e) {
                    var r, n, i;
                    n = {};
                    for (r in e) {
                        i = e[r];
                        n[i] = r
                    }
                    return n
                };
                var C = function() {
                    function t(t) {
                        this.font = t;
                        this.subset = {};
                        this.unicodes = {};
                        this.next = 33
                    }
                    t.prototype.generateCmap = function() {
                        var t, e, r, n, i;
                        n = this.font.cmap.tables[0].codeMap;
                        t = {};
                        i = this.subset;
                        for (e in i) {
                            r = i[e];
                            t[e] = n[r]
                        }
                        return t
                    }
                    ;
                    t.prototype.glyphsFor = function(t) {
                        var e, r, n, i, a, o, s;
                        n = {};
                        for (a = 0,
                        o = t.length; a < o; a++) {
                            i = t[a];
                            n[i] = this.font.glyf.glyphFor(i)
                        }
                        e = [];
                        for (i in n) {
                            r = n[i];
                            if (r != null ? r.compound : void 0) {
                                e.push.apply(e, r.glyphIDs)
                            }
                        }
                        if (e.length > 0) {
                            s = this.glyphsFor(e);
                            for (i in s) {
                                r = s[i];
                                n[i] = r
                            }
                        }
                        return n
                    }
                    ;
                    t.prototype.encode = function(t, e) {
                        var r, n, i, a, o, s, f, u, l, h, c, d, p, v, g;
                        r = m.encode(this.generateCmap(), "unicode");
                        a = this.glyphsFor(t);
                        c = {
                            0: 0
                        };
                        g = r.charMap;
                        for (n in g) {
                            s = g[n];
                            c[s.old] = s["new"]
                        }
                        h = r.maxGlyphID;
                        for (d in a) {
                            if (!(d in c)) {
                                c[d] = h++
                            }
                        }
                        u = I(c);
                        l = Object.keys(u).sort(function(t, e) {
                            return t - e
                        });
                        p = function() {
                            var t, e, r;
                            r = [];
                            for (t = 0,
                            e = l.length; t < e; t++) {
                                o = l[t];
                                r.push(u[o])
                            }
                            return r
                        }();
                        i = this.font.glyf.encode(a, p, c);
                        f = this.font.loca.encode(i.offsets, p);
                        v = {
                            cmap: this.font.cmap.raw(),
                            glyf: i.table,
                            loca: f,
                            hmtx: this.font.hmtx.raw(),
                            hhea: this.font.hhea.raw(),
                            maxp: this.font.maxp.raw(),
                            post: this.font.post.raw(),
                            name: this.font.name.raw(),
                            head: this.font.head.encode(e)
                        };
                        if (this.font.os2.exists) {
                            v["OS/2"] = this.font.os2.raw()
                        }
                        return this.font.directory.encode(v)
                    }
                    ;
                    return t
                }();
                t.API.PDFObject = function() {
                    var t;
                    function e() {}
                    t = function t(e, r) {
                        return (Array(r + 1).join("0") + e).slice(-r)
                    }
                    ;
                    e.convert = function(r) {
                        var n, i, a, o, s;
                        if (Array.isArray(r)) {
                            i = function() {
                                var t, i, a;
                                a = [];
                                for (t = 0,
                                i = r.length; t < i; t++) {
                                    n = r[t];
                                    a.push(e.convert(n))
                                }
                                return a
                            }().join(" ");
                            return "[" + i + "]"
                        } else if (typeof r === "string") {
                            return "/" + r
                        } else if (r != null ? r.isString : void 0) {
                            return "(" + r + ")"
                        } else if (r instanceof Date) {
                            return "(D:" + t(r.getUTCFullYear(), 4) + t(r.getUTCMonth(), 2) + t(r.getUTCDate(), 2) + t(r.getUTCHours(), 2) + t(r.getUTCMinutes(), 2) + t(r.getUTCSeconds(), 2) + "Z)"
                        } else if ({}.toString.call(r) === "[object Object]") {
                            o = ["<<"];
                            for (a in r) {
                                s = r[a];
                                o.push("/" + a + " " + e.convert(s))
                            }
                            o.push(">>");
                            return o.join("\n")
                        } else {
                            return "" + r
                        }
                    }
                    ;
                    return e
                }()
            }
            )(e);
            /*
    # PNG.js
    # Copyright (c) 2011 Devon Govett
    # MIT LICENSE
    # 
    # 
    */
            (function(t) {
                var e;
                e = function() {
                    var e, r, n, i, a, o;
                    s.load = function(t, e, r) {
                        var n;
                        if (typeof e === "function") {
                            r = e
                        }
                        n = new XMLHttpRequest;
                        n.open("GET", t, true);
                        n.responseType = "arraybuffer";
                        n.onload = function() {
                            var t, i;
                            t = new Uint8Array(n.response || n.mozResponseArrayBuffer);
                            i = new s(t);
                            if (typeof (e != null ? e.getContext : void 0) === "function") {
                                i.render(e)
                            }
                            return typeof r === "function" ? r(i) : void 0
                        }
                        ;
                        return n.send(null)
                    }
                    ;
                    r = 1;
                    n = 2;
                    e = 0;
                    function s(t) {
                        var e, r, n, i, a, o, s, f, u, l, h, c, d, p, v;
                        this.data = t;
                        this.pos = 8;
                        this.palette = [];
                        this.imgData = [];
                        this.transparency = {};
                        this.animation = null;
                        this.text = {};
                        o = null;
                        while (true) {
                            e = this.readUInt32();
                            l = function() {
                                var t, e;
                                e = [];
                                for (s = t = 0; t < 4; s = ++t) {
                                    e.push(String.fromCharCode(this.data[this.pos++]))
                                }
                                return e
                            }
                            .call(this).join("");
                            switch (l) {
                            case "IHDR":
                                this.width = this.readUInt32();
                                this.height = this.readUInt32();
                                this.bits = this.data[this.pos++];
                                this.colorType = this.data[this.pos++];
                                this.compressionMethod = this.data[this.pos++];
                                this.filterMethod = this.data[this.pos++];
                                this.interlaceMethod = this.data[this.pos++];
                                break;
                            case "acTL":
                                this.animation = {
                                    numFrames: this.readUInt32(),
                                    numPlays: this.readUInt32() || Infinity,
                                    frames: []
                                };
                                break;
                            case "PLTE":
                                this.palette = this.read(e);
                                break;
                            case "fcTL":
                                if (o) {
                                    this.animation.frames.push(o)
                                }
                                this.pos += 4;
                                o = {
                                    width: this.readUInt32(),
                                    height: this.readUInt32(),
                                    xOffset: this.readUInt32(),
                                    yOffset: this.readUInt32()
                                };
                                a = this.readUInt16();
                                i = this.readUInt16() || 100;
                                o.delay = 1e3 * a / i;
                                o.disposeOp = this.data[this.pos++];
                                o.blendOp = this.data[this.pos++];
                                o.data = [];
                                break;
                            case "IDAT":
                            case "fdAT":
                                if (l === "fdAT") {
                                    this.pos += 4;
                                    e -= 4
                                }
                                t = (o != null ? o.data : void 0) || this.imgData;
                                for (s = d = 0; 0 <= e ? d < e : d > e; s = 0 <= e ? ++d : --d) {
                                    t.push(this.data[this.pos++])
                                }
                                break;
                            case "tRNS":
                                this.transparency = {};
                                switch (this.colorType) {
                                case 3:
                                    n = this.palette.length / 3;
                                    this.transparency.indexed = this.read(e);
                                    if (this.transparency.indexed.length > n)
                                        throw new Error("More transparent colors than palette size");
                                    h = n - this.transparency.indexed.length;
                                    if (h > 0) {
                                        for (s = p = 0; 0 <= h ? p < h : p > h; s = 0 <= h ? ++p : --p) {
                                            this.transparency.indexed.push(255)
                                        }
                                    }
                                    break;
                                case 0:
                                    this.transparency.grayscale = this.read(e)[0];
                                    break;
                                case 2:
                                    this.transparency.rgb = this.read(e)
                                }
                                break;
                            case "tEXt":
                                c = this.read(e);
                                f = c.indexOf(0);
                                u = String.fromCharCode.apply(String, c.slice(0, f));
                                this.text[u] = String.fromCharCode.apply(String, c.slice(f + 1));
                                break;
                            case "IEND":
                                if (o) {
                                    this.animation.frames.push(o)
                                }
                                this.colors = function() {
                                    switch (this.colorType) {
                                    case 0:
                                    case 3:
                                    case 4:
                                        return 1;
                                    case 2:
                                    case 6:
                                        return 3
                                    }
                                }
                                .call(this);
                                this.hasAlphaChannel = (v = this.colorType) === 4 || v === 6;
                                r = this.colors + (this.hasAlphaChannel ? 1 : 0);
                                this.pixelBitlength = this.bits * r;
                                this.colorSpace = function() {
                                    switch (this.colors) {
                                    case 1:
                                        return "DeviceGray";
                                    case 3:
                                        return "DeviceRGB"
                                    }
                                }
                                .call(this);
                                this.imgData = new Uint8Array(this.imgData);
                                return;
                            default:
                                this.pos += e
                            }
                            this.pos += 4;
                            if (this.pos > this.data.length) {
                                throw new Error("Incomplete or corrupt PNG file")
                            }
                        }
                        return
                    }
                    s.prototype.read = function(t) {
                        var e, r, n;
                        n = [];
                        for (e = r = 0; 0 <= t ? r < t : r > t; e = 0 <= t ? ++r : --r) {
                            n.push(this.data[this.pos++])
                        }
                        return n
                    }
                    ;
                    s.prototype.readUInt32 = function() {
                        var t, e, r, n;
                        t = this.data[this.pos++] << 24;
                        e = this.data[this.pos++] << 16;
                        r = this.data[this.pos++] << 8;
                        n = this.data[this.pos++];
                        return t | e | r | n
                    }
                    ;
                    s.prototype.readUInt16 = function() {
                        var t, e;
                        t = this.data[this.pos++] << 8;
                        e = this.data[this.pos++];
                        return t | e
                    }
                    ;
                    s.prototype.decodePixels = function(t) {
                        var e = this.pixelBitlength / 8;
                        var r = new Uint8Array(this.width * this.height * e);
                        var n = 0;
                        var i = this;
                        if (t == null) {
                            t = this.imgData
                        }
                        if (t.length === 0) {
                            return new Uint8Array(0)
                        }
                        t = new l(t);
                        t = t.getBytes();
                        function a(a, o, s, f) {
                            var u, l, h, c, d, p, v, g, m, y, w, b, x, N, L, A, S, _, F, k, P;
                            var I = Math.ceil((i.width - a) / s)
                              , C = Math.ceil((i.height - o) / f);
                            var B = i.width == I && i.height == C;
                            N = e * I;
                            b = B ? r : new Uint8Array(N * C);
                            p = t.length;
                            x = 0;
                            l = 0;
                            while (x < C && n < p) {
                                switch (t[n++]) {
                                case 0:
                                    for (c = S = 0; S < N; c = S += 1) {
                                        b[l++] = t[n++]
                                    }
                                    break;
                                case 1:
                                    for (c = _ = 0; _ < N; c = _ += 1) {
                                        u = t[n++];
                                        d = c < e ? 0 : b[l - e];
                                        b[l++] = (u + d) % 256
                                    }
                                    break;
                                case 2:
                                    for (c = F = 0; F < N; c = F += 1) {
                                        u = t[n++];
                                        h = (c - c % e) / e;
                                        L = x && b[(x - 1) * N + h * e + c % e];
                                        b[l++] = (L + u) % 256
                                    }
                                    break;
                                case 3:
                                    for (c = k = 0; k < N; c = k += 1) {
                                        u = t[n++];
                                        h = (c - c % e) / e;
                                        d = c < e ? 0 : b[l - e];
                                        L = x && b[(x - 1) * N + h * e + c % e];
                                        b[l++] = (u + Math.floor((d + L) / 2)) % 256
                                    }
                                    break;
                                case 4:
                                    for (c = P = 0; P < N; c = P += 1) {
                                        u = t[n++];
                                        h = (c - c % e) / e;
                                        d = c < e ? 0 : b[l - e];
                                        if (x === 0) {
                                            L = A = 0
                                        } else {
                                            L = b[(x - 1) * N + h * e + c % e];
                                            A = h && b[(x - 1) * N + (h - 1) * e + c % e]
                                        }
                                        v = d + L - A;
                                        g = Math.abs(v - d);
                                        y = Math.abs(v - L);
                                        w = Math.abs(v - A);
                                        if (g <= y && g <= w) {
                                            m = d
                                        } else if (y <= w) {
                                            m = L
                                        } else {
                                            m = A
                                        }
                                        b[l++] = (u + m) % 256
                                    }
                                    break;
                                default:
                                    throw new Error("Invalid filter algorithm: " + t[n - 1])
                                }
                                if (!B) {
                                    var j = ((o + x * f) * i.width + a) * e;
                                    var E = x * N;
                                    for (c = 0; c < I; c += 1) {
                                        for (var M = 0; M < e; M += 1) {
                                            r[j++] = b[E++]
                                        }
                                        j += (s - 1) * e
                                    }
                                }
                                x++
                            }
                        }
                        if (i.interlaceMethod == 1) {
                            a(0, 0, 8, 8);
                            a(4, 0, 8, 8);
                            a(0, 4, 4, 8);
                            a(2, 0, 4, 4);
                            a(0, 2, 2, 4);
                            a(1, 0, 2, 2);
                            a(0, 1, 1, 2)
                        } else {
                            a(0, 0, 1, 1)
                        }
                        return r
                    }
                    ;
                    s.prototype.decodePalette = function() {
                        var t, e, r, n, i, a, o, s, f, u;
                        n = this.palette;
                        o = this.transparency.indexed || [];
                        a = new Uint8Array((o.length || 0) + n.length);
                        i = 0;
                        r = n.length;
                        t = 0;
                        for (e = s = 0,
                        f = n.length; s < f; e = s += 3) {
                            a[i++] = n[e];
                            a[i++] = n[e + 1];
                            a[i++] = n[e + 2];
                            a[i++] = (u = o[t++]) != null ? u : 255
                        }
                        return a
                    }
                    ;
                    s.prototype.copyToImageData = function(t, e) {
                        var r, n, i, a, o, s, f, u, l, h, c;
                        n = this.colors;
                        l = null;
                        r = this.hasAlphaChannel;
                        if (this.palette.length) {
                            l = (c = this._decodedPalette) != null ? c : this._decodedPalette = this.decodePalette();
                            n = 4;
                            r = true
                        }
                        i = t.data || t;
                        u = i.length;
                        o = l || e;
                        a = s = 0;
                        if (n === 1) {
                            while (a < u) {
                                f = l ? e[a / 4] * 4 : s;
                                h = o[f++];
                                i[a++] = h;
                                i[a++] = h;
                                i[a++] = h;
                                i[a++] = r ? o[f++] : 255;
                                s = f
                            }
                        } else {
                            while (a < u) {
                                f = l ? e[a / 4] * 4 : s;
                                i[a++] = o[f++];
                                i[a++] = o[f++];
                                i[a++] = o[f++];
                                i[a++] = r ? o[f++] : 255;
                                s = f
                            }
                        }
                    }
                    ;
                    s.prototype.decode = function() {
                        var t;
                        t = new Uint8Array(this.width * this.height * 4);
                        this.copyToImageData(t, this.decodePixels());
                        return t
                    }
                    ;
                    try {
                        a = t.document.createElement("canvas");
                        o = a.getContext("2d")
                    } catch (t) {
                        return -1
                    }
                    i = function t(e) {
                        var r;
                        o.width = e.width;
                        o.height = e.height;
                        o.clearRect(0, 0, e.width, e.height);
                        o.putImageData(e, 0, 0);
                        r = new Image;
                        r.src = a.toDataURL();
                        return r
                    }
                    ;
                    s.prototype.decodeFrames = function(t) {
                        var e, r, n, a, o, s, f, u;
                        if (!this.animation) {
                            return
                        }
                        f = this.animation.frames;
                        u = [];
                        for (r = o = 0,
                        s = f.length; o < s; r = ++o) {
                            e = f[r];
                            n = t.createImageData(e.width, e.height);
                            a = this.decodePixels(new Uint8Array(e.data));
                            this.copyToImageData(n, a);
                            e.imageData = n;
                            u.push(e.image = i(n))
                        }
                        return u
                    }
                    ;
                    s.prototype.renderFrame = function(t, i) {
                        var a, o, s;
                        o = this.animation.frames;
                        a = o[i];
                        s = o[i - 1];
                        if (i === 0) {
                            t.clearRect(0, 0, this.width, this.height)
                        }
                        if ((s != null ? s.disposeOp : void 0) === r) {
                            t.clearRect(s.xOffset, s.yOffset, s.width, s.height)
                        } else if ((s != null ? s.disposeOp : void 0) === n) {
                            t.putImageData(s.imageData, s.xOffset, s.yOffset)
                        }
                        if (a.blendOp === e) {
                            t.clearRect(a.xOffset, a.yOffset, a.width, a.height)
                        }
                        return t.drawImage(a.image, a.xOffset, a.yOffset)
                    }
                    ;
                    s.prototype.animate = function(t) {
                        var e, r, n, i, a, o, s = this;
                        r = 0;
                        o = this.animation,
                        i = o.numFrames,
                        n = o.frames,
                        a = o.numPlays;
                        return (e = function o() {
                            var f, u;
                            f = r++ % i;
                            u = n[f];
                            s.renderFrame(t, f);
                            if (i > 1 && r / i < a) {
                                return s.animation._timeout = setTimeout(e, u.delay)
                            }
                        }
                        )()
                    }
                    ;
                    s.prototype.stopAnimation = function() {
                        var t;
                        return clearTimeout((t = this.animation) != null ? t._timeout : void 0)
                    }
                    ;
                    s.prototype.render = function(t) {
                        var e, r;
                        if (t._png) {
                            t._png.stopAnimation()
                        }
                        t._png = this;
                        t.width = this.width;
                        t.height = this.height;
                        e = t.getContext("2d");
                        if (this.animation) {
                            this.decodeFrames(e);
                            return this.animate(e)
                        } else {
                            r = e.createImageData(this.width, this.height);
                            this.copyToImageData(r, this.decodePixels());
                            return e.putImageData(r, 0, 0)
                        }
                    }
                    ;
                    return s
                }();
                t.PNG = e
            }
            )(typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || Function('return typeof this === "object" && this.content')() || Function("return this")());
            /*
     * Extracted from pdf.js
     * https://github.com/andreasgal/pdf.js
     *
     * Copyright (c) 2011 Mozilla Foundation
     *
     * Contributors: Andreas Gal <gal@mozilla.com>
     *               Chris G Jones <cjones@mozilla.com>
     *               Shaon Barman <shaon.barman@gmail.com>
     *               Vivien Nicolas <21@vingtetun.org>
     *               Justin D'Arcangelo <justindarc@gmail.com>
     *               Yury Delendik
     *
     * 
     */
            var u = function() {
                function t() {
                    this.pos = 0;
                    this.bufferLength = 0;
                    this.eof = false;
                    this.buffer = null
                }
                t.prototype = {
                    ensureBuffer: function t(e) {
                        var r = this.buffer;
                        var n = r ? r.byteLength : 0;
                        if (e < n)
                            return r;
                        var i = 512;
                        while (i < e) {
                            i <<= 1
                        }
                        var a = new Uint8Array(i);
                        for (var o = 0; o < n; ++o) {
                            a[o] = r[o]
                        }
                        return this.buffer = a
                    },
                    getByte: function t() {
                        var e = this.pos;
                        while (this.bufferLength <= e) {
                            if (this.eof)
                                return null;
                            this.readBlock()
                        }
                        return this.buffer[this.pos++]
                    },
                    getBytes: function t(e) {
                        var r = this.pos;
                        if (e) {
                            this.ensureBuffer(r + e);
                            var n = r + e;
                            while (!this.eof && this.bufferLength < n) {
                                this.readBlock()
                            }
                            var i = this.bufferLength;
                            if (n > i)
                                n = i
                        } else {
                            while (!this.eof) {
                                this.readBlock()
                            }
                            var n = this.bufferLength
                        }
                        this.pos = n;
                        return this.buffer.subarray(r, n)
                    },
                    lookChar: function t() {
                        var e = this.pos;
                        while (this.bufferLength <= e) {
                            if (this.eof)
                                return null;
                            this.readBlock()
                        }
                        return String.fromCharCode(this.buffer[this.pos])
                    },
                    getChar: function t() {
                        var e = this.pos;
                        while (this.bufferLength <= e) {
                            if (this.eof)
                                return null;
                            this.readBlock()
                        }
                        return String.fromCharCode(this.buffer[this.pos++])
                    },
                    makeSubStream: function t(e, r, n) {
                        var i = e + r;
                        while (this.bufferLength <= i && !this.eof) {
                            this.readBlock()
                        }
                        return new Stream(this.buffer,e,r,n)
                    },
                    skip: function t(e) {
                        if (!e)
                            e = 1;
                        this.pos += e
                    },
                    reset: function t() {
                        this.pos = 0
                    }
                };
                return t
            }();
            var l = function() {
                if (typeof Uint32Array === "undefined") {
                    return undefined
                }
                var t = new Uint32Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
                var e = new Uint32Array([3, 4, 5, 6, 7, 8, 9, 10, 65547, 65549, 65551, 65553, 131091, 131095, 131099, 131103, 196643, 196651, 196659, 196667, 262211, 262227, 262243, 262259, 327811, 327843, 327875, 327907, 258, 258, 258]);
                var r = new Uint32Array([1, 2, 3, 4, 65541, 65543, 131081, 131085, 196625, 196633, 262177, 262193, 327745, 327777, 393345, 393409, 459009, 459137, 524801, 525057, 590849, 591361, 657409, 658433, 724993, 727041, 794625, 798721, 868353, 876545]);
                var n = [new Uint32Array([459008, 524368, 524304, 524568, 459024, 524400, 524336, 590016, 459016, 524384, 524320, 589984, 524288, 524416, 524352, 590048, 459012, 524376, 524312, 589968, 459028, 524408, 524344, 590032, 459020, 524392, 524328, 59e4, 524296, 524424, 524360, 590064, 459010, 524372, 524308, 524572, 459026, 524404, 524340, 590024, 459018, 524388, 524324, 589992, 524292, 524420, 524356, 590056, 459014, 524380, 524316, 589976, 459030, 524412, 524348, 590040, 459022, 524396, 524332, 590008, 524300, 524428, 524364, 590072, 459009, 524370, 524306, 524570, 459025, 524402, 524338, 590020, 459017, 524386, 524322, 589988, 524290, 524418, 524354, 590052, 459013, 524378, 524314, 589972, 459029, 524410, 524346, 590036, 459021, 524394, 524330, 590004, 524298, 524426, 524362, 590068, 459011, 524374, 524310, 524574, 459027, 524406, 524342, 590028, 459019, 524390, 524326, 589996, 524294, 524422, 524358, 590060, 459015, 524382, 524318, 589980, 459031, 524414, 524350, 590044, 459023, 524398, 524334, 590012, 524302, 524430, 524366, 590076, 459008, 524369, 524305, 524569, 459024, 524401, 524337, 590018, 459016, 524385, 524321, 589986, 524289, 524417, 524353, 590050, 459012, 524377, 524313, 589970, 459028, 524409, 524345, 590034, 459020, 524393, 524329, 590002, 524297, 524425, 524361, 590066, 459010, 524373, 524309, 524573, 459026, 524405, 524341, 590026, 459018, 524389, 524325, 589994, 524293, 524421, 524357, 590058, 459014, 524381, 524317, 589978, 459030, 524413, 524349, 590042, 459022, 524397, 524333, 590010, 524301, 524429, 524365, 590074, 459009, 524371, 524307, 524571, 459025, 524403, 524339, 590022, 459017, 524387, 524323, 589990, 524291, 524419, 524355, 590054, 459013, 524379, 524315, 589974, 459029, 524411, 524347, 590038, 459021, 524395, 524331, 590006, 524299, 524427, 524363, 590070, 459011, 524375, 524311, 524575, 459027, 524407, 524343, 590030, 459019, 524391, 524327, 589998, 524295, 524423, 524359, 590062, 459015, 524383, 524319, 589982, 459031, 524415, 524351, 590046, 459023, 524399, 524335, 590014, 524303, 524431, 524367, 590078, 459008, 524368, 524304, 524568, 459024, 524400, 524336, 590017, 459016, 524384, 524320, 589985, 524288, 524416, 524352, 590049, 459012, 524376, 524312, 589969, 459028, 524408, 524344, 590033, 459020, 524392, 524328, 590001, 524296, 524424, 524360, 590065, 459010, 524372, 524308, 524572, 459026, 524404, 524340, 590025, 459018, 524388, 524324, 589993, 524292, 524420, 524356, 590057, 459014, 524380, 524316, 589977, 459030, 524412, 524348, 590041, 459022, 524396, 524332, 590009, 524300, 524428, 524364, 590073, 459009, 524370, 524306, 524570, 459025, 524402, 524338, 590021, 459017, 524386, 524322, 589989, 524290, 524418, 524354, 590053, 459013, 524378, 524314, 589973, 459029, 524410, 524346, 590037, 459021, 524394, 524330, 590005, 524298, 524426, 524362, 590069, 459011, 524374, 524310, 524574, 459027, 524406, 524342, 590029, 459019, 524390, 524326, 589997, 524294, 524422, 524358, 590061, 459015, 524382, 524318, 589981, 459031, 524414, 524350, 590045, 459023, 524398, 524334, 590013, 524302, 524430, 524366, 590077, 459008, 524369, 524305, 524569, 459024, 524401, 524337, 590019, 459016, 524385, 524321, 589987, 524289, 524417, 524353, 590051, 459012, 524377, 524313, 589971, 459028, 524409, 524345, 590035, 459020, 524393, 524329, 590003, 524297, 524425, 524361, 590067, 459010, 524373, 524309, 524573, 459026, 524405, 524341, 590027, 459018, 524389, 524325, 589995, 524293, 524421, 524357, 590059, 459014, 524381, 524317, 589979, 459030, 524413, 524349, 590043, 459022, 524397, 524333, 590011, 524301, 524429, 524365, 590075, 459009, 524371, 524307, 524571, 459025, 524403, 524339, 590023, 459017, 524387, 524323, 589991, 524291, 524419, 524355, 590055, 459013, 524379, 524315, 589975, 459029, 524411, 524347, 590039, 459021, 524395, 524331, 590007, 524299, 524427, 524363, 590071, 459011, 524375, 524311, 524575, 459027, 524407, 524343, 590031, 459019, 524391, 524327, 589999, 524295, 524423, 524359, 590063, 459015, 524383, 524319, 589983, 459031, 524415, 524351, 590047, 459023, 524399, 524335, 590015, 524303, 524431, 524367, 590079]), 9];
                var i = [new Uint32Array([327680, 327696, 327688, 327704, 327684, 327700, 327692, 327708, 327682, 327698, 327690, 327706, 327686, 327702, 327694, 0, 327681, 327697, 327689, 327705, 327685, 327701, 327693, 327709, 327683, 327699, 327691, 327707, 327687, 327703, 327695, 0]), 5];
                function a(t) {
                    throw new Error(t)
                }
                function o(t) {
                    var e = 0;
                    var r = t[e++];
                    var n = t[e++];
                    if (r == -1 || n == -1)
                        a("Invalid header in flate stream");
                    if ((r & 15) != 8)
                        a("Unknown compression method in flate stream");
                    if (((r << 8) + n) % 31 != 0)
                        a("Bad FCHECK in flate stream");
                    if (n & 32)
                        a("FDICT bit set in flate stream");
                    this.bytes = t;
                    this.bytesPos = e;
                    this.codeSize = 0;
                    this.codeBuf = 0;
                    u.call(this)
                }
                o.prototype = Object.create(u.prototype);
                o.prototype.getBits = function(t) {
                    var e = this.codeSize;
                    var r = this.codeBuf;
                    var n = this.bytes;
                    var i = this.bytesPos;
                    var o;
                    while (e < t) {
                        if (typeof (o = n[i++]) == "undefined")
                            a("Bad encoding in flate stream");
                        r |= o << e;
                        e += 8
                    }
                    o = r & (1 << t) - 1;
                    this.codeBuf = r >> t;
                    this.codeSize = e -= t;
                    this.bytesPos = i;
                    return o
                }
                ;
                o.prototype.getCode = function(t) {
                    var e = t[0];
                    var r = t[1];
                    var n = this.codeSize;
                    var i = this.codeBuf;
                    var o = this.bytes;
                    var s = this.bytesPos;
                    while (n < r) {
                        var f;
                        if (typeof (f = o[s++]) == "undefined")
                            a("Bad encoding in flate stream");
                        i |= f << n;
                        n += 8
                    }
                    var u = e[i & (1 << r) - 1];
                    var l = u >> 16;
                    var h = u & 65535;
                    if (n == 0 || n < l || l == 0)
                        a("Bad encoding in flate stream");
                    this.codeBuf = i >> l;
                    this.codeSize = n - l;
                    this.bytesPos = s;
                    return h
                }
                ;
                o.prototype.generateHuffmanTable = function(t) {
                    var e = t.length;
                    var r = 0;
                    for (var n = 0; n < e; ++n) {
                        if (t[n] > r)
                            r = t[n]
                    }
                    var i = 1 << r;
                    var a = new Uint32Array(i);
                    for (var o = 1, s = 0, f = 2; o <= r; ++o,
                    s <<= 1,
                    f <<= 1) {
                        for (var u = 0; u < e; ++u) {
                            if (t[u] == o) {
                                var l = 0;
                                var h = s;
                                for (var n = 0; n < o; ++n) {
                                    l = l << 1 | h & 1;
                                    h >>= 1
                                }
                                for (var n = l; n < i; n += f) {
                                    a[n] = o << 16 | u
                                }
                                ++s
                            }
                        }
                    }
                    return [a, r]
                }
                ;
                o.prototype.readBlock = function() {
                    function o(t, e, r, n, i) {
                        var a = t.getBits(r) + n;
                        while (a-- > 0) {
                            e[L++] = i
                        }
                    }
                    var s = this.getBits(3);
                    if (s & 1)
                        this.eof = true;
                    s >>= 1;
                    if (s == 0) {
                        var f = this.bytes;
                        var u = this.bytesPos;
                        var l;
                        if (typeof (l = f[u++]) == "undefined")
                            a("Bad block header in flate stream");
                        var h = l;
                        if (typeof (l = f[u++]) == "undefined")
                            a("Bad block header in flate stream");
                        h |= l << 8;
                        if (typeof (l = f[u++]) == "undefined")
                            a("Bad block header in flate stream");
                        var c = l;
                        if (typeof (l = f[u++]) == "undefined")
                            a("Bad block header in flate stream");
                        c |= l << 8;
                        if (c != (~h & 65535))
                            a("Bad uncompressed block length in flate stream");
                        this.codeBuf = 0;
                        this.codeSize = 0;
                        var d = this.bufferLength;
                        var p = this.ensureBuffer(d + h);
                        var v = d + h;
                        this.bufferLength = v;
                        for (var g = d; g < v; ++g) {
                            if (typeof (l = f[u++]) == "undefined") {
                                this.eof = true;
                                break
                            }
                            p[g] = l
                        }
                        this.bytesPos = u;
                        return
                    }
                    var m;
                    var y;
                    if (s == 1) {
                        m = n;
                        y = i
                    } else if (s == 2) {
                        var w = this.getBits(5) + 257;
                        var b = this.getBits(5) + 1;
                        var x = this.getBits(4) + 4;
                        var N = Array(t.length);
                        var L = 0;
                        while (L < x) {
                            N[t[L++]] = this.getBits(3)
                        }
                        var A = this.generateHuffmanTable(N);
                        var S = 0;
                        var L = 0;
                        var _ = w + b;
                        var F = new Array(_);
                        while (L < _) {
                            var k = this.getCode(A);
                            if (k == 16) {
                                o(this, F, 2, 3, S)
                            } else if (k == 17) {
                                o(this, F, 3, 3, S = 0)
                            } else if (k == 18) {
                                o(this, F, 7, 11, S = 0)
                            } else {
                                F[L++] = S = k
                            }
                        }
                        m = this.generateHuffmanTable(F.slice(0, w));
                        y = this.generateHuffmanTable(F.slice(w, _))
                    } else {
                        a("Unknown block type in flate stream")
                    }
                    var p = this.buffer;
                    var P = p ? p.length : 0;
                    var I = this.bufferLength;
                    while (true) {
                        var C = this.getCode(m);
                        if (C < 256) {
                            if (I + 1 >= P) {
                                p = this.ensureBuffer(I + 1);
                                P = p.length
                            }
                            p[I++] = C;
                            continue
                        }
                        if (C == 256) {
                            this.bufferLength = I;
                            return
                        }
                        C -= 257;
                        C = e[C];
                        var B = C >> 16;
                        if (B > 0)
                            B = this.getBits(B);
                        var S = (C & 65535) + B;
                        C = this.getCode(y);
                        C = r[C];
                        B = C >> 16;
                        if (B > 0)
                            B = this.getBits(B);
                        var j = (C & 65535) + B;
                        if (I + S >= P) {
                            p = this.ensureBuffer(I + S);
                            P = p.length
                        }
                        for (var E = 0; E < S; ++E,
                        ++I) {
                            p[I] = p[I - j]
                        }
                    }
                }
                ;
                return o
            }();
            window.tmp = l
        });
        try {
            module.exports = jsPDF
        } catch (t) {}
    },
    "delmex/zmmbascula/manifest.json": '{"_version":"1.65.0","sap.app":{"id":"delmex.zmmbascula","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"0.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","sourceTemplate":{"id":"@sap/generator-fiori:basic","version":"1.16.5","toolsId":"9484c494-8d24-4596-86f5-2d1f2ee123a4"},"dataSources":{"ZBASC_SRV":{"uri":"sap/opu/odata/sap/ZUI_BASCULA_SRV_V2/","type":"OData","settings":{"annotations":[],"localUri":"localService/mainService/metadata.xml","odataVersion":"2.0"}}},"crossNavigation":{"inbounds":{"bascula-display":{"semanticObject":"bascula","action":"display","title":"Báscula Delmex","subTitle":"Gestión de tickets","icon":"sap-icon://shipping-status","signature":{"parameters":{},"additionalParameters":"allowed"}}}},"navigationMode":"newWindow"},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":true,"dependencies":{"minUI5Version":"1.133.0","libs":{"sap.m":{},"sap.ui.core":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"delmex.zmmbascula.i18n.i18n"}},"zbasc":{"dataSource":"ZBASC_SRV","preload":true,"settings":{"useBatch":false}}},"resources":{"css":[{"uri":"css/style.css"}],"js":[{"uri":"lib/jspdf.js"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","controlAggregation":"pages","controlId":"app","transition":"slide","type":"View","viewType":"XML","path":"delmex.zmmbascula.view","async":true,"viewPath":"delmex.zmmbascula.view"},"routes":[{"name":"RouteMain","pattern":":?query:","target":["TargetMain"]},{"name":"RouteDetail","pattern":"header/{folio}","target":["TargetDetail"]}],"targets":{"TargetMain":{"id":"Main","name":"Main"},"TargetDetail":{"id":"Detail","name":"Detail"}}},"rootView":{"viewName":"delmex.zmmbascula.view.App","type":"XML","id":"App"}},"sap.cloud":{"public":true,"service":"delmexbasculazmmbascula"}}',
    "delmex/zmmbascula/model/models.js": function() {
        sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function(e, n) {
            "use strict";
            return {
                createDeviceModel: function() {
                    var i = new e(n);
                    i.setDefaultBindingMode("OneWay");
                    return i
                }
            }
        });
    },
    "delmex/zmmbascula/util/formatter.js": function() {
        sap.ui.define(["sap/ui/core/format/DateFormat", "sap/ui/model/resource/ResourceModel"], function(e, t) {
            "use strict";
            function r(e) {
                if (!e || typeof e !== "string")
                    return e;
                return e.toLowerCase().replace(/(^|\s)\S/g, e => e.toUpperCase())
            }
            function n() {
                const e = sap.ui.getCore().getModel("i18n")?.getResourceBundle();
                return e?.getText("formatter.noData") || ""
            }
            return {
                formatDate: function(t) {
                    if (!t || t.length < 15) {
                        return n()
                    }
                    var r = t.substring(0, 4);
                    var o = t.substring(4, 6);
                    var u = t.substring(6, 8);
                    var s = t.substring(9, 11);
                    var i = t.substring(11, 13);
                    var a = t.substring(13, 15);
                    var c = new Date(Number(r),Number(o) - 1,Number(u),Number(s),Number(i),Number(a));
                    var g = e.getDateTimeInstance({
                        pattern: "dd/MM/yyyy HH:mm:ss"
                    });
                    return g.format(c)
                },
                getProcesoDescripcion: function(e) {
                    const t = sap.ui.getCore().getModel("catalogsModel").getProperty("/Proceso") || {};
                    const o = t[e];
                    return o ? r(o) : n()
                },
                getTipoTicketDescripcion: function(e) {
                    const t = sap.ui.getCore().getModel("catalogsModel").getProperty("/TipoTicket") || {};
                    const o = t[e];
                    return o ? r(o) : n()
                },
                trimValue: function(e) {
                    return e ? e.trim() : ""
                },
                formatNumberWithCommas: function(e) {
                    if (e === null || e === undefined || isNaN(e)) {
                        return "0.00"
                    }
                    const t = e.toString().split(".");
                    t[0] = t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    return t.join(".")
                }
            }
        });
    },
    "delmex/zmmbascula/view/App.view.xml": '<mvc:View controllerName="delmex.zmmbascula.controller.App"\n    displayBlock="true"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"><App id="app"></App></mvc:View>',
    "delmex/zmmbascula/view/Detail.view.xml": '<mvc:View\n    controllerName="delmex.zmmbascula.controller.Detail"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"\n    xmlns:tnt="sap.tnt"\n    xmlns:table="sap.ui.table"\n    xmlns:l="sap.ui.layout"\n    xmlns:f="sap.ui.layout.form"\n    xmlns:core="sap.ui.core"\n><tnt:ToolHeader><Button\n            text="{i18n>detailview.regresar}"\n            press="goBackBtn"\n        /><ToolbarSpacer /><Title\n            titleStyle="H4"\n            text="{i18n>title}"\n            class="sapUiSmallMargin"\n            id="titleText"\n        /><ToolbarSpacer /></tnt:ToolHeader><VBox class="sapUiSmallMargin"><f:Form\n            id="FormDisplay480_Trial"\n            editable="false"\n        ><f:title><core:Title\n                    text="{i18n>detailView.form_title} {basculaDetails>/Folio}"\n                /></f:title><f:layout><f:ResponsiveGridLayout\n                    labelSpanXL="4"\n                    labelSpanL="4"\n                    labelSpanM="4"\n                    labelSpanS="12"\n                    adjustLabelSpan="false"\n                    emptySpanXL="0"\n                    emptySpanL="0"\n                    emptySpanM="0"\n                    emptySpanS="0"\n                    columnsXL="3"\n                    columnsL="2"\n                    columnsM="2"\n                    singleContainerFullSize="false"\n                /></f:layout><f:formContainers><f:FormContainer title=""><f:formElements><f:FormElement label="{i18n>detailView.tipo_ticket}"><f:fields><Text\n                                    text="{\n                                    parts: [\'basculaDetails>/Tipoticket\'],\n                                    formatter: \'.formatter.getTipoTicketDescripcion\'\n                                }"\n                                    id="txt_Tipoticket"\n                                /></f:fields></f:FormElement><f:FormElement\n                            label="{i18n>detailView.bascula_entrada}"\n                        ><f:fields><Text\n                                    text="{basculaDetails>/BasculaEnt}"\n                                    id="txt_BasculaEnt"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.centro_entrada}"><f:fields><Text\n                                    text="{basculaDetails>/CentroEnt}"\n                                    id="txt_CentroEnt"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.bascula_salida}"><f:fields><Text\n                                    text="{basculaDetails>/BasculaSal}"\n                                    id="txt_BasculaSal"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.centro_salida}"><f:fields><Text\n                                    text="{basculaDetails>/CentroSal}"\n                                    id="txt_CentroSal"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.material}"><f:fields><Text\n                                    text="{basculaDetails>/Material}"\n                                    id="txt_Material"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.fecha_reg_bas}"><f:fields><Text\n                                    text="{ path: \'basculaDetails>/FechaRegBas\', formatter: \'.formatter.formatDate\' }"\n                                    id="txt_FechaRegBas"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.placa}"><f:fields><Text\n                                    text="{basculaDetails>/Placa}"\n                                    id="txt_Placa"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.conductor}"><f:fields><Text\n                                    text="{basculaDetails>/Conductor}"\n                                    id="txt_Conductor"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.fecha_ent_bas}"><f:fields><Text\n                                    text="{ path: \'basculaDetails>/FechaEntBas\', formatter: \'.formatter.formatDate\' }"\n                                    id="txt_FechaEntBas"\n                                /></f:fields></f:FormElement></f:formElements></f:FormContainer><f:FormContainer title=""><f:formElements><f:FormElement label="{i18n>detailView.pesaje}"><f:fields><Text\n                                    text="{path: \'basculaDetails>/Pesaje\', formatter: \'.formatter.formatNumberWithCommas\'}"\n                                    id="txt_Pesaje"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.fecha_sal_bas}"><f:fields><Text\n                                    text="{ path: \'basculaDetails>/FechaSalBas\', formatter: \'.formatter.formatDate\' }"\n                                    id="txt_FechaSalBas"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.pesaje2}"><f:fields><Text\n                                    text="{path: \'basculaDetails>/Pesaje2\', formatter: \'.formatter.formatNumberWithCommas\'}"\n                                    id="txt_Pesaje2"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.peso_neto}"><f:fields><Text\n                                    text="{path: \'basculaDetails>/PesoNeto\', formatter: \'.formatter.formatNumberWithCommas\'}"\n                                    id="txt_PesoNeto"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.peso_teorico}"><f:fields><Text\n                                    text="{path: \'basculaDetails>/PesoTeorico\', formatter: \'.formatter.formatNumberWithCommas\'}"\n                                    id="txt_PesoTeorico"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.diferencia}"><f:fields><Text\n                                    text="{path: \'basculaDetails>/Diferencia\', formatter: \'.formatter.formatNumberWithCommas\'}"\n                                    id="txt_Diferencia"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.valor}"><f:fields><Text\n                                    text="{path: \'basculaDetails>/Valor\', formatter: \'.formatter.formatNumberWithCommas\'}"\n                                    id="txt_Valor"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.reg_incompleto}"><f:fields><Text\n                                    text="{basculaDetails>/RegIncompleto}"\n                                    id="txt_RegIncompleto"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.numero_doc}"><f:fields><Input\n                                    value="{\n                                        path: \'basculaDetails>/NumeroDoc\',\n                                        formatter: \'.formatter.removeSpaces\'\n                                    }"\n                                    editable="{= ${basculaDetails>/RegIncompleto} !== \'X\' }"\n                                    id="txt_NumeroDoc"\n                                    width="50%"\n                                    placeholder="{i18n>detailView.numero_doc.placeholder}"\n                                /></f:fields></f:FormElement><f:FormElement label="{i18n>detailView.mensaje}"><f:fields><Text\n                                    text="{basculaDetails>/Mensaje}"\n                                    id="txt_Mensaje"\n                                /></f:fields></f:FormElement></f:formElements></f:FormContainer></f:formContainers></f:Form></VBox><HBox\n        class="sapUiSmallMarginTop sapUiMediumMarginBeginEnd"\n        justifyContent="End"\n        alignItems="Center"\n    ><Button\n            text="{i18n>detailView.generar_pdf}"\n            press="onShowPDF"\n        /><Button\n            text="{i18n>detailView.actualizar_datos}"\n            press="onUpdateData"\n            class="sapUiSmallMarginBegin"\n        /></HBox></mvc:View>\n',
    "delmex/zmmbascula/view/Main.view.xml": '<mvc:View\n    controllerName="delmex.zmmbascula.controller.Main"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"\n    xmlns:tnt="sap.tnt"\n    xmlns:f="sap.f"\n    xmlns:fb="sap.ui.comp.filterbar"\n    xmlns:core="sap.ui.core"\n    xmlns:svm="sap.ui.comp.smartvariants"\n><f:DynamicPage headerExpanded="{/headerExpanded}"><f:header><f:DynamicPageHeader><f:content><fb:FilterBar\n                        id="filterbar"\n                        persistencyKey="myPersKey"\n                        useToolbar="false"\n                        search=".onSearch"\n                        filterChange=".onFilterChange"\n                        afterVariantLoad=".onAfterVariantLoad"\n                    ><fb:filterGroupItems><fb:FilterGroupItem\n                                name="Folio"\n                                label="Folio"\n                                groupName="Group1"\n                                visibleInFilterBar="true"\n                            ><fb:control><Input\n                                        name="inputFolio"\n                                        placeholder="Buscar Folio"\n                                        value="{requestModel>/Folio}"\n                                    /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                                name="Centro_ent"\n                                label="Centro Ent"\n                                groupName="Group1"\n                                visibleInFilterBar="true"\n                            ><fb:control><Input\n                                        name="inputCentro_ent"\n                                        placeholder="Buscar Centro Ent"\n                                    /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                                name="Ticket"\n                                label="Ticket"\n                                groupName="Group1"\n                                visibleInFilterBar="true"\n                            ><fb:control><Input\n                                        name="inputTipoTicket"\n                                        placeholder="Buscar Ticket"\n                                        value="{requestModel>/tipo_ticket}"\n                                    /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                                name="Centro_sal"\n                                label="Centro Sal"\n                                groupName="Group1"\n                                visibleInFilterBar="true"\n                            ><fb:control><Input\n                                        name="inputCentro_sal"\n                                        placeholder="Buscar Centro Sal"\n                                        value="{requestModel>/centro_sal}"\n                                    /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                                name="Material"\n                                label="Material"\n                                groupName="Group1"\n                                visibleInFilterBar="true"\n                            ><fb:control><Input\n                                        name="inputMaterial"\n                                        placeholder="Buscar Material"\n                                        value="{requestModel>/Material}"\n                                    /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                                name="NumeroDoc"\n                                label="Numero de Documento"\n                                groupName="Group1"\n                                visibleInFilterBar="true"\n                            ><fb:control><Input\n                                        name="inputNumDoc"\n                                        placeholder="Numero de Documento"\n                                        value="{requestModel>/NumeroDoc}"\n                                    /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                                name="Placa"\n                                label="Placa"\n                                groupName="Group1"\n                                visibleInFilterBar="true"\n                            ><fb:control><Input\n                                        name="inputPlaca"\n                                        placeholder="Buscar Placa"\n                                        value="{requestModel>/Placa}"\n                                    /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                                name="FechaEntrada"\n                                label="Fecha entrada báscula"\n                                groupName="Group1"\n                                visibleInFilterBar="true"\n                            ><fb:control><DatePicker\n                                        id="DTPFechaEntradaBas"\n                                        value="{\n                                            \'path\': \'requestModel>/FechaEntBas\',\n                                            \'type\': \'sap.ui.model.type.Date\',\n                                            \'formatOptions\': {\n                                                \'pattern\': \'d/M/yyyy\'\n                                            }\n                                        }"\n                                        secondaryCalendarType="Gregorian"\n                                        change="handleChange"\n                                        class="sapUiSmallMarginBottom"\n                                    /></fb:control></fb:FilterGroupItem><fb:FilterGroupItem\n                                name="FechaSalida"\n                                label="Fecha salida báscula"\n                                groupName="Group1"\n                                visibleInFilterBar="true"\n                            ><fb:control><DatePicker\n                                        id="DTP_FechaSalidaBas"\n                                        value="{\n                                            \'path\':\'requestModel>/FechaSalBas\',\n                                            \'type\':\'sap.ui.model.type.Date\',\n                                            \'formatOptions\': {\n                                                \'pattern\': \'yyyy-MM-dd\'\n                                            }\n                                        }"\n                                        change="handleChange"\n\t\t\t\t\t                    class="sapUiSmallMarginBottom"\n                                    /></fb:control></fb:FilterGroupItem></fb:filterGroupItems></fb:FilterBar></f:content></f:DynamicPageHeader></f:header><f:content><Table\n                id="productsTable"\n                items="{detailsModel>/}"\n                headerText="Resultado"\n                growing="true"\n                growingScrollToLoad="true"\n                width="100%"\n            ><columns><Column><Text text="Folio" /></Column><Column><Text text="Tipo ticket" /></Column><Column><Text text="Centro Ent" /></Column><Column><Text text="Centro Sal" /></Column><Column><Text text="Material" /></Column><Column><Text text="Proceso" /></Column><Column><Text text="Numero Documento" /></Column><Column><Text text="Placa" /></Column><Column><Text text="Fecha Ent Bascula" /></Column><Column><Text text="Fecha Sal Báscula" /></Column></columns><items><ColumnListItem\n                        type="Active"\n                        vAlign="Middle"\n                        press="navToDetail"\n                    ><cells><Text text="{detailsModel>Folio}" /><Text\n                                text="{\n                    parts: [\'detailsModel>Tipoticket\'],\n                    formatter: \'.formatter.getTipoTicketDescripcion\'\n                }"\n                            /><Text text="{detailsModel>CentroEnt}" /><Text text="{detailsModel>CentroSal}" /><Text\n                                text="{\n                    parts: [\'detailsModel>Material\'],\n                    formatter: \'.formatter.emptyValue\'\n                }"\n                            /><Text\n                                text="{\n                    parts: [\'detailsModel>Proceso\'],\n                    formatter: \'.formatter.getProcesoDescripcion\'\n                }"\n                            /><Text text="{detailsModel>NumeroDoc}" /><Text text="{detailsModel>Placa}" /><Text\n                                text="{\n                    parts: [\'detailsModel>FechaEntBas\'],\n                    formatter: \'.formatter.formatDate\'\n                }"\n                            /><Text\n                                text="{\n                    parts: [\'detailsModel>FechaEntBas\'],\n                    formatter: \'.formatter.formatDate\'\n                }"\n                            /></cells></ColumnListItem></items></Table></f:content></f:DynamicPage></mvc:View>\n'
});
//# sourceMappingURL=Component-preload.js.map
//# base controlle----------


sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageBox) => {
    "use strict";

    return Controller.extend("delmex.zmmbascula.controller.BaseController", {

        onInit() {

            console.log("base controller");
        },
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        goBack: function () {
            var sPreviousHash = sap.ui.core.routing.History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined && !sPreviousHash.includes("header")) {
                history.go(-1);
            } else {
                var _bReplace = true;
                this.getRouter().navTo("RouteMain");
            }
        },

        getRequestModel() {
            let _requestModel = new JSONModel({
                Folio: "",
                CentroEnt: "",
                Tipoticket: "",
                CentroSal: "",
                Material: "",
                NumeroDoc: "",
                Placa: "",
                FechaEntBas: "",
                FechaSalBas: ""
            });

            return _requestModel;
        },

        getCatalogsModel() {

            let _catalogsModel = new JSONModel({
                Proceso: {
                    1: "Entrada de Mercancía",
                    2: "Salida de Mercancía",
                    3: "Traslados de Mercancía",
                    4: "Venta de Chatarra",
                    5: "Serv de pesaje externo",
                    6: "Otros"
                },
                TipoTicket: {
                    1: "Ticket interno",
                    2: "Ticket externo"
                }
            });

            return _catalogsModel;

        },

        detailSettingsModel() {
            let _detailSettings = new JSONModel({
                flag_oc: false,
                flag_ov: false
            });

            return _detailSettings;
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
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
                    error: reject
                });
            });
        },


        get_JSON_PDF() {



            return {
                "Structure": {
                    "Header": {
                        "Line1": "AV. ÁNGEL MARTÍNEZ VILLAREAL #637 INT. S2",
                        "Line2": "COL. CHEPEVERA C.P. 64030 MONTERREY N. L. MÉXICO",
                        "Line3": "RFC GDE091112HA8",
                        "Line4": "LIBRAMIENTO NOROESTE # 4030, PARQUE INDUSTRIAL ESCOBEDO",
                        "Line5": "GENERAL ESCOBEDO, N.L. C.P. 66072",
                        "Line6": "TEL: (81) 4057 5110",
                        "Line7": "E-MAIL: CALIDAD@DELMEX.MX CREDITOS@DELMEX.MX",
                        "Line8": "WWW.DELMEX.MX"
                    },

                    "Body": {
                        "Folio": "FOLIO ",
                        "Placa": "PLACA ",
                        "Bound": "BOUND ",
                        "Fecha_Hora_SALIDA_1": "FECHA Y HORA ",
                        "Bruto": "BRUTO ",
                        "Called_Neto": "CALLED NETO ",
                        "Fecha_Hora_SALIDA_2": "DE SALIDA "
                    },
                    "Footer": {
                        "Nombre": "NOMBRE ",
                        "Referencia_Material": "REFERENCIA DE MATERIAL ",
                        "No_Doc": "NO. DE DOCUMENTO "
                    },

                    "Helpers": {
                        "Line": "___________________________"
                    }
                }
            }
        },

        buildDate(oDate) {

            let oMonth = parseInt(oDate.getMonth()) + 1;
            oMonth = oMonth <= 9 ? "0" + oMonth.toString() : oMonth.toString();
            let oDay = parseInt(oDate.getDate());
            oDay = oDay <= 9 ? "0" + oDay.toString() : oDay.toString();
            let _returnDate = oDate.getFullYear().toString() + oMonth.toString() + oDay;

            return _returnDate;

        },

        _getServiceUrl: function () {
            const sModulePath = sap.ui.require.toUrl("delmex/zmmbascula");
            const sBase = sModulePath.split("/webapp")[0];

            // Devuelve algo como: /resources/ -> para BAS
            // o: /e4a25f08-xxxxxx.delmexbasculazmmbascula... -> en Work Zone

            return sBase + "/sap/opu/odata/sap/ZUI_BASCULA_SRV_V2";
        },


        /**
        * Consulta los datos de un folio en el servicio OData y los carga en el modelo "basculaDetails".
        * Retorna una Promise para poder usar async/await si se desea.
        * 
        * @param {string} sFolio - Folio a consultar
        * @returns {Promise} Resolución con los datos obtenidos, o rechazo con el error
        */
        loadFolioData: function (sFolio, c_buildPDF = false) {
            const _that = this;
            const oModel = this.getView().getModel("zbasc");
            const sUrl = `/Folio('${sFolio}')`;

            sap.ui.core.BusyIndicator.show();

            return new Promise(function (resolve, reject) {
                oModel.read(sUrl, {
                    success: function (oData) {
                        // Crear un modelo temporal con los datos recibidos
                        const oFolioModel = new sap.ui.model.json.JSONModel();
                        oFolioModel.setData(oData);

                        // Asignar el modelo a la vista con el nombre "basculaDetails"
                        if(_that.getView().getModel("basculaDetails")){
                            _that.getView().getModel("basculaDetails").setData();
                           
                        }
                        
                        _that.getView().setModel(oFolioModel, "basculaDetails");
                        debugger;
                        
                        if(c_buildPDF){
                            _that.buildPDF(_that);
                        }

                        sap.ui.core.BusyIndicator.hide();
                        resolve(oData); // Resolver la promesa con los datos
                    },
                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error("Error al obtener el folio.");
                        reject(oError); // Rechazar la promesa con el error
                    }
                });
            });
        },


        buildPDF: function (_that) {
            //const { jsPDF } = window.jspdf;

            
            
            var doc = new jsPDF();
            var _pdf = _that.getView().getModel("pdfStructureModel").getData().Structure;
            _that.getView().getModel("basculaDetails").refresh();
            var _basculaDetails = _that.getView().getModel("basculaDetails").getData();

            const pageWidth = doc.internal.pageSize.getWidth();

            // Coordenadas para centrar logo
            const imageWidth = 90;
            const imageHeight = 30;
            const imageCenter = (pageWidth - imageWidth) / 2;
            const marginRight = 10; // margen derecho (en mm)

            var _headerSize = 10;
            var _bodySize = 12;

            doc.setFontSize(_headerSize);


            // Coordenadas para centrar el texto de cabecera
            const _header_line1_Width = doc.getTextWidth(_pdf.Header.Line1);
            const _header_line1_Center = (pageWidth - _header_line1_Width) / 2;
            const _header_line2_Width = doc.getTextWidth(_pdf.Header.Line2);
            const _header_line2_Center = (pageWidth - _header_line2_Width) / 2;
            const _header_line3_Width = doc.getTextWidth(_pdf.Header.Line3);
            const _header_line3_Center = (pageWidth - _header_line3_Width) / 2;
            const _header_line4_Width = doc.getTextWidth(_pdf.Header.Line4);
            const _header_line4_Center = (pageWidth - _header_line4_Width) / 2;
            const _header_line5_Width = doc.getTextWidth(_pdf.Header.Line5);
            const _header_line5_Center = (pageWidth - _header_line5_Width) / 2;
            const _header_line6_Width = doc.getTextWidth(_pdf.Header.Line6);
            const _header_line6_Center = (pageWidth - _header_line6_Width) / 2;
            const _header_line7_Width = doc.getTextWidth(_pdf.Header.Line7);
            const _header_line7_Center = (pageWidth - _header_line7_Width) / 2;

            var _folio = _pdf.Body.Folio + _basculaDetails.Folio;




            // Coordenadas Folio

            const sPath = sap.ui.require.toUrl("delmex/zmmbascula/images/Logo.png");

            _that.loadImageAsBase64(sPath, function (base64Img) {

                doc.addImage(base64Img, 'PNG', imageCenter, 20, imageWidth, imageHeight);

                /** Cabecera del PDF */


                doc.setTextColor(7, 31, 99); // Color Azul
                doc.setFont("helvetica", "bolditalic");    // fuente
                doc.text(_pdf.Header.Line1, _header_line1_Center, 70);
                doc.text(_pdf.Header.Line2, _header_line2_Center, 75);
                doc.text(_pdf.Header.Line3, _header_line3_Center, 80);
                doc.text(_pdf.Header.Line4, _header_line4_Center, 85);
                doc.text(_pdf.Header.Line5, _header_line5_Center, 90);
                doc.text(_pdf.Header.Line6, _header_line6_Center, 95);
                doc.text(_pdf.Header.Line7, _header_line7_Center, 100);


                doc.setFontSize(_bodySize); /** Tamaño de fuente */

                doc.text(_folio, pageWidth - (marginRight + 40), 115, {
                    align: "right"
                });


                /** Cuerpo del PDF */

                const _marginLeft = 20;


                var _placa = _pdf.Body.Placa;
                var _bruto1 = _pdf.Body.Bruto;
                var _bound = _pdf.Body.Bound;
                //var _fechaSalida_1 = _pdf.Body.Fecha_Hora_SALIDA_1 + _basculaDetails.FechaEntBas;
                var _fechaSalida_1 = _pdf.Body.Fecha_Hora_SALIDA_1;
                var _bruto = _pdf.Body.Bruto;
                var _called_Neto = _pdf.Body.Called_Neto;
                //var _fechaSalida_2 = _pdf.Body.Fecha_Hora_SALIDA_1 + _basculaDetails.fecha_sal_bas;
                var _fechaSalida_2 = _pdf.Body.Fecha_Hora_SALIDA_2;


                // Separador de miles
                _basculaDetails.Pesaje = _that.formatter.formatNumberWithCommas(_basculaDetails.Pesaje.trim());
                _basculaDetails.Pesaje2 = _that.formatter.formatNumberWithCommas(_basculaDetails.Pesaje2.trim());
                _basculaDetails.PesoNeto = _that.formatter.formatNumberWithCommas(_basculaDetails.PesoNeto.trim());





                doc.setFont("helvetica", "italic");    // fuente


                doc.text(_placa, _marginLeft, 140); // X = 10 (desde el margen izquierdo)
                doc.text(_basculaDetails.Placa, _marginLeft + 30, 140);
                doc.text(_pdf.Helpers.Line, _marginLeft + 30, 141);

                doc.text(_bruto1, _marginLeft, 150);
                doc.text(_bound, _marginLeft, 155);
                doc.text(_basculaDetails.Pesaje.trim(), _marginLeft + 30, 155);
                doc.text(_pdf.Helpers.Line, _marginLeft + 30, 156);

                var _FechaEntBas = _that.formatter.formatDate(_basculaDetails.FechaEntBas);

                doc.text(_fechaSalida_1, _marginLeft, 165);
                doc.text(_fechaSalida_2, _marginLeft, 170);
                doc.text(_FechaEntBas, 60, 170);
                doc.text(_pdf.Helpers.Line, _marginLeft + 40, 171);

                doc.text(_placa, _marginLeft, 185);
                doc.text(_basculaDetails.Placa.trim(), _marginLeft + 30, 185);
                doc.text(_pdf.Helpers.Line, _marginLeft + 30, 186);


                doc.text(_bruto, _marginLeft, 200);
                doc.text(_basculaDetails.Pesaje2.trim(), _marginLeft + 30, 200);
                doc.text(_pdf.Helpers.Line, _marginLeft + 30, 201);



                doc.text(_called_Neto, _marginLeft, 215);
                doc.text(_basculaDetails.PesoNeto.trim(), _marginLeft + 40, 215);
                doc.text(_pdf.Helpers.Line, _marginLeft + 40, 216);


                doc.text(_fechaSalida_1, _marginLeft, 225);
                doc.text(_fechaSalida_2, _marginLeft, 230);
                doc.text(_FechaEntBas, 60, 230);
                doc.text(_pdf.Helpers.Line, _marginLeft + 40, 231);

                // Footer

                var _nombre = _pdf.Footer.Nombre;
                var _referencia_material = _pdf.Footer.Referencia_Material; // Orden de compra
                var _no_documento = _pdf.Footer.No_Doc; // Orden de venta



                doc.text(_nombre, _marginLeft, 250);
                doc.text(_basculaDetails.Conductor, 60, 250);
                doc.text(_pdf.Helpers.Line, _marginLeft + 40, 251);

                doc.text(_placa, _marginLeft, 260);
                doc.text(_basculaDetails.Placa.trim(), 60, 260);
                doc.text(_pdf.Helpers.Line, _marginLeft + 40, 261);


                doc.text(_referencia_material.trim(), _marginLeft, 270);
                doc.text(_basculaDetails.Material.trim(), 90, 270); // OC => NumeroDoc
                doc.text(_pdf.Helpers.Line, 90, 271);

                doc.text(_no_documento.trim(), _marginLeft, 280);
                doc.text(_basculaDetails.NumeroDoc.trim(), _marginLeft + 50, 280);
                doc.text(_pdf.Helpers.Line, _marginLeft + 50, 281);





                const pdfBlob = doc.output("blob");
                const pdfUrl = URL.createObjectURL(pdfBlob);

                _that._pdfViewer.setSource(pdfUrl);
                //doc.save(_basculaDetails.Folio);
                _that._pdfViewer.open();
            }.bind(_that));
        },

        loadImageAsBase64: function (src, callback) {
            var img = new Image();
            img.onload = function () {
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                var dataURL = canvas.toDataURL('image/png');
                callback(dataURL);
            };
            img.src = src;
        },








    });
});