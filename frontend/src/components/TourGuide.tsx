import { useState } from 'react';
// @ts-ignore
import { Joyride, STATUS, Step } from 'react-joyride';

interface TourGuideProps {
  run: boolean;
  onFinish: () => void;
}

export function TourGuide({ run, onFinish }: TourGuideProps) {
  const [steps] = useState<Step[]>([
    {
      target: '.tour-step-1',
      content: 'Welcome to TeamBoard! Start by selecting an existing project or creating a new one here.',
      placement: 'right'
    },
    {
      target: '.tour-step-2',
      content: 'Use this bar to quickly search for tasks or filter them by status, priority, and due dates.',
      placement: 'bottom'
    },
    {
      target: '.tour-step-3',
      content: "This is your Kanban board. It gives you a bird's-eye view of everything happening in the project.",
      placement: 'center'
    },
    {
      target: '.tour-step-4',
      content: 'Click here to create a new task and add it to your workflow.',
      placement: 'left'
    },
    {
      target: '.tour-step-5',
      content: 'Need to see what changed? The Audit Trail keeps a permanent record of all actions.',
      placement: 'left'
    }
  ]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onFinish();
    }
  };

  const JoyrideComponent = Joyride as any;

  return (
    <JoyrideComponent
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#0f766e', // teal-700
          textColor: '#334155', // slate-700
          backgroundColor: '#ffffff'
        }
      }}
    />
  );
}
