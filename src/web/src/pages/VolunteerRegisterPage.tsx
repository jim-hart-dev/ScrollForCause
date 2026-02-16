import { SignUp, useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from '../components/onboarding/StepIndicator';
import ProfileStep from '../components/onboarding/ProfileStep';
import InterestsStep from '../components/onboarding/InterestsStep';
import { useRegisterVolunteer } from '../hooks/useRegisterVolunteer';

type PostSignupStep = 'profile' | 'interests';

export default function VolunteerRegisterPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const registerMutation = useRegisterVolunteer();
  const [postSignupStep, setPostSignupStep] = useState<PostSignupStep>('profile');
  const [profileData, setProfileData] = useState<{
    displayName: string;
    city: string;
    state: string;
  } | null>(null);

  // Derive the current step from auth state and post-signup progress
  const step = !isSignedIn ? 'signup' : postSignupStep;
  const stepNumber = step === 'signup' ? 1 : step === 'profile' ? 2 : 3;

  const handleProfileSubmit = (data: { displayName: string; city: string; state: string }) => {
    setProfileData(data);
    setPostSignupStep('interests');
  };

  const submitRegistration = async (categoryIds: string[]) => {
    if (!profileData) return;

    await registerMutation.mutateAsync({
      displayName: profileData.displayName,
      city: profileData.city,
      state: profileData.state,
      categoryIds,
    });

    navigate('/', { replace: true });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-coral border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-cream px-4 pt-12 pb-8">
      <StepIndicator currentStep={stepNumber} />

      <div className="w-full max-w-md">
        {step === 'signup' && (
          <SignUp
            routing="path"
            path="/register/volunteer"
            signInUrl="/login"
            forceRedirectUrl="/register/volunteer"
          />
        )}

        {step === 'profile' && <ProfileStep onSubmit={handleProfileSubmit} />}

        {step === 'interests' && (
          <InterestsStep
            onSubmit={submitRegistration}
            onSkip={() => submitRegistration([])}
            isSubmitting={registerMutation.isPending}
          />
        )}

        {registerMutation.isError && (
          <p className="mt-4 text-center text-sm text-red-500 font-body">
            {registerMutation.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
