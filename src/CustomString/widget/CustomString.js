define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "CustomString/lib/jquery-1.11.2",
    "dojo/text!CustomString/widget/template/CustomString.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    return declare("CustomString.widget.CustomString", [ _WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,

        // Parameters configured in the Modeler.
        sourceMF: "",
        sourceNF: "",
        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;
            if (this._contextObj) {
                this._resetSubscriptions();
                this._updateRendering(callback);
            }else {
                this._executeCallback(callback, "update");
            }
        },
        resize: function (box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering : function (callback) {
            logger.debug(this.id + "._updateRendering");

            if(this.sourceMF !== ""){
                mx.ui.action(this.sourceMF, {
                    params: {
                        applyto     : "selection",
                        guids       : [this._contextObj.getGuid()]
                    },
                    callback     : lang.hitch(this, this._processSourceMFCallback, callback),
                    error        : lang.hitch(this, function(error) {
                        alert(error.description);
                        this._executeCallback(callback, "_updateRendering error");
                    })
                }, this);
            }else {
                mx.data.callNanoflow({
                    nanoflow: this.sourceNF,
                    origin: this.mxform,
                    context: this.mxcontext,
                    callback     : lang.hitch(this, this._processSourceMFCallback, callback),
                    error        : lang.hitch(this, function(error) {
                        alert(error.description);
                        this._executeCallback(callback, "_updateRendering error");
                    })
                },this);
            }
        },
        _processSourceMFCallback: function (callback, returnedString) {
            logger.debug(this.id + "._processSourceMFCallback");
            if (this.customString) {
                dojoHtml.set(this.customString, returnedString);
            }
            this._executeCallback(callback, "_processSourceMFCallback");
        },
        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
            this.unsubscribeAll();

            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });
            }
        },

        // Shorthand for running a microflow
        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["CustomString/widget/CustomString"]);
