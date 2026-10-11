import { createFileRoute } from '@tanstack/react-router'
import { CourseDetail } from '@/modules/workspace/pages'
import { offerings, templates } from '@/modules/catalog/data'
export const Route = createFileRoute('/courses/$courseId')({head:({params})=>{const o=offerings.find(o=>o.id===params.courseId);const c=templates.find(c=>c.id===o?.templateId);const title=`${c?.name??'Course practicals'} — Ubasify Practical Labs`;const description='Access your practical manual, download resources and submit your work for review.';return {meta:[{title},{name:'description',content:description},{property:'og:title',content:title},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}},component:CoursePage})
function CoursePage(){const {courseId}=Route.useParams();return <CourseDetail id={courseId}/> }
