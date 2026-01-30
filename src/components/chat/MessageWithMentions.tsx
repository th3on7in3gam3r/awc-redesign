import React from 'react';
import { AtSign } from 'lucide-react';

interface RenderMessageProps {
    text: string;
    onMentionClick?: (username: string) => void;
}

/**
 * Render message with highlighted @mentions
 */
export const renderMessageWithMentions = (text: string, onMentionClick?: (username: string) => void): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    const mentionRegex = /@([a-z0-9_]{3,20})/g;

    while ((match = mentionRegex.exec(text)) !== null) {
        // Add text before mention
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        // Add mention as styled element
        const username = match[1];
        parts.push(
            <span
                key={`mention-${key++}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium cursor-pointer hover:bg-indigo-100 transition-colors"
                onClick={() => onMentionClick?.(username)}
            >
                <AtSign className="w-3 h-3" />
                {username}
            </span>
        );

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
};

/**
 * Component wrapper for rendering messages with mentions
 */
export const MessageWithMentions: React.FC<RenderMessageProps> = ({ text, onMentionClick }) => {
    return <>{renderMessageWithMentions(text, onMentionClick)}</>;
};
