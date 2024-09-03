
import * as COLLADAContext from "../context"
import { Log, LogLevel } from "../log"
import { EElement } from "./element";
import { Link, UrlLink, SidLink, FxLink } from "./link";



    export class LoaderContext extends COLLADAContext.Context {
        ids: { [s: string]: EElement; }
        links: Link[] | undefined;
        totalBytes: number = 0;
        loadedBytes: number = 0;

        constructor(log: Log) {
            super(log);
            this.ids = {};
            this.links = [];
        }

        getAttributeNamed(el: Node, name: string) : Attr | undefined {
            var e = el as Element;
            var a = e.getAttributeNode(name);
            if (a) {
                return a;
            } else {
                return undefined;
            }

        }

        getAttributeFromChildNodesNamed(cn: NodeListOf<ChildNode>, name: string) : Attr | undefined {
            cn.forEach(el => {
                var a = this.getAttributeNamed(el, name);
                if (a) {
                    return a;
                }
            });
            return undefined;
        }

        getTextContent(el: Node): string {
            return el.textContent || (<any>el).firstChild.getNodeValue()+"";
        }

        getFloatsContent(el: Node): Float32Array {
            return this.strToFloats(this.getTextContent(el));
        }

        getFloatContent(el: Node): number {
            return parseFloat(this.getTextContent(el));
        }

        getIntsContent(el: Node): Int32Array {
            return this.strToInts(this.getTextContent(el));
        }

        getUintsContent(el: Node): Uint32Array {
            return this.strToUints(this.getTextContent(el));
        }

        getIntContent(el: Node): number {
            return parseInt(this.getTextContent(el), 10);
        }

        getBoolsContent(el: Node): Uint8Array {
            return this.strToBools(this.getTextContent(el));
        }

        getStringsContent(el: Node): string[] {
            return this.strToStrings(this.getTextContent(el));
        }

        getAttributeAsFloat(el: Node, name: string, defaultValue: number, required: boolean): number {
            var attr = this.getAttributeFromChildNodesNamed(el.childNodes, name);
            if (attr) {
                return parseFloat(attr.value);
            } else if (!required) {
                return defaultValue;
            } else {
                this.log?.write("Element " + el.nodeName + " is missing required float attribute " + name + ". Using default value " + defaultValue + ".", LogLevel.Error);
                return defaultValue;
            }
        }

        getAttributeAsInt(el: Node, name: string, defaultValue: number, required: boolean): number{
            var attr = this.getAttributeNamed(el, name);
            if (attr) {
                return parseInt(attr.value, 10);
            } else if (!required) {
                return defaultValue;
            } else {
                this.log?.write("Element " + el.nodeName + " is missing required integer attribute " + name + ". Using default value " + defaultValue + ".", LogLevel.Error);
                return defaultValue;
            }
        }

        getAttributeAsString(el: Node, name: string, defaultValue: string | undefined, required: boolean): string {
            var attr = this.getAttributeNamed(el, name);
            if (attr) {
                return attr.value + "";
            } else if (!required) {
                return defaultValue?defaultValue:"";
            } else {
                this.log?.write("Element " + el.nodeName + " is missing required string attribute " + name + ". Using default value " + defaultValue + ".", LogLevel.Error);
                return defaultValue?defaultValue:"";
            }
        }

        createUrlLink(url: string): UrlLink {
            var link: UrlLink = new UrlLink(url);
            this.links?.push(link);
            return link;
        }

        createSidLink(url: string, parentId: string): SidLink {
            var link: SidLink = new SidLink(url, parentId);
            this.links?.push(link);
            return link;
        }

        createFxLink(url: string, scope: EElement): FxLink {
            var link: FxLink = new FxLink(url, scope);
            this.links?.push(link);
            return link;
        }

        getAttributeAsUrlLink(el: Node, name: string, required: boolean): UrlLink | undefined{
            var attr = this.getAttributeNamed(el, name);
            if (attr) {
                return this.createUrlLink(attr.value);
            } else if (!required) {
                return undefined;
            } else {
                this.log?.write("Element " + el.nodeName + " is missing required URL link attribute " + name + ".", LogLevel.Error);
                return undefined;
            }
        }

        getAttributeAsSidLink(el: Node, name: string, parentId: string, required: boolean): SidLink | undefined {
            var attr = this.getAttributeNamed(el, name);
            if (attr) {
                return this.createSidLink(attr.value, parentId);
            } else if (!required) {
                return undefined;
            } else {
                this.log?.write("Element " + el.nodeName + " is missing required SID link attribute " + name + ".", LogLevel.Error);
                return undefined;
            }
        }

        getAttributeAsFxLink(el: Node, name: string, scope: EElement, required: boolean): FxLink | undefined{
            var attr = this.getAttributeNamed(el, name);
            if (attr) {
                return this.createFxLink(attr.value, scope);
            } else if (!required) {
                return undefined;
            } else {
                this.log?.write("Element " + el.nodeName + " is missing required FX link attribute " + name + ".", LogLevel.Error);
                return undefined;
            }
        }

        /**
        *   Splits a string into whitespace-separated strings
        */
        strToStrings(str: string): string[] {
            if (str.length > 0) {
                return str.trim().split(/\s+/);
            } else {
                return [];
            }
        }

        /**
        *   Parses a string of whitespace-separated float numbers
        */
        strToFloats(str: string): Float32Array {
            var strings: string[] = this.strToStrings(str);
            var data: Float32Array = new Float32Array(strings.length);
            var len: number = strings.length;
            for (var i: number = 0; i < len; ++i) {
                data[i] = parseFloat(strings[i]);
            }
            return data;
        }

        /**
        *   Parses a string of whitespace-separated integer numbers
        */
        strToInts(str: string): Int32Array {
            var strings: string[] = this.strToStrings(str);
            var data: Int32Array = new Int32Array(strings.length);
            var len: number = strings.length;
            for (var i: number = 0; i < len; ++i) {
                data[i] = parseInt(strings[i], 10);
            }
            return data;
        }

        /**
        *   Parses a string of whitespace-separated integer numbers
        */
        strToUints(str: string): Uint32Array {
            var strings: string[] = this.strToStrings(str);
            var data: Uint32Array = new Uint32Array(strings.length);
            var len: number = strings.length;
            for (var i: number = 0; i < len; ++i) {
                data[i] = parseInt(strings[i], 10);
            }
            return data;
        }

        /**
        *   Parses a string of whitespace-separated booleans
        */
        strToBools(str: string): Uint8Array {
            var strings: string[] = this.strToStrings(str);
            var data: Uint8Array = new Uint8Array(strings.length);
            var len: number = strings.length;
            for (var i: number = 0; i < len; ++i) {
                data[i] = (strings[i] === "true" || strings[i] === "1") ? 1 : 0;
            }
            return data;
        }

        /**
        *   Parses a color string
        */
        strToColor(str: string): Float32Array {
            var rgba = this.strToFloats(str);
            if (rgba.length === 4) {
                return rgba;
            } else {
                this.log?.write("Skipped color element because it does not contain 4 numbers", LogLevel.Error);
                return new Float32Array();
            }
        }

        registerUrlTarget(object: EElement, needsId: boolean) {
            var id: string = object.id;
            // Abort if the object has no ID
            if (id == null) {
                if (needsId) {
                    this.log?.write("Object has no ID, object was not registered as a URL target.", LogLevel.Error);
                }
                return;
            }
            // IDs must be unique
            if (this.ids[id] != null) {
                this.log?.write("There is already an object with ID " + id + ". IDs must be globally unique.", LogLevel.Error);
                return;
            }
            // URL links are registered globally
            this.ids[id] = object;
        }

        registerFxTarget(object: EElement, scope: EElement) {
            var sid: string = object.sid;
            if (sid == null) {
                this.log?.write("Cannot add a FX target: object has no SID.", LogLevel.Error);
                return;
            }
            if (scope.fxChildren[sid] != null) {
                this.log?.write("There is already an FX target with SID " + sid + ".", LogLevel.Error);
                return;
            }
            // FX links are registered within the parent scope
            object.fxParent = scope;
            scope.fxChildren[sid] = object;
        }

        registerSidTarget(object: EElement, parent: EElement) {
            // SID links are registered within the parent scope
            parent.sidChildren.push(object);
        }

        getNodePath(node: Node): string {
            var path: string = "<" + node.nodeName + ">";
            var len: number = 1;
            var maxLen: number = 10;
            while (node.parentNode != null) {
                node = node.parentNode;
                if (node.nodeName.toUpperCase() === "COLLADA") {
                    break;
                } else if (len >= maxLen) {
                    path = ".../" + path;
                    break;
                } else {
                    path = ("<" + node.nodeName + ">/") + path;
                    len += 1;
                }
            }
            return path;
        }

        reportUnexpectedChild(child: Node) {
            this.log?.write("Skipped unexpected element " + (this.getNodePath(child)) + ".", LogLevel.Warning);
        }

        reportUnhandledChild(child: Node) {
            this.log?.write("Element " + (this.getNodePath(child)) + " is legal, but not handled by this loader.", LogLevel.Trace);
        }

        resolveAllLinks() {
            if (this.links) {
                var linksLen: number = this.links.length;
                for (var i = 0; i < linksLen; ++i) {
                    var link: Link = this.links[i];
                    link.resolve(this);
                }
            }
        }
    };
