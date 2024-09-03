import {Context} from "./context"
import { LoaderContext } from "./loader/context";
import {Log, LogLevel, LogConsole} from "./log"
import {Document} from "./loader/document"
import * as BABYLON from "babylonjs";


export class ColladaLoader {
        onFinished: ((id: string, doc?: Document) => void) | undefined;
        onProgress: ((id: string, loaded: number, total: number) => void) | undefined;
        log: Log;

        constructor() {
            this.log = new LogConsole();
        }

        private _reportError(id: string, context: LoaderContext) {
            if (this.onFinished) {
                this.onFinished(id, undefined);
            }
        }

        private _reportSuccess(id: string, doc: Document, context: LoaderContext) {
            if (this.onFinished) {
                this.onFinished(id, doc);
            }
        }

        private _reportProgress(id: string, context: LoaderContext) {
            if (this.onProgress) {
                this.onProgress(id, context.loadedBytes, context.totalBytes);
            }
        }

        loadFromXML(id: string, doc: XMLDocument): Document {
            var context: LoaderContext = new LoaderContext(this.log);
            return this._loadFromXML(id, doc, context);
        }

        private _loadFromXML(id: string, doc: XMLDocument, context: LoaderContext): Document | undefined {
            var result: Document | undefined = undefined;
            try {
                result = Document.parse(doc, context);
                context.resolveAllLinks();
            } catch (err) {
                context.log.write(err.message + "\n" + err.stack, LogLevel.Exception);
                context.log.write(err.message + "\n" + err.stack, LogLevel.Error);
                this._reportError(id, context);
                return undefined;
            }
            this._reportSuccess(id, result, context);
            return result;
        }

        loadFromURL(id: string, url: string) {
            var context: LoaderContext = new LoaderContext(this.log);
            var loader: ColladaLoader = this;

            if (document != null && document.implementation != null && document.implementation.createDocument != null) {

                var req: XMLHttpRequest = new XMLHttpRequest();
                if (typeof req.overrideMimeType === "function") {
                    req.overrideMimeType("text/xml");
                }

                req.onreadystatechange = function () {
                    if (req.readyState === 4) {
                        if (req.status === 0 || req.status === 200) {
                            if (req.responseXML) {
                                var result: Document = Document.parse(req.responseXML, context);
                                loader._reportSuccess(id, result, context);
                            } else {
                                context.log.write("Empty or non-existing file " + url + ".", LogLevel.Error);
                                loader._reportError(id, context);
                            }
                        }
                    } else if (req.readyState === 3) {
                        if (!(context.totalBytes > 0)) {
                            context.totalBytes = parseInt(req.getResponseHeader("Content-Length") || "0");
                        }
                        context.loadedBytes = req.responseText.length;
                        loader._reportProgress(id, context);
                    }
                };
                req.open("GET", url, true);
                req.send(null);
            } else {
                context.log.write("Don't know how to parse XML!", LogLevel.Error);
                loader._reportError(id, context);
            }
        }
    }
