import { DocumentJSON } from "./format";

    export class Document {
        json: DocumentJSON;
        data: Uint8Array;

        constructor() {
            this.json = null;
            this.data = null;
        }
    }
