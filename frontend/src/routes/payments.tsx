import { createFileRoute } from '@tanstack/react-router'
import { Payments } from '@/modules/workspace/pages'
export const Route = createFileRoute('/payments')({head:()=>({meta:[{title:'Semester payments — Ubasify Practical Labs'},{name:'description',content:'Manage your per-course semester payments and receipts.'},{property:'og:title',content:'Semester payments — Ubasify Practical Labs'},{property:'og:description',content:'Manage your per-course semester payments and receipts.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Payments})
