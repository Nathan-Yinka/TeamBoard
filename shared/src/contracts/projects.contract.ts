export const ProjectsMessagePatterns = {
  AssertOwner: 'projects.project.assert_owner',
  GetSummary: 'projects.project.get_summary',
  LogAudit: 'projects.project.log_audit'
} as const;

export interface ProjectsAssertOwnerRequest {
  projectId: string;
  userId: string;
}

export interface ProjectsAssertOwnerResponse {
  projectId: string;
  ownerId: string;
  name: string;
}

export interface ProjectsGetSummaryRequest {
  projectId: string;
  userId: string;
}

export interface ProjectsGetSummaryResponse {
  projectId: string;
  name: string;
  description: string;
}

export interface ProjectsLogAuditRequest {
  projectId: string;
  userEmail: string;
  action: string;
  details: string;
}
