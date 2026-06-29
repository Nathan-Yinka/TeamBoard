import type { ProjectDto } from '@teamboard/shared';
import { FormEvent, useEffect, useState } from 'react';
import { Button as RadixButton } from '@radix-ui/themes';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';

interface ProjectEditFormProps {
  project: ProjectDto | null;
  onUpdate(projectId: string, name: string, description: string, dueDate: string): Promise<void>;
  onSuccess?: () => void;
}

export function ProjectEditForm({ project, onUpdate, onSuccess }: ProjectEditFormProps): JSX.Element {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
    setDueDate(project?.dueDate ? project.dueDate.split('T')[0] : '');
  }, [project]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!project) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdate(project.id, name, description, new Date(dueDate).toISOString());
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
      <Input
        label="Project name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={!project}
        required
      />
      <Input
        type="date"
        label="Due Date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
        disabled={!project}
        required
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        disabled={!project}
      />
      <div className="flex justify-end gap-3 mt-2">
        <RadixButton size="2" type="submit" disabled={!project || isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </RadixButton>
      </div>
    </form>
  );
}
