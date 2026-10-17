import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialStudents = [
  { id: "STU-1001", fullName: "Thabiso Matlosa", age: 20, email: "bigsminus@gmail.com", course: "Software Engineering", status: "Enrolled", fullTime: true },
  { id: "STU-1002", fullName: "Lerato molise", age: 19, email: "molise@gmail.com", course: "Graphic Design", status: "Enrolled", fullTime: true },
  { id: "STU-1003", fullName: "Puseletso Leboto", age: 22, email: "puseletso23@gmail.com", course: "Business Information Technology", status: "Graduated", fullTime: false },
  { id: "STU-1004", fullName: "Tumelo Khoase", age: 21, email: "tumeloKhoase@gmail.com", course: "Information Technology", status: "Pending", fullTime: true },
  { id: "STU-1005", fullName: "Nthati Keithabetse", age: 24, email: "nthatiKey@gmail.com", course: "Multimedia Design", status: "Enrolled", fullTime: false },
  { id: "STU-1006", fullName: "Karabelo Molapo", age: 23, email: "karabelomolapo@gmail.com", course: "Software Engineering", status: "Withdrawn", fullTime: true },
];

const COURSES = ["Information Technology","Business Information Technology","Software Engineering","Multimedia Design","Graphic Design","Fashion Design"];
const STATUSES = ["Enrolled", "Pending", "Graduated", "Withdrawn"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function generateStudentId(students) {
  let highest = 1000;
  students.forEach(s => { let n = parseInt(s.id.replace("STU-",""),10); if(!isNaN(n) && n > highest) highest = n; });
  return "STU-" + (highest+1);
}
const emptyForm = { fullName: "", age: "", email: "", course: "", status: "Enrolled", fullTime: true };
const toFormValues = (student) => ({...student, age: String(student.age) });
const normaliseValues = (form) => ({ fullName: form.fullName.trim().replace(/\s+/g," "), age: Number(form.age), email: form.email.trim().toLowerCase(), course: form.course, status: form.status, fullTime: Boolean(form.fullTime), });
function validateStudent(form, students, editingId = null) {
  const errors = {}; const name = form.fullName.trim(); const age = Number(form.age); const email = form.email.trim().toLowerCase();
  if (!name) errors.fullName = "Enter full name."; else if (name.length < 3) errors.fullName = "At least 3 characters.";
  if (String(form.age).trim() === "") errors.age = "Enter age."; else if (age < 15 || age > 80) errors.age = "Age must be 15-80.";
  if (!email) errors.email = "Enter email."; else if (!EMAIL_PATTERN.test(email)) errors.email = "Invalid email."; else if (students.some(s => s.email === email && s.id!== editingId)) errors.email = "Email already used.";
  if (!form.course) errors.course = "Choose a course."; if (!form.status) errors.status = "Choose status."; return errors;
}
function filterStudents(students, query, status) { const q = query.trim().toLowerCase(); return students.filter(s => { const matchesStatus = status === "All" || s.status === status; const matchesText =!q || [s.id, s.fullName, s.email, s.course].some(f => f.toLowerCase().includes(q)); return matchesStatus && matchesText; }); }
function summarise(students) { const total = students.length; const enrolled = students.filter(s => s.status === "Enrolled").length; const fullTime = students.filter(s => s.fullTime).length; const averageAge = total? Math.round(students.reduce((a,b)=>a+b.age,0)/total) : 0; return { total, enrolled, fullTime, averageAge }; }
const getInitials = (name) => name.split(" ").filter(Boolean).slice(0,2).map(p=>p[0].toUpperCase()).join("");

function Modal({ title, onClose, children }) {
  useEffect(() => { const onKey = (e) => e.key === "Escape" && onClose(); document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; }; }, [onClose]);
  return (<div className="overlay" onMouseDown={(e)=> e.target===e.currentTarget && onClose()}><div className="modal"><header className="modal__head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}>&times;</button></header>{children}</div></div>);
}

function DetailsModal({ type, students, onClose }) {
  let title = ""; let list = students;
  if(type==="total") title=`Total Students - ${students.length}`;
  if(type==="enrolled"){ list=students.filter(s=>s.status==="Enrolled"); title=`Currently Enrolled - ${list.length}`; }
  if(type==="fulltime"){ list=students.filter(s=>s.fullTime); title=`Full-time Students - ${list.length}`; }
  if(type==="age") title=`Average Age - ${Math.round(students.reduce((a,b)=>a+b.age,0)/students.length)} years`;

  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal__body" style={{maxHeight:"60vh", overflow:"auto"}}>
        {list.map(s=>(
          <div key={s.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex", gap:"10px", alignItems:"center"}}><span className="avatar" style={{width:"32px", height:"32px", fontSize:"10px"}}>{getInitials(s.fullName)}</span><div><strong>{s.fullName}</strong><br/><small style={{color:"#9aa0b5"}}>{s.id} • {s.course}</small></div></div>
            <span>{type==="age"? s.age+" yrs" : s.status}</span>
          </div>
        ))}
      </div>
      <footer className="modal__foot"><button className="btn btn--ghost" onClick={onClose}>Close</button></footer>
    </Modal>
  );
}

function StudentModal({ mode, student, students, onSave, onClose }) {
  const isEdit = mode === "edit"; const [form, setForm] = useState(isEdit? toFormValues(student) : emptyForm); const [errors, setErrors] = useState({});
  const handleChange = (e) => { const { name, type, value, checked } = e.target; setForm(p => ({...p, [name]: type==="checkbox"? checked : value })); setErrors(p => ({...p, [name]: undefined })); };
  const handleSubmit = (e) => { e.preventDefault(); const found = validateStudent(form, students, isEdit? student.id : null); if (Object.keys(found).length > 0) { setErrors(found); return; } onSave(form); };
  const field = (name, label, input) => (<div className={"field" + (errors[name]? " field--error" : "")}><label>{label}</label>{input}{errors[name] && <p className="error">{errors[name]}</p>}</div>);
  return (<Modal title={isEdit? "Edit student" : "Add a new student"} onClose={onClose}><form onSubmit={handleSubmit} noValidate><div className="modal__body"><p className="hint">Student ID: <strong>{isEdit? student.id : "assigned automatically"}</strong></p>{field("fullName","Full name",<input name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Katleho Mankholi" autoFocus />)}<div className="row">{field("age","Age",<input name="age" type="number" value={form.age} onChange={handleChange} placeholder="20" />)}{field("email","Email",<input name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@example.com" />)}</div>{field("course","Course",<select name="course" value={form.course} onChange={handleChange}><option value="">Choose a course</option>{COURSES.map(c=><option key={c} value={c}>{c}</option>)}</select>)}{field("status","Status",<select name="status" value={form.status} onChange={handleChange}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select>)}<label className="check"><input type="checkbox" name="fullTime" checked={form.fullTime} onChange={handleChange} /> Full-time student</label></div><footer className="modal__foot"><button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button><button type="submit" className="btn btn--primary">{isEdit? "Save changes" : "Add student"}</button></footer></form></Modal>);
}
function ConfirmModal({ student, onConfirm, onClose }) { return (<Modal title="Delete this student?" onClose={onClose}><div className="modal__body"><p><strong>{student.fullName}</strong> ({student.id}) will be removed. Cannot be undone.</p></div><footer className="modal__foot"><button className="btn btn--ghost" onClick={onClose}>Keep student</button><button className="btn btn--danger" onClick={()=>onConfirm(student.id)} autoFocus>Delete student</button></footer></Modal>); }

export default function App() {
  const [students, setStudents] = useState(()=>{ try{ const s=JSON.parse(localStorage.getItem("sms.v1")); if(Array.isArray(s)) return s; }catch{} return initialStudents; });
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("All"); const [modal, setModal] = useState({ type: null, student: null }); const [detailType, setDetailType] = useState(null); const [toast, setToast] = useState(""); const [page, setPage] = useState(1);
  useEffect(()=>{ localStorage.setItem("sms.v1", JSON.stringify(students)); },[students]);
  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(""),3000); return()=>clearTimeout(t); },[toast]);
  const openModal = (type, student=null) => setModal({ type, student }); const closeModal = () => setModal({ type: null, student: null });
  const handleAdd = (form) => { const s={ id: generateStudentId(students),...normaliseValues(form)}; setStudents(p=>[s,...p]); closeModal(); setToast(`${s.fullName} added.`); };
  const handleEdit = (form) => { const u=normaliseValues(form); setStudents(p=>p.map(s=>s.id===modal.student.id? {...s,...u} : s)); closeModal(); setToast(`${u.fullName} updated.`); };
  const handleDelete = (id) => { const r=students.find(s=>s.id===id); setStudents(p=>p.filter(s=>s.id!==id)); closeModal(); setToast(`${r.fullName} deleted.`); };
  const visible = useMemo(()=>filterStudents(students,query,status),[students,query,status]); const stats = useMemo(()=>summarise(students),[students]);
  const totalPages = Math.max(1, Math.ceil(visible.length/5)); const currentPage = Math.min(page,totalPages); const pageStudents = visible.slice((currentPage-1)*5, currentPage*5);
  return (
    <><header className="topbar"><div className="topbar__inner"><div className="logo"><span className="logo__icon">♦</span><div><strong>Limkokwing</strong><small>StudentHub</small></div></div><nav className="nav"><a className="active">Dashboard</a><a>Students</a><a>Courses</a><a>Attendance</a></nav><div className="topbar__actions"><button className="btn btn--primary" onClick={()=>openModal("add")}>+ Add Student</button></div></div></header>
      <main className="page"><div className="hero"><div><h1>Welcome back ✨</h1><p>Here's what's happening at Limkokwing today</p></div><div className="date-pill">📅 {new Date().toLocaleDateString('en-US',{month:'short', day:'numeric', year:'numeric'})}</div></div>
        <section className="stats">
          <div className="stat stat--clickable" onClick={()=>setDetailType("total")} style={{cursor:"pointer"}}><span className="stat__icon violet">👥</span><div><label>Total students</label><strong>{stats.total}</strong><small style={{color:"#4ade80"}}>Click to view ↓</small></div></div>
          <div className="stat stat--clickable" onClick={()=>setDetailType("enrolled")} style={{cursor:"pointer"}}><span className="stat__icon sky">📖</span><div><label>Currently enrolled</label><strong>{stats.enrolled}</strong><small style={{color:"#4ade80"}}>Click to view ↓</small></div></div>
          <div className="stat stat--clickable" onClick={()=>setDetailType("fulltime")} style={{cursor:"pointer"}}><span className="stat__icon pink">📊</span><div><label>Full-time</label><strong>{stats.fullTime}</strong><small style={{color:"#4ade80"}}>Click to view ↓</small></div></div>
          <div className="stat stat--clickable" onClick={()=>setDetailType("age")} style={{cursor:"pointer"}}><span className="stat__icon coral">🎓</span><div><label>Average age</label><strong>{stats.averageAge}</strong><small style={{color:"#4ade80"}}>Click to view ↓</small></div></div>
        </section>
        <section className="panel"><div className="toolbar"><input className="search" value={query} onChange={e=>{setQuery(e.target.value); setPage(1);}} placeholder="Search by name, ID, email or course" /><select value={status} onChange={e=>{setStatus(e.target.value); setPage(1);}}><option value="All">All statuses</option>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select><button className="btn btn--primary hide-mobile" onClick={()=>openModal("add")}>Add student</button></div><p className="count">Showing {visible.length} of {students.length} students</p><div className="table-wrap"><table><thead><tr><th>Student</th><th>Age</th><th>Email</th><th>Course</th><th>Status</th><th></th></tr></thead><tbody>{pageStudents.map(s=>(<tr key={s.id}><td><div className="person"><span className="avatar">{getInitials(s.fullName)}</span><div><strong>{s.fullName}</strong><small>{s.id}</small></div></div></td><td>{s.age}</td><td className="email">{s.email}</td><td><span className="course-pill">{s.course}</span></td><td><span className={`pill pill--${s.status.toLowerCase()}`}>{s.status}</span><small className="mode">{s.fullTime? "Full-time":"Part-time"}</small></td><td className="actions"><button className="btn btn--small" onClick={()=>openModal("edit",s)}>Edit</button><button className="btn btn--small btn--outline-danger" onClick={()=>openModal("delete",s)}>Delete</button></td></tr>))}</tbody></table></div><div className="pagination"><button disabled={currentPage===1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>{currentPage} / {totalPages}</span><button disabled={currentPage===totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button></div></section></main>
      <footer className="site-footer"><div className="site-footer__inner"><div><strong>Student Management System</strong><p>Faculty of ICT - Limkokwing University Lesotho</p></div><div><strong>Limkokwing University</strong><p>Lesotho</p></div></div><p className="site-footer__copy">© {new Date().getFullYear()} Student Management System. All rights reserved.</p></footer>
      {modal.type==="add" && <StudentModal mode="add" students={students} onSave={handleAdd} onClose={closeModal} />}{modal.type==="edit" && <StudentModal mode="edit" student={modal.student} students={students} onSave={handleEdit} onClose={closeModal} />}{modal.type==="delete" && <ConfirmModal student={modal.student} onConfirm={handleDelete} onClose={closeModal} />}{detailType && <DetailsModal type={detailType} students={students} onClose={()=>setDetailType(null)} />}{toast && <div className="toast">{toast}</div>}</>
  );
}