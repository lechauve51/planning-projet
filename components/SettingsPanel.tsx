'use client';

import { useState } from 'react';
import { usePlanningStore } from '@/store/usePlanningStore';
import { TimelineConfig, Granularity } from '@/types';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const timelineConfig = usePlanningStore((state) => state.timelineConfig);
  const updateTimelineConfig = usePlanningStore((state) => state.updateTimelineConfig);

  const [config, setConfig] = useState<TimelineConfig>(timelineConfig);

  const handleSave = () => {
    updateTimelineConfig(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-ink/45 z-50 flex items-center justify-center">
      <div className="bg-card border border-line rounded-card shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-gradient-to-r from-gold/20 to-white/96 border-b border-line px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy">Paramètres de la Timeline</h2>
          <button onClick={onClose} className="text-navy hover:text-muted">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
              />
            </div>
          </div>

          {/* Granularity */}
          <div>
            <label className="block text-xs text-muted mb-2">
              Granularité
            </label>
            <select
              value={config.granularity}
              onChange={(e) => setConfig({ ...config, granularity: e.target.value as Granularity })}
              className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
            >
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
              <option value="quarter">Trimestre</option>
              <option value="half-year">Semestre</option>
              <option value="year">Année</option>
            </select>
          </div>

          {/* Step */}
          <div>
            <label className="block text-xs text-muted mb-2">
              Pas (ex: 1 mois, 2 semaines)
            </label>
            <input
              type="number"
              min="1"
              value={config.step}
              onChange={(e) => setConfig({ ...config, step: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
            />
          </div>

          {/* Card Layout */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-navy mb-4">Configuration des cartes</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-2">
                  Unité de division
                </label>
                <select
                  value={config.cardSplitUnit}
                  onChange={(e) => setConfig({ ...config, cardSplitUnit: e.target.value as any })}
                  className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                >
                  <option value="none">Aucune (1 carte unique)</option>
                  <option value="month">Mois</option>
                  <option value="quarter">Trimestre</option>
                  <option value="half-year">Semestre</option>
                  <option value="year">Année</option>
                </select>
              </div>

              {config.cardSplitUnit !== 'none' && (
                <div>
                  <label className="block text-xs text-muted mb-2">
                    Taille par carte (ex: 1 = 1 an par carte, 2 = 2 ans par carte)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={config.cardSplitSize}
                    onChange={(e) => setConfig({ ...config, cardSplitSize: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Snap Mode */}
          <div>
            <label className="block text-xs text-muted mb-2">
              Mode de snap
            </label>
            <select
              value={config.snapMode || 'cell'}
              onChange={(e) => setConfig({ ...config, snapMode: e.target.value as 'cell' | 'subCell' })}
              className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
            >
              <option value="cell">Cellule (snap strict)</option>
              <option value="subCell">Sous-cellule (demi-unité)</option>
            </select>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#fbfaf7] border-t border-line px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition text-xs font-black text-navy bg-white"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-navy text-white rounded-[10px] hover:bg-opacity-90 transition text-xs font-black"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

