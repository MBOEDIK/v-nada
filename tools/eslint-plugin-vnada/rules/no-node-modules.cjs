const NODE_MODULES = new Set([
  'fs', 'path', 'crypto', 'express', 'http', 'https', 'net', 'os',
  'child_process', 'cluster', 'dns', 'dgram', 'readline', 'stream',
  'worker_threads', 'zlib', 'util', 'events', 'http2', 'perf_hooks',
  'async_hooks', 'v8', 'vm', 'tls', 'tty', 'punycode', 'querystring',
  'string_decoder', 'timers', 'console', 'module', 'process', 'buffer',
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid importing Node.js backend modules in client-side project',
      category: 'Critical',
    },
    messages: {
      nodeImport:
        'Node.js backend module "{{name}}" is PROHIBITED. V-NADA is 100% client-side. Use browser-native APIs instead.',
    },
  },
  create(context) {
    function checkNodeImport(source) {
      if (source.startsWith('node:')) {
        context.report({
          node: context.getScope().block,
          messageId: 'nodeImport',
          data: { name: source },
        });
        return;
      }
      if (NODE_MODULES.has(source)) {
        context.report({
          node: context.getScope().block,
          messageId: 'nodeImport',
          data: { name: source },
        });
      }
    }

    return {
      ImportDeclaration(node) {
        checkNodeImport(node.source.value);
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal'
        ) {
          checkNodeImport(node.arguments[0].value);
        }
      },
    };
  },
};
