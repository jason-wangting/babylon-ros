import { Context } from "../context"
import { LogLevel } from "../log"
import { LoaderContext } from "./context";
import { EElement } from "./element";


    export interface LinkResolveResult {
        result: EElement | undefined;
        warning: string | undefined;
    }

    /**
    * Base class for all links within a collada document
    */
    export class Link {
        url: string = "";
        target: EElement | undefined;

        constructor() {
        }

        getUrl(): string {
            throw new Error("not implemented");
        }

        resolve(context: LoaderContext) {
            throw new Error("not implemented");
        }

    };

    /**
    *   COLLADA URL addressing
    *
    *   See chapter 3, section "Adress Syntax"
    *   Uses XML ids that are unique within the whole document.
    *   Hyperlinks to ids start with a hash.
    *   <element id="xyz">
    *   <element source="#xyz">
    */
    export class UrlLink extends Link {

        constructor(url: string) {
            super();
            this.url = url.trim().replace(/^#/, "");
        }

        getUrl(): string {
            return this.url;
        }

        resolve(context: LoaderContext): void {
            // IDs are globally unique
            var object: EElement = context.ids[this.url];
            if (object != null) {
                this.target = object;
            } else {
                context.log?.write("Could not find URL target with URL " + this.url, LogLevel.Warning);
            }
        }
    };

    /**
    *   COLLADA FX parameter addressing
    *
    *   See chapter 7, section "About Parameters"
    *   Uses scoped ids that are unique within the given scope.
    *   If the target is not defined within the same scope,
    *   the search continues in the parent scope
    *   <element sid="xyz">
    *   <element texture="xyz">
    */
    export class FxLink extends Link {
        scope: EElement | undefined;

        constructor(url: string, scope: EElement) {
            super();
            this.url = url;
            this.scope = scope;
        }

        getUrl(): string {
            return this.url;
        }

        resolve(context: LoaderContext): void {
            var scope: EElement | undefined = this.scope;
            var object: EElement | undefined = undefined;
            // FX targets have a unique SID within a scope
            // If the target is not found in the current scope,
            // continue searching in the parent scope.
            while ((object == undefined) && scope) {
                object = scope.fxChildren[this.url];
                scope = scope.fxParent;
            }
            if (object) {
                this.target = object;
            } else {
                context.log?.write("Could not find FX target with URL " + this.url, LogLevel.Warning);
            };
        }
    }

    /**
    *   COLLADA SID addressing
    *
    *   See chapter 3, section "Adress Syntax"
    *   Uses scoped ids that are unique within the parent element.
    *   Adresses are anchored at a globally unique id and have a path of scoped ids.
    *   <elementA id="xyz"><elementB sid="abc"></elementB></elementA>
    *   <element target="xyz/abc">
    */
    export class SidLink extends Link {
        parentId: string;
        id: string | undefined;
        sids: string[];
        member: string | undefined;
        indices: number[];
        dotSyntax: boolean;
        arrSyntax: boolean;

        constructor(url: string, parentId: string) {
            super();
            this.url = url;
            this.parentId = parentId;
            this.sids = [];
            this.indices = [];
            this.dotSyntax = false;
            this.arrSyntax = false;
            this._parseUrl();
        }

        getUrl(): string {
            return this.url;
        }

        private _parseUrl() {
            var parts: string[] = this.url.split("/");

            // Part 1: element id
            this.id = parts.shift();
            if (this.id === ".") {
                this.id = this.parentId;
            }

            // Part 2: list of sids
            while (parts.length > 1) {
                var s = parts.shift();
                if (s) {
                    this.sids.push();
                }
            }

            // Part 3: last sid
            if (parts.length > 0) {
                var lastSid: string = parts[0];
                var dotSyntax: boolean = lastSid.indexOf(".") >= 0;
                var arrSyntax: boolean = lastSid.indexOf("(") >= 0;
                if (dotSyntax) {
                    parts = lastSid.split(".");
                    var s = parts.shift();
                    if (s) {
                        this.sids?.push(s);
                    }
                    this.member = parts.shift();
                    this.dotSyntax = true;
                } else if (arrSyntax) {
                    var arrIndices: string[] = lastSid.split("(");
                    var idx = arrIndices.shift();
                    if (idx) {
                        this.sids.push(idx);
                    }
                    this.indices = [];
                    var index: string;
                    for (var i: number = 0, len: number = arrIndices.length; i < len; i++) {
                        index = arrIndices[i];
                        this.indices.push(parseInt(index.replace(/\)/, ""), 10));
                    }
                    this.arrSyntax = true;
                } else {
                    this.sids.push(lastSid);
                }
            }
        };

        /**
        *   Find the SID target given by the URL (array of sid parts).
        *
        *   @param url The complete URL, for debugging only
        *   @param root Root element, where the search starts.
        *   @param sids SID parts.
        *   @returns The collada element the URL points to, or an error why it wasn't found
        */
        static findSidTarget(url: string, root: EElement, sids: string[], context: Context): LinkResolveResult {
            var result: LinkResolveResult = { result: undefined, warning: undefined };
            if (root == null) {
                result.result = undefined;
                result.warning = "Could not resolve SID target " + sids.join("/") + ", missing root element";
                return result;
            }
            var parentObject: EElement = root;
            var childObject: EElement | undefined = undefined;
            // For each SID part, perform a depth-first search
            for (var i: number = 0, ilen: number = sids.length; i < ilen; i++) {
                var sid: string = sids[i];
                // Initialize a queue for the search
                var queue: EElement[] = [parentObject];
                // Dept-first search
                while (queue.length !== 0) {
                    // Get front of search queue
                    var front: EElement | undefined = queue.shift();
                    if (front) {
                        // Stop if we found the target
                        if (front.sid === sid) {
                            childObject = front;
                            break;
                        }
                        // Add all children to the back of the queue
                        var frontChildren: EElement[] = front.sidChildren;
                        if (frontChildren != null) {
                            for (var j: number = 0, jlen: number = frontChildren.length; j < jlen; j++) {
                                var sidChild: EElement = frontChildren[j];
                                queue.push(sidChild);
                            }
                        }
                    }
                }
                // Abort if the current SID part was not found
                if (!childObject) {
                    result.result = undefined;
                    result.warning = "Could not resolve SID target " + sids.join("/") + ", missing SID part " + sid;
                    return result;
                }
                parentObject = childObject;
            }
            // All parts processed, return the final target
            result.result = childObject;
            result.warning = "";
            return result;
        }

        resolve(context: LoaderContext): void {
            var object: EElement | undefined;
            if (this.id == null) {
                context.log?.write("Could not resolve SID #" + this.url + ", link has no root ID", LogLevel.Warning);
                return;
            }
            object = context.ids[this.id];
            if (object == null) {
                context.log?.write("Could not resolve SID #" + this.url + ", could not find root element " + this.id, LogLevel.Warning);
                return;
            }
            var result = SidLink.findSidTarget(this.url, object, this.sids, context);
            if (result.warning) {
                context.log?.write(result.warning, LogLevel.Warning);
            }
            this.target = result.result;
        }
    }
