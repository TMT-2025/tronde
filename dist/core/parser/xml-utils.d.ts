import { Element, Node } from "@xmldom/xmldom";
export declare function getChildrenByLocalName(parent: Node, localName: string): Element[];
export declare function getFirstChildByLocalName(parent: Node, localName: string): Element | null;
export declare function getAttributeValue(element: Element, attrLocalName: string): string | null;
export declare function getElementTextContent(element: Element): string;
export declare function getDescendantsByLocalName(parent: Node, localName: string): Element[];
