import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export interface Session {
  id: string
  name: string
  status: string
  current_url: string | null
  page_count: number
  memory_mb: number
  requests_count: number
  is_headless: boolean
  created_at: string
}

export interface Page {
  id: string
  session_id: string
  url: string
  title: string | null
  status_code: number | null
  load_time_ms: number | null
  memory_mb: number | null
  content_length: number | null
  elements_count: number | null
  links_count: number | null
  error: string | null
  created_at: string
  observation?: {
    text_content: string
    interactive_elements: Array<{ id: string; type: string; text: string; href?: string; placeholder?: string }>
    links: Array<{ text: string; href: string }>
  }
}

export interface Task {
  id: string
  session_id: string
  name: string
  type: string
  status: string
  target_url: string | null
  instructions: string | null
  result: Record<string, unknown> | null
  score: number | null
  duration_ms: number | null
  created_at: string
  completed_at: string | null
}

export interface Metrics {
  total_sessions: number
  active_sessions: number
  total_pages_fetched: number
  total_tasks: number
  completed_tasks: number
  avg_load_time_ms: number
  avg_memory_mb: number
  performance: { vs_chrome_speed: string; vs_chrome_memory: string; engine: string }
}

// Sessions
export const createSession = (name?: string) =>
  api.post<Session>('/sessions/', { name, is_headless: true }).then(r => r.data)

export const listSessions = () =>
  api.get<Session[]>('/sessions/').then(r => r.data)

export const closeSession = (id: string) =>
  api.delete(`/sessions/${id}`).then(r => r.data)

// Pages
export const fetchPage = (session_id: string, url: string) =>
  api.post<Page>('/pages/fetch', { session_id, url }).then(r => r.data)

export const listPages = (session_id: string) =>
  api.get<Page[]>(`/pages/session/${session_id}`).then(r => r.data)

// Tasks
export const createTask = (session_id: string, name: string, type: string, target_url: string, instructions?: string) =>
  api.post<Task>('/tasks/', { session_id, name, type, target_url, instructions }).then(r => r.data)

export const runTask = (task_id: string) =>
  api.post<Task>(`/tasks/${task_id}/run`).then(r => r.data)

export const listTasks = (session_id: string) =>
  api.get<Task[]>(`/tasks/session/${session_id}`).then(r => r.data)

// Metrics
export const getMetrics = () =>
  api.get<Metrics>('/metrics/overview').then(r => r.data)

export const getPerformance = () =>
  api.get('/metrics/performance').then(r => r.data)

export default api
