
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