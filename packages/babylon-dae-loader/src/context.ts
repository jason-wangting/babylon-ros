
import {Log, LogLevel} from "./log"

    export class Context {
        log: Log;
        constructor(l : Log) {
            this.log = l;
        }

        isInstanceOf(el: any, typeName: string): boolean {
            return el._className.indexOf("|" + typeName + "|") > -1;
        }
    }
