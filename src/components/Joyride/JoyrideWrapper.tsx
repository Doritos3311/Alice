'use client';

import React from 'react';
import CustomJoyride, { CustomJoyrideProps, Step as CustomStep } from './CustomJoyride';
import { Props as JoyrideProps, Step as JoyrideStep } from 'react-joyride';

const JoyrideWrapper: React.FC<JoyrideProps> = (props) => {
  // Convertir los pasos de JoyrideStep a CustomStep
  const convertedSteps: CustomStep[] = props.steps.map((step: JoyrideStep) => ({
    ...step,
    placement: step.placement as CustomStep['placement'],
  }));

  // Convertir las props de JoyrideProps a CustomJoyrideProps
  const customProps: CustomJoyrideProps = {
    ...props,
    steps: convertedSteps,
  };

  return <CustomJoyride {...customProps} />;
};

export default JoyrideWrapper;