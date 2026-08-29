import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Printer, ChevronDown } from 'lucide-react';

interface ExportMenuProps {
    onExportCSV: () => void;
    onPrint: () => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ onExportCSV, onPrint }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
            >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 animate-fade-in">
                    <button
                        onClick={() => {
                            onExportCSV();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Export as CSV</span>
                    </button>
                    <button
                        onClick={() => {
                            onPrint();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-t border-slate-50"
                    >
                        <Printer className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Print</span>
                    </button>
                </div>
            )}
        </div>
    );
};
