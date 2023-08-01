import { consola } from "consola";
import { redis } from "../index";

export function connected() {
    consola.success("Redis connected")
}
export function ready() {
    consola.success("Redis ready to go !")
    redis.flushdb()
}
export function error(error: Error) {
    consola.error("Redis got an error: ", error)
}
