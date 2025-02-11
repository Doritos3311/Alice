declare module 'react-joyride' {
    import { ComponentType } from 'react';
  
    export interface Step {
        target: string;
        content: React.ReactNode;
        placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
        title?: React.ReactNode;
        disableBeacon?: boolean;
    }
  
    export interface Props {
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
  
    const Joyride: ComponentType<Props>;
  
    export default Joyride;
  }