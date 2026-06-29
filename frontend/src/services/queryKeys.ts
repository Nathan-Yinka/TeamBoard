export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const
  },
  projects: {
    all: ['projects'] as const
  },
  tasks: {
    all: ['tasks'] as const,
    byProject(projectId: string) {
      return ['tasks', projectId] as const;
    }
  }
};
