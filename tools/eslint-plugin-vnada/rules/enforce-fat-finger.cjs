const REQUIRED_MIN_SIZE = 60;
const INTERACTIVE_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea']);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce minimum 60dp touch targets for interactive elements',
      category: 'Accessibility',
    },
    messages: {
      tooSmall:
        'Interactive element <{{tag}}> must have min-width and min-height ≥{{min}}px. Add min-w-[{{min}}px] min-h-[{{min}}px] classes.',
    },
  },
  create() {
    return {
      JSXElement(node) {
        if (
          node.openingElement &&
          node.openingElement.name &&
          node.openingElement.name.type === 'JSXIdentifier' &&
          INTERACTIVE_TAGS.has(node.openingElement.name.name)
        ) {
          const attrs = node.openingElement.attributes;
          const classAttr = attrs.find(
            (a) =>
              a.type === 'JSXAttribute' &&
              a.name &&
              a.name.type === 'JSXIdentifier' &&
              (a.name.name === 'className' || a.name.name === 'class')
          );

          if (!classAttr) {
            context.report({
              node,
              messageId: 'tooSmall',
              data: {
                tag: node.openingElement.name.name,
                min: String(REQUIRED_MIN_SIZE),
              },
            });
            return;
          }

          let classValue = '';
          if (classAttr.value.type === 'Literal') {
            classValue = classAttr.value.value;
          } else if (classAttr.value.type === 'TemplateLiteral') {
            classValue = classAttr.value.quasis.map((q) => q.value.raw).join('');
          }

          const hasMinW = new RegExp(`min-w-\\[${REQUIRED_MIN_SIZE}px\\]`).test(classValue);
          const hasMinH = new RegExp(`min-h-\\[${REQUIRED_MIN_SIZE}px\\]`).test(classValue);

          if (!hasMinW || !hasMinH) {
            context.report({
              node,
              messageId: 'tooSmall',
              data: {
                tag: node.openingElement.name.name,
                min: String(REQUIRED_MIN_SIZE),
              },
            });
          }
        }
      },
    };
  },
};
