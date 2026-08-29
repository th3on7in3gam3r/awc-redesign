import React from 'react';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-2">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step < currentStep
                                        ? 'bg-green-500 text-white'
                                        : step === currentStep
                                            ? 'bg-church-gold text-white'
                                            : 'bg-slate-200 text-slate-400'
                                    }`}
                            >
                                {step < currentStep ? '✓' : step}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${step === currentStep ? 'text-church-gold' : 'text-slate-400'}`}>
                                {step === 1 && 'Welcome'}
                                {step === 2 && 'Interests'}
                                {step === 3 && 'Preferences'}
                                {step === 4 && 'Tour'}
                            </span>
                        </div>
                        {step < totalSteps && (
                            <div
                                className={`h-1 flex-1 mx-2 transition-all ${step < currentStep ? 'bg-green-500' : 'bg-slate-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
