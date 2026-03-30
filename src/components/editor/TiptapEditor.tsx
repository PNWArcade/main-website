'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Minus,
    Table as TableIcon,
} from 'lucide-react'

interface TiptapEditorProps {
    content: string // JSON string
    onChange: (content: string) => void
    placeholder?: string
    editable?: boolean
    className?: string
    minHeight?: number
}

export default function TiptapEditor({
    content,
    onChange,
    placeholder = 'Start writing...',
    editable = true,
    className,
    minHeight = 200,
}: TiptapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 px-3 py-2',
                },
            }),
        ],
        content: content ? JSON.parse(content) : undefined,
        editable,
        onUpdate: ({ editor }) => {
            onChange(JSON.stringify(editor.getJSON()))
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-full p-4',
            },
        },
    })

    // Update content when prop changes
    useEffect(() => {
        if (editor && content) {
            const currentContent = JSON.stringify(editor.getJSON())
            if (currentContent !== content) {
                editor.commands.setContent(JSON.parse(content))
            }
        }
    }, [content, editor])

    const imageInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleImageUpload = useCallback(async (file: File) => {
        if (!editor) return
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'editor')

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()
            if (response.ok && data.url) {
                editor.chain().focus().setImage({ src: data.url }).run()
            }
        } catch (error) {
            console.error('Image upload failed:', error)
        } finally {
            setIsUploading(false)
        }
    }, [editor])

    const addImage = useCallback(() => {
        imageInputRef.current?.click()
    }, [])

    const setLink = useCallback(() => {
        if (!editor) return

        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('Enter URL', previousUrl)

        if (url === null) return

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    if (!editor) return null

    const ToolButton = ({
        onClick,
        isActive,
        children,
        title,
    }: {
        onClick: () => void
        isActive?: boolean
        children: React.ReactNode
        title: string
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                'p-2 rounded hover:bg-gray-100 transition-colors',
                isActive && 'bg-gray-200 text-blue-600'
            )}
        >
            {children}
        </button>
    )

    return (
        <div className={cn('border border-gray-300 rounded-lg overflow-hidden', className)}>
            {/* Toolbar */}
            {editable && (
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        title="Inline Code"
                    >
                        <Code className="w-4 h-4" />
                    </ToolButton>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <ToolButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </ToolButton>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <ToolButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Horizontal Rule"
                    >
                        <Minus className="w-4 h-4" />
                    </ToolButton>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <ToolButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        title="Add Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton onClick={addImage} title="Add Image">
                        <ImageIcon className="w-4 h-4" />
                    </ToolButton>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Table Controls */}
                    <ToolButton
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        title="Insert Table"
                    >
                        <TableIcon className="w-4 h-4" />
                    </ToolButton>
                    {editor.isActive('table') && (
                        <>
                            <ToolButton
                                onClick={() => editor.chain().focus().addColumnAfter().run()}
                                title="Add Column"
                            >
                                <span className="text-xs font-medium">+Col</span>
                            </ToolButton>
                            <ToolButton
                                onClick={() => editor.chain().focus().addRowAfter().run()}
                                title="Add Row"
                            >
                                <span className="text-xs font-medium">+Row</span>
                            </ToolButton>
                            <ToolButton
                                onClick={() => editor.chain().focus().deleteColumn().run()}
                                title="Delete Column"
                            >
                                <span className="text-xs font-medium">-Col</span>
                            </ToolButton>
                            <ToolButton
                                onClick={() => editor.chain().focus().deleteRow().run()}
                                title="Delete Row"
                            >
                                <span className="text-xs font-medium">-Row</span>
                            </ToolButton>
                            <ToolButton
                                onClick={() => editor.chain().focus().deleteTable().run()}
                                title="Delete Table"
                            >
                                <span className="text-xs font-medium text-red-500">Del</span>
                            </ToolButton>
                        </>
                    )}

                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                handleImageUpload(file)
                                e.target.value = ''
                            }
                        }}
                    />

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <ToolButton
                        onClick={() => editor.chain().focus().undo().run()}
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().redo().run()}
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </ToolButton>
                </div>
            )}

            {/* Editor Content */}
            <div style={{ minHeight: `${minHeight}px` }}>
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
