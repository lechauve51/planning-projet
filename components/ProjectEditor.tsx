'use client';

import { useState, useEffect } from 'react';
import { usePlanningStore } from '@/store/usePlanningStore';
import { Project } from '@/types';
import { format, parseISO, getYear } from 'date-fns';
import { 
  dateToGranularity, 
  granularityToDateStart, 
  granularityToDateEnd,
  getGranularityOptions,
  GranularityDate 
} from '@/lib/date-granularity';

interface ProjectEditorProps {
  projectId: string | null;
  onClose: () => void;
}

export function ProjectEditor({ projectId, onClose }: ProjectEditorProps) {
  const projects = usePlanningStore((state) => state.projects);
  const groups = usePlanningStore((state) => state.groups);
  const addProject = usePlanningStore((state) => state.addProject);
  const updateProject = usePlanningStore((state) => state.updateProject);
  const deleteProject = usePlanningStore((state) => state.deleteProject);
  const timelineConfig = usePlanningStore((state) => state.timelineConfig);

  const project = projectId && projectId !== 'new' ? projects.find((p) => p.id === projectId) : null;
  const isNew = !project || projectId === 'new';

  // Get granularity options
  const startYear = getYear(parseISO(timelineConfig.startDate));
  const endYear = getYear(parseISO(timelineConfig.endDate));
  const options = getGranularityOptions(timelineConfig.granularity, startYear, endYear);

  const [formData, setFormData] = useState(() => {
    const defaultStart = dateToGranularity(timelineConfig.startDate, timelineConfig.granularity);
    return {
      name: project?.name || '',
      code: project?.code || '',
      groupId: project?.groupId || groups[0]?.id || '',
      startGranularity: project 
        ? dateToGranularity(project.startDate, timelineConfig.granularity)
        : defaultStart,
      endGranularity: project 
        ? dateToGranularity(project.endDate, timelineConfig.granularity)
        : defaultStart,
      row: project?.row || 0,
      colorOverride: project?.colorOverride || '',
    };
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        code: project.code || '',
        groupId: project.groupId,
        startGranularity: dateToGranularity(project.startDate, timelineConfig.granularity),
        endGranularity: dateToGranularity(project.endDate, timelineConfig.granularity),
        row: project.row,
        colorOverride: project.colorOverride || '',
      });
    }
  }, [project, timelineConfig.granularity]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.groupId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Convert granularity dates to ISO dates
    const startDate = granularityToDateStart(formData.startGranularity, timelineConfig.granularity);
    const endDate = granularityToDateEnd(formData.endGranularity, timelineConfig.granularity);

    if (isNew) {
      addProject({
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        groupId: formData.groupId,
        startDate,
        endDate,
        row: formData.row,
        colorOverride: formData.colorOverride || undefined,
      });
    } else if (projectId && projectId !== 'new') {
      updateProject(projectId, {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        groupId: formData.groupId,
        startDate,
        endDate,
        row: formData.row,
        colorOverride: formData.colorOverride || undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (projectId && projectId !== 'new' && confirm(`Supprimer le projet "${formData.name}" ?`)) {
      deleteProject(projectId);
      onClose();
    }
  };

  const selectedGroup = groups.find((g) => g.id === formData.groupId);
  const displayColor = formData.colorOverride || selectedGroup?.color || '#6b7280';

  return (
    <div className="fixed inset-0 bg-ink/45 z-50 flex items-center justify-center">
      <div className="bg-card border border-line rounded-card shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-gradient-to-r from-gold/20 to-white/96 border-b border-line px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy">
            {isNew ? 'Nouveau projet' : 'Modifier le projet'}
          </h2>
          <button onClick={onClose} className="text-navy hover:text-muted">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs text-muted mb-2">
              Nom du projet *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
              placeholder="Ex: Projet Alpha"
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-xs text-muted mb-2">
              Code (optionnel)
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
              placeholder="Ex: PROJ-001"
            />
          </div>

          {/* Group */}
          <div>
            <label className="block text-xs text-muted mb-2">
              Groupe *
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates - Adapté à la granularité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-2">
                {timelineConfig.granularity === 'year' ? 'Année de début *' :
                 timelineConfig.granularity === 'half-year' ? 'Début (Année - Semestre) *' :
                 timelineConfig.granularity === 'quarter' ? 'Début (Année - Trimestre) *' :
                 timelineConfig.granularity === 'month' ? 'Début (Année - Mois) *' :
                 'Début (Année - Semaine) *'}
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.startGranularity.year}
                  onChange={(e) => setFormData({
                    ...formData,
                    startGranularity: { ...formData.startGranularity, year: parseInt(e.target.value) }
                  })}
                  className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                >
                  {options.years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {timelineConfig.granularity === 'quarter' && (
                  <select
                    value={formData.startGranularity.quarter || 1}
                    onChange={(e) => setFormData({
                      ...formData,
                      startGranularity: { ...formData.startGranularity, quarter: parseInt(e.target.value) }
                    })}
                    className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                  >
                    {options.quarters?.map((q) => (
                      <option key={q} value={q}>T{q}</option>
                    ))}
                  </select>
                )}
                {timelineConfig.granularity === 'half-year' && (
                  <select
                    value={formData.startGranularity.semester || 1}
                    onChange={(e) => setFormData({
                      ...formData,
                      startGranularity: { ...formData.startGranularity, semester: parseInt(e.target.value) }
                    })}
                    className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                  >
                    {options.semesters?.map((s) => (
                      <option key={s} value={s}>S{s}</option>
                    ))}
                  </select>
                )}
                {timelineConfig.granularity === 'month' && (
                  <select
                    value={formData.startGranularity.month || 1}
                    onChange={(e) => setFormData({
                      ...formData,
                      startGranularity: { ...formData.startGranularity, month: parseInt(e.target.value) }
                    })}
                    className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                  >
                    {options.months?.map((m) => {
                      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
                      return <option key={m} value={m}>{monthNames[m - 1]}</option>;
                    })}
                  </select>
                )}
                {timelineConfig.granularity === 'week' && (
                  <select
                    value={formData.startGranularity.week || 1}
                    onChange={(e) => setFormData({
                      ...formData,
                      startGranularity: { ...formData.startGranularity, week: parseInt(e.target.value) }
                    })}
                    className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                  >
                    {options.weeks?.map((w) => (
                      <option key={w} value={w}>S{w}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-2">
                {timelineConfig.granularity === 'year' ? 'Année de fin *' :
                 timelineConfig.granularity === 'half-year' ? 'Fin (Année - Semestre) *' :
                 timelineConfig.granularity === 'quarter' ? 'Fin (Année - Trimestre) *' :
                 timelineConfig.granularity === 'month' ? 'Fin (Année - Mois) *' :
                 'Fin (Année - Semaine) *'}
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.endGranularity.year}
                  onChange={(e) => setFormData({
                    ...formData,
                    endGranularity: { ...formData.endGranularity, year: parseInt(e.target.value) }
                  })}
                  className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                >
                  {options.years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {timelineConfig.granularity === 'quarter' && (
                  <select
                    value={formData.endGranularity.quarter || 1}
                    onChange={(e) => setFormData({
                      ...formData,
                      endGranularity: { ...formData.endGranularity, quarter: parseInt(e.target.value) }
                    })}
                    className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                  >
                    {options.quarters?.map((q) => (
                      <option key={q} value={q}>T{q}</option>
                    ))}
                  </select>
                )}
                {timelineConfig.granularity === 'half-year' && (
                  <select
                    value={formData.endGranularity.semester || 1}
                    onChange={(e) => setFormData({
                      ...formData,
                      endGranularity: { ...formData.endGranularity, semester: parseInt(e.target.value) }
                    })}
                    className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                  >
                    {options.semesters?.map((s) => (
                      <option key={s} value={s}>S{s}</option>
                    ))}
                  </select>
                )}
                {timelineConfig.granularity === 'month' && (
                  <select
                    value={formData.endGranularity.month || 1}
                    onChange={(e) => setFormData({
                      ...formData,
                      endGranularity: { ...formData.endGranularity, month: parseInt(e.target.value) }
                    })}
                    className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                  >
                    {options.months?.map((m) => {
                      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
                      return <option key={m} value={m}>{monthNames[m - 1]}</option>;
                    })}
                  </select>
                )}
                {timelineConfig.granularity === 'week' && (
                  <select
                    value={formData.endGranularity.week || 1}
                    onChange={(e) => setFormData({
                      ...formData,
                      endGranularity: { ...formData.endGranularity, week: parseInt(e.target.value) }
                    })}
                    className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                  >
                    {options.weeks?.map((w) => (
                      <option key={w} value={w}>S{w}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Row */}
          <div>
            <label className="block text-xs text-muted mb-2">
              Ligne (position verticale)
            </label>
            <input
              type="number"
              min="0"
              value={formData.row}
              onChange={(e) => setFormData({ ...formData, row: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
            />
          </div>

          {/* Color Override */}
          <div>
            <label className="block text-xs text-muted mb-2">
              Couleur personnalisée (optionnel, laisse vide pour utiliser la couleur du groupe)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={displayColor}
                onChange={(e) => setFormData({ ...formData, colorOverride: e.target.value })}
                className="w-16 h-10 border border-line2 rounded-[10px] cursor-pointer"
              />
              <input
                type="text"
                value={formData.colorOverride}
                onChange={(e) => setFormData({ ...formData, colorOverride: e.target.value })}
                placeholder="#3b82f6 ou vide"
                className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
              />
              <button
                onClick={() => setFormData({ ...formData, colorOverride: '' })}
                className="px-4 py-2 border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition text-xs font-black text-navy bg-white"
              >
                Réinitialiser
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">
              Couleur actuelle: <span style={{ color: displayColor }}>●</span> {displayColor}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#fbfaf7] border-t border-line px-6 py-4 flex justify-between">
          <div>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Supprimer
              </button>
            )}
          </div>
          <div className="flex gap-2">
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
    </div>
  );
}

