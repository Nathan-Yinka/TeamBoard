import { Dialog, ScrollArea } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock } from 'lucide-react';
import { auditService } from '../../services/audit.service';

interface AuditTrailSidebarProps {
  projectId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditTrailSidebar({ projectId, isOpen, onOpenChange }: AuditTrailSidebarProps): JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', projectId],
    queryFn: () => (projectId ? auditService.listLogs(projectId) : Promise.reject('No project')),
    enabled: isOpen && projectId !== null,
    refetchInterval: 10000 // refresh every 10 seconds while open
  });

  const logs = data?.items ?? [];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content 
        maxWidth="400px" 
        className="fixed top-0 right-0 h-full max-h-screen rounded-none m-0 shadow-2xl p-0 flex flex-col translate-x-0 data-[state=closed]:translate-x-full transition-transform duration-300 ease-in-out"
        style={{ left: 'auto', bottom: 'auto' }}
      >
        <div className="p-6 border-b border-slate-200 flex items-center gap-3 bg-white">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <Activity size={20} />
          </div>
          <div>
            <Dialog.Title className="text-lg font-bold text-slate-900 m-0 leading-tight">Project Activity</Dialog.Title>
            <Dialog.Description className="text-xs text-slate-500 m-0">Audit trail of all actions</Dialog.Description>
          </div>
        </div>

        <ScrollArea className="flex-1 bg-slate-50/50 p-6">
          {isLoading && <p className="text-sm text-slate-500 text-center py-4">Loading activity...</p>}
          {isError && <p className="text-sm text-red-500 text-center py-4">Failed to load activity.</p>}
          
          {!isLoading && !isError && logs.length === 0 && (
            <div className="text-center py-10 flex flex-col items-center justify-center text-slate-400">
              <Clock size={32} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">No activity yet</p>
            </div>
          )}

          {!isLoading && !isError && logs.length > 0 && (
            <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6 pb-6">
              {logs.map((log) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[29px] top-1 w-2 h-2 rounded-full bg-teal-500 ring-4 ring-slate-50"></div>
                  <p className="text-xs font-semibold text-teal-600 mb-1">
                    {new Date(log.createdAt).toLocaleString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-sm font-medium text-slate-900 leading-snug">{log.details}</p>
                  <p className="text-xs text-slate-500 mt-1">by {log.userEmail}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <Dialog.Close>
            <button className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors outline-none cursor-pointer">
              Close
            </button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
