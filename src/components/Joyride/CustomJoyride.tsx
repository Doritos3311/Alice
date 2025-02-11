'use client';

import React, { useState, useEffect } from 'react';
import styles from './CustomJoyride.module.css';

export interface Step {
    target: string;
    content: React.ReactNode;
    placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
    title?: React.ReactNode;
    disableBeacon?: boolean;
}

export interface CustomJoyrideProps {
    steps: Step[];
    run: boolean;
    continuous?: boolean;
    showProgress?: boolean;
    showSkipButton?: boolean;
    styles?: {
        options?: {
        primaryColor?: string;
        };
    };
    callback?: (data: { status: string }) => void;
}

const CustomJoyride: React.FC<CustomJoyrideProps> = ({
  steps,
  run,
  continuous = true,
  showProgress = true,
  showSkipButton = true,
  styles,
  callback,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(run);

  useEffect(() => {
    setIsRunning(run);
  }, [run]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsRunning(false);
      callback?.({ status: 'finished' });
    }
  };

  const handleSkip = () => {
    setIsRunning(false);
    callback?.({ status: 'skipped' });
  };

  if (!isRunning) return null;

  const step = steps[currentStep];
  const targetElement = document.querySelector(step.target);

  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 9999,
    ...getPlacement(rect, step.placement),
  };

  return (
    <div style={tooltipStyle}>
      {step.title && <h3>{step.title}</h3>}
      <div>{step.content}</div>
      <div style={{ marginTop: '10px' }}>
        {showProgress && (
          <span>{`${currentStep + 1} of ${steps.length}`}</span>
        )}
        {showSkipButton && currentStep < steps.length - 1 && (
          <button onClick={handleSkip} style={{ marginLeft: '10px' }}>
            Skip
          </button>
        )}
        <button
          onClick={handleNext}
          style={{
            marginLeft: '10px',
            backgroundColor: styles?.options?.primaryColor || '#007bff',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
          }}
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

function getPlacement(rect: DOMRect, placement: Step['placement'] = 'bottom'): React.CSSProperties {
    switch (placement) {
      case 'top':
      case 'top-start':
      case 'top-end':
        return { bottom: `${window.innerHeight - rect.top + 10}px`, left: `${rect.left}px` };
      case 'left':
      case 'left-start':
      case 'left-end':
        return { top: `${rect.top}px`, right: `${window.innerWidth - rect.left + 10}px` };
      case 'right':
      case 'right-start':
      case 'right-end':
        return { top: `${rect.top}px`, left: `${rect.right + 10}px` };
      default: // bottom, bottom-start, bottom-end
        return { top: `${rect.bottom + 10}px`, left: `${rect.left}px` };
    }
  }

export default CustomJoyride;