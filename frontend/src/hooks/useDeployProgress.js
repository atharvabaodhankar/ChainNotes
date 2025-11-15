import { useState, useCallback } from 'react';

export const useDeployProgress = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const start = useCallback(() => {
    setIsOpen(true);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  const complete = useCallback(() => {
    // Will be called after success animation
    setTimeout(() => {
      reset();
    }, 100);
  }, [reset]);

  return {
    isOpen,
    currentStep,
    start,
    nextStep,
    reset,
    complete
  };
};
