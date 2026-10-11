import { describe, expect, it } from 'vitest'
import { requirePermission } from './guard.server'
describe('server permission boundary',()=>{
 const student={id:'demo-student',role:'student' as const,institutionId:'unilag'}
 const lecturer={id:'demo-lecturer',role:'lecturer' as const,institutionId:'unilag'}
 it('rejects missing sessions',()=>expect(()=>requirePermission(null,'grade','unilag')).toThrow('Unauthorized'))
 it('rejects student grading',()=>expect(()=>requirePermission(student,'grade','unilag')).toThrow('Forbidden'))
 it('rejects cross-institution grading',()=>expect(()=>requirePermission(lecturer,'grade','ibadan')).toThrow('Forbidden institution'))
 it('allows scoped lecturer grading',()=>expect(requirePermission(lecturer,'grade','unilag')).toEqual(lecturer))
 it('allows student submissions',()=>expect(requirePermission(student,'submit','unilag')).toEqual(student))
})
