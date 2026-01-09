'use client';

import { useState, useEffect } from 'react';
import { SettingsPanel } from './SettingsPanel';
import { CardBoard } from './CardBoard';
import { GroupManager } from './GroupManager';
import { ExportImageBar } from './ExportImageBar';
import { ImportExport } from './ImportExport';
import { ProjectEditor } from './ProjectEditor';
import { PlanningManager } from './PlanningManager';
import { usePlanningStore } from '@/store/usePlanningStore';

export function PlanningBuilder() {
  const [showSettings, setShowSettings] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showPlannings, setShowPlannings] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const selectedProjectId = usePlanningStore((state) => state.selectedProjectId);
  const setSelectedProject = usePlanningStore((state) => state.setSelectedProject);
  const getCurrentPlanning = usePlanningStore((state) => state.getCurrentPlanning);
  const loadPlanning = usePlanningStore((state) => state.loadPlanning);
  const plannings = usePlanningStore((state) => state.plannings);
  
  const currentPlanning = getCurrentPlanning();

  // Hydrate the store on client side only
  useEffect(() => {
    usePlanningStore.persist.rehydrate();
    
    // Initialize with default planning if needed
    const state = usePlanningStore.getState();
    if (state.plannings.length === 0 || !state.currentPlanningId) {
      if (state.plannings.length === 0) {
        usePlanningStore.getState().createPlanning('Planning par défaut');
      } else {
        // Load first planning if currentPlanningId is null
        usePlanningStore.getState().loadPlanning(state.plannings[0].id);
      }
    } else {
      // Ensure current planning is loaded
      const current = state.plannings.find(p => p.id === state.currentPlanningId);
      if (current) {
        usePlanningStore.setState({
          timelineConfig: current.timelineConfig,
          projects: current.projects,
          groups: current.groups,
        });
      }
    }
    
    setIsHydrated(true);
  }, []);

  // Don't render until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-navy text-white shadow-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Planning Builder</h1>
            <span className="text-xs text-gold-2 bg-navy-2 px-2 py-1 rounded-full border border-line2">
              v1.1.0
            </span>
            {currentPlanning && (
              <div className="flex items-center gap-2">
                <select
                  value={currentPlanning.id}
                  onChange={(e) => loadPlanning(e.target.value)}
                  className="px-3 py-1.5 border border-line2 rounded-[10px] bg-white text-navy text-xs font-black focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  {plannings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowPlannings(true)}
                  className="px-3 py-1.5 border border-line2 rounded-[10px] bg-white text-navy hover:bg-[#fbfaf7] transition text-xs font-black"
                  title="Gérer les plannings"
                >
                  ⚙️
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                usePlanningStore.getState().setSelectedProject('new');
              }}
              className="px-4 py-2 bg-white text-navy border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition font-black text-xs"
            >
              + Nouveau projet
            </button>
            <button
              onClick={() => setShowGroups(!showGroups)}
              className="px-4 py-2 bg-white text-navy border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition font-black text-xs"
            >
              Groupes
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-white text-navy border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition font-black text-xs"
            >
              Paramètres
            </button>
            <ImportExport />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <ExportImageBar />
        <CardBoard />
      </main>

      {/* Side Panels */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
      {showGroups && (
        <GroupManager onClose={() => setShowGroups(false)} />
      )}
      {showPlannings && (
        <PlanningManager onClose={() => setShowPlannings(false)} />
      )}
      {selectedProjectId !== null && (
        <ProjectEditor
          projectId={selectedProjectId}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

