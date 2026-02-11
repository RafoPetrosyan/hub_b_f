'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import HardBreak from '@tiptap/extension-hard-break';
import { Variable } from './VariableExtension';
import { convertVariablesToHtml } from './variableHelpers';
import './EditorWithTemplates.css';

export type Template = {
  id: string;
  name: string;
  content: string;
};

export type Variable = {
  key: string;
  label: string;
  defaultValue?: string;
};

interface CKEditorWithTemplatesProps {
  data?: string;
  onChange?: (data: string) => void;
  templates?: Template[];
  variables?: Variable[];
}

// Default templates
const defaultTemplates: Template[] = [
  {
    id: 'email-template',
    name: 'Email Template',
    content:
      '<p>Dear {{name}},</p><p>Thank you for your interest. Your order ID is: {{orderId}}.</p><p>Best regards,<br>Team</p>',
  },
  {
    id: 'invoice-template',
    name: 'Invoice Template',
    content:
      '<h2>Invoice</h2><p>Invoice Number: {{invoiceNumber}}</p><p>Date: {{date}}</p><p>Amount: {{amount}}</p><p>Thank you for your business!</p>',
  },
];

// Default variables
const defaultVariables: Variable[] = [
  { key: 'client_name', label: 'Client Name', defaultValue: 'John Doe' },
  { key: 'company_address', label: 'Company Address', defaultValue: '123 Main St' },
  {
    key: 'reservation_date',
    label: 'Reservation Date',
    defaultValue: new Date().toLocaleDateString(),
  },
  { key: 'name', label: 'Name', defaultValue: 'John Doe' },
  { key: 'orderId', label: 'Order ID', defaultValue: 'ORD-12345' },
  { key: 'invoiceNumber', label: 'Invoice Number', defaultValue: 'INV-001' },
  { key: 'date', label: 'Date', defaultValue: new Date().toLocaleDateString() },
  { key: 'amount', label: 'Amount', defaultValue: '$0.00' },
];

export default function EditorWithTemplates({
  data = '',
  onChange,
  templates = defaultTemplates,
  variables = defaultVariables,
}: CKEditorWithTemplatesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const variablesButtonRef = useRef<HTMLButtonElement>(null);
  const colorPickerButtonRef = useRef<HTMLButtonElement>(null);
  const bgColorPickerButtonRef = useRef<HTMLButtonElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use the standalone extension
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Underline,
      Code,
      CodeBlock,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      Subscript,
      Superscript,
      HorizontalRule,
      HardBreak,
      Variable,
    ],
    content: data ? convertVariablesToHtml(data) : '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
      handleDOMEvents: {
        beforeinput: (view, event) => {
          // Fix for Next.js double space issue
          // Return false to let TipTap handle the input normally
          return false;
        },
      },
    },
  });

  // Update editor content when data prop changes
  useEffect(() => {
    if (editor && data !== editor.getHTML()) {
      const convertedHtml = convertVariablesToHtml(data);
      editor.commands.setContent(convertedHtml, { emitUpdate: false });
    }
  }, [data, editor]);

  // Insert template into editor
  const insertTemplate = (template: Template) => {
    if (editor) {
      const convertedHtml = convertVariablesToHtml(template.content);
      editor.commands.setContent(convertedHtml);
      setShowTemplates(false);
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    }
  };

  // Insert variable placeholder into editor
  const insertVariable = (variable: Variable) => {
    if (editor) {
      editor.commands.insertVariable({
        key: variable.key,
        label: variable.label,
      });
      setShowVariables(false);
    }
  };

  // Insert or update link
  const handleLink = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    if (editor.isActive('link')) {
      const attrs = editor.getAttributes('link');
      setLinkUrl(attrs.href || '');
      setLinkText(selectedText || '');
    } else {
      setLinkUrl('');
      setLinkText(selectedText || '');
    }

    setShowLinkDialog(true);
  };

  const applyLink = () => {
    if (!editor) return;

    const url = linkUrl.trim();
    if (!url) {
      setShowLinkDialog(false);
      return;
    }

    if (editor.isActive('link')) {
      // Update existing link
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      // Insert new link
      if (linkText.trim() && editor.state.selection.empty) {
        editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }

    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setShowLinkDialog(false);
  };

  // Color presets
  const colorPresets = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#808080',
    '#800000',
    '#008000',
    '#000080',
    '#808000',
    '#800080',
    '#008080',
    '#C0C0C0',
    '#FF8080',
    '#80FF80',
    '#8080FF',
    '#FFFF80',
  ];

  const setTextColor = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const setHighlightColor = (color: string) => {
    if (!editor) return;
    editor.chain().focus().toggleHighlight({ color }).run();
    setShowBgColorPicker(false);
  };

  // Calculate dropdown position for fixed positioning
  const getDropdownPosition = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    };
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
        setShowVariables(false);
        setShowColorPicker(false);
        setShowBgColorPicker(false);
      }
    };

    if (showTemplates || showVariables || showColorPicker || showBgColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTemplates, showVariables, showColorPicker, showBgColorPicker]);

  if (!editor) {
    return null;
  }

  return (
    <div className="ckeditor-with-templates" ref={containerRef}>
      <div className="toolbar-actions">
        <div className="toolbar-group">
          <div className="dropdown-container">
            <button
              ref={variablesButtonRef}
              type="button"
              onClick={() => {
                setShowVariables(!showVariables);
                setShowTemplates(false);
              }}
              className="toolbar-btn"
            >
              🔤 Variables
            </button>
            {showVariables && (
              <div
                className="dropdown-menu variables-dropdown"
                style={
                  // @ts-ignore
                  getDropdownPosition(variablesButtonRef)
                    ? {
                        position: 'fixed',
                        // @ts-ignore
                        top: `${getDropdownPosition(variablesButtonRef)!.top}px`,
                        // @ts-ignore
                        left: `${getDropdownPosition(variablesButtonRef)!.left}px`,
                      }
                    : undefined
                }
              >
                <div className="dropdown-header">Insert Variable</div>
                {variables.map((variable) => (
                  <button
                    key={variable.key}
                    type="button"
                    className="dropdown-item"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable.label} ({`{{${variable.key}}}`})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tiptap Toolbar */}
        <div className="tiptap-toolbar">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
            title="Inline Code"
          >
            &lt;/&gt;
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`toolbar-btn ${editor.isActive('subscript') ? 'is-active' : ''}`}
            title="Subscript"
          >
            x<sub>2</sub>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`toolbar-btn ${editor.isActive('superscript') ? 'is-active' : ''}`}
            title="Superscript"
          >
            x<sup>2</sup>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`toolbar-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
            title="Highlight"
          >
            <mark>H</mark>
          </button>

          <div className="toolbar-separator"></div>

          {/* Colors */}
          <div className="dropdown-container">
            <button
              ref={colorPickerButtonRef}
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowBgColorPicker(false);
              }}
              className={`toolbar-btn ${editor.isActive('textStyle') ? 'is-active' : ''}`}
              title="Text Color"
            >
              A
            </button>
            {showColorPicker && (
              <div
                className="dropdown-menu color-picker"
                style={
                  // @ts-ignore
                  getDropdownPosition(colorPickerButtonRef)
                    ? {
                        position: 'fixed',
                        // @ts-ignore
                        top: `${getDropdownPosition(colorPickerButtonRef)!.top}px`,
                        // @ts-ignore
                        left: `${getDropdownPosition(colorPickerButtonRef)!.left}px`,
                      }
                    : undefined
                }
              >
                <div className="dropdown-header">Text Color</div>
                <div className="color-grid">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => setTextColor(color)}
                      title={color}
                    />
                  ))}
                </div>
                <div className="color-input-group">
                  <input
                    type="color"
                    onChange={(e) => setTextColor(e.target.value)}
                    className="color-input"
                  />
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetColor().run()}
                    className="toolbar-btn"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="dropdown-container">
            <button
              ref={bgColorPickerButtonRef}
              type="button"
              onClick={() => {
                setShowBgColorPicker(!showBgColorPicker);
                setShowColorPicker(false);
              }}
              className={`toolbar-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
              title="Background Color"
            >
              <span style={{ background: '#ffff00' }}>A</span>
            </button>
            {showBgColorPicker && (
              <div
                className="dropdown-menu color-picker"
                style={
                  // @ts-ignore
                  getDropdownPosition(bgColorPickerButtonRef)
                    ? {
                        position: 'fixed',
                        // @ts-ignore
                        top: `${getDropdownPosition(bgColorPickerButtonRef)!.top}px`,
                        // @ts-ignore
                        left: `${getDropdownPosition(bgColorPickerButtonRef)!.left}px`,
                      }
                    : undefined
                }
              >
                <div className="dropdown-header">Background Color</div>
                <div className="color-grid">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => setHighlightColor(color)}
                      title={color}
                    />
                  ))}
                </div>
                <div className="color-input-group">
                  <input
                    type="color"
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="color-input"
                  />
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetHighlight().run()}
                    className="toolbar-btn"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="toolbar-separator"></div>

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}`}
            title="Heading 4"
          >
            H4
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`toolbar-btn ${editor.isActive('paragraph') ? 'is-active' : ''}`}
            title="Paragraph"
          >
            P
          </button>

          <div className="toolbar-separator"></div>

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            title="Numbered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
            title="Quote"
          >
            "
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`toolbar-btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
            title="Code Block"
          >
            {'</>'}
          </button>

          <div className="toolbar-separator"></div>

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
            title="Align Left"
          >
            ⬅
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
            title="Align Center"
          >
            ⬌
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
            title="Align Right"
          >
            ➡
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
            title="Justify"
          >
            ⬌⬌
          </button>

          <div className="toolbar-separator"></div>

          {/* Links */}
          <button
            type="button"
            onClick={handleLink}
            className={`toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
            title="Insert Link"
          >
            🔗
          </button>

          {/* Insert Elements */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="toolbar-btn"
            title="Horizontal Rule"
          >
            ─
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHardBreak().run()}
            className="toolbar-btn"
            title="Line Break"
          >
            ↵
          </button>

          <div className="toolbar-separator"></div>

          {/* History */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="toolbar-btn"
            title="Undo"
            disabled={!editor.can().undo()}
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="toolbar-btn"
            title="Redo"
            disabled={!editor.can().redo()}
          >
            ↷
          </button>
        </div>
      </div>

      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="modal-overlay" onClick={() => setShowLinkDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editor?.isActive('link') ? 'Edit Link' : 'Insert Link'}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowLinkDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>URL:</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="form-input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyLink();
                    }
                    if (e.key === 'Escape') {
                      setShowLinkDialog(false);
                    }
                  }}
                />
              </div>
              <div className="form-group">
                <label>Text (optional):</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              {editor?.isActive('link') && (
                <button type="button" className="toolbar-btn btn-danger" onClick={removeLink}>
                  Remove Link
                </button>
              )}
              <button type="button" className="toolbar-btn btn-primary" onClick={applyLink}>
                {editor?.isActive('link') ? 'Update' : 'Insert'}
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
