import AsyncStorage from '@react-native-async-storage/async-storage';
import type {CourseListItem} from './types';

const LOCAL_SHORTLIST_KEY = 'mm_local_shortlist_v1';

export async function getLocalShortlist(): Promise<CourseListItem[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_SHORTLIST_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CourseListItem[]) : [];
  } catch {
    return [];
  }
}

export async function saveLocalShortlist(courses: CourseListItem[]) {
  await AsyncStorage.setItem(LOCAL_SHORTLIST_KEY, JSON.stringify(courses));
}

export async function addLocalShortlist(course: CourseListItem) {
  const list = await getLocalShortlist();
  if (list.some(c => c.id === course.id)) {
    return;
  }
  await saveLocalShortlist([course, ...list]);
}

export async function removeLocalShortlist(courseId: number) {
  const list = await getLocalShortlist();
  await saveLocalShortlist(list.filter(c => c.id !== courseId));
}

/** Server list first; append local-only entries (e.g. API not deployed yet). */
export function mergeShortlistCourses(
  server: CourseListItem[],
  local: CourseListItem[],
): CourseListItem[] {
  const seen = new Set(server.map(c => c.id));
  const extras = local.filter(c => c.id > 0 && !seen.has(c.id));
  return [...server, ...extras];
}
