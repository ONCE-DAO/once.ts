import { PluginConfig } from "ts-patch"
import ts from "typescript"

export default interface Transformer {
    transpile(): Promise<void>
}

export const TRANSFORMER = {

}

export type PluginOptions = ts.CompilerOptions & {
    plugins?: PluginConfig[],
    onceIOR?: string,
  }