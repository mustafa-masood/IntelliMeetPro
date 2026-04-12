import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Questionnaire3: React.FC = () => {
    const navigate = useNavigate();
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const helpOptions = [
        'Generate action items',
        'Replace manual note-taking',
        'Capture meetings so I can skip them',
        'Transcribe audio for interviews',
        'Extract insights from multiple meetings',
        'Draft follow-up emails',
        'Increase meeting transparency by sharing notes',
        'Other'
    ];

    const toggleOption = (option: string) => {
        setSelectedOptions(prev =>
            prev.includes(option)
                ? prev.filter(o => o !== option)
                : [...prev, option]
        );
    };

    const handleNext = () => {
        if (selectedOptions.length > 0) {
            navigate('/signup/pricing');
        }
    };

    const handleBack = () => {
        navigate('/signup/questionnaire-2');
    };

    return (
        <div className="flex w-screen h-screen bg-bg-surface-pure items-center justify-center">
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
                <div className="flex flex-col gap-5 items-center text-center w-full">
                    <h1 className="font-inter-tight font-medium text-[40px] text-text-primary tracking-[-0.4px] leading-[48px] m-0">
                        How would you like IntelliMeet to help you?
                    </h1>
                    <p className="font-inter font-medium text-base text-text-primary opacity-70 tracking-[-0.176px] m-0">
                        Select all that apply
                    </p>
                    <div className="h-1.5 w-[52px] bg-text-primary rounded-full" />
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-3 justify-center w-full mt-8">
                    {helpOptions.map((option) => {
                        const isSelected = selectedOptions.includes(option);

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => toggleOption(option)}
                                className={`px-4 py-2 rounded-[20px] font-inter font-medium text-base tracking-[-0.16px] border transition-all duration-200 ${
                                    isSelected
                                        ? 'bg-primary-100 text-primary-700 border-primary-600 ring-2 ring-primary-300'
                                        : 'bg-primary-500 text-white border-primary-200 hover:bg-primary-600'
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2 mt-8">
                    <button
                        onClick={handleBack}
                        className="bg-white border-2 border-primary-100 rounded-8 px-4 py-3 flex items-center justify-center gap-1 cursor-pointer font-inter font-medium text-sm text-primary-500 tracking-[-0.084px] hover:bg-primary-50 transition-all hover:opacity-90 active:opacity-80"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Back
                    </button>

                    {selectedOptions.length > 0 && (
                        <button
                            onClick={handleNext}
                            className="bg-white border-2 border-primary-100 rounded-8 px-4 py-3 flex items-center justify-center gap-1 cursor-pointer font-inter font-medium text-sm text-primary-500 tracking-[-0.084px] hover:bg-primary-50 transition-all hover:opacity-90 active:opacity-80"
                        >
                            Next
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M9 6L15 12L9 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Questionnaire3;
