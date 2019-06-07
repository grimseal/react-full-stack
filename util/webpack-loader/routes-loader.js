const pathToRegexp = require('path-to-regexp');
const path = require('path');
const fs = require('fs');
const config = require('../../config/config');

function BracketsGroup (openBracket, parent) {
  this.arr = [];
  this.deep = parent ? parent.deep + 1 : 0;
  this.parent = parent || null;
  this.childrens = [];
  this.resultContent = '';
  this.stateClosed = false;
  this.openBracket = openBracket;
}

BracketsGroup.prototype.push = function(letter) {
  this.arr.push(letter);
};

BracketsGroup.prototype.pushChildren = function(children) {
  this.childrens.push({
    index: this.arr.length,
    children
  });
  this.arr = this.arr.concat(children.arr);
};

BracketsGroup.prototype.content = function() {
  return this.resultContent.toString();
};

BracketsGroup.prototype.closed = function() {
  return this.stateClosed;
};

BracketsGroup.prototype.close = function() {
  this.resultContent = this.arr.join('');
  this.stateClosed = true;
  if (this.parent) this.parent.pushChildren(this);
};

/**
 * @param string
 * @returns {BracketsGroup[]}
 */
function getBracketsGroups(string) {
  const openBrackets = ['{'];
  const closedBrackets = ['}'];
  /** @type {BracketsGroup[]} */
  const groups = [];
  /** @type {BracketsGroup} */
  let group = null;

  let i = 0;
  while (i < string.length) {
    const letter = string.charAt(i);
    // loop trought all letters of expr
    if (openBrackets.includes(letter)) {
      // if its oppening bracket
      group = new BracketsGroup(letter, group);
      group.push(letter);
      groups.push(group);
    } else if (closedBrackets.includes(letter)) {
      // if its closing
      const openPair = openBrackets[closedBrackets.indexOf(letter)]; // find his pair
      if (!group) {
        throw new Error('syntax error in source, no group');
      }

      if (group.openBracket === openPair) {
        group.push(letter);
        group.close();
        group = group.parent;
      } else {
        throw new Error('syntax error in source');
      }
    } else if (group && !group.closed()) {
      group.push(letter);
    }
    i += 1;
  }

  return groups;
}

function parse(content, reg, template, rows) {
  const match = content.match(reg);
  if (match && match.length === 2) {
    rows.push(template.replace('$1', match[1]));
  }
}

const commentsRegExp = /(?:\/\*[^*]*\*+(?:[^/][^*]*\*+)*\/)|(?:\/\/.*)/g;
const importRegExp = /^import \S+ from ['"].*client.+['"];?$/gm;

function parseSource(source) {
  const string = source.replace(commentsRegExp, '');
  const imports = (string.match(importRegExp) || []).join('\n');
  const route = getBracketsGroups(string.replace(/^import.+$/gm, ''))
    .filter(function(group) { return group.deep === 0 && group.content().trim(); })
    .map(function(group) {
      try {
        const content = group.content();
        const pathMatch = content.match(/path:\s*['"]([^'"]+)/);
        const rows = [`path: ${pathToRegexp(pathMatch[1])}`];
        parse(content, /view:\s*([^,\n]+)/, 'view: $1', rows);
        parse(content, /local:\s*([^,\n]+)/, 'local: $1', rows);
        parse(content, /authorized:\s*([^,\n]+)/, 'authorized: $1', rows);
        return `{\n    ${rows.join(',\n    ')}\n  }`;
      } catch (e) {
        console.log('routes-loader', group.content());
        console.error(e);
        throw e;
      }
    })
    .join(',\n');

  return {
    imports: imports,
    route: route
  };
}

module.exports = function() {
  const imports = [];
  const routes = [];
  const routeDir = path.resolve(config.root, 'src/server/routes');

  fs.readdirSync(routeDir)
    .filter(file => file.match(/.+\.js$/))
    .forEach(file => {
      const modulePath = path.resolve(routeDir, file);
      const source = fs.readFileSync(modulePath, 'utf8');

      const data = parseSource(source);
      const ext = path.extname(file);
      const name = path.basename(file, ext);

      imports.push(data.imports);
      routes.push(`'${name}': ${data.route}`);
    });

  return `${imports.join('\n')}\nexport default {\n  ${routes.join(',\n  ')}\n}`;
}
