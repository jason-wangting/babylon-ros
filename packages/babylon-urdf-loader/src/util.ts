import { parseString } from 'xml2js';
import { URDF } from './interfaces/URDF';
import { Vector3 } from '@babylonjs/core';

/**
 * parse urdf text to URDF object
 * @param urdf urdf text
 * @returns URDF object
 */
export async function parseUrdf(urdf: string): Promise<URDF> {
    return await new Promise((resolve, reject) => parseString(urdf, (err, jsonData) => {
        if (err) {
            console.log(err);
            reject(err);
        }
        resolve(jsonData);
    }));
}
export function parseVector(vec: string): BABYLON.Vector3 {
    vec = vec.trim();
    var xyz = vec.split(' ');
    if (xyz.length != 3) {
        throw new Error("Vector ${vec} does not have 3 values")
    }

    return new Vector3(parseFloat(xyz[0]), parseFloat(xyz[1]), parseFloat(xyz[2]));
}
/**
 * parse basepath and filename from path
 * @param path 
 * @returns base && filename
 * @example /test/test.data => { base: '/test/', filename: 'test.data' }
 */
export function getBaseAndFileName(path: string): { base: string, filename: string } {
    const lastIndex = path.lastIndexOf('/');
    const base = path.substring(0, lastIndex + 1);
    const filename = path.substring(lastIndex + 1);
    return { base, filename };
}