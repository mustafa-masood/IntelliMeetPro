import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Questionnaire1: React.FC = () => {
    const navigate = useNavigate();
    const [selectedWork, setSelectedWork] = useState<string>('');

    const workTypes = [
        'Sales',
        'Consulting',
        'Marketing/PR',
        'HR/People',
        'Engineering',
        'Customer Support',
        'IT',
        'Communications',
        'Operations',
        'Legal',
        'Healthcare',
        'Research',
        'Finance',
        'Product',
        'Student/Education',
        'Other'
    ];

    const handleNext = () => {
        if (selectedWork) {
            navigate('/onboarding/questionnaire-2');
        }
    };

    return (
        <div className="flex min-h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-auto bg-bg-surface-pure items-center justify-center p-6">
            <div className="w-full max-w-[800px] flex flex-col gap-6 items-center p-6">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <img
                        src="/src/assets/intellimeet-logo-dark.png"
                        alt="IntelliMeet Logo"
                        className="w-[100px] h-[100px] rounded-8 object-contain"
                    />
                </div>

                {/* Title */}
                <div className="flex flex-col gap-8 items-center text-center w-full">
                    <h1 className="font-inter-tight font-medium text-[40px] text-text-primary tracking-[-0.4px] leading-[48px] m-0">
                        What best describes your work?
                    </h1>
                    <div className="h-1.5 w-[52px] bg-text-primary rounded-full" />
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-3 justify-center w-full mt-8">
                    {workTypes.map((work) => (
                        <button
                            key={work}
                            type="button"
                            onClick={() => setSelectedWork(work)}
                            className={`px-4 py-2 rounded-[20px] font-inter font-medium text-base text-white tracking-[-0.16px] transition-colors cursor-pointer ${
                                selectedWork === work
                                    ? 'bg-primary-600'
                                    : 'bg-primary-500 hover:bg-primary-600'
                            }`}
                        >
                            {work}
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={!selectedWork}
                    className="mt-8 bg-primary-600 border-2 border-primary-200 rounded-8 px-4 py-3 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px] hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Questionnaire1;
