import { createContext, useContext, useState, type ReactNode } from 'react'
import { initialSubmissions, type Role } from '@/modules/catalog/data'
type Submission = typeof initialSubmissions[number]
type Workspace = { role: Role; setRole: (r: Role) => void; submissions: Submission[]; addSubmission: (s: Submission) => void; gradeSubmission: (id: string, grade: number, feedback: string) => void }
const Context = createContext<Workspace | null>(null)
export function WorkspaceProvider({children}:{children:ReactNode}) {
 const [role,setRole] = useState<Role>('student')
 const [submissions,setSubmissions] = useState(initialSubmissions)
 return <Context.Provider value={{role,setRole,submissions,addSubmission:s=>setSubmissions(p=>[s,...p]),gradeSubmission:(id,grade,feedback)=>setSubmissions(p=>p.map(s=>s.id===id?{...s,grade,feedback,status:'Graded'}:s))}}>{children}</Context.Provider>
}
export function useWorkspace() { const value = useContext(Context); if (!value) throw new Error('Workspace provider missing'); return value }
