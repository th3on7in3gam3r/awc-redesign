import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChatComposerProps {
    onSend: (text: string, file?: { url: string; type: string }) => void;
    disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({ onSend, disabled }) => {
    const [text, setText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [fileAttachment, setFileAttachment] = useState<{ url: string; type: string; name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!text.trim() && !fileAttachment) return;

        onSend(text, fileAttachment ? { url: fileAttachment.url, type: fileAttachment.type } : undefined);
        setText('');
        setFileAttachment(null);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setFileAttachment({
                    url: data.url,
                    type: data.type,
                    name: data.originalName
                });
            } else {
                alert('File upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-4 bg-white border-t border-gray-200">
            {fileAttachment && (
                <div className="mb-3 flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                        {fileAttachment.type.startsWith('image/') ? (
                            <img src={fileAttachment.url} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                            <FileText className="w-5 h-5 text-gray-500" />
                        )}
                    </div>
                    <div className="text-xs">
                        <p className="font-medium text-gray-700 max-w-[150px] truncate">{fileAttachment.name}</p>
                        <p className="text-gray-400">Ready to send</p>
                    </div>
                    <button
                        onClick={() => setFileAttachment(null)}
                        className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex gap-2 items-end">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                    title="Attach file"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isUploading ? "Uploading..." : "Type a message..."}
                    rows={1}
                    disabled={disabled || isUploading}
                    className="flex-1 resize-none border-0 bg-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all max-h-32"
                    style={{ minHeight: '48px' }}
                />
                <Button
                    onClick={handleSend}
                    disabled={disabled || isUploading || (!text.trim() && !fileAttachment)}
                    className="rounded-xl px-4 bg-amber-600 hover:bg-amber-700 text-white h-[48px]"
                >
                    <Send className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};
