import type { ProjectDto } from '@teamboard/shared';
import { Badge } from '@radix-ui/themes';
import { AlertCircle, FolderIcon, Search } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ProjectListProps {
  projects: ProjectDto[];
  selectedProjectId: string | null;
  onSelect(projectId: string): void;
  onLoadMore(): void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  searchQuery: string;
  onSearchChange(query: string): void;
}

export function ProjectList({ projects, selectedProjectId, onSelect, onLoadMore, hasNextPage, isFetchingNextPage, searchQuery, onSearchChange }: ProjectListProps): JSX.Element {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className="flex flex-col gap-3 px-2 flex-1">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search projects..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/50 bg-slate-50 focus:bg-white transition-colors"
        />
      </div>

      {projects.length === 0 ? (
        <p className="text-slate-500 text-sm mt-4 text-center">No projects found.</p>
      ) : (
        <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
          {projects.map((project) => {
            const isSelected = selectedProjectId === project.id;
            return (
              <button
                key={project.id}
                type="button"
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 ${isSelected ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                onClick={() => onSelect(project.id)}
              >
                <FolderIcon size={16} className={isSelected ? 'text-teal-600 shrink-0' : 'text-slate-400 shrink-0'} />
                <span className="truncate flex-1 text-left">{project.name}</span>
                {project.stats && project.stats.overdueCount > 0 && (
                  <Badge color="red" variant="soft" size="1" title={`${project.stats.overdueCount} overdue tasks`}>
                    <AlertCircle size={12} /> {project.stats.overdueCount}
                  </Badge>
                )}
                {project.stats && project.stats.soonDueCount > 0 && project.stats.overdueCount === 0 && (
                  <Badge color="amber" variant="soft" size="1" title={`${project.stats.soonDueCount} tasks due soon`}>
                    <AlertCircle size={12} /> {project.stats.soonDueCount}
                  </Badge>
                )}
              </button>
            );
          })}
          
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center shrink-0">
            {isFetchingNextPage && <span className="text-xs text-slate-500 font-medium">Loading more...</span>}
          </div>
        </div>
      )}
    </div>
  );
}
