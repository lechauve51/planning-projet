'use client';

import { useState } from 'react';
import { usePlanningStore } from '@/store/usePlanningStore';
import { Group } from '@/types';

interface GroupManagerProps {
  onClose: () => void;
}

export function GroupManager({ onClose }: GroupManagerProps) {
  const groups = usePlanningStore((state) => state.groups);
  const addGroup = usePlanningStore((state) => state.addGroup);
  const updateGroup = usePlanningStore((state) => state.updateGroup);
  const deleteGroup = usePlanningStore((state) => state.deleteGroup);

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3b82f6');

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup({ name: newGroupName.trim(), color: newGroupColor });
      setNewGroupName('');
      setNewGroupColor('#3b82f6');
    }
  };

  const defaultColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  ];

  return (
    <div className="fixed inset-0 bg-ink/45 z-50 flex items-center justify-center">
      <div className="bg-card border border-line rounded-card shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-gradient-to-r from-gold/20 to-white/96 border-b border-line px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy">Gestion des Groupes</h2>
          <button onClick={onClose} className="text-navy hover:text-muted">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Group */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-bold text-navy mb-4">Ajouter un groupe</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom du groupe"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAddGroup()}
              />
              <input
                type="color"
                value={newGroupColor}
                onChange={(e) => setNewGroupColor(e.target.value)}
                className="w-16 h-10 border border-line2 rounded-[10px] cursor-pointer"
              />
              <button
                onClick={handleAddGroup}
                className="px-4 py-2 bg-navy text-white rounded-md hover:bg-opacity-90 transition"
              >
                Ajouter
              </button>
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewGroupColor(color)}
                  className="w-8 h-8 rounded border-2 border-line2 hover:border-navy transition"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Groups List */}
          <div>
            <h3 className="text-sm font-bold text-navy mb-4">Groupes existants</h3>
            <div className="space-y-2">
              {groups.map((group) => (
                <GroupItem
                  key={group.id}
                  group={group}
                  onUpdate={updateGroup}
                  onDelete={deleteGroup}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#fbfaf7] border-t border-line px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-navy text-white rounded-md hover:bg-opacity-90 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupItem({
  group,
  onUpdate,
  onDelete,
}: {
  group: Group;
  onUpdate: (id: string, updates: Partial<Group>) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [color, setColor] = useState(group.color);

  const handleSave = () => {
    onUpdate(group.id, { name, color });
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-[#fbfaf7] rounded-lg border border-line">
      <input
        type="color"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          onUpdate(group.id, { color: e.target.value });
        }}
        className="w-12 h-12 rounded border-2 border-line2 cursor-pointer"
      />
      {isEditing ? (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 border border-line2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-navy text-xs text-ink bg-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            ✓
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setName(group.name);
            }}
            className="px-3 py-2 border border-line2 rounded-[10px] hover:bg-[#fbfaf7] transition text-xs font-black text-navy bg-white"
          >
            ✕
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 font-medium">{name}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Modifier
          </button>
          <button
            onClick={() => {
              if (confirm(`Supprimer le groupe "${group.name}" ?`)) {
                onDelete(group.id);
              }
            }}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Supprimer
          </button>
        </>
      )}
    </div>
  );
}

