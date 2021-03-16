import { TEXT_NODE } from './shared/HTMLNodeType'

export const setTextContent = (node: Element, text: string): void => {
  if (text) {
    const firstChild = node.firstChild

    if (
      firstChild &&
      firstChild === node.lastChild &&
      firstChild.nodeType === TEXT_NODE
    ) {
      firstChild.nodeValue = text
      return
    }

    node.textContent = text
  }
}
