import React from 'react';
import { Calendar, Book, Heart } from 'lucide-react';

interface EventTemplate {
    name: string;
    title: string;
    defaultTime: string;
    location: string;
    description: string;
    icon: React.ElementType;
}

interface EventTemplatesProps {
    onSelectTemplate: (template: Omit<EventTemplate, 'icon'>) => void;
}

export const EventTemplates: React.FC<EventTemplatesProps> = ({ onSelectTemplate }) => {
    const templates: EventTemplate[] = [
        {
            name: 'Sunday Worship',
            title: 'Sunday Morning Worship',
            defaultTime: '10:00',
            location: 'Main Sanctuary',
            description: 'Weekly worship service',
            icon: Calendar
        },
        {
            name: 'Bible Study',
            title: 'Wednesday Bible Study',
            defaultTime: '19:00',
            location: 'Fellowship Hall',
            description: 'Midweek Bible study',
            icon: Book
        },
        {
            name: 'Prayer Night',
            title: 'Prayer Night',
            defaultTime: '18:30',
            location: 'Prayer Room',
            description: 'Corporate prayer gathering',
            icon: Heart
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Events Yet</h3>
                <p className="text-sm text-slate-500">Get started by creating your first event using a template</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => {
                    const Icon = template.icon;
                    return (
                        <button
                            key={template.name}
                            onClick={() => onSelectTemplate({
                                name: template.name,
                                title: template.title,
                                defaultTime: template.defaultTime,
                                location: template.location,
                                description: template.description
                            })}
                            className="group p-6 border-2 border-slate-100 rounded-2xl hover:border-church-gold hover:bg-amber-50/50 transition-all text-left"
                        >
                            <div className="w-12 h-12 bg-slate-50 group-hover:bg-church-gold/10 rounded-xl flex items-center justify-center mb-4 transition-colors">
                                <Icon className="w-6 h-6 text-slate-400 group-hover:text-church-gold transition-colors" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">{template.name}</h4>
                            <p className="text-xs text-slate-500">{template.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
