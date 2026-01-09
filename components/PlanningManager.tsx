'use client';

import { useState, useEffect } from 'react';
import { usePlanningStore } from '@/store/usePlanningStore';
import { format } from 'date-fns';

interface PlanningManagerProps {
  onClose: () => void;
}

export function PlanningManager({ onClose }: PlanningManagerProps) {
  const plannings = usePlanningStore((state) => state.plannings);
  const currentPlanningId = usePlanningStore((state) => state.currentPlanningId);
  const createPlanning = usePlanningStore((state) => state.createPlanning);
  const loadPlanning = usePlanningStore((state) => state.loadPlanning);
  const deletePlanning = usePlanningStore((state) => state.deletePlanning);
  const renamePlanning = usePlanningStore((state) => state.renamePlanning);
  const duplicatePlanning = usePlanningStore((state) => state.duplicatePlanning);

  const [newPlanningName, setNewPlanningName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Initialize with default planning if none exists
  useEffect(() => {
    if (plannings.length === 0 && !currentPlanningId) {
      createPlanning('Planning par défaut');
    }
  }, [plannings.length, currentPlanningId, createPlanning]);

  const handleCreate = () => {
    if (newPlanningName.trim()) {
      createPlanning(newPlanningName.trim());
      setNewPlanningName('');
    }
  };

  const handleRename = (id: string) => {
    if (editingName.trim()) {
      renamePlanning(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer le planning "${name}" ? Cette action est irréversible.`)) {
      deletePlanning(id);
    }
  };

  const handleDuplicate = (id: string, name: string) => {
    const newName = `${name} (copie)`;
    duplicatePlanning(id, newName);
  };

  const sortedPlannings = [...plannings].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="fixed inset-0 bg-ink/45 z-50 flex items-center justify-center">
      <div className="bg-card border border-line rounded-card shadow-modal w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-gradient-to-r from-gold/20 to-white/96 border-b border-line px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy">Gestion des Plannings</h2>
          <button onClick={onClose} className="text-navy hover:text-muted">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Create New Planning */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-bold text-navy mb-4">Créer un nouveau planning</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom du planning"
                value={newPlanningName}
                onChange={(e) => setNewPlanningName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-navy text-white rounded-[10px] hover:bg-opacity-90 transition text-xs font-black"
              >
                Créer
              </button>
            </div>
          </div>

          {/* Plannings List */}
          <div>
            <h3 className="text-sm font-bold text-navy mb-4">
              Plannings existants ({plannings.length})
            </h3>
            {sortedPlannings.length === 0 ? (
              <p className="text-xs text-muted">Aucun planning. Créez-en un nouveau ci-dessus.</p>
            ) : (
              <div className="space-y-2">
                {sortedPlannings.map((planning) => {
                  const isCurrent = planning.id === currentPlanningId;
                  const isEditing = editingId === planning.id;

                  return (
                    <div
                      key={planning.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isCurrent 
                          ? 'bg-gold/10 border-gold' 
                          : 'bg-[#fbfaf7] border-line'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleRename(planning.id);
                              } else if (e.key === 'Escape') {
                                setEditingId(null);
                                setEditingName('');
                              }
                            }}
                            autoFocus
                            className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                          />
                          <button
                            onClick={() => handleRename(planning.id)}
                            className="px-3 py-2 bg-green-600 text-white rounded-[10px] hover:bg-green-700 transition text-xs font-black"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingName('');
                            }}
                            className="px-3 py-2 border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition text-xs font-black text-navy bg-white"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-navy">
                                {planning.name}
                              </span>
                              {isCurrent && (
                                <span className="text-xs bg-navy text-white px-2 py-0.5 rounded-full">
                                  Actuel
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted mt-1">
                              {planning.projects.length} projet(s) • 
                              Modifié le {format(new Date(planning.updatedAt), 'dd/MM/yyyy à HH:mm')}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!isCurrent && (
                              <button
                                onClick={() => loadPlanning(planning.id)}
                                className="px-3 py-2 bg-navy text-white rounded-[10px] hover:bg-opacity-90 transition text-xs font-black"
                              >
                                Charger
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingId(planning.id);
                                setEditingName(planning.name);
                              }}
                              className="px-3 py-2 border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition text-xs font-black text-navy bg-white"
                            >
                              Renommer
                            </button>
                            <button
                              onClick={() => handleDuplicate(planning.id, planning.name)}
                              className="px-3 py-2 border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition text-xs font-black text-navy bg-white"
                            >
                              Dupliquer
                            </button>
                            <button
                              onClick={() => handleDelete(planning.id, planning.name)}
                              className="px-3 py-2 text-[#7a1b1b] border border-[#e2c6c6] bg-[#fff7f7] rounded-[10px] hover:bg-[#fff0f0] transition text-xs font-black"
                            >
                              Supprimer
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#fbfaf7] border-t border-line px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-navy text-white rounded-[10px] hover:bg-opacity-90 transition text-xs font-black"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

