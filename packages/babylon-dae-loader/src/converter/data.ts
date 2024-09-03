    export class ColladaConverterData {
        data: Uint8Array;
        offset: number = 0;
        length: number = 0;

        constructor(input: ArrayBuffer) {
            this.data = new Uint8Array(input);
        }

    }
