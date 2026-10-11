import { createFileRoute } from '@tanstack/react-router'
import { Courses } from '@/modules/workspace/pages'
export const Route = createFileRoute('/courses')({head:()=>({meta:[{title:'My courses — Ubasify Practical Labs'},{name:'description',content:'Explore your semester practical course offerings.'},{property:'og:title',content:'My courses — Ubasify Practical Labs'},{property:'og:description',content:'Explore your semester practical course offerings.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Courses})
