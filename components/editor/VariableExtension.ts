import { Node, mergeAttributes } from '@tiptap/core';

export interface VariableOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      /**
       * Insert a variable node
       */
      insertVariable: (options: { key: string; label: string }) => ReturnType;
    };
  }
}

export const Variable = Node.create<VariableOptions>({
  name: 'variable',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-key'),
        renderHTML: (attributes) => {
          if (!attributes.key) {
            return {};
          }
          return {
            'data-key': attributes.key,
          };
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }
          return {
            'data-label': attributes.label,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="variable"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': 'variable', class: 'variable-node' },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      `{{${node.attrs.key}}}`,
    ];
  },

  addCommands() {
    return {
      insertVariable:
        (options: { key: string; label: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});




