import React from 'react';
import Layout from '../components/Layout';
import { OnboardingOrchestrator } from '../components/onboarding/OnboardingOrchestrator';

const Onboarding: React.FC = () => {
  return (
    <Layout showSideNav={false}>
      <OnboardingOrchestrator />
    </Layout>
  );
};

export default Onboarding; 