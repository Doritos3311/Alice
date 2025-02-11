import React, { useState, useEffect, useRef } from 'react';
import styles from './CustomJoyride.module.css';
import { useTheme } from "next-themes"

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
  styles: joyrideStyles,
  callback,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(run);
  const tooltipRef = useRef<HTMLDivElement>(null); // Referencia para el tooltip

  const { theme } = useTheme()

  useEffect(() => {
    setIsRunning(run);
  }, [run]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Avanzar al siguiente paso
      setCurrentStep(currentStep + 1);
    } else {
      // Reiniciar el tour
      setIsRunning(false); // Detener el tour temporalmente
      setCurrentStep(0); // Reiniciar al primer paso
      callback?.({ status: 'finished' }); // Ejecutar el callback si existe
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

  // Obtener las dimensiones del tooltip
  const tooltipWidth = tooltipRef.current?.offsetWidth || 0;
  const tooltipHeight = tooltipRef.current?.offsetHeight || 0;

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    ...getPlacement(rect, step.placement, tooltipWidth, tooltipHeight),
  };

  // Estilo para el resaltado
  const highlightStyle: React.CSSProperties = {
    position: 'absolute',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    borderRadius: '8px',
    boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.7)`,
    zIndex: 9999,
  };

  return (
    <>
      {/* Overlay oscuro */}
      <div className={styles.overlay} />

      {/* Resaltado del componente */}
      <div style={highlightStyle} className={styles.highlight} />

      {/* Tooltip */}
      <div ref={tooltipRef} style={tooltipStyle} className={`${styles.tooltip} ${theme === "light" ? styles.tooltipLight : styles.tooltipDark}`}>
        {step.title && <h3 className={styles.tooltipTitle}>{step.title}</h3>}
        <div className={styles.tooltipContent}>{step.content}</div>

        <div className={styles.footerContent} style={{ marginTop: '10px' }}>
          {showProgress && (
            <span className={styles.pagina}>{`${currentStep + 1} of ${steps.length}`}</span>
          )}
          <div>
            {showSkipButton && currentStep < steps.length - 1 && (
              <button onClick={handleSkip} className={styles.buttonBack}>
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              className={`${styles.buttonNext} ${theme === "light" ? styles.buttonNextLight : styles.buttonNextDark}`}
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

function getPlacement(
  rect: DOMRect,
  placement: Step['placement'] = 'bottom',
  tooltipWidth: number,
  tooltipHeight: number
): React.CSSProperties {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const margin = 10; // Margen de seguridad

  switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
      if (rect.top - tooltipHeight - margin < 0) {
        // No cabe arriba, mostrarlo abajo
        return { top: `${rect.bottom + margin}px`, left: `${rect.left}px` };
      }
      return { bottom: `${viewportHeight - rect.top + margin}px`, left: `${rect.left}px` };

    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      if (rect.bottom + tooltipHeight + margin > viewportHeight) {
        // No cabe abajo, mostrarlo arriba
        return { bottom: `${viewportHeight - rect.top + margin}px`, left: `${rect.left}px` };
      }
      return { top: `${rect.bottom + margin}px`, left: `${rect.left}px` };

    case 'left':
    case 'left-start':
    case 'left-end':
      if (rect.left - tooltipWidth - margin < 0) {
        // No cabe a la izquierda, mostrarlo a la derecha
        return { top: `${rect.top}px`, left: `${rect.right + margin}px` };
      }
      return { top: `${rect.top}px`, right: `${viewportWidth - rect.left + margin}px` };

    case 'right':
    case 'right-start':
    case 'right-end':
      if (rect.right + tooltipWidth + margin > viewportWidth) {
        // No cabe a la derecha, mostrarlo a la izquierda
        return { top: `${rect.top}px`, right: `${viewportWidth - rect.left + margin}px` };
      }
      return { top: `${rect.top}px`, left: `${rect.right + margin}px` };

    default:
      return { top: `${rect.bottom + margin}px`, left: `${rect.left}px` };
  }
}

export default CustomJoyride;