// function AsyncPropFunction<T>(fn: () => Promise<T>): Promise<T> {
//     return new Promise<T>(async (resolve, reject) => {
//         try {
//             const result = await fn()
//             resolve(result)
//         } catch (error) {
//             reject(error)
//         }
//     })
// }
export class Async {
    static Property<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            try {
                const result = await fn();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}
