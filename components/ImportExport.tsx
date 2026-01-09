'use client';

import { useRef } from 'react';
import { usePlanningStore } from '@/store/usePlanningStore';
import { saveAs } from 'file-saver';
import { autoConvertJSON } from '@/lib/json-converter';

export function ImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineConfig = usePlanningStore((state) => state.timelineConfig);
  const projects = usePlanningStore((state) => state.projects);
  const groups = usePlanningStore((state) => state.groups);

  const handleExport = () => {
    const data = {
      timelineConfig,
      projects,
      groups,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `planning-export-${Date.now()}.json`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      // Convertir automatiquement le format
      const data = autoConvertJSON(rawData);

      // Mettre à jour la timeline config si présente
      if (data.timelineConfig) {
        usePlanningStore.getState().updateTimelineConfig(data.timelineConfig);
      }

      // Mettre à jour les groupes
      if (data.groups && data.groups.length > 0) {
        usePlanningStore.setState({ groups: data.groups });
      }

      // Ajouter les projets un par un pour qu'ils soient correctement snapés
      if (data.projects && data.projects.length > 0) {
        // Vider les projets existants
        usePlanningStore.setState({ projects: [] });
        
        // Ajouter chaque projet (addProject gère le snap automatiquement)
        data.projects.forEach((project) => {
          usePlanningStore.getState().addProject({
            code: project.code,
            name: project.name,
            groupId: project.groupId,
            startDate: project.startDate,
            endDate: project.endDate,
            row: project.row,
            colorOverride: project.colorOverride,
          });
        });
      }

      const projectCount = data.projects?.length || 0;
      const groupCount = data.groups?.length || 0;
      alert(`Import réussi !\n${projectCount} projet(s) importé(s)\n${groupCount} groupe(s) créé(s)`);
    } catch (error) {
      console.error('Import error:', error);
      alert(`Erreur lors de l'import : ${error instanceof Error ? error.message : 'Format de fichier invalide'}`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      usePlanningStore.setState({
        projects: [],
        groups: [
          { id: 'group-1', name: 'Qualité de la donnée', color: '#d9c890' },
          { id: 'group-2', name: 'Relation locataire', color: '#bcd7f2' },
          { id: 'group-3', name: 'Rationalisation SI', color: '#c5e6d2' },
          { id: 'group-4', name: 'Efficacité collaborateur', color: '#f2c7c7' },
        ],
        timelineConfig: {
          startDate: '2026-01-01',
          endDate: '2029-12-31',
          granularity: 'quarter',
          step: 1,
          cardSplitUnit: 'year',
          cardSplitSize: 1,
          snapMode: 'cell',
        },
      });
      alert('Données réinitialisées');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-white text-navy border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition font-black text-xs"
      >
        Importer JSON
      </button>
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-white text-navy border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition font-black text-xs"
      >
        Exporter JSON
      </button>
      <button
        onClick={handleReset}
        className="px-4 py-2 text-[#7a1b1b] border border-[#e2c6c6] bg-[#fff7f7] rounded-[10px] hover:bg-[#fff0f0] transition font-black text-xs"
      >
        Réinitialiser
      </button>
    </div>
  );
}

