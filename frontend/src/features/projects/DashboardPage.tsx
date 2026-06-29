import { Button as RadixButton, Dialog, Skeleton } from '@radix-ui/themes';
import type { TaskPriority, TaskStatus } from '@teamboard/shared';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { queryKeys } from '../../services/queryKeys';
import { projectsService } from '../../services/projects.service';
import { tasksService } from '../../services/tasks.service';
import { clearAuth } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { TaskForm } from '../tasks/TaskForm';
import { EditableTaskPayload, TaskList } from '../tasks/TaskList';
import { ProjectEditForm } from './ProjectEditForm';
import { ProjectForm } from './ProjectForm';
import { ProjectList } from './ProjectList';
import { Plus, Settings, LogOut, LayoutDashboard, Search, Filter, SortDesc, Activity, Menu, X } from 'lucide-react';
import { AuditTrailSidebar } from './AuditTrailSidebar';

export function DashboardPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [projectSearch, setProjectSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskSortBy, setTaskSortBy] = useState<'createdAt' | 'title' | 'dueDate' | 'priority'>('createdAt');
  const [taskSortDir, setTaskSortDir] = useState<'asc' | 'desc'>('desc');

  const projectsQuery = useInfiniteQuery({
    queryKey: ['projects', 'all', projectSearch],
    queryFn: ({ pageParam }) => projectsService.list({ 
      page: pageParam, 
      limit: 20, 
      search: projectSearch || undefined 
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
  });

  const projects = useMemo(() => {
    return projectsQuery.data?.pages.flatMap(page => page.items) ?? [];
  }, [projectsQuery.data]);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const isProjectOwner = selectedProject?.ownerId === user?.id;

  const tasksQuery = useInfiniteQuery({
    queryKey: ['tasks', selectedProjectId, taskSearch, taskSortBy, taskSortDir],
    queryFn: ({ pageParam }) => tasksService.list(selectedProjectId ?? '', {
      page: pageParam,
      limit: 10,
      search: taskSearch || undefined,
      sortBy: taskSortBy,
      sortDir: taskSortDir
    }),
    enabled: selectedProjectId !== null,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
  });

  const tasks = useMemo(() => {
    return tasksQuery.data?.pages.flatMap(page => page.items) ?? [];
  }, [tasksQuery.data]);

  const createProjectMutation = useMutation({
    mutationFn: (payload: { name: string; description: string; dueDate: string }) => projectsService.create(payload),
    onSuccess: (project) => {
      setSelectedProjectId(project.id);
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => projectsService.delete(projectId),
    onSuccess: (_project, projectId) => {
      setSelectedProjectId(currentProjectId => (currentProjectId === projectId ? null : currentProjectId));
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: (payload: { projectId: string; name: string; description: string; dueDate: string }) =>
      projectsService.update(payload.projectId, { name: payload.name, description: payload.description, dueDate: payload.dueDate }),
    onSuccess: (project) => {
      setSelectedProjectId(project.id);
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (payload: { title: string; description: string; priority: TaskPriority; dueDate: string }) =>
      selectedProjectId
        ? tasksService.create(selectedProjectId, {
            title: payload.title,
            description: payload.description,
            priority: payload.priority,
            dueDate: payload.dueDate || undefined
          })
        : Promise.reject(new Error('No project selected')),
    onSuccess: () => {
      if (selectedProjectId) {
        void queryClient.invalidateQueries({ queryKey: ['tasks', selectedProjectId] });
      }
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: (payload: { taskId: string; task: EditableTaskPayload }) =>
      tasksService.update(payload.taskId, {
        ...payload.task,
        dueDate: payload.task.dueDate || undefined
      }),
    onSuccess: () => {
      if (selectedProjectId) {
        void queryClient.invalidateQueries({ queryKey: ['tasks', selectedProjectId] });
      }
    }
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: (payload: { taskId: string; status: TaskStatus }) =>
      tasksService.updateStatus(payload.taskId, payload.status),
    onSuccess: () => {
      if (selectedProjectId) {
        void queryClient.invalidateQueries({ queryKey: ['tasks', selectedProjectId] });
      }
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasksService.delete(taskId),
    onSuccess: () => {
      if (selectedProjectId) {
        void queryClient.invalidateQueries({ queryKey: ['tasks', selectedProjectId] });
      }
    }
  });

  async function createProject(name: string, description: string, dueDate: string): Promise<void> {
    await createProjectMutation.mutateAsync({ name, description, dueDate });
  }

  async function deleteProject(): Promise<void> {
    if (selectedProjectId) {
      await deleteProjectMutation.mutateAsync(selectedProjectId);
      setIsEditProjectOpen(false);
    }
  }

  async function updateProject(projectId: string, name: string, description: string, dueDate: string): Promise<void> {
    await updateProjectMutation.mutateAsync({ projectId, name, description, dueDate });
  }

  async function createTask(title: string, description: string, priority: TaskPriority, dueDate: string): Promise<void> {
    await createTaskMutation.mutateAsync({ title, description, priority, dueDate });
  }

  async function updateTask(taskId: string, task: EditableTaskPayload): Promise<void> {
    await updateTaskMutation.mutateAsync({ taskId, task });
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    await updateTaskStatusMutation.mutateAsync({ taskId, status });
  }

  async function deleteTask(taskId: string): Promise<void> {
    await deleteTaskMutation.mutateAsync(taskId);
  }

  function logout(): void {
    dispatch(clearAuth());
    queryClient.clear();
  }

  return (
    <main className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-50 shrink-0 fixed inset-y-0 left-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-1">
              <LayoutDashboard size={18} className="stroke-[2.5px]" />
              <p className="text-xs font-bold uppercase tracking-wider">TeamBoard</p>
            </div>
            <h1 className="text-xl font-bold">Workspace</h1>
            <p className="text-sm text-slate-500 truncate mt-1">{user?.email}</p>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-slate-600 outline-none"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-hidden flex flex-col pt-4 pb-2">
          <div className="flex items-center justify-between px-6 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projects</span>
            <Dialog.Root open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
              <Dialog.Trigger>
                <button className="text-slate-400 hover:text-teal-600 transition-colors cursor-pointer outline-none">
                  <Plus size={18} />
                </button>
              </Dialog.Trigger>
              <Dialog.Content maxWidth="450px" className="rounded-xl shadow-2xl p-6">
                <Dialog.Title className="text-xl font-bold mb-1">New Project</Dialog.Title>
                <Dialog.Description className="text-slate-500 text-sm mb-4">Create a new workspace for your team.</Dialog.Description>
                <ProjectForm onCreate={createProject} onSuccess={() => setIsCreateProjectOpen(false)} />
              </Dialog.Content>
            </Dialog.Root>
          </div>

          {projectsQuery.isLoading && projects.length === 0 ? (
            <div className="flex flex-col gap-3 px-6">
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </div>
          ) : (
            <ProjectList 
              projects={projects} 
              selectedProjectId={selectedProjectId} 
              onSelect={setSelectedProjectId}
              searchQuery={projectSearch}
              onSearchChange={setProjectSearch}
              onLoadMore={() => projectsQuery.fetchNextPage()}
              hasNextPage={!!projectsQuery.hasNextPage}
              isFetchingNextPage={projectsQuery.isFetchingNextPage}
            />
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer outline-none"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        <header className="bg-white border-b border-slate-200 px-3 md:px-8 py-3 md:py-6 flex flex-col gap-3 md:gap-6 shrink-0 shadow-sm relative z-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button 
                  className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 rounded-md outline-none"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu size={20} />
                </button>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Project</p>
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{selectedProject?.name ?? 'No project selected'}</h2>
                
                {selectedProjectId && isProjectOwner && (
                  <Dialog.Root open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
                    <Dialog.Trigger>
                      <button className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer outline-none">
                        <Settings size={18} />
                      </button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px" className="rounded-xl shadow-2xl p-6">
                      <Dialog.Title className="text-xl font-bold mb-1">Project Settings</Dialog.Title>
                      <Dialog.Description className="text-slate-500 text-sm mb-4">Update project details.</Dialog.Description>
                      <ProjectEditForm project={selectedProject} onUpdate={updateProject} onSuccess={() => setIsEditProjectOpen(false)} />
                      
                      <div className="mt-8 pt-6 border-t border-red-100">
                        <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
                        <p className="text-xs text-slate-500 mb-4">Deleting this project will permanently remove all associated tasks.</p>
                        <RadixButton color="red" variant="soft" onClick={deleteProject}>
                          Delete Project Permanently
                        </RadixButton>
                      </div>
                    </Dialog.Content>
                  </Dialog.Root>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-2 line-clamp-1 md:line-clamp-none">{selectedProject?.description ?? 'Create or select a project to start organizing tasks.'}</p>
              {selectedProject?.dueDate && (
                <p className="text-[11px] md:text-xs font-medium text-slate-500 mt-0.5 md:mt-1">Due: {new Date(selectedProject.dueDate).toLocaleDateString()}</p>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              {selectedProjectId && (
                <RadixButton variant="soft" color="gray" size="3" style={{ cursor: 'pointer' }} className="flex-1 md:flex-none" onClick={() => setIsAuditTrailOpen(true)}>
                  <Activity size={16} /> Activity
                </RadixButton>
              )}
              <Dialog.Root open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <Dialog.Trigger>
                  <RadixButton disabled={!selectedProjectId} size="3" style={{ cursor: 'pointer' }} className="flex-1 md:flex-none">
                    <Plus size={16} /> New Task
                  </RadixButton>
                </Dialog.Trigger>
                <Dialog.Content maxWidth="500px" className="rounded-xl shadow-2xl p-6">
                  <Dialog.Title className="text-xl font-bold mb-1">New Task</Dialog.Title>
                  <Dialog.Description className="text-slate-500 text-sm mb-4">Add a new task to the current project.</Dialog.Description>
                  <TaskForm disabled={!selectedProjectId} onCreate={createTask} onSuccess={() => setIsCreateTaskOpen(false)} />
                </Dialog.Content>
              </Dialog.Root>
            </div>
          </div>

          {/* Filters Bar */}
          {selectedProjectId && (
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="relative flex-1 w-full md:min-w-[200px]">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/50 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 hidden sm:inline">Sort by:</span>
                </div>
                <select 
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500/50"
                  value={taskSortBy}
                  onChange={(e) => setTaskSortBy(e.target.value as any)}
                >
                  <option value="createdAt">Created Date</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <button 
                  onClick={() => setTaskSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  title="Toggle Sort Direction"
                >
                  <SortDesc size={16} className={taskSortDir === 'asc' ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-3 md:p-8 relative z-0">
          {(projectsQuery.isError || tasksQuery.isError) && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-medium border border-red-100">
              Unable to load workspace data.
            </div>
          )}

          {tasksQuery.isLoading && tasks.length === 0 ? (
            <div className="flex flex-col gap-3">
              <Skeleton height="72px" />
              <Skeleton height="72px" />
              <Skeleton height="72px" />
            </div>
          ) : selectedProjectId ? (
            <TaskList 
              tasks={tasks} 
              onUpdate={updateTask} 
              onUpdateStatus={updateTaskStatus}
              onDelete={deleteTask} 
              onLoadMore={() => tasksQuery.fetchNextPage()}
              hasNextPage={!!tasksQuery.hasNextPage}
              isFetchingNextPage={tasksQuery.isFetchingNextPage}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">Select a project to view its Kanban board.</p>
            </div>
          )}
        </div>
      </section>

      <AuditTrailSidebar 
        projectId={selectedProjectId} 
        isOpen={isAuditTrailOpen} 
        onOpenChange={setIsAuditTrailOpen} 
      />
    </main>
  );
}
