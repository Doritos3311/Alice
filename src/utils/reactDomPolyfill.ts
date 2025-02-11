import ReactDOM from 'react-dom';

if (typeof (ReactDOM as any).unmountComponentAtNode === 'undefined') {
  (ReactDOM as any).unmountComponentAtNode = (container: Element | DocumentFragment) => {
    const root = (container as any)._reactRootContainer;
    if (root) {
      root.unmount();
      return true;
    }
    return false;
  };
}

export default ReactDOM;