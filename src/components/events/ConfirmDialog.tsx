import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const variantColors = {
        danger: {
            icon: 'bg-rose-100 text-rose-600',
            button: 'bg-rose-600 hover:bg-rose-700 text-white'
        },
        warning: {
            icon: 'bg-amber-100 text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700 text-white'
        }
    };

    const colors = variantColors[variant];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                                <p className="text-sm text-slate-600 mt-2">{message}</p>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 flex gap-3">
                    <Button
                        onClick={onCancel}
                        className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-none"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={`flex-1 ${colors.button}`}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};
