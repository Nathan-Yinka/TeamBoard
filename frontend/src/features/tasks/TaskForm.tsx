import type { TaskPriority } from '@teamboard/shared';
import { FormEvent, useState } from 'react';
import { Button as RadixButton } from '@radix-ui/themes';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';

const TASK_PRIORITY_OPTIONS: readonly { value: TaskPriority; label: string }[] = [
  { value: 'low' as TaskPriority, label: 'Low' },
  { value: 'medium' as TaskPriority, label: 'Medium' },
  { value: 'high' as TaskPriority, label: 'High' }
];
const DEFAULT_PRIORITY = 'medium' as TaskPriority;

interface TaskFormProps {
  disabled: boolean;
  onCreate(title: string, description: string, priority: TaskPriority, dueDate: string): Promise<void>;
  onSuccess?: () => void;
}

export function TaskForm({ disabled, onCreate, onSuccess }: TaskFormProps): JSX.Element {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_PRIORITY);
  const [dueDate, setDueDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onCreate(title, description, priority, dueDate);
      setTitle('');
      setDescription('');
      setPriority(DEFAULT_PRIORITY);
      setDueDate('');
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
      <Input
        label="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={disabled}
        required
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        disabled={disabled}
      />
      <label className="flex flex-col gap-1.5 text-slate-700 text-sm font-semibold">
        <span>Priority</span>
        <select 
          className="w-full border border-slate-300 rounded-md bg-white text-slate-900 px-3 py-2 disabled:opacity-60" 
          value={priority} 
          onChange={(event) => setPriority(event.target.value as TaskPriority)} 
          disabled={disabled}
        >
          {TASK_PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="Due date"
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
        disabled={disabled}
      />
      <div className="flex justify-end gap-3 mt-2">
        <RadixButton size="2" type="submit" disabled={disabled || isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </RadixButton>
      </div>
    </form>
  );
}
