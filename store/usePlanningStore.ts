import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TimelineConfig, Project, Group, Planning } from '@/types';
import { buildCells, splitIntoCards, adjustProjectToGranularity, snapDateToCell, projectToGridSpan } from '@/lib/timeline-engine';
import { parseISO } from 'date-fns';

interface PlanningState {
  // Multi-planning management
  plannings: Planning[];
  currentPlanningId: string | null;
  
  // Current planning data (synced with currentPlanningId)
  timelineConfig: TimelineConfig;
  projects: Project[];
  groups: Group[];
  
  // UI State
  selectedProjectId: string | null;
  selectedCardIndex: number;
  
  // Actions
  updateTimelineConfig: (config: Partial<TimelineConfig>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, newStartDate: string, newEndDate: string, newRow: number) => void;
  resizeProject: (id: string, newStartDate: string, newEndDate: string) => void;
  
  addGroup: (group: Omit<Group, 'id'>) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  
  setSelectedProject: (id: string | null) => void;
  setSelectedCard: (index: number) => void;
  
  // Planning management
  createPlanning: (name: string) => string; // Returns new planning ID
  loadPlanning: (id: string) => void;
  saveCurrentPlanning: () => void;
  deletePlanning: (id: string) => void;
  renamePlanning: (id: string, newName: string) => void;
  duplicatePlanning: (id: string, newName: string) => string; // Returns new planning ID
  
  // Computed
  getCells: () => ReturnType<typeof buildCells>;
  getCards: () => ReturnType<typeof splitIntoCards>;
  getProjectsForCard: (cardIndex: number) => Project[];
  getGroup: (id: string) => Group | undefined;
  getProjectColor: (project: Project) => string;
  getCurrentPlanning: () => Planning | null;
}

const defaultConfig: TimelineConfig = {
  startDate: '2026-01-01',
  endDate: '2029-12-31',
  granularity: 'quarter',
  step: 1,
  cardSplitUnit: 'year',
  cardSplitSize: 1,
  snapMode: 'cell',
};

const defaultGroups: Group[] = [
  { id: 'group-1', name: 'Qualité de la donnée', color: '#d9c890' },
  { id: 'group-2', name: 'Relation locataire', color: '#bcd7f2' },
  { id: 'group-3', name: 'Rationalisation SI', color: '#c5e6d2' },
  { id: 'group-4', name: 'Efficacité collaborateur', color: '#f2c7c7' },
];

export const usePlanningStore = create<PlanningState>()(
  persist(
    (set, get) => {
      // Helper to save current planning state to the plannings array
      const saveCurrentPlanningToArray = (state: PlanningState): Planning[] => {
        if (!state.currentPlanningId) return state.plannings;
        
        const now = new Date().toISOString();
        const existing = state.plannings.find(p => p.id === state.currentPlanningId);
        const currentPlanning: Planning = {
          id: state.currentPlanningId,
          name: existing?.name || 'Sans nom',
          createdAt: existing?.createdAt || now,
          updatedAt: now,
          timelineConfig: state.timelineConfig,
          projects: state.projects,
          groups: state.groups,
        };
        
        const existingIndex = state.plannings.findIndex(p => p.id === state.currentPlanningId);
        if (existingIndex >= 0) {
          const updated = [...state.plannings];
          updated[existingIndex] = currentPlanning;
          return updated;
        }
        return [...state.plannings, currentPlanning];
      };

      return {
        plannings: [],
        currentPlanningId: null,
        timelineConfig: defaultConfig,
        projects: [],
        groups: defaultGroups,
        selectedProjectId: null,
        selectedCardIndex: 0,

        updateTimelineConfig: (updates) => {
          set((state) => {
            const newConfig = { ...state.timelineConfig, ...updates };
            const oldCells = buildCells(state.timelineConfig);
            const newCells = buildCells(newConfig);
            
            // Adjust projects if granularity changed
            const adjustedProjects = state.projects.map((project) => {
              const projectStart = parseISO(project.startDate);
              const projectEnd = parseISO(project.endDate);
              const adjusted = adjustProjectToGranularity(projectStart, projectEnd, newCells);
              
              if (adjusted.adjusted) {
                return {
                  ...project,
                  startDate: adjusted.start.toISOString(),
                  endDate: adjusted.end.toISOString(),
                };
              }
              return project;
            });

            const newState = {
              timelineConfig: newConfig,
              projects: adjustedProjects,
            };
            
            // Auto-save to current planning
            return {
              ...newState,
              plannings: saveCurrentPlanningToArray({ ...state, ...newState }),
            };
          });
        },

        addProject: (projectData) => {
          const cells = get().getCells();
          const startDate = parseISO(projectData.startDate);
          const endDate = parseISO(projectData.endDate);
          
          const snappedStart = snapDateToCell(startDate, cells, get().timelineConfig.snapMode || 'cell');
          const snappedEnd = snapDateToCell(endDate, cells, get().timelineConfig.snapMode || 'cell');
          
          // Ensure end is after start
          let finalEnd = snappedEnd;
          if (finalEnd.getTime() <= snappedStart.getTime()) {
            const span = projectToGridSpan(snappedStart, snappedStart, cells);
            if (span.endIndex < cells.length) {
              finalEnd = cells[span.endIndex].start;
            }
          }

          // Ensure groupId is valid, fallback to first group
          const state = get();
          const validGroupId = state.groups.find(g => g.id === projectData.groupId) 
            ? projectData.groupId 
            : (state.groups[0]?.id || projectData.groupId);

          const newProject: Project = {
            ...projectData,
            id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            startDate: snappedStart.toISOString(),
            endDate: finalEnd.toISOString(),
            groupId: validGroupId,
          };

          set((state) => {
            const newState = {
              projects: [...state.projects, newProject],
            };
            return {
              ...newState,
              plannings: saveCurrentPlanningToArray({ ...state, ...newState }),
            };
          });
        },

        updateProject: (id, updates) => {
          set((state) => {
            const cells = state.getCells();
            const project = state.projects.find((p) => p.id === id);
            if (!project) return state;

            let newStartDate = updates.startDate ? parseISO(updates.startDate) : parseISO(project.startDate);
            let newEndDate = updates.endDate ? parseISO(updates.endDate) : parseISO(project.endDate);

            // Snap dates if they're being updated
            if (updates.startDate) {
              newStartDate = snapDateToCell(newStartDate, cells, state.timelineConfig.snapMode || 'cell');
            }
            if (updates.endDate) {
              newEndDate = snapDateToCell(newEndDate, cells, state.timelineConfig.snapMode || 'cell');
            }

            // Ensure end is after start and minimum 1 cell span
            const minCellDuration = cells[0]?.end.getTime() - cells[0]?.start.getTime() || 86400000;
            if (newEndDate.getTime() <= newStartDate.getTime()) {
              newEndDate = new Date(newStartDate.getTime() + minCellDuration);
            }
            
            // Ensure minimum span of 1 cell
            const actualSpan = newEndDate.getTime() - newStartDate.getTime();
            if (actualSpan < minCellDuration) {
              newEndDate = new Date(newStartDate.getTime() + minCellDuration);
            }

            // Ensure groupId is valid if being updated
            let validGroupId = updates.groupId;
            if (updates.groupId && !state.groups.find(g => g.id === updates.groupId)) {
              validGroupId = state.groups[0]?.id || updates.groupId;
            }

            const newState = {
              projects: state.projects.map((p) =>
                p.id === id
                  ? {
                      ...p,
                      ...updates,
                      startDate: newStartDate.toISOString(),
                      endDate: newEndDate.toISOString(),
                      ...(validGroupId && validGroupId !== updates.groupId ? { groupId: validGroupId } : {}),
                    }
                  : p
              ),
            };
            return {
              ...newState,
              plannings: saveCurrentPlanningToArray({ ...state, ...newState }),
            };
          });
        },

        deleteProject: (id) => {
          set((state) => {
            const newState = {
              projects: state.projects.filter((p) => p.id !== id),
              selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
            };
            return {
              ...newState,
              plannings: saveCurrentPlanningToArray({ ...state, ...newState }),
            };
          });
        },

        moveProject: (id, newStartDate, newEndDate, newRow) => {
          get().updateProject(id, {
            startDate: newStartDate,
            endDate: newEndDate,
            row: newRow,
          });
        },

        resizeProject: (id, newStartDate, newEndDate) => {
          const cells = get().getCells();
          const project = get().projects.find((p) => p.id === id);
          if (!project) return;

          const start = parseISO(newStartDate);
          const end = parseISO(newEndDate);
          const minCellDuration = cells[0]?.end.getTime() - cells[0]?.start.getTime() || 86400000;
          const actualDuration = end.getTime() - start.getTime();

          // Force minimum 1 cell duration
          if (actualDuration < minCellDuration) {
            const correctedEnd = new Date(start.getTime() + minCellDuration);
            get().updateProject(id, {
              startDate: newStartDate,
              endDate: correctedEnd.toISOString(),
            });
          } else {
            get().updateProject(id, {
              startDate: newStartDate,
              endDate: newEndDate,
            });
          }
        },

        addGroup: (groupData) => {
          const newGroup: Group = {
            ...groupData,
            id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };

          set((state) => {
            const newState = {
              groups: [...state.groups, newGroup],
            };
            return {
              ...newState,
              plannings: saveCurrentPlanningToArray({ ...state, ...newState }),
            };
          });
        },

        updateGroup: (id, updates) => {
          set((state) => {
            const newState = {
              groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
            };
            return {
              ...newState,
              plannings: saveCurrentPlanningToArray({ ...state, ...newState }),
            };
          });
        },

        deleteGroup: (id) => {
          set((state) => {
            // Move projects to first group if they're in the deleted group
            const firstGroup = state.groups.find((g) => g.id !== id);
            const newState = {
              groups: state.groups.filter((g) => g.id !== id),
              projects: state.projects.map((p) =>
                p.groupId === id && firstGroup ? { ...p, groupId: firstGroup.id } : p
              ),
            };
            return {
              ...newState,
              plannings: saveCurrentPlanningToArray({ ...state, ...newState }),
            };
          });
        },

        setSelectedProject: (id) => {
          set({ selectedProjectId: id });
        },

        setSelectedCard: (index) => {
          set({ selectedCardIndex: index });
        },

        // Computed getters
        getCells: () => {
          return buildCells(get().timelineConfig);
        },

        getCards: () => {
          const cells = get().getCells();
          return splitIntoCards(cells, get().timelineConfig);
        },

        getProjectsForCard: (cardIndex) => {
          const cards = get().getCards();
          const card = cards[cardIndex];
          if (!card) return [];

          const cells = get().getCells();
          const cardStart = card.cells[0]?.start;
          const cardEnd = card.cells[card.cells.length - 1]?.end;

          if (!cardStart || !cardEnd) return [];

          return get().projects.filter((project) => {
            const projectStart = parseISO(project.startDate);
            const projectEnd = parseISO(project.endDate);
            
            // Project overlaps with card if it starts before card ends and ends after card starts
            return projectStart.getTime() < cardEnd.getTime() && projectEnd.getTime() > cardStart.getTime();
          });
        },

        getGroup: (id) => {
          return get().groups.find((g) => g.id === id);
        },

        getProjectColor: (project) => {
          if (project.colorOverride) {
            return project.colorOverride;
          }
          const group = get().getGroup(project.groupId);
          if (group) {
            return group.color;
          }
          // If group not found, use first available group or default color
          const firstGroup = get().groups[0];
          return firstGroup?.color || '#6b7280';
        },

        getCurrentPlanning: () => {
          const state = get();
          if (!state.currentPlanningId) return null;
          return state.plannings.find(p => p.id === state.currentPlanningId) || null;
        },

        // Planning management actions
        createPlanning: (name) => {
          const newId = `planning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();
          const newPlanning: Planning = {
            id: newId,
            name,
            createdAt: now,
            updatedAt: now,
            timelineConfig: defaultConfig,
            projects: [],
            groups: [...defaultGroups],
          };

          set((state) => {
            // Save current planning before switching
            const savedPlannings = saveCurrentPlanningToArray(state);
            return {
              plannings: [...savedPlannings, newPlanning],
              currentPlanningId: newId,
              timelineConfig: newPlanning.timelineConfig,
              projects: newPlanning.projects,
              groups: newPlanning.groups,
              selectedProjectId: null,
              selectedCardIndex: 0,
            };
          });

          return newId;
        },

        loadPlanning: (id) => {
          set((state) => {
            // Save current planning before switching
            const savedPlannings = saveCurrentPlanningToArray(state);
            const planning = savedPlannings.find(p => p.id === id);
            
            if (!planning) {
              console.error(`Planning ${id} not found`);
              return state;
            }

            return {
              plannings: savedPlannings,
              currentPlanningId: id,
              timelineConfig: planning.timelineConfig,
              projects: planning.projects,
              groups: planning.groups,
              selectedProjectId: null,
              selectedCardIndex: 0,
            };
          });
        },

        saveCurrentPlanning: () => {
          set((state) => ({
            plannings: saveCurrentPlanningToArray(state),
          }));
        },

        deletePlanning: (id) => {
          set((state) => {
            const remainingPlannings = state.plannings.filter(p => p.id !== id);
            
            // If deleting current planning, switch to first available
            let newCurrentId = state.currentPlanningId;
            if (state.currentPlanningId === id) {
              newCurrentId = remainingPlannings.length > 0 ? remainingPlannings[0].id : null;
            }

            if (newCurrentId && remainingPlannings.length > 0) {
              const newPlanning = remainingPlannings.find(p => p.id === newCurrentId)!;
              return {
                plannings: remainingPlannings,
                currentPlanningId: newCurrentId,
                timelineConfig: newPlanning.timelineConfig,
                projects: newPlanning.projects,
                groups: newPlanning.groups,
                selectedProjectId: null,
                selectedCardIndex: 0,
              };
            }

            // No plannings left, create a default one
            const defaultPlanning: Planning = {
              id: `planning-${Date.now()}`,
              name: 'Planning par défaut',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              timelineConfig: defaultConfig,
              projects: [],
              groups: [...defaultGroups],
            };

            return {
              plannings: [defaultPlanning],
              currentPlanningId: defaultPlanning.id,
              timelineConfig: defaultPlanning.timelineConfig,
              projects: defaultPlanning.projects,
              groups: defaultPlanning.groups,
              selectedProjectId: null,
              selectedCardIndex: 0,
            };
          });
        },

        renamePlanning: (id, newName) => {
          set((state) => ({
            plannings: state.plannings.map(p => 
              p.id === id ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p
            ),
          }));
        },

        duplicatePlanning: (id, newName) => {
          const newId = `planning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();
          
          set((state) => {
            const savedPlannings = saveCurrentPlanningToArray(state);
            const sourcePlanning = savedPlannings.find(p => p.id === id);
            
            if (!sourcePlanning) {
              console.error(`Planning ${id} not found`);
              return state;
            }

            // Create a map of old group IDs to new group IDs
            const groupIdMap = new Map<string, string>();
            const duplicatedGroups = sourcePlanning.groups.map(g => {
              const newGroupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              groupIdMap.set(g.id, newGroupId);
              return {
                ...g,
                id: newGroupId,
              };
            });

            const duplicatedPlanning: Planning = {
              ...sourcePlanning,
              id: newId,
              name: newName,
              createdAt: now,
              updatedAt: now,
              // Deep copy projects and update group IDs to match new groups
              projects: sourcePlanning.projects.map(p => ({
                ...p,
                id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                groupId: groupIdMap.get(p.groupId) || duplicatedGroups[0]?.id || p.groupId,
              })),
              groups: duplicatedGroups,
            };

            return {
              plannings: [...savedPlannings, duplicatedPlanning],
              currentPlanningId: newId,
              timelineConfig: duplicatedPlanning.timelineConfig,
              projects: duplicatedPlanning.projects,
              groups: duplicatedPlanning.groups,
              selectedProjectId: null,
              selectedCardIndex: 0,
            };
          });

          return newId;
        },
      }
    },
    {
      name: 'planning-builder-storage',
      storage: typeof window !== 'undefined' 
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          })),
      partialize: (state) => ({
        plannings: state.plannings,
        currentPlanningId: state.currentPlanningId,
        // Also persist current state for backward compatibility
        timelineConfig: state.timelineConfig,
        projects: state.projects,
        groups: state.groups,
      }),
    }
  )
);

