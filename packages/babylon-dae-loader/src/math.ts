import * as BABYLON from 'babylonjs';


    export interface NumberArray {
        length: number;
        [index: number]: number;
    }

    var TO_RADIANS: number = Math.PI / 180.0;

    export function round(num: number, decimals: number): number {
        if (decimals !== null) {
            // Nice, but does not work for scientific notation numbers
            // return +(Math.round(+(num + "e+" + decimals)) + "e-" + decimals);
            return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
        } else {
            return num;
        }
    }

    export function copyNumberArray(src: NumberArray, dest: NumberArray, count: number) {
        for (var i: number = 0; i < count; ++i) {
            dest[i] = src[i];
        }
    }

    export function copyNumberArrayOffset(src: NumberArray, srcOffset: number, dest: NumberArray, destOffset: number, count: number) {
        for (var i: number = 0; i < count; ++i) {
            dest[destOffset + i] = src[srcOffset + i];
        }
    }

    /**
    * Calls the given function for each src[i*stride + offset]
    */
    export function forEachElement(src: NumberArray, stride: number, offset: number, fn: (x: number) => void) {
        var count = src.length / stride;
        for (var i: number = 0; i < count; ++i) {
            fn(src[i * stride + offset]);
        }
    }

    /**
    * Extracts a 4D matrix from an array of matrices (stored as an array of numbers)
    */
    export function mat4Extract(src: NumberArray, srcOff: number, dest: BABYLON.Matrix) {
        let d = new Float32Array(16);
        for (var i: number = 0; i < 16; ++i) {
            d[i] = src[srcOff * 16 + i];
        }
        dest.copyFrom(BABYLON.Matrix.FromArray(d).transpose());

        // Collada matrices are row major
        // glMatrix matrices are column major
        // webgl matrices are column major
        // BABlong is Row major dest.transpose();
    }

    export function bezier(p0: number, c0: number, c1: number, p1: number, s: number): number {
        if (s < 0 || s > 1) throw new Error("Invalid Bezier parameter: " + s);
        return p0 * (1 - s) * (1 - s) * (1 - s) + 3 * c0 * s * (1 - s) * (1 - s) + 3 * c1 * s * s * (1 - s) + p1 * s * s * s;
    }

    export function hermite(p0: number, t0: number, t1: number, p1: number, s: number): number {
        if (s < 0 || s > 1) throw new Error("Invalid Hermite parameter: " + s);
        var s2: number = s * s;
        var s3: number = s2 * s;
        return p0 * (2 * s3 - 3 * s2 + 1) + t0 * (s3 - 2 * s2 + s) + p1 * (-2 * s3 + 3 * s2) + t1 * (s3 - s2);
    }

    /**
     * 
    * Given a monotonously increasing function fn and a value target_y, finds a value x with 0<=x<=1 such that fn(x)=target_y
    */
    export function bisect(target_y: number, fn: (x: number) => number, tol_y: number, max_iterations: number): number {
        var x0: number = 0;
        var x1: number = 1;
        var y0: number = fn(x0);
        var y1: number = fn(x1);
        if (target_y <= y0) return x0;
        if (target_y >= y1) return x1;

        var x: number = 0.5 * (x0 + x1);
        var y: number = fn(x);

        var iteration: number = 0;
        while (Math.abs(y - target_y) > tol_y) {

            // Update bounds
            if (y < target_y) {
                x0 = x;
            } else if (y > target_y) {
                x1 = x;
            } else {
                return x;
            }

            // Update values
            x = 0.5 * (x0 + x1);
            y = fn(x);

            // Check iteration count
            ++iteration;
            if (iteration > max_iterations) {
                throw new Error("Too many iterations");
            }
        }
        return x;
    }
