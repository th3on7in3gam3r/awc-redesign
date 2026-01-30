import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProgressIndicator } from './ProgressIndicator';
import { WelcomeStep } from './WelcomeStep';
import { MinistryInterestsStep } from './MinistryInterestsStep';
import { FamilyInfoStep } from './FamilyInfoStep';
import { PreferencesStep } from './PreferencesStep';
import { MediaConsentStep } from './MediaConsentStep';
import { TourStep } from './TourStep';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    // Track if family step is needed
    const [needsFamilyStep, setNeedsFamilyStep] = useState(false);

    useEffect(() => {
        // Fetch current onboarding status
        if (isOpen) {
            fetchOnboardingStatus();
        }
    }, [isOpen]);

    const fetchOnboardingStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/onboarding/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setCurrentStep(data.current_step || 1);

            // Check if we should restore needsFamilyStep from saved interests
            // (Simplified: relies on re-evaluating when interests are submitted)
        } catch (err) {
            console.error('Error fetching onboarding status:', err);
        }
    };

    const saveStepData = async (stepData: any) => {
        setFormData(prev => ({ ...prev, ...stepData }));
        const token = localStorage.getItem('token');

        // Check for special logic
        let nextStep = currentStep + 1;

        if (currentStep === 2 && stepData.ministry_interests) {
            // Check if family step is relevant
            const kidInterests = ['children', 'youth', 'teen', 'awana']; // Add relevant IDs
            const hasKidInterest = stepData.ministry_interests.some((id: string) => kidInterests.includes(id));
            setNeedsFamilyStep(hasKidInterest);
            if (!hasKidInterest) {
                // Skip Family Info step if not relevant
                // Wait, if we assume Family Info is step 3...
                // If we skip, we go to step 4?
                // Complication: The backend stores "current_step". If we skip, backend might expect 3.
                // Let's keep it simple: We simply don't show step 3 UI but tell backend we are at 4?
                // Or better: Step 3 is "Family Info", we just auto-advance if not needed?
                // Let's implement auto-advance logic in the UI rendering or here.
                if (!hasKidInterest) nextStep = 4;
            }
        }

        // Special handling for Family Data (Step 3) - Custom endpoint
        if (currentStep === 3 && stepData.children) {
            try {
                await fetch('/api/onboarding/family', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(stepData)
                });
            } catch (err) {
                console.error('Failed to save family info', err);
            }
        } else {
            // Regular Profile Update - ONLY if relevant fields exist
            const profileFields = ['phone', 'birthday', 'address', 'profile_photo_url', 'ministry_interests', 'email_notifications', 'sms_notifications'];
            const hasProfileData = Object.keys(stepData).some(key => profileFields.includes(key));

            if (hasProfileData) {
                try {
                    await fetch('/api/user/profile', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(stepData)
                    });
                } catch (err) {
                    console.error('Error saving profile data:', err);
                }
            }
        }

        // Update step progress
        if (nextStep <= 6) {
            try {
                await fetch('/api/onboarding/step', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ step: nextStep })
                });
                setCurrentStep(nextStep);
            } catch (err) {
                console.error('Error updating step:', err);
            }
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onComplete();
        } catch (err) {
            console.error('Error completing onboarding:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            let prevStep = currentStep - 1;
            // logic to skip back over family step if wasn't shown?
            // checking needsFamilyStep might be tricky if state lost on refresh. 
            // For now simple decrement.
            if (prevStep === 3 && !needsFamilyStep) prevStep = 2;
            setCurrentStep(prevStep);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    {/* Progress Indicator - Total steps increased to 6? let's say 5 visual steps + welcome */}
                    <ProgressIndicator currentStep={currentStep} totalSteps={6} />

                    {/* Step Content */}
                    <div className="mt-8">
                        {currentStep === 1 && (
                            <WelcomeStep
                                onNext={saveStepData}
                                initialData={formData}
                            />
                        )}
                        {currentStep === 2 && (
                            <MinistryInterestsStep
                                onNext={saveStepData}
                                onBack={handleBack}
                                initialData={formData}
                            />
                        )}
                        {currentStep === 3 && (
                            <FamilyInfoStep
                                onNext={saveStepData}
                                onBack={handleBack}
                                initialData={formData}
                            />
                        )}
                        {currentStep === 4 && (
                            <PreferencesStep
                                onNext={saveStepData}
                                onBack={handleBack}
                                initialData={formData}
                            />
                        )}
                        {currentStep === 5 && (
                            <MediaConsentStep
                                onNext={saveStepData}
                                onBack={handleBack}
                                initialData={formData}
                            />
                        )}
                        {currentStep === 6 && (
                            <TourStep
                                onComplete={handleComplete}
                                onBack={handleBack}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
