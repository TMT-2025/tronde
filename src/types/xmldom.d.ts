/// <reference lib="dom" />
import "@xmldom/xmldom";

declare module "@xmldom/xmldom" {
  export type Element = globalThis.Element;
  export type Node = globalThis.Node;
}
