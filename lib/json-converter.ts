import { Project, Group } from '@/types';

/**
 * Format legacy du fichier JSON
 */
interface LegacyProject {
  axis: string;
  code?: string;
  name: string;
  start: { y: number; q: number };
  end: { y: number; q: number };
}

/**
 * Convertit une année et un trimestre en date ISO
 */
function quarterToDate(year: number, quarter: number): string {
  const month = (quarter - 1) * 3; // Q1 = Jan (0), Q2 = Apr (3), Q3 = Jul (6), Q4 = Oct (9)
  const date = new Date(year, month, 1);
  return date.toISOString().split('T')[0];
}

/**
 * Convertit une date de fin de trimestre en date ISO
 */
function quarterEndToDate(year: number, quarter: number): string {
  // Q1 (jan-mar) -> fin mars, Q2 (avr-juin) -> fin juin, Q3 (jul-sept) -> fin sept, Q4 (oct-déc) -> fin déc
  let month: number;
  if (quarter === 4) {
    // Q4 : fin décembre = premier jour de l'année suivante moins 1 jour
    const date = new Date(year + 1, 0, 0); // Dernier jour de décembre
    return date.toISOString().split('T')[0];
  } else {
    // Q1, Q2, Q3 : dernier jour du dernier mois du trimestre
    month = quarter * 3; // 3, 6, 9
    const date = new Date(year, month, 0); // Dernier jour du mois précédent
    return date.toISOString().split('T')[0];
  }
}

/**
 * Convertit un projet au format legacy vers le format de l'application
 */
function convertLegacyProject(
  legacy: LegacyProject,
  groupMap: Map<string, string>,
  rowMap: Map<string, number>
): Omit<Project, 'id'> {
  // Obtenir ou créer le groupe ID pour cet axis
  let groupId = groupMap.get(legacy.axis);
  if (!groupId) {
    // Créer un nouvel ID de groupe (sera créé plus tard)
    groupId = `group-${legacy.axis.toLowerCase().replace(/\s+/g, '-')}`;
    groupMap.set(legacy.axis, groupId);
  }

  // Calculer la row (position verticale) - on groupe par axis
  let row = rowMap.get(legacy.axis) || 0;
  rowMap.set(legacy.axis, row + 1);

  // Convertir les dates
  const startDate = quarterToDate(legacy.start.y, legacy.start.q);
  const endDate = quarterEndToDate(legacy.end.y, legacy.end.q);

  return {
    code: legacy.code,
    name: legacy.name,
    groupId,
    startDate,
    endDate,
    row,
  };
}

/**
 * Détecte si le JSON est au format legacy
 */
function isLegacyFormat(data: any): data is LegacyProject[] {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;
  const first = data[0];
  return (
    typeof first === 'object' &&
    first !== null &&
    'axis' in first &&
    'start' in first &&
    'end' in first &&
    typeof first.start === 'object' &&
    'y' in first.start &&
    'q' in first.start
  );
}

/**
 * Génère une couleur pour un groupe basée sur son nom
 */
function generateColorForGroup(index: number): string {
  const colors = [
    '#3b82f6', // bleu
    '#10b981', // vert
    '#f59e0b', // orange
    '#ef4444', // rouge
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#ec4899', // rose
    '#84cc16', // lime
    '#f97316', // orange foncé
    '#6366f1', // indigo
  ];
  return colors[index % colors.length];
}

/**
 * Convertit un fichier JSON legacy vers le format de l'application
 */
export function convertLegacyJSON(data: any): {
  projects: Omit<Project, 'id'>[];
  groups: Omit<Group, 'id'>[];
} {
  if (!isLegacyFormat(data)) {
    throw new Error('Format JSON non reconnu. Attendu : tableau de projets avec axis/start/end');
  }

  const groupMap = new Map<string, string>();
  const rowMap = new Map<string, number>();
  const groupNames = new Map<string, string>(); // Pour garder les noms originaux

  // Première passe : identifier tous les axes uniques
  data.forEach((legacy) => {
    if (!groupMap.has(legacy.axis)) {
      const groupId = `group-${legacy.axis.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      groupMap.set(legacy.axis, groupId);
      groupNames.set(groupId, legacy.axis);
    }
  });

  // Créer les groupes
  const groups: Omit<Group, 'id'>[] = Array.from(groupNames.entries()).map(([groupId, name], index) => ({
    name,
    color: generateColorForGroup(index),
  }));

  // Convertir les projets
  const projects = data.map((legacy) => convertLegacyProject(legacy, groupMap, rowMap));

  return { projects, groups };
}

/**
 * Détecte et convertit automatiquement le format JSON
 */
export function autoConvertJSON(data: any): {
  projects?: Project[];
  groups?: Group[];
  timelineConfig?: any;
} {
  // Si c'est déjà le format de l'application
  if (data.projects && Array.isArray(data.projects)) {
    return data;
  }

  // Si c'est le format legacy
  if (isLegacyFormat(data)) {
    const converted = convertLegacyJSON(data);
    return {
      projects: converted.projects.map((p, i) => ({
        ...p,
        id: `project-${Date.now()}-${i}`,
      })),
      groups: converted.groups.map((g, i) => ({
        ...g,
        id: `group-${Date.now()}-${i}`,
      })),
    };
  }

  throw new Error('Format JSON non reconnu');
}

