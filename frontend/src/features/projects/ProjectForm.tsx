import { FormEvent, useState } from 'react';
import { Button as RadixButton } from '@radix-ui/themes';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';

interface ProjectFormProps {
  onCreate(name: string, description: string, dueDate: string): Promise<void>;
  onSuccess?: () => void;
}

export function ProjectForm({ onCreate, onSuccess }: ProjectFormProps): JSX.Element {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onCreate(name, description, new Date(dueDate).toISOString());
      setName('');
      setDescription('');
      setDueDate('');
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
      <Input label="Project name" value={name} onChange={(event) => setName(event.target.value)} required />
      <Input type="date" label="Due Date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
      <Textarea
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
      />
      <div className="flex justify-end gap-3 mt-2">
        <RadixButton size="2" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </RadixButton>
      </div>
    </form>
  );
}
