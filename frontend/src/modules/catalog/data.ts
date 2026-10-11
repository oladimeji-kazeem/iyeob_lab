import computing from '@/assets/computing.jpg'
import physics from '@/assets/physics.jpg'
import biology from '@/assets/biology.jpg'
export type Role = 'student' | 'lecturer' | 'admin'
export const templates = [
 {id:'csc',code:'CSC 201',name:'Introduction to Programming',department:'Computer Science',image:computing,practicals:8,category:'computing'},
 {id:'phy',code:'PHY 102',name:'Electricity & Magnetism',department:'Physics',image:physics,practicals:6,category:'physics'},
 {id:'bio',code:'BIO 101',name:'General Biology',department:'Biological Sciences',image:biology,practicals:7,category:'biology'},
]
export const offerings = [
 {id:'csc-unilag-26',templateId:'csc',institution:'University of Lagos',semester:'First semester · 2026/2027',lecturer:'Dr. Adewale Bello',completed:3,fee:5000,enrolled:true},
 {id:'phy-unilag-26',templateId:'phy',institution:'University of Lagos',semester:'First semester · 2026/2027',lecturer:'Dr. Chidinma Okafor',completed:1,fee:4500,enrolled:true},
 {id:'bio-unilag-26',templateId:'bio',institution:'University of Lagos',semester:'First semester · 2026/2027',lecturer:'Prof. Tunde Akinola',completed:4,fee:4000,enrolled:true},
]
export const initialSubmissions = [
 {id:'s1',student:'Alex Johnson',course:'CSC 201',practical:'Variables & data types',date:'Oct 8, 2026',status:'Graded',grade:92,feedback:'Excellent implementation. Clear variable naming and thorough test cases.'},
 {id:'s2',student:'Alex Johnson',course:'BIO 101',practical:'Cell structure & microscopy',date:'Oct 9, 2026',status:'In review',grade:0,feedback:''},
 {id:'s3',student:'Sarah Adeyemi',course:'PHY 102',practical:'Ohm’s law & resistance',date:'Oct 10, 2026',status:'Submitted',grade:0,feedback:''},
]
export const practicals = ['Variables & data types','Control flow & loops','Functions & modular programming','Arrays & data structures','File handling','Error handling','Object-oriented programming','Final practical project']
