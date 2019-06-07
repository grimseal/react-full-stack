export default {
  findParentNode(name, node) {
    let current = node;
    const nodeName = name.toLowerCase();
    while (current) {
      if ((current.nodeName || current.tagName).toLowerCase() === nodeName) return current;
      current = current.parentNode;
    }
    return null;
  }
};
