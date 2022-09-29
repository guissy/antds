export function hasClass(node, className) {
  if (node.classList) {
    return node.classList.contains(className);
  }
  const originClass = node['class'];
  return ` ${originClass} `.indexOf(` ${className} `) > -1;
}

export function addClass(node, className) {
  if (node.classList) {
    node.classList.add(className);
  } else {
    if (!hasClass(node, className)) {
      node['class'] = `${node['class']} ${className}`;
    }
  }
}

export function removeClass(node, className) {
  if (node.classList) {
    node.classList.remove(className);
  } else {
    if (hasClass(node, className)) {
      const originClass = node['class'];
      node['class'] = ` ${originClass} `.replace(` ${className} `, ' ');
    }
  }
}
