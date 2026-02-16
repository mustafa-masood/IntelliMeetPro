import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Questionnaire2: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<string>('');

    const roles = [
        'Individual contributor',
        'Manager',
        'Senior Leader'
    ];

    const handleNext = () => {
        if (selectedRole) {
            navigate('/signup/questionnaire-3');
        }
    };

    const handleBack = () => {
        navigate('/signup/questionnaire-1');
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
                <div className="flex flex-col gap-8 items-center text-center w-full">
                    <h1 className="font-inter-tight font-medium text-[40px] text-text-primary tracking-[-0.4px] leading-[48px] m-0">
                        What's your role?
                    </h1>
                    <div className="h-1.5 w-[52px] bg-text-primary rounded-full" />
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-3 justify-center w-full mt-8">
                    {roles.map((role) => (
                        <button
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`px-4 py-2 rounded-[20px] font-inter font-medium text-base text-white tracking-[-0.16px] transition-colors cursor-pointer ${
                                selectedRole === role
                                    ? 'bg-primary-600'
                                    : 'bg-primary-500 hover:bg-primary-600'
                            }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2 mt-8">
                    <button
                        onClick={handleBack}
                        className="bg-white border-2 border-primary-100 rounded-8 px-4 py-3 flex items-center justify-center gap-1 cursor-pointer font-inter font-medium text-sm text-primary-500 tracking-[-0.084px] hover:bg-primary-50 transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!selectedRole}
                        className="bg-primary-600 border-2 border-primary-200 rounded-8 px-4 py-3 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px] hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Questionnaire2;
