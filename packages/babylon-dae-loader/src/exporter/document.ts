import { DocumentJSON } from "./format";

    export class Document {
        json: DocumentJSON | null;
        data: Uint8Array | null;

        constructor() {
            this.json = null;
            this.data = null;
        }
    }
