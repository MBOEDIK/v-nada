const EXPECTED_INDICES = { top: 13, bottom: 14, left: 78, right: 308 };

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce correct FaceMesh landmark indices for LAR calculation',
      category: 'Critical',
    },
    messages: {
      wrongIndex:
        'FACEMESH_LIPS.{{key}} must be {{expected}}, found {{actual}}. LAR requires P_top=13, P_bottom=14, P_left=78, P_right=308.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key.type === 'Identifier' &&
          Object.prototype.hasOwnProperty.call(EXPECTED_INDICES, node.key.name) &&
          node.parent &&
          node.parent.parent &&
          node.parent.parent.type === 'VariableDeclarator' &&
          node.parent.parent.id.type === 'Identifier' &&
          (node.parent.parent.id.name === 'FACEMESH_LIPS' ||
            node.parent.parent.id.name === 'FACE_MESH_LIPS')
        ) {
          const expected = EXPECTED_INDICES[node.key.name];
          if (
            node.value.type === 'Literal' &&
            node.value.value !== expected
          ) {
            context.report({
              node,
              messageId: 'wrongIndex',
              data: {
                key: node.key.name,
                expected: String(expected),
                actual: String(node.value.value),
              },
            });
          }
        }
      },
    };
  },
};
