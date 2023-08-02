import { consola } from "consola";

export function connected() {
    consola.success("Redis connected")
}
export function ready() {
    consola.success("Redis ready to go !")
}
export function error(error: Error) {
    consola.error("Redis got an error: ", error)
}
