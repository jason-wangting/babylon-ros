import { Context } from "../context"
import { LogLevel } from "../log"
import { Link } from "./link";


    /**
    *   Base class for any collada element.
    *
    *   Contains members for URL, FX, and SID adressing,
    *   even if the actual element does not support those.
    */
    export class EElement {
        /** Class name so that we do not depend on instanceof */
        _className: string;
        /** Collada URL adressing: identifier */
        id: string = "";
        /** Collada SID/FX adressing: identifier */
        sid: string = "";
        /** Collada FX adressing: parent element */
        fxParent: EElement | undefined;
        /** Collada FX adressing: child elements */
        fxChildren: { [sid: string]: EElement; };
        /** Collada SID adressing: child elements */
        sidChildren: EElement[];
        /** Name of the element. Not used for any adressing. */
        name: string = "";

        /** Empty constructor */
        constructor() {
            this.fxChildren = {};
            this.sidChildren = [];
            this._className = "|Element|";
        }

        static fromLink(link: Link, context: Context): EElement | undefined{
            return EElement._fromLink<EElement>(link, "Element", context);
        }

        static _fromLink<T extends EElement>(link: Link, typeName: string, context: Context): T | undefined{
            if (!link) {
                return undefined;
            } else if (!link.target) {
                return undefined;
            } else if (context.isInstanceOf(link.target, typeName)) {
                return <T> link.target;
            } else {
                context.log.write("Link with url " + link.url + " does not point to a " + typeName + ", link target ignored", LogLevel.Error);
                return undefined;
            }
        }
    };
