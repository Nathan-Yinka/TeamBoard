import type { TaskDto, TaskPriority, TaskStatus } from '@teamboard/shared';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ApiErrorDisplay } from '../../components/ui/ApiErrorDisplay';

interface TaskListProps {
  tasks: TaskDto[];
  onUpdate(taskId: string, payload: EditableTaskPayload): Promise<void>;
  onUpdateStatus(taskId: string, status: TaskStatus): Promise<void>;
  onDelete(taskId: string): Promise<void>;
  onLoadMore(): void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  statusCounts?: Record<string, number>;
}

export interface EditableTaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

const TASK_STATUS_OPTIONS: readonly { value: TaskStatus; label: string }[] = [
  { value: 'todo' as TaskStatus, label: 'Todo' },
  { value: 'in_progress' as TaskStatus, label: 'In Progress' },
  { value: 'done' as TaskStatus, label: 'Done' }
];

const TASK_PRIORITY_OPTIONS: readonly { value: TaskPriority; label: string }[] = [
  { value: 'low' as TaskPriority, label: 'Low' },
  { value: 'medium' as TaskPriority, label: 'Medium' },
  { value: 'high' as TaskPriority, label: 'High' }
];

export function TaskList({ tasks, statusCounts, onUpdate, onUpdateStatus, onDelete, onLoadMore, hasNextPage, isFetchingNextPage }: TaskListProps): JSX.Element {
  const isFetchingRef = useRef(false);

  useEffect(() => {
    isFetchingRef.current = isFetchingNextPage;
  }, [isFetchingNextPage]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Prevent elastic scroll events on non-overflowing columns
    if (scrollHeight <= clientHeight) return;

    if (scrollHeight - scrollTop <= clientHeight + 100) {
      isFetchingRef.current = true;
      onLoadMore();
    }
  }, [hasNextPage, onLoadMore]);

  if (tasks.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-lg">No tasks found.</p>;
  }

  const groupedTasks: Record<TaskStatus, TaskDto[]> = {
    todo: [],
    in_progress: [],
    done: []
  };

  tasks.forEach((task) => {
    groupedTasks[task.status].push(task);
  });

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full h-full min-h-0">
      <div 
        className="tour-step-3 flex overflow-x-auto gap-3 md:gap-6 items-start pb-4 snap-x snap-mandatory flex-1 min-h-0 styled-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {TASK_STATUS_OPTIONS.map((statusOption) => (
          <div key={statusOption.value} className="flex flex-col flex-1 w-[85vw] min-w-[280px] md:w-auto md:min-w-[320px] lg:min-w-0 shrink-0 lg:shrink bg-slate-50/80 rounded-xl p-3 sm:p-4 border border-slate-200 h-full max-h-full snap-center md:snap-start">
            <h3 className="font-bold text-slate-800 mb-2 md:mb-4 pb-2 border-b border-slate-200 flex items-center justify-between text-sm md:text-base shrink-0">
              {statusOption.label}
              <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{statusCounts?.[statusOption.value] ?? groupedTasks[statusOption.value].length}</span>
            </h3>
            <div 
              className="flex flex-col gap-2.5 md:gap-3 overflow-y-auto flex-1 min-h-0 pr-1 pb-4 styled-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onScroll={handleScroll}
            >
              {groupedTasks[statusOption.value].map((task) => (
                <TaskListItem key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} onUpdateStatus={onUpdateStatus} />
              ))}
              {groupedTasks[statusOption.value].length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No tasks</p>
              )}
              
              {isFetchingNextPage && (
                <div className="h-4 shrink-0 flex justify-center items-center mt-2">
                  <span className="text-xs text-slate-500">Loading...</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TaskListItemProps {
  task: TaskDto;
  onUpdate(taskId: string, payload: EditableTaskPayload): Promise<void>;
  onUpdateStatus(taskId: string, status: TaskStatus): Promise<void>;
  onDelete(taskId: string): Promise<void>;
}

function TaskListItem({ task, onUpdate, onUpdateStatus, onDelete }: TaskListItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(task.title);
  const [description, setDescription] = useState<string>(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState<string>(task.dueDate?.slice(0, 10) ?? '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const isOverdue = task.isOverdue;
  const isSoonDue = task.isSoonDue;

  let cardStyle = "border-slate-200 bg-white hover:border-teal-300";
  if (task.status !== 'done') {
    if (isOverdue) cardStyle = "border-red-300 bg-red-50 hover:border-red-400";
    else if (isSoonDue) cardStyle = "border-amber-300 bg-amber-100 hover:border-amber-400";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(task.id, { title, description, status, priority, dueDate: new Date(dueDate).toISOString() });
      setIsEditing(false);
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEditing) {
    return (
      <form className="flex flex-col gap-3 p-3 sm:p-4 border border-slate-300 rounded-xl bg-white shadow-sm" onSubmit={handleSubmit}>
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <Textarea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
        <div className="grid grid-cols-1 gap-3">
          <label className="flex flex-col gap-1.5 text-slate-700 text-sm font-semibold">
            <span>Status</span>
            <select className="w-full border border-slate-300 rounded-md bg-white text-slate-900 px-3 py-2 focus:ring-2 focus:ring-teal-500/50 outline-none" value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
              {TASK_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-slate-700 text-sm font-semibold">
            <span>Priority</span>
            <select className="w-full border border-slate-300 rounded-md bg-white text-slate-900 px-3 py-2 focus:ring-2 focus:ring-teal-500/50 outline-none" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
              {TASK_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <Input label="Due date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </div>
        <ApiErrorDisplay error={error} />
        <div className="flex gap-2 mt-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">{isSubmitting ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
        </div>
      </form>
    );
  }

  return (
    <article className={`group flex flex-col gap-2.5 sm:gap-3 p-3 sm:p-4 border rounded-xl shadow-sm transition-all duration-200 ${cardStyle}`}>
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-slate-900 text-[14px] sm:text-[15px] leading-tight">{task.title}</h3>
        <select 
          className="text-xs bg-white border border-slate-200 text-slate-600 rounded px-1.5 py-0.5 outline-none hover:border-teal-400 cursor-pointer"
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
        >
          {TASK_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      {task.description && <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">{task.description}</p>}
      
      <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2">
        <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
        {task.dueDate && (
          <Badge tone={task.status !== 'done' && isOverdue ? 'red' : task.status !== 'done' && isSoonDue ? 'amber' : 'neutral'}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </Badge>
        )}
      </div>

      <div className="flex gap-2 pt-2 mt-2 border-t border-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={() => setIsEditing(true)} className="text-xs font-semibold text-teal-600 hover:text-teal-800">Edit</button>
        <button type="button" onClick={() => onDelete(task.id)} className="text-xs font-semibold text-red-600 hover:text-red-800">Delete</button>
      </div>
    </article>
  );
}

function priorityTone(priority: TaskPriority): 'neutral' | 'amber' | 'red' {
  if (priority === 'high') return 'red';
  return priority === 'medium' ? 'amber' : 'neutral';
}


