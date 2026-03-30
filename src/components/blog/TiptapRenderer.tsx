'use client';

import React from 'react';

interface TiptapRendererProps {
    content: any; // Tiptap JSON content
}

export default function TiptapRenderer({ content }: TiptapRendererProps) {
    if (!content || !content.content) {
        return null;
    }

    const renderNode = (node: any, index: number): React.ReactNode => {
        switch (node.type) {
            case 'paragraph':
                return (
                    <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                        {node.content?.map((child: any, i: number) => renderInline(child, i))}
                    </p>
                );

            case 'heading':
                const level = node.attrs?.level || 2;
                const headingClasses: Record<number, string> = {
                    1: 'text-4xl font-bold text-gray-900 mb-6 mt-12',
                    2: 'text-3xl font-bold text-gray-900 mb-4 mt-10',
                    3: 'text-2xl font-bold text-gray-900 mb-3 mt-8',
                    4: 'text-xl font-bold text-gray-900 mb-2 mt-6',
                    5: 'text-lg font-bold text-gray-900 mb-2 mt-4',
                    6: 'text-base font-bold text-gray-900 mb-2 mt-4'
                };
                const HeadingComponent = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : level === 4 ? 'h4' : level === 5 ? 'h5' : 'h6';
                return React.createElement(
                    HeadingComponent,
                    { key: index, className: headingClasses[level] || headingClasses[2] },
                    node.content?.map((child: any, i: number) => renderInline(child, i))
                );

            case 'bulletList':
                return (
                    <ul key={index} className="list-disc list-inside mb-6 space-y-2 text-gray-700">
                        {node.content?.map((child: any, i: number) => renderNode(child, i))}
                    </ul>
                );

            case 'orderedList':
                return (
                    <ol key={index} className="list-decimal list-inside mb-6 space-y-2 text-gray-700">
                        {node.content?.map((child: any, i: number) => renderNode(child, i))}
                    </ol>
                );

            case 'listItem':
                return (
                    <li key={index} className="ml-4">
                        {node.content?.map((child: any, i: number) => {
                            if (child.type === 'paragraph') {
                                return (
                                    <span key={i}>
                                        {child.content?.map((inline: any, j: number) => renderInline(inline, j))}
                                    </span>
                                );
                            }
                            return renderNode(child, i);
                        })}
                    </li>
                );

            case 'blockquote':
                return (
                    <blockquote key={index} className="border-l-4 border-gray-300 pl-6 my-6 italic text-gray-600">
                        {node.content?.map((child: any, i: number) => renderNode(child, i))}
                    </blockquote>
                );

            case 'codeBlock':
                return (
                    <pre key={index} className="bg-gray-900 text-gray-100 rounded-xl p-6 mb-6 overflow-x-auto">
                        <code>
                            {node.content?.map((child: any) => child.text).join('') || ''}
                        </code>
                    </pre>
                );

            case 'horizontalRule':
                return <hr key={index} className="my-8 border-gray-300" />;

            case 'hardBreak':
                return <br key={index} />;

            case 'image':
                return (
                    <figure key={index} className="my-8">
                        <img
                            src={node.attrs?.src}
                            alt={node.attrs?.alt || ''}
                            title={node.attrs?.title}
                            className="rounded-xl w-full"
                        />
                        {node.attrs?.title && (
                            <figcaption className="text-center text-sm text-gray-600 mt-2">
                                {node.attrs.title}
                            </figcaption>
                        )}
                    </figure>
                );

            case 'table':
                return (
                    <div key={index} className="my-8 overflow-x-auto">
                        <table className="min-w-full border-2 border-gray-300 rounded-lg overflow-hidden">
                            <thead className="bg-gray-900 text-white">
                                <tr>
                                    {node.content?.headers?.map((header: string, i: number) => (
                                        <th key={i} className="px-6 py-3 text-left text-sm font-semibold border-r border-gray-700 last:border-r-0">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {node.content?.rows?.map((row: string[], rowIndex: number) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50">
                                        {row.map((cell: string, cellIndex: number) => (
                                            <td key={cellIndex} className="px-6 py-4 text-sm text-gray-700 border-r border-gray-200 last:border-r-0">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'chart':
                const chartData = node.content;
                if (chartData?.type === 'bar') {
                    return (
                        <div key={index} className="my-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                                {chartData.title}
                            </h4>
                            <div className="space-y-4">
                                {chartData.data?.map((item: any, i: number) => {
                                    const maxValue = Math.max(...chartData.data.map((d: any) => Math.max(d.original, d.optimized)));
                                    const originalWidth = (item.original / maxValue) * 100;
                                    const optimizedWidth = (item.optimized / maxValue) * 100;
                                    
                                    return (
                                        <div key={i} className="space-y-2">
                                            <div className="text-sm font-medium text-gray-700">{item.label}</div>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs text-gray-500 w-20">Original:</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                                    <div 
                                                        className="bg-red-500 h-full rounded-full flex items-center justify-end px-3 text-white text-xs font-semibold transition-all duration-500"
                                                        style={{ width: `${originalWidth}%` }}
                                                    >
                                                        {item.original}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs text-gray-500 w-20">Optimized:</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                                    <div 
                                                        className="bg-green-500 h-full rounded-full flex items-center justify-end px-3 text-white text-xs font-semibold transition-all duration-500"
                                                        style={{ width: `${optimizedWidth}%` }}
                                                    >
                                                        {item.optimized}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 flex justify-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                    <span className="text-gray-600">Original</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span className="text-gray-600">Optimized</span>
                                </div>
                            </div>
                        </div>
                    );
                }
                return null;

            default:
                return null;
        }
    };

    const renderInline = (node: any, index: number): React.ReactNode => {
        if (node.type === 'text') {
            let text: React.ReactNode = node.text;

            // Apply marks
            if (node.marks) {
                node.marks.forEach((mark: any) => {
                    switch (mark.type) {
                        case 'bold':
                            text = <strong key={`bold-${index}`}>{text}</strong>;
                            break;
                        case 'italic':
                            text = <em key={`italic-${index}`}>{text}</em>;
                            break;
                        case 'underline':
                            text = <u key={`underline-${index}`}>{text}</u>;
                            break;
                        case 'strike':
                            text = <s key={`strike-${index}`}>{text}</s>;
                            break;
                        case 'code':
                            text = (
                                <code key={`code-${index}`} className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono">
                                    {text}
                                </code>
                            );
                            break;
                        case 'link':
                            text = (
                                <a
                                    key={`link-${index}`}
                                    href={mark.attrs?.href}
                                    target={mark.attrs?.target}
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    {text}
                                </a>
                            );
                            break;
                        case 'highlight':
                            text = (
                                <mark key={`highlight-${index}`} className="bg-yellow-200 px-1">
                                    {text}
                                </mark>
                            );
                            break;
                    }
                });
            }

            return <React.Fragment key={index}>{text}</React.Fragment>;
        }

        return renderNode(node, index);
    };

    return (
        <div className="tiptap-content">
            {content.content.map((node: any, index: number) => renderNode(node, index))}
        </div>
    );
}
