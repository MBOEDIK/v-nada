const REQUIRED_NAMES = new Set([
  'user_id',
  'lar_threshold',
  'f_min',
  'f_max',
  'session_id',
  'timestamp',
  'module_type',
  'lar_accuracy',
  'fo_stability',
  'star_score',
]);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce snake_case naming for V-NADA domain fields',
      category: 'Standards',
    },
    messages: {
      notSnakeCase:
        'Variable "{{name}}" must be snake_case. Found "{{actual}}", expected "{{expected}}".',
    },
  },
  create(context) {
    function checkName(node, name) {
      if (!name || typeof name !== 'string') {return;}

      const lower = name.toLowerCase();
      if (!REQUIRED_NAMES.has(lower)) {return;}

      if (name !== lower) {
        context.report({
          node,
          messageId: 'notSnakeCase',
          data: {
            name: lower,
            actual: name,
            expected: lower,
          },
        });
      }
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier') {
          checkName(node, node.id.name);
        }
        if (node.id.type === 'ObjectPattern') {
          node.id.properties.forEach((prop) => {
            if (prop.value.type === 'Identifier') {
              checkName(prop, prop.value.name);
            }
          });
        }
      },
      Property(node) {
        if (
          node.key.type === 'Identifier' &&
          !node.computed
        ) {
          checkName(node, node.key.name);
        }
        if (
          node.key.type === 'Literal' &&
          typeof node.key.value === 'string'
        ) {
          checkName(node, node.key.value);
        }
      },
      AssignmentExpression(node) {
        if (
          node.left.type === 'MemberExpression' &&
          node.left.property.type === 'Identifier'
        ) {
          checkName(node.left, node.left.property.name);
        }
      },
    };
  },
};
