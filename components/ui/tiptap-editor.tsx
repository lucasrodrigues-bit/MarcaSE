'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import UnderlineExtension from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import FontFamily from '@tiptap/extension-font-family'
import { Extension } from '@tiptap/core'
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  IndentIncrease, IndentDecrease,
  Undo, Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FontSizeExtension = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: element => element.style.fontSize,
          renderHTML: attributes => {
            if (!attributes.fontSize) return {}
            return { style: `font-size: ${attributes.fontSize}` }
          },
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: `${fontSize}px` }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: null }).run(),
    } as any
  },
})

const FONT_FAMILIES = [
  { label: 'Padrão', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
]

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '60', '72']

interface TiptapProps {
  content: string
  onChange?: (html: string, json: object) => void
  editable?: boolean
}

const Tiptap = ({ content, onChange, editable = true }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      TextStyle.configure(),
      Color.configure(),
      UnderlineExtension,
      FontSizeExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      FontFamily.configure(),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base min-h-[320px] p-5 focus:outline-none',
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML(), editor.getJSON())
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor) editor.setEditable(editable)
  }, [editor, editable])

  // Sync content prop after initial mount (ex: load from API)
  useEffect(() => {
    if (!editor || !content) return
    const current = editor.getHTML()
    if (content !== current) {
      editor.commands.setContent(content, false)
    }
  }, [editor, content])

  if (!editor) return null

  const Btn = ({
    onClick, active, title, disabled, children,
  }: { onClick: () => void; active?: boolean; title?: string; disabled?: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'p-1.5 rounded transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed',
        active && 'bg-primary text-primary-foreground hover:bg-primary/90',
      )}
    >
      {children}
    </button>
  )

  const Sep = () => <div className="w-px h-5 bg-border mx-0.5 shrink-0" />

  return (
    <div className={cn(!editable && 'opacity-75 pointer-events-none')}>
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/20 rounded-t-md">
          {/* Estilo de texto */}
          <Btn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Sublinhado (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </Btn>

          <Sep />

          {/* Tamanho da fonte */}
          <select
            onChange={e => {
              const v = e.target.value
              if (v) (editor.chain().focus() as any).setFontSize(v).run()
              else (editor.chain().focus() as any).unsetFontSize().run()
            }}
            className="h-7 text-xs border rounded px-1 bg-background focus:outline-none"
            title="Tamanho da fonte"
            defaultValue=""
          >
            <option value="">Tam.</option>
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Família da fonte */}
          <select
            onChange={e => {
              const v = e.target.value
              const chain = editor.chain().focus() as any
              if (v) chain.setFontFamily(v).run()
              else chain.unsetFontFamily().run()
            }}
            className="h-7 text-xs border rounded px-1 bg-background focus:outline-none max-w-[130px]"
            title="Família da fonte"
            defaultValue=""
          >
            {FONT_FAMILIES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Cor do texto */}
          <input
            type="color"
            onInput={e => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="w-7 h-7 rounded cursor-pointer border border-border p-0.5 bg-background"
            title="Cor do texto"
          />

          <Sep />

          {/* Alinhamento */}
          <Btn
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Centralizar"
          >
            <AlignCenter className="w-4 h-4" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Alinhar à direita"
          >
            <AlignRight className="w-4 h-4" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            active={editor.isActive({ textAlign: 'justify' })}
            title="Justificar"
          >
            <AlignJustify className="w-4 h-4" />
          </Btn>

          <Sep />

          {/* Listas */}
          <Btn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Lista com marcadores"
          >
            <List className="w-4 h-4" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </Btn>

          {/* Recuo */}
          <Btn
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            disabled={!editor.can().sinkListItem('listItem')}
            title="Aumentar recuo"
          >
            <IndentIncrease className="w-4 h-4" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            disabled={!editor.can().liftListItem('listItem')}
            title="Diminuir recuo"
          >
            <IndentDecrease className="w-4 h-4" />
          </Btn>

          <Sep />

          {/* Desfazer / Refazer */}
          <Btn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Refazer (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Btn>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

export default Tiptap
