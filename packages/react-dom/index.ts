export { createRoot } from './ReactDomRoot'

export default {
  render(element: any, container: Element) {
    console.log({
      element,
      container,
    })
    console.log('Noop')
  },
}
