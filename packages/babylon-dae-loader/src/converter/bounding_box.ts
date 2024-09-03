import * as BABYLON from 'babylonjs';
/// <reference path="../math.ts" />

    export class BoundingBox {
        public min: BABYLON.Vector3 = new BABYLON.Vector3();
        public max: BABYLON.Vector3 = new BABYLON.Vector3();

        constructor() {
            this.reset();
        }

        reset() {
            this.min.set(Infinity, Infinity, Infinity);
            this.max.set(-Infinity, -Infinity, -Infinity);
        }

        fromPositions(p: Float32Array, offset: number, count: number) {
            this.reset();
            for (var i: number = 0; i < count; ++i) {
                    var value = p[(offset + i) * 3 + 0];
                    this.min.x = Math.min(this.min.x, value);
                    this.max.x = Math.max(this.max.x, value);

                    value = p[(offset + i) * 3 + 1];
                    this.min.y = Math.min(this.min.y, value);
                    this.max.y = Math.max(this.max.y, value);

                    value = p[(offset + i) * 3 + 2];
                    this.min.z = Math.min(this.min.z, value);
                    this.max.z = Math.max(this.max.z, value);
                }
        }

        extend(p: BABYLON.Vector3) {
            this.min.x = Math.min(this.min.x, p.x);
            this.max.x = Math.max(this.max.x, p.x);

            this.min.y = Math.min(this.min.y, p.y);
            this.max.y = Math.max(this.max.y, p.y);

            this.min.z = Math.min(this.min.z, p.z);
            this.max.z = Math.max(this.max.z, p.z);
        }

        extendBox(b: BoundingBox) {
            this.extend(b.max);
            this.extend(b.min);
        }
    }
