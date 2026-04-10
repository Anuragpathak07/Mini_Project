/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const STORAGE_KEY = "atelierHealth_v1";

const MEDICINES = [
  { id: 1, name: "Paracetamol 500mg", category: "Pain Relief", price: 45, unit: "Strip of 10", icon: "💊", inStock: true, description: "Fast-acting pain relief & fever reducer" },
  { id: 2, name: "Cetirizine 10mg", category: "Allergy", price: 60, unit: "Strip of 10", icon: "💊", inStock: true, description: "Non-drowsy antihistamine for allergy relief" },
  { id: 3, name: "Omeprazole 20mg", category: "Digestive", price: 85, unit: "Strip of 14", icon: "💊", inStock: true, description: "Reduces stomach acid production" },
  { id: 4, name: "Vitamin D3 1000IU", category: "Vitamins", price: 120, unit: "Bottle of 60", icon: "🟡", inStock: true, description: "Supports bone health & immunity" },
  { id: 5, name: "Metformin 500mg", category: "Diabetes", price: 95, unit: "Strip of 10", icon: "💊", inStock: false, description: "Type 2 diabetes management" },
  { id: 6, name: "Atorvastatin 10mg", category: "Cardiac", price: 130, unit: "Strip of 15", icon: "❤️", inStock: true, description: "Cholesterol management statin" },
  { id: 7, name: "Azithromycin 500mg", category: "Antibiotic", price: 150, unit: "Strip of 3", icon: "💊", inStock: true, description: "Broad-spectrum antibiotic" },
  { id: 8, name: "Multivitamin Complex", category: "Vitamins", price: 200, unit: "Bottle of 30", icon: "🟡", inStock: true, description: "Complete daily nutrition support" },
];

const DOCTORS = [
  { id: 1, name: "Dr. Priya Sharma", specialty: "Cardiologist", rating: 4.9, exp: "12 yrs", available: true, fee: 800, img: "PS" },
  { id: 2, name: "Dr. Rahul Mehta", specialty: "General Physician", rating: 4.7, exp: "8 yrs", available: true, fee: 500, img: "RM" },
  { id: 3, name: "Dr. Anjali Singh", specialty: "Dermatologist", rating: 4.8, exp: "10 yrs", available: false, fee: 700, img: "AS" },
  { id: 4, name: "Dr. Vikram Nair", specialty: "Orthopedic", rating: 4.6, exp: "15 yrs", available: true, fee: 900, img: "VN" },
];

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

function loadStore() {
  try {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    // Also pick up user written by the login page (key: 'user')
    if (!store.user) {
      const loginUser = localStorage.getItem('user');
      if (loginUser) store.user = JSON.parse(loginUser);
    }
    return store;
  } catch { return {}; }
}
function saveStore(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#1E3A8A;--blue-mid:#2563EB;--blue-light:#EFF6FF;--blue-border:#BFDBFE;
  --navy:#0F1B3C;--text:#0f172a;--muted:#64748b;--border:#e2e8f0;
  --white:#fff;--bg:#F8FAFC;--card:#fff;--success:#059669;--warn:#D97706;--danger:#DC2626;
  --radius:12px;--radius-sm:8px;
  --shadow:0 1px 3px rgba(0,0,0,.07),0 1px 2px rgba(0,0,0,.05);
  --shadow-md:0 4px 16px rgba(0,0,0,.09);
  --f-body:'Plus Jakarta Sans',sans-serif;
  --f-display:'Playfair Display',serif;
}
body{font-family:var(--f-body);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;letter-spacing:-.01em}
h1,h2,h3,h4{font-family:var(--f-display);letter-spacing:-.02em}
button{cursor:pointer;border:none;background:none;font-family:var(--f-body)}
input,select,textarea{font-family:var(--f-body);font-size:14px}

.dash{display:flex;min-height:100vh;background:var(--bg)}
.sidebar{width:256px;background:white;border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:40;overflow-y:auto}
.sidebar-logo{display:flex;align-items:center;gap:10px;padding:22px 20px 18px;border-bottom:1px solid var(--border);cursor:pointer}
.sidebar-logo-icon{width:36px;height:36px;background:var(--blue);border-radius:9px;display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0}
.sidebar-logo-text h2{font-size:16px;color:var(--navy);line-height:1.2;font-weight:600}
.sidebar-logo-text p{font-size:11px;color:var(--muted);font-family:var(--f-body);font-weight:400}
.sidebar-nav{padding:14px 10px;flex:1}
.nav-item{display:flex;align-items:center;gap:11px;padding:9px 13px;border-radius:var(--radius-sm);font-size:13.5px;font-weight:500;color:var(--muted);transition:all .18s;margin-bottom:1px;cursor:pointer;width:100%;text-align:left;font-family:var(--f-body)}
.nav-item:hover{background:var(--blue-light);color:var(--blue)}
.nav-item.active{background:var(--navy);color:white}
.sidebar-footer{padding:14px}
.sidebar-btn-new{width:100%;background:var(--blue);color:white;font-size:13.5px;font-weight:600;padding:11px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;gap:8px;font-family:var(--f-body)}
.sidebar-btn-new:hover{background:var(--blue-mid)}

.main{margin-left:256px;flex:1;display:flex;flex-direction:column;min-height:100vh}
.topbar{background:white;border-bottom:1px solid var(--border);padding:12px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:30}
.search-wrap{display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:8px 16px;width:280px}
.search-wrap input{border:none;background:none;outline:none;font-size:13.5px;color:var(--text);width:100%;font-family:var(--f-body)}
.topbar-right{display:flex;align-items:center;gap:14px}
.notif-btn{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--muted);background:var(--bg);border:1px solid var(--border);position:relative}
.notif-badge{position:absolute;top:-2px;right:-2px;width:15px;height:15px;background:var(--danger);border-radius:50%;font-size:9px;color:white;display:flex;align-items:center;justify-content:center;font-weight:700}
.user-chip{display:flex;align-items:center;gap:9px;padding:4px 12px 4px 4px;border-radius:20px;border:1px solid var(--border);transition:background .15s}
.user-chip:hover{background:var(--bg)}
.user-avatar{width:32px;height:32px;border-radius:50%;background:var(--navy);color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;letter-spacing:.03em}
.user-info-name{font-size:13px;font-weight:600;color:var(--navy);line-height:1.3;font-family:var(--f-body)}
.logout-btn{font-size:11px;color:var(--muted);text-decoration:underline;cursor:pointer;background:none;border:none;font-family:var(--f-body);padding:0;display:block;text-align:right;transition:color .15s;line-height:1.3}
.logout-btn:hover{color:var(--danger)}

.content{padding:28px 32px;flex:1}
.page-header{margin-bottom:24px}
.page-tag{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--blue-mid);margin-bottom:6px;font-family:var(--f-body)}
.page-title{font-size:clamp(24px,2.8vw,32px);color:var(--navy);line-height:1.15;font-weight:600}
.page-sub{font-size:14px;color:var(--muted);margin-top:5px;font-family:var(--f-body);font-weight:400}

.card{background:white;border:1px solid var(--border);border-radius:var(--radius);padding:22px;box-shadow:var(--shadow)}
.bento{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}
.col-5{grid-column:span 5}.col-7{grid-column:span 7}
.col-4{grid-column:span 4}.col-6{grid-column:span 6}.col-12{grid-column:span 12}
@media(max-width:900px){.col-5,.col-7,.col-4,.col-6{grid-column:span 12}}

.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
@media(max-width:900px){.stat-grid{grid-template-columns:repeat(2,1fr)}}
.stat-card{background:white;border:1px solid var(--border);border-radius:var(--radius);padding:18px;box-shadow:var(--shadow)}
.stat-card-icon{width:40px;height:40px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px}
.stat-card h3{font-size:28px;color:var(--navy);font-weight:600;line-height:1}
.stat-card p{font-size:12.5px;color:var(--muted);margin-top:3px;font-family:var(--f-body)}
.stat-card-badge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;margin-top:8px;display:inline-block;font-family:var(--f-body)}

.vitals-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.health-metric{padding:13px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg)}
.hm-label{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);font-family:var(--f-body)}
.hm-value{font-size:20px;color:var(--navy);margin:4px 0;font-weight:600;line-height:1.1;font-family:var(--f-display)}
.hm-unit{font-size:11px;color:var(--muted);font-family:var(--f-body);font-weight:400}
.hm-bar{height:3px;border-radius:2px;background:var(--border);margin-top:8px;overflow:hidden}
.hm-bar-fill{height:100%;border-radius:2px;transition:width .6s ease}
.hm-empty{font-size:12.5px;color:var(--muted);font-style:italic;padding:6px 0;font-family:var(--f-body)}

.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.section-header h3{font-size:15px;font-weight:600;color:var(--navy);font-family:var(--f-body);letter-spacing:-.02em}
.view-all{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--blue-mid);cursor:pointer;background:var(--blue-light);padding:4px 11px;border-radius:20px;border:none;font-family:var(--f-body);transition:all .15s}
.view-all:hover{background:var(--blue);color:white}
.section-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;padding-bottom:7px;border-bottom:1px solid var(--border);font-family:var(--f-body)}

.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11.5px;font-weight:600;font-family:var(--f-body)}
.badge-blue{background:var(--blue-light);color:var(--blue)}
.badge-green{background:#ECFDF5;color:var(--success)}
.badge-red{background:#FEF2F2;color:var(--danger)}
.badge-amber{background:#FFFBEB;color:var(--warn)}
.badge-gray{background:#F1F5F9;color:#475569}

.quick-actions{display:flex;gap:10px;flex-wrap:wrap}
.qa-btn{display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:var(--radius-sm);font-size:13.5px;font-weight:500;border:1.5px solid var(--border);color:var(--navy);background:white;transition:all .18s;font-family:var(--f-body)}
.qa-btn:hover{border-color:var(--blue-mid);color:var(--blue);background:var(--blue-light)}

.timeline-item{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)}
.timeline-item:last-child{border-bottom:none}
.tl-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;margin-top:5px}
.tl-content h4{font-size:13.5px;font-weight:600;color:var(--navy);font-family:var(--f-body)}
.tl-content p{font-size:12.5px;color:var(--muted);margin-top:2px;font-family:var(--f-body)}

.appt-card{display:flex;gap:12px;padding:13px;border:1px solid var(--border);border-radius:var(--radius-sm);background:white;align-items:center;transition:all .18s}
.appt-card:hover{border-color:var(--blue-border);box-shadow:var(--shadow)}
.appt-avatar{width:42px;height:42px;border-radius:9px;background:var(--navy);color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.appt-info h4{font-size:13.5px;font-weight:600;color:var(--navy);font-family:var(--f-body)}
.appt-info p{font-size:12.5px;color:var(--muted);font-family:var(--f-body)}

.doctor-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.doctor-card{background:white;border:1.5px solid var(--border);border-radius:var(--radius);padding:18px;transition:all .2s;cursor:pointer}
.doctor-card:hover{border-color:var(--blue-mid);box-shadow:var(--shadow-md);transform:translateY(-1px)}
.doctor-card.selected{border-color:var(--blue-mid);background:var(--blue-light)}
.doc-avatar{width:48px;height:48px;border-radius:11px;background:var(--navy);color:white;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.doc-name{font-size:14.5px;font-weight:700;color:var(--navy);font-family:var(--f-body)}
.doc-spec{font-size:12.5px;color:var(--muted);margin-bottom:7px;font-family:var(--f-body)}
.doc-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.doc-meta span{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:3px;font-family:var(--f-body)}
.slot-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
.slot{padding:7px 4px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:11.5px;font-weight:600;color:var(--muted);text-align:center;cursor:pointer;transition:all .18s;font-family:var(--f-body)}
.slot:hover{border-color:var(--blue-mid);color:var(--blue);background:var(--blue-light)}
.slot.selected{background:var(--navy);border-color:var(--navy);color:white}
.book-panel{background:white;border:1px solid var(--border);border-radius:var(--radius);padding:22px;position:sticky;top:76px;box-shadow:var(--shadow)}

.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
.product-card{background:white;border:1.5px solid var(--border);border-radius:var(--radius);padding:18px;transition:all .18s;display:flex;flex-direction:column}
.product-card:hover{border-color:var(--blue-mid);box-shadow:var(--shadow-md)}
.product-icon{font-size:26px;margin-bottom:10px}
.product-name{font-size:14px;font-weight:700;color:var(--navy);margin-bottom:3px;font-family:var(--f-body)}
.product-desc{font-size:12.5px;color:var(--muted);margin-bottom:10px;flex:1;line-height:1.5;font-family:var(--f-body)}
.product-price{font-size:17px;font-weight:700;color:var(--navy);font-family:var(--f-display)}
.product-price span{font-size:11.5px;font-weight:400;color:var(--muted);font-family:var(--f-body)}
.product-footer{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)}
.add-btn{background:var(--navy);color:white;font-size:12.5px;font-weight:600;padding:7px 14px;border-radius:var(--radius-sm);transition:background .18s;font-family:var(--f-body)}
.add-btn:hover{background:var(--blue)}
.add-btn:disabled{background:var(--border);color:var(--muted);cursor:not-allowed}
.qty-ctrl{display:flex;align-items:center;gap:7px}
.qty-btn{width:26px;height:26px;border-radius:6px;border:1.5px solid var(--border);color:var(--navy);font-size:15px;display:flex;align-items:center;justify-content:center;font-weight:700;transition:all .15s;font-family:var(--f-body)}
.qty-btn:hover{border-color:var(--blue);color:var(--blue)}
.cart-panel{background:white;border:1px solid var(--border);border-radius:var(--radius);padding:18px;position:sticky;top:76px;box-shadow:var(--shadow)}
.cart-item{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border)}
.cart-total{font-size:17px;font-weight:700;color:var(--navy);font-family:var(--f-display)}
.filter-bar{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}
.filter-chip{padding:5px 13px;border-radius:20px;font-size:12.5px;font-weight:600;border:1.5px solid var(--border);color:var(--muted);cursor:pointer;transition:all .18s;font-family:var(--f-body)}
.filter-chip.active{background:var(--navy);border-color:var(--navy);color:white}

.invoice-row{display:flex;align-items:center;justify-content:space-between;padding:13px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:white;margin-bottom:7px;transition:all .18s}
.invoice-row:hover{border-color:var(--blue-border);box-shadow:var(--shadow)}
.invoice-icon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
.inv-info h4{font-size:13.5px;font-weight:600;color:var(--navy);font-family:var(--f-body)}
.inv-info p{font-size:12px;color:var(--muted);font-family:var(--f-body)}
.inv-amount{font-size:15px;font-weight:700;color:var(--navy);font-family:var(--f-display);text-align:right}
.inv-amount small{display:block;font-family:var(--f-body);font-size:11px;color:var(--muted);font-weight:400}
.pay-btn{background:var(--success);color:white;font-size:12.5px;font-weight:600;padding:6px 13px;border-radius:var(--radius-sm);font-family:var(--f-body)}
.pay-btn:hover{background:#047857}

.report-dropzone{border:2px dashed var(--border);border-radius:var(--radius);padding:44px;text-align:center;transition:all .18s;cursor:pointer;background:var(--bg)}
.report-dropzone:hover,.report-dropzone.over{border-color:var(--blue-mid);background:var(--blue-light)}
.report-card{display:flex;align-items:center;gap:14px;padding:14px;background:white;border:1px solid var(--border);border-radius:var(--radius);margin-bottom:8px;transition:all .18s}
.report-card:hover{border-color:var(--blue-border);box-shadow:var(--shadow)}
.report-icon{width:42px;height:42px;background:var(--blue-light);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;color:var(--blue)}
.report-info h4{font-size:13.5px;font-weight:600;color:var(--navy);font-family:var(--f-body)}
.report-info p{font-size:12px;color:var(--muted);font-family:var(--f-body)}
.report-actions{margin-left:auto;display:flex;gap:7px}
.report-action-btn{font-size:12.5px;font-weight:600;color:var(--blue);padding:5px 11px;border-radius:var(--radius-sm);border:1px solid var(--blue-border);background:var(--blue-light);transition:all .18s;font-family:var(--f-body)}
.report-action-btn:hover{background:var(--blue);color:white}

.profile-grid{display:grid;grid-template-columns:280px 1fr;gap:18px}
@media(max-width:900px){.profile-grid{grid-template-columns:1fr}}
.profile-avatar-big{width:76px;height:76px;border-radius:16px;background:var(--navy);color:white;font-size:26px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.profile-name{font-size:19px;color:var(--navy);text-align:center;margin-bottom:3px;font-weight:600}
.profile-email{font-size:12.5px;color:var(--muted);text-align:center;margin-bottom:14px;font-family:var(--f-body)}
.profile-stat{padding:11px;background:var(--bg);border-radius:var(--radius-sm);text-align:center}
.profile-stat h3{font-size:19px;color:var(--navy);font-weight:600}
.profile-stat p{font-size:11.5px;color:var(--muted);font-family:var(--f-body)}

.chat-fab{position:fixed;bottom:24px;right:24px;z-index:100;width:52px;height:52px;border-radius:50%;background:var(--navy);color:white;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-md);transition:all .2s}
.chat-fab:hover{background:var(--blue);transform:scale(1.04)}
.chat-window{position:fixed;bottom:88px;right:24px;z-index:100;width:340px;height:500px;background:white;border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-md);display:flex;flex-direction:column;overflow:hidden}
.chat-header{background:var(--navy);padding:14px 18px}
.chat-header h3{color:white;font-size:16px;font-weight:600}
.chat-header p{color:rgba(255,255,255,.6);font-size:11.5px;font-family:var(--f-body)}
.chat-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.chat-msg{max-width:86%;padding:9px 13px;border-radius:13px;font-size:13.5px;line-height:1.55;font-family:var(--f-body)}
.chat-msg.user{align-self:flex-end;background:var(--navy);color:white;border-bottom-right-radius:3px}
.chat-msg.ai{align-self:flex-start;background:var(--bg);color:var(--text);border:1px solid var(--border);border-bottom-left-radius:3px}
.chat-msg.typing{opacity:.55}
.chat-input-row{padding:10px 14px;border-top:1px solid var(--border);display:flex;gap:8px}
.chat-input{flex:1;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:9px 13px;font-size:13.5px;outline:none;resize:none;background:var(--bg);font-family:var(--f-body)}
.chat-input:focus{border-color:var(--blue-mid)}
.chat-send{background:var(--navy);color:white;width:38px;height:38px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0;align-self:flex-end;transition:background .15s}
.chat-send:hover{background:var(--blue)}

.ai-result{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:18px;margin-top:14px}
.modal-overlay{position:fixed;inset:0;background:rgba(15,27,60,.4);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
.modal-box{background:white;border-radius:14px;padding:28px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,.18)}
.modal-box h3{font-size:20px;color:var(--navy);margin-bottom:7px;font-weight:600}
.modal-box p{font-size:13.5px;color:var(--muted);margin-bottom:0;line-height:1.6;font-family:var(--f-body)}
.modal-actions{display:flex;gap:9px;margin-top:20px}
.modal-cancel{flex:1;padding:11px;border-radius:var(--radius-sm);border:1.5px solid var(--border);font-size:13.5px;font-weight:600;color:var(--muted);font-family:var(--f-body)}
.modal-confirm{flex:1;padding:11px;border-radius:var(--radius-sm);background:var(--navy);color:white;font-size:13.5px;font-weight:600;font-family:var(--f-body)}
.modal-confirm:hover{background:var(--blue)}

.form-group{margin-bottom:14px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.form-label{display:block;font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:5px;font-family:var(--f-body)}
.form-input{width:100%;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:10px 13px 10px 38px;font-size:13.5px;color:var(--text);background:var(--bg);transition:border-color .18s;outline:none;font-family:var(--f-body)}
.form-input:focus{border-color:var(--blue-mid);background:white}
.form-input-wrap{position:relative}
.btn-submit{width:100%;background:var(--navy);color:white;font-size:14px;font-weight:700;padding:13px;border-radius:var(--radius);margin-top:7px;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .18s;font-family:var(--f-body)}
.btn-submit:hover{background:var(--blue)}
.btn-submit:disabled{opacity:.65;cursor:not-allowed}
.btn-primary{background:var(--blue);color:white;font-size:13.5px;font-weight:600;padding:9px 20px;border-radius:20px;border:none;cursor:pointer;font-family:var(--f-body);transition:background .15s}
.btn-primary:hover{background:#1d4ed8}

.empty-state{text-align:center;padding:44px 20px;color:var(--muted)}
.empty-state .es-icon{font-size:36px;margin-bottom:10px;color:var(--blue-border)}
.empty-state p{font-size:13.5px;font-family:var(--f-body)}
.empty-state h3{font-size:15px;font-weight:600;color:var(--navy);margin-bottom:3px;font-family:var(--f-body)}
.tab-bar{display:flex;gap:3px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px;margin-bottom:18px;width:fit-content}
.tab-item{padding:7px 16px;border-radius:6px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .18s;font-family:var(--f-body)}
.tab-item.active{background:white;color:var(--navy);box-shadow:var(--shadow)}
.divider{height:1px;background:var(--border);margin:14px 0}
.success-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--navy);color:white;padding:11px 22px;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;z-index:500;box-shadow:var(--shadow-md);animation:slideUp .28s ease;font-family:var(--f-body)}
@keyframes slideUp{from{transform:translateX(-50%) translateY(18px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
.fade-in{animation:fadeIn .35s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.ms{font-family:'Material Symbols Outlined';font-size:20px;line-height:1;font-style:normal;font-variation-settings:'FILL' 0,'wght' 400}
.ms-fill{font-variation-settings:'FILL' 1,'wght' 400}
select.form-input{appearance:none;padding-left:13px}
textarea.form-input{padding:11px 13px;resize:vertical;min-height:80px}
`;

const Icon = ({ name, fill = false, style = {} }) => (
  <span className={`ms${fill ? " ms-fill" : ""}`} style={style}>{name}</span>
);

function Toast({ msg }) {
  return msg ? <div className="success-toast">{msg}</div> : null;
}

function Modal({ title, body, onConfirm, onCancel, confirmText = "Confirm" }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const [internalStore, setInternalStore] = useState(loadStore);
  const [internalToast, setInternalToast] = useState("");
  const isStandalone = true;
  const store = internalStore;

  const updateStore = useCallback((patch: Record<string, unknown>) => {
    setInternalStore((prev: Record<string, unknown>) => {
      const next = { ...prev, ...patch };
      saveStore(next);
      return next;
    });
  }, []);

  const showToast = (msg: string) => {
    setInternalToast(msg);
    setTimeout(() => setInternalToast(""), 3000);
  };

  const onLogout = () => {
    // Clear all auth keys written by login page and our own store
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Guard: if no user is present, redirect to login
  useEffect(() => {
    if (isStandalone) {
      const hasUser = store.user || localStorage.getItem('user');
      if (!hasUser) {
        window.location.href = '/login';
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{CSS}</style>
      {isStandalone && <Toast msg={internalToast} />}
      <Dashboard store={store} updateStore={updateStore} onLogout={onLogout} showToast={showToast} />
    </>
  );
}

// ─── DASHBOARD SHELL ─────────────────────────────────────────────────────────
function Dashboard({ store, updateStore, onLogout, showToast }) {
  const [tab, setTab] = useState("overview");
  const [chatOpen, setChatOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const user = store.user || {};
  const firstName = user.firstName || user.email?.split("@")[0] || "Patient";
  const initials = ((user.firstName || "P").charAt(0) + (user.lastName || "").charAt(0)).toUpperCase();

  const NAV = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "appointments", label: "Appointments", icon: "calendar_month" },
    { id: "records", label: "Medical Records", icon: "folder_shared" },
    { id: "simplifier", label: "AI Simplifier", icon: "auto_awesome" },
    { id: "pharmacy", label: "E-Pharmacy", icon: "local_pharmacy" },
    { id: "billing", label: "Billing", icon: "receipt_long" },
    { id: "profile", label: "My Profile", icon: "account_circle" },
  ];

  const doLogout = () => {
    updateStore({ user: null });
    saveStore({});
    onLogout();
  };

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => setTab("overview")}>
          <div className="sidebar-logo-icon"><Icon name="medical_services" fill style={{ fontSize: 18 }} /></div>
          <div className="sidebar-logo-text">
            <h2>Atelier Health</h2>
            <p>Patient Portal</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-item${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
              <Icon name={n.icon} style={{ fontSize: 19 }} />{n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-btn-new" onClick={() => setTab("appointments")}>
            <Icon name="add" style={{ fontSize: 18 }} />New Appointment
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search-wrap">
            <Icon name="search" style={{ color: "#94a3b8", fontSize: 17 }} />
            <input placeholder="Search records, medicines…" />
          </div>
          <div className="topbar-right">
            <button className="notif-btn">
              <Icon name="notifications" style={{ fontSize: 18 }} />
              {(store.appointments || []).filter(a => a.status === "upcoming").length > 0 && (
                <span className="notif-badge">{(store.appointments || []).filter(a => a.status === "upcoming").length}</span>
              )}
            </button>
            <div className="user-chip">
              <div className="user-avatar">{initials || "P"}</div>
              <div>
                <div className="user-info-name">{firstName}</div>
                {/* ── Logout button: shows confirmation modal ── */}
                <button className="logout-btn" onClick={() => setLogoutModal(true)}>Log out</button>
              </div>
            </div>
          </div>
        </header>

        <div className="content fade-in">
          {tab === "overview" && <OverviewTab store={store} setTab={setTab} showToast={showToast} />}
          {tab === "appointments" && <AppointmentsTab store={store} updateStore={updateStore} showToast={showToast} />}
          {tab === "records" && <RecordsTab store={store} updateStore={updateStore} showToast={showToast} />}
          {tab === "simplifier" && <SimplifierTab store={store} updateStore={updateStore} showToast={showToast} />}
          {tab === "pharmacy" && <PharmacyTab store={store} updateStore={updateStore} showToast={showToast} />}
          {tab === "billing" && <BillingTab store={store} updateStore={updateStore} showToast={showToast} />}
          {tab === "profile" && <ProfileTab store={store} updateStore={updateStore} showToast={showToast} />}
        </div>
      </main>

      <button className="chat-fab" onClick={() => setChatOpen(o => !o)}>
        <Icon name={chatOpen ? "close" : "chat"} style={{ fontSize: 22 }} />
      </button>
      {chatOpen && <ChatWidget store={store} />}

      {logoutModal && (
        <Modal
          title="Log out?"
          body="You'll be returned to the login screen. Your data is saved locally and will be available when you return."
          confirmText="Yes, Log Out"
          onConfirm={doLogout}
          onCancel={() => setLogoutModal(false)}
        />
      )}
    </div>
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
function OverviewTab({ store, setTab }) {
  const user = store.user || {};
  const appts = store.appointments || [];
  const reports = store.reports || [];
  const orders = store.orders || [];
  // ── No fallbacks: only what the patient has saved ──
  const vitals = store.vitals || {};

  const firstName = user.firstName || user.email?.split("@")[0] || "Patient";

  // Vitals to show — value comes purely from patient input
  const VITAL_FIELDS = [
    { key: "bp", label: "Blood Pressure", unit: "mmHg", color: "#DC2626", pct: 60 },
    { key: "hr", label: "Heart Rate", unit: "bpm", color: "#2563EB", pct: 72 },
    { key: "temp", label: "Temperature", unit: "°F", color: "#D97706", pct: 70 },
    { key: "spo2", label: "SpO2", unit: "%", color: "#059669", pct: 98 },
    { key: "_bg", label: "Blood Group", unit: "", color: "#7C3AED", pct: 100 },
    { key: "weight", label: "Weight", unit: "kg", color: "#0891B2", pct: 60 },
  ];

  const getVal = (field) => {
    if (field.key === "_bg") return user.bloodGroup || null;
    return vitals[field.key] || null;
  };

  const hasAnyVital = VITAL_FIELDS.some(f => getVal(f));

  return (
    <div>
      <div className="page-header">
        <div className="page-tag">Patient Dashboard</div>
        <h1 className="page-title">Welcome back, {firstName}.</h1>
        <p className="page-sub">Your health metrics and records are synchronized.</p>
      </div>

      <div className="stat-grid">
        {[
          { label: "Appointments", value: appts.length, icon: "calendar_month", color: "#EFF6FF", ic: "#2563EB", badge: `${appts.filter(a => a.status === "upcoming").length} upcoming`, bc: "badge-blue" },
          { label: "Medical Reports", value: reports.length, icon: "description", color: "#ECFDF5", ic: "#059669", badge: "All synced", bc: "badge-green" },
          { label: "Prescriptions", value: store.prescriptions?.length || 0, icon: "medication", color: "#FFFBEB", ic: "#D97706", badge: "Up to date", bc: "badge-amber" },
          { label: "Orders", value: orders.length, icon: "shopping_bag", color: "#FEF2F2", ic: "#DC2626", badge: `${orders.filter(o => o.status === "processing").length} active`, bc: "badge-red" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.color, color: s.ic }}><Icon name={s.icon} fill /></div>
            <h3>{s.value}</h3>
            <p>{s.label}</p>
            <span className={`badge ${s.bc} stat-card-badge`}>{s.badge}</span>
          </div>
        ))}
      </div>

      <div className="bento">
        {/* Health Vitals */}
        <div className="col-7 card">
          <div className="section-header">
            <h3>Health Vitals</h3>
            <button className="view-all" onClick={() => setTab("profile")}>Update</button>
          </div>
          {!hasAnyVital ? (
            <div className="empty-state" style={{ padding: "28px 0" }}>
              <div className="es-icon"><Icon name="monitor_heart" style={{ fontSize: 34 }} /></div>
              <h3>No vitals recorded yet</h3>
              <p>Go to My Profile to enter your health metrics</p>
              <button className="btn-primary" style={{ marginTop: 12, fontSize: 12, padding: "7px 16px", borderRadius: 8 }} onClick={() => setTab("profile")}>Add Vitals</button>
            </div>
          ) : (
            <div className="vitals-grid">
              {VITAL_FIELDS.map(f => {
                const val = getVal(f);
                return (
                  <div key={f.key} className="health-metric">
                    <div className="hm-label">{f.label}</div>
                    {val ? (
                      <>
                        <div className="hm-value">{val}{f.unit && <span className="hm-unit"> {f.unit}</span>}</div>
                        {f.unit && <div className="hm-bar"><div className="hm-bar-fill" style={{ width: `${f.pct}%`, background: f.color }} /></div>}
                      </>
                    ) : (
                      <div className="hm-empty">Not entered</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="col-5 card">
          <div className="section-header">
            <h3>Upcoming Appointments</h3>
            <button className="view-all" onClick={() => setTab("appointments")}>View All</button>
          </div>
          {appts.filter(a => a.status === "upcoming").length === 0 ? (
            <div className="empty-state" style={{ padding: "28px 0" }}>
              <div className="es-icon"><Icon name="calendar_month" style={{ fontSize: 34 }} /></div>
              <h3>No upcoming appointments</h3>
              <p>Book your next consultation</p>
              <button className="btn-primary" style={{ marginTop: 12, fontSize: 12, padding: "7px 16px", borderRadius: 8 }} onClick={() => setTab("appointments")}>Book Now</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {appts.filter(a => a.status === "upcoming").slice(0, 3).map((a, i) => (
                <div key={i} className="appt-card">
                  <div className="appt-avatar">{a.doctorImg}</div>
                  <div className="appt-info">
                    <h4>{a.doctorName}</h4>
                    <p>{a.specialty} · {a.date}, {a.slot}</p>
                    <span className="badge badge-blue" style={{ marginTop: 4 }}>{a.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="col-5 card">
          <div className="section-header"><h3>Quick Actions</h3></div>
          <div className="quick-actions">
            {[
              { label: "Book Appointment", icon: "calendar_add_on", tab: "appointments" },
              { label: "Upload Report", icon: "upload_file", tab: "records" },
              { label: "Order Medicine", icon: "medication", tab: "pharmacy" },
              { label: "AI Simplifier", icon: "auto_awesome", tab: "simplifier" },
              { label: "View Billing", icon: "receipt_long", tab: "billing" },
            ].map(a => (
              <button key={a.label} className="qa-btn" onClick={() => setTab(a.tab)}>
                <Icon name={a.icon} style={{ fontSize: 17 }} />{a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Health Timeline */}
        <div className="col-7 card">
          <div className="section-header">
            <h3>Health Timeline</h3>
            <button className="view-all" onClick={() => setTab("records")}>View All</button>
          </div>
          {[...appts, ...reports].length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div className="es-icon"><Icon name="timeline" style={{ fontSize: 34 }} /></div>
              <h3>No history yet</h3>
              <p>Your health events will appear here</p>
            </div>
          ) : (
            <div>
              {[
                ...appts.map(a => ({ title: `Appointment with ${a.doctorName}`, sub: `${a.specialty} — ${a.date}`, color: "#2563EB" })),
                ...reports.map(r => ({ title: r.name, sub: `Uploaded ${new Date(r.uploadedAt).toLocaleDateString()}`, color: "#059669" })),
              ].slice(0, 5).map((item, i) => (
                <div key={i} className="timeline-item">
                  <div className="tl-dot" style={{ background: item.color }} />
                  <div className="tl-content">
                    <h4>{item.title}</h4>
                    <p>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APPOINTMENTS TAB ────────────────────────────────────────────────────────
function AppointmentsTab({ store, updateStore, showToast }) {
  const [view, setView] = useState("book");
  const [selDoctor, setSelDoctor] = useState(null);
  const [selSlot, setSelSlot] = useState(null);
  const [selDate, setSelDate] = useState("");
  const [selType, setSelType] = useState("in-person");
  const [notes, setNotes] = useState("");
  const [modal, setModal] = useState(null);
  const appts = store.appointments || [];

  const book = () => {
    if (!selDoctor || !selSlot || !selDate) { showToast("Please select a doctor, date & time slot"); return; }
    const appt = { id: Date.now(), doctorName: selDoctor.name, doctorImg: selDoctor.img, specialty: selDoctor.specialty, date: selDate, slot: selSlot, type: selType, notes, status: "upcoming", fee: selDoctor.fee, bookedAt: new Date().toISOString() };
    const invoice = { id: Date.now() + 1, type: "Consultation", desc: `Dr. ${selDoctor.name} — ${selType}`, amount: selDoctor.fee, status: "pending", date: selDate };
    updateStore({ appointments: [...appts, appt], invoices: [...(store.invoices || []), invoice] });
    showToast("Appointment booked successfully!");
    setSelDoctor(null); setSelSlot(null); setSelDate(""); setNotes("");
    setView("upcoming");
  };

  const cancel = (id) => {
    updateStore({ appointments: appts.map(a => a.id === id ? { ...a, status: "cancelled" } : a) });
    showToast("Appointment cancelled");
    setModal(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-tag">Healthcare</div>
        <h1 className="page-title">Appointment Management</h1>
        <p className="page-sub">Book, manage and track your consultations.</p>
      </div>
      <div className="tab-bar">
        {[["book", "Book New"], ["upcoming", `Upcoming (${appts.filter(a => a.status === "upcoming").length})`], ["past", "History"]].map(([id, label]) => (
          <div key={id} className={`tab-item${view === id ? " active" : ""}`} onClick={() => setView(id)}>{label}</div>
        ))}
      </div>
      {view === "book" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 18 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 14 }}>Choose a Doctor</div>
            <div className="doctor-grid">
              {DOCTORS.map(doc => (
                <div key={doc.id} className={`doctor-card${selDoctor?.id === doc.id ? " selected" : ""}`} onClick={() => selDoctor?.id === doc.id ? setSelDoctor(null) : setSelDoctor(doc)}>
                  <div className="doc-avatar">{doc.img}</div>
                  <div className="doc-name">{doc.name}</div>
                  <div className="doc-spec">{doc.specialty}</div>
                  <div className="doc-meta">
                    <span><Icon name="star" fill style={{ fontSize: 13, color: "#F59E0B" }} /> {doc.rating}</span>
                    <span><Icon name="work" style={{ fontSize: 13 }} /> {doc.exp}</span>
                    <span style={{ color: doc.available ? "var(--success)" : "var(--danger)" }}>● {doc.available ? "Available" : "Busy"}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", fontFamily: "var(--f-display)", marginBottom: 10 }}>
                    ₹{doc.fee} <span style={{ fontSize: 11.5, fontWeight: 400, color: "var(--muted)", fontFamily: "var(--f-body)" }}>/ visit</span>
                  </div>
                  {selDoctor?.id === doc.id && (
                    <>
                      <div className="section-label" style={{ marginBottom: 8 }}>Pick a Slot</div>
                      <div className="slot-grid">
                        {TIME_SLOTS.map(s => (
                          <div key={s} className={`slot${selSlot === s ? " selected" : ""}`} onClick={e => { e.stopPropagation(); setSelSlot(s); }}>{s}</div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="book-panel">
              <div className="section-label">Booking Details</div>
              {selDoctor ? (
                <div className="appt-card" style={{ marginBottom: 14, padding: 11 }}>
                  <div className="appt-avatar">{selDoctor.img}</div>
                  <div><div className="doc-name" style={{ fontSize: 13 }}>{selDoctor.name}</div><div className="doc-spec">{selDoctor.specialty}</div></div>
                </div>
              ) : <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>No doctor selected</p>}
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={selDate} onChange={e => setSelDate(e.target.value)} style={{ paddingLeft: 13 }} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Consultation Type</label>
                <div style={{ display: "flex", gap: 7 }}>
                  {["in-person", "video"].map(t => (
                    <button key={t} style={{ flex: 1, padding: 8, border: `1.5px solid ${selType === t ? "var(--blue)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 600, background: selType === t ? "var(--blue-light)" : "white", color: selType === t ? "var(--blue)" : "var(--muted)", fontFamily: "var(--f-body)" }} onClick={() => setSelType(t)}>
                      <Icon name={t === "video" ? "videocam" : "person_pin"} style={{ fontSize: 15, display: "block", margin: "0 auto 3px" }} />{t === "video" ? "Video" : "In-Person"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe your symptoms…" style={{ paddingLeft: 13, minHeight: 68 }} />
              </div>
              {selSlot && <div style={{ padding: "9px 13px", background: "var(--blue-light)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--blue)", fontWeight: 600, marginBottom: 10 }}><Icon name="schedule" style={{ fontSize: 14, marginRight: 5 }} />{selSlot} selected</div>}
              <button className="btn-submit" onClick={book} style={{ marginTop: 2 }}>Confirm Booking →</button>
            </div>
          </div>
        </div>
      )}
      {view === "upcoming" && (
        appts.filter(a => a.status === "upcoming").length === 0
          ? <div className="empty-state card"><div className="es-icon"><Icon name="calendar_month" style={{ fontSize: 38 }} /></div><h3>No upcoming appointments</h3><p>Book a consultation to get started</p><button className="btn-primary" style={{ marginTop: 12, borderRadius: 8, padding: "9px 18px", fontSize: 13 }} onClick={() => setView("book")}>Book Now</button></div>
          : appts.filter(a => a.status === "upcoming").map(a => (
            <div key={a.id} className="appt-card" style={{ marginBottom: 9 }}>
              <div className="appt-avatar">{a.doctorImg}</div>
              <div className="appt-info" style={{ flex: 1 }}>
                <h4>{a.doctorName}</h4>
                <p>{a.specialty} · {a.date} · {a.slot}</p>
                <div style={{ display: "flex", gap: 7, marginTop: 4, flexWrap: "wrap" }}>
                  <span className="badge badge-blue">{a.type}</span>
                  <span className="badge badge-green">₹{a.fee}</span>
                </div>
                {a.notes && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 5, fontStyle: "italic" }}>Note: {a.notes}</p>}
              </div>
              <button className="badge badge-red" style={{ cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => setModal(a.id)}>Cancel</button>
            </div>
          ))
      )}
      {view === "past" && (
        appts.filter(a => a.status !== "upcoming").length === 0
          ? <div className="empty-state card"><div className="es-icon"><Icon name="history" style={{ fontSize: 38 }} /></div><h3>No past appointments</h3></div>
          : appts.filter(a => a.status !== "upcoming").map(a => (
            <div key={a.id} className="appt-card" style={{ marginBottom: 8 }}>
              <div className="appt-avatar">{a.doctorImg}</div>
              <div className="appt-info" style={{ flex: 1 }}><h4>{a.doctorName}</h4><p>{a.specialty} · {a.date}</p></div>
              <span className={`badge ${a.status === "cancelled" ? "badge-red" : "badge-gray"}`}>{a.status}</span>
            </div>
          ))
      )}
      {modal && <Modal title="Cancel Appointment?" body="This action cannot be undone." confirmText="Yes, Cancel" onConfirm={() => cancel(modal)} onCancel={() => setModal(null)} />}
    </div>
  );
}

// ─── RECORDS TAB ─────────────────────────────────────────────────────────────
function RecordsTab({ store, updateStore, showToast }) {
  const reports = store.reports || [];
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter] = useState("All");

  const handleFiles = (files) => {
    const newReports = Array.from(files).map(f => ({
      id: Date.now() + Math.random(), name: f.name,
      type: f.type.includes("pdf") ? "PDF" : f.type.includes("image") ? "Image" : "Document",
      category: "General", size: (f.size / 1024).toFixed(1) + " KB", uploadedAt: new Date().toISOString(), simplified: null,
    }));
    updateStore({ reports: [...reports, ...newReports] });
    showToast(`${newReports.length} report(s) uploaded`);
  };

  const categories = ["All", ...new Set(reports.map(r => r.category))];
  const filtered = filter === "All" ? reports : reports.filter(r => r.category === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-tag">Health Data</div>
        <h1 className="page-title">Medical Records</h1>
        <p className="page-sub">All your aggregated lab results and analyses.</p>
      </div>
      <div className={`report-dropzone${dragging ? " over" : ""}`} onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }} style={{ marginBottom: 20 }}>
        <Icon name="upload_file" style={{ fontSize: 38, color: "var(--blue-mid)", display: "block", margin: "0 auto 10px" }} />
        <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--navy)", marginBottom: 3 }}>Drop files here or click to upload</p>
        <p style={{ fontSize: 12.5, color: "var(--muted)" }}>PDF, JPG, PNG — Max 10MB</p>
        <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>
      {categories.length > 1 && <div className="filter-bar">{categories.map(c => <div key={c} className={`filter-chip${filter === c ? " active" : ""}`} onClick={() => setFilter(c)}>{c}</div>)}</div>}
      {filtered.length === 0
        ? <div className="empty-state card"><div className="es-icon"><Icon name="scan" style={{ fontSize: 38 }} /></div><h3>No reports uploaded yet</h3><p>Upload your medical documents to get started</p></div>
        : filtered.map(r => (
          <div key={r.id} className="report-card">
            <div className="report-icon"><Icon name={r.type === "PDF" ? "picture_as_pdf" : r.type === "Image" ? "image" : "description"} fill /></div>
            <div className="report-info" style={{ flex: 1 }}>
              <h4>{r.name}</h4>
              <p>{r.type} · {r.size} · Uploaded {new Date(r.uploadedAt).toLocaleDateString()}</p>
            </div>
            <div className="report-actions">
              <span className={`badge ${r.simplified ? "badge-green" : "badge-gray"}`}>{r.simplified ? "AI Simplified" : "Raw"}</span>
              <button className="report-action-btn" onClick={() => showToast("Download started")}>Download</button>
              <button className="report-action-btn" onClick={() => { updateStore({ reports: reports.filter(x => x.id !== r.id) }); showToast("Report deleted"); }} style={{ color: "var(--danger)", borderColor: "#FECACA", background: "#FEF2F2" }}>Delete</button>
            </div>
          </div>
        ))}
    </div>
  );
}

// ─── SIMPLIFIER TAB ──────────────────────────────────────────────────────────
function SimplifierTab({ store, updateStore, showToast }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const reports = store.reports || [];

  const simplify = async () => {
    if (!text.trim()) { showToast("Please enter some medical text to simplify"); return; }
    setLoading(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: "You are a medical AI assistant. Simplify medical jargon into plain language for patients. Be clear, reassuring, and concise. Structure your response with: 1) Simple Summary, 2) Key Findings, 3) What This Means For You, 4) Recommended Actions.", messages: [{ role: "user", content: `Please simplify this medical text for a patient:\n\n${text}` }] }) });
      const data = await res.json();
      const simplified = data.content?.map(c => c.text).join("") || "Unable to simplify. Please try again.";
      setResult(simplified);
      if (text.length > 50) updateStore({ reports: [...reports, { id: Date.now(), name: "AI Simplified Report", type: "Document", category: "General", size: text.length + " chars", uploadedAt: new Date().toISOString(), simplified }] });
    } catch { setResult("⚠️ AI service temporarily unavailable. Please try again shortly."); }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="auto_awesome" style={{ fontSize: 26, color: "var(--blue-mid)" }} />
          <div><div className="page-tag">AI-Powered</div><h1 className="page-title">AI Report Simplifier</h1></div>
        </div>
        <p className="page-sub" style={{ marginLeft: 36 }}>Break down complex medical jargon into easy-to-understand summaries.</p>
      </div>
      <div className="card" style={{ borderTop: "4px solid var(--blue-mid)" }}>
        <div className="section-label">Paste Medical Text or Report</div>
        <textarea className="form-input" value={text} onChange={e => setText(e.target.value)} placeholder={"Paste your lab report, prescription, or any medical document here...\n\nExample: Serum creatinine levels are elevated at 1.8 mg/dL suggesting early-stage CKD..."} style={{ paddingLeft: 13, minHeight: 150, width: "100%", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", resize: "vertical", display: "block", marginBottom: 14 }} />
        <button className="btn-submit" style={{ width: "auto", padding: "11px 28px" }} onClick={simplify} disabled={loading}>
          {loading ? <>Analyzing… <span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite", verticalAlign: "middle", marginLeft: 7 }} /></> : <><Icon name="auto_awesome" style={{ fontSize: 17 }} /> Simplify with AI →</>}
        </button>
        {result && (
          <div className="ai-result" style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <Icon name="check_circle" fill style={{ fontSize: 17, color: "var(--success)" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--success)", fontFamily: "var(--f-body)" }}>AI Analysis Complete</span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)", fontFamily: "var(--f-body)" }}>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PHARMACY TAB ────────────────────────────────────────────────────────────
function PharmacyTab({ store, updateStore, showToast }) {
  const [cart, setCart] = useState({});
  const [filter, setFilter] = useState("All");
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [view, setView] = useState("shop");
  const orders = store.orders || [];

  const cats = ["All", ...new Set(MEDICINES.map(m => m.category))];
  const filtered = filter === "All" ? MEDICINES : MEDICINES.filter(m => m.category === filter);
  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);
  const cartTotal = cartItems.reduce((s, [id, qty]) => s + (MEDICINES.find(m => m.id === +id)?.price || 0) * qty, 0);
  const setQty = (id, qty) => setCart(c => ({ ...c, [id]: Math.max(0, qty) }));

  const placeOrder = () => {
    const items = cartItems.map(([id, qty]) => ({ ...MEDICINES.find(m => m.id === +id), qty }));
    const order = { id: Date.now(), items, total: cartTotal, status: "processing", placedAt: new Date().toISOString() };
    const invoice = { id: Date.now() + 1, type: "Pharmacy", desc: `${items.length} items — E-Pharmacy order`, amount: cartTotal, status: "pending", date: new Date().toISOString().split("T")[0] };
    updateStore({ orders: [...orders, order], invoices: [...(store.invoices || []), invoice] });
    setCart({}); setCheckoutModal(false);
    showToast("Order placed! Expected delivery in 2–4 hours");
    setView("orders");
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-tag">Healthcare</div>
        <h1 className="page-title">E-Pharmacy Store</h1>
        <p className="page-sub">Refill prescriptions and order wellness supplies directly.</p>
      </div>
      <div className="tab-bar">
        {[["shop", "Shop"], ["orders", `My Orders (${orders.length})`]].map(([id, label]) => (
          <div key={id} className={`tab-item${view === id ? " active" : ""}`} onClick={() => setView(id)}>{label}</div>
        ))}
      </div>
      {view === "shop" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 268px", gap: 18 }}>
          <div>
            <div className="filter-bar">{cats.map(c => <div key={c} className={`filter-chip${filter === c ? " active" : ""}`} onClick={() => setFilter(c)}>{c}</div>)}</div>
            <div className="product-grid">
              {filtered.map(med => (
                <div key={med.id} className="product-card">
                  <div className="product-icon">{med.icon}</div>
                  <div className="product-name">{med.name}</div>
                  <div style={{ marginBottom: 7 }}><span className="badge badge-gray">{med.category}</span></div>
                  <div className="product-desc">{med.description}</div>
                  <div className="product-price">₹{med.price} <span>/ {med.unit}</span></div>
                  <div className="product-footer">
                    {!med.inStock ? <span style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>Out of Stock</span>
                      : cart[med.id] > 0 ? (
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={() => setQty(med.id, (cart[med.id] || 0) - 1)}>−</button>
                          <span style={{ fontSize: 13.5, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{cart[med.id]}</span>
                          <button className="qty-btn" onClick={() => setQty(med.id, (cart[med.id] || 0) + 1)}>+</button>
                        </div>
                      ) : <button className="add-btn" onClick={() => setQty(med.id, 1)}>Add to Cart</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="cart-panel">
              <div className="section-label" style={{ marginBottom: 10 }}>Cart ({cartItems.length} items)</div>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "22px 0", color: "var(--muted)" }}>
                  <Icon name="shopping_cart" style={{ fontSize: 30, display: "block", margin: "0 auto 7px", color: "var(--blue-border)" }} />
                  <p style={{ fontSize: 13 }}>Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cartItems.map(([id, qty]) => {
                    const med = MEDICINES.find(m => m.id === +id); return (
                      <div key={id} className="cart-item">
                        <div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{med.name}</div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>×{qty} · ₹{med.price * qty}</div></div>
                        <button className="qty-btn" onClick={() => setQty(+id, 0)} style={{ borderColor: "#FECACA", color: "var(--danger)" }}>×</button>
                      </div>
                    );
                  })}
                  <div className="divider" />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 13.5, color: "var(--muted)" }}>Total</span>
                    <span className="cart-total">₹{cartTotal}</span>
                  </div>
                  <button className="btn-submit" style={{ width: "100%", marginTop: 0 }} onClick={() => setCheckoutModal(true)}>Checkout →</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {view === "orders" && (
        orders.length === 0
          ? <div className="empty-state card"><div className="es-icon"><Icon name="shopping_bag" style={{ fontSize: 38 }} /></div><h3>No orders yet</h3><p>Your pharmacy orders will appear here</p></div>
          : orders.map(o => (
            <div key={o.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div><div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--navy)", fontFamily: "var(--f-body)" }}>Order #{o.id.toString().slice(-6)}</div><div style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(o.placedAt).toLocaleString()}</div></div>
                <div style={{ textAlign: "right" }}><span className="badge badge-amber">{o.status}</span><div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", fontFamily: "var(--f-display)", marginTop: 3 }}>₹{o.total}</div></div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{o.items.map(item => <span key={item.id} className="badge badge-gray">{item.name} × {item.qty}</span>)}</div>
            </div>
          ))
      )}
      {checkoutModal && <Modal title="Confirm Order" body={`Place order for ${cartItems.length} items totalling ₹${cartTotal}? Payment will be collected on delivery.`} confirmText="Place Order" onConfirm={placeOrder} onCancel={() => setCheckoutModal(false)} />}
    </div>
  );
}

// ─── BILLING TAB ─────────────────────────────────────────────────────────────
function BillingTab({ store, updateStore, showToast }) {
  const invoices = store.invoices || [];
  const [filter, setFilter] = useState("all");
  const pay = (id) => { updateStore({ invoices: invoices.map(inv => inv.id === id ? { ...inv, status: "paid", paidAt: new Date().toISOString() } : inv) }); showToast("Payment successful!"); };
  const filtered = filter === "all" ? invoices : invoices.filter(inv => inv.status === filter);
  const total = invoices.reduce((s, i) => s + (i.status === "paid" ? i.amount : 0), 0);
  const pending = invoices.reduce((s, i) => s + (i.status === "pending" ? i.amount : 0), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-tag">Finance</div>
        <h1 className="page-title">Invoicing & Billing</h1>
        <p className="page-sub">Manage payments, insurance claims, and statements.</p>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { label: "Total Paid", value: `₹${total}`, icon: "check_circle", color: "#ECFDF5", ic: "#059669" },
          { label: "Pending", value: `₹${pending}`, icon: "pending", color: "#FFFBEB", ic: "#D97706" },
          { label: "Invoices", value: invoices.length, icon: "receipt_long", color: "#EFF6FF", ic: "#2563EB" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.color, color: s.ic }}><Icon name={s.icon} fill /></div>
            <h3>{s.value}</h3><p>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="tab-bar" style={{ marginTop: 16 }}>
        {[["all", "All"], ["pending", "Pending"], ["paid", "Paid"]].map(([id, label]) => (
          <div key={id} className={`tab-item${filter === id ? " active" : ""}`} onClick={() => setFilter(id)}>{label}</div>
        ))}
      </div>
      {filtered.length === 0
        ? <div className="empty-state card"><div className="es-icon"><Icon name="receipt_long" style={{ fontSize: 38 }} /></div><h3>No invoices yet</h3><p>Book appointments or order medicines to generate invoices</p></div>
        : filtered.map(inv => (
          <div key={inv.id} className="invoice-row">
            <div className="invoice-icon" style={{ background: inv.type === "Consultation" ? "#EFF6FF" : "#ECFDF5", color: inv.type === "Consultation" ? "#2563EB" : "#059669" }}>
              <Icon name={inv.type === "Consultation" ? "medical_services" : "shopping_bag"} fill />
            </div>
            <div className="inv-info" style={{ flex: 1, marginLeft: 11 }}>
              <h4>{inv.desc}</h4>
              <p>{inv.date} · Invoice #{inv.id.toString().slice(-6)}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="inv-amount">₹{inv.amount}<small>{inv.status === "paid" ? `Paid ${inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : ""}` : "Pending"}</small></div>
              {inv.status === "pending" ? <button className="pay-btn" onClick={() => pay(inv.id)}>Pay Now</button> : <span className="badge badge-green"><Icon name="check_circle" fill style={{ fontSize: 13 }} /> Paid</span>}
            </div>
          </div>
        ))}
    </div>
  );
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
function ProfileTab({ store, updateStore, showToast }) {
  const user = store.user || {};
  const vitals = store.vitals || {};
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [vitalsForm, setVitalsForm] = useState({ bp: vitals.bp || "", hr: vitals.hr || "", temp: vitals.temp || "", spo2: vitals.spo2 || "", weight: vitals.weight || "", height: vitals.height || "" });
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setV = k => e => setVitalsForm(f => ({ ...f, [k]: e.target.value }));

  const save = () => { updateStore({ user: form, vitals: vitalsForm }); setEditing(false); showToast("Profile updated successfully!"); };
  const initials = ((form.firstName || user.email || "P").charAt(0) + (form.lastName || "").charAt(0)).toUpperCase();

  const VITAL_FIELDS = [
    ["bp", "Blood Pressure", "mmHg", "favorite"],
    ["hr", "Heart Rate", "bpm", "monitor_heart"],
    ["temp", "Temperature", "°F", "device_thermostat"],
    ["spo2", "SpO2", "%", "air"],
    ["weight", "Weight", "kg", "scale"],
    ["height", "Height", "cm", "height"],
  ];

  const profileInfo = [
    { label: "Blood Group", value: form.bloodGroup || "Not entered", icon: "water_drop" },
    { label: "Date of Birth", value: form.dob || "Not entered", icon: "cake" },
    { label: "Gender", value: form.gender || "Not entered", icon: "person" },
    { label: "Phone", value: form.phone || "Not entered", icon: "phone" },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-tag">Account</div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-sub">Manage your personal information and health data.</p>
      </div>
      <div className="profile-grid">
        <div>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="profile-avatar-big">{initials}</div>
            <div className="profile-name">{form.firstName} {form.lastName}</div>
            <div className="profile-email">{form.email}</div>
            <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
              <div className="profile-stat" style={{ flex: 1 }}><h3>{(store.appointments || []).length}</h3><p>Appointments</p></div>
              <div className="profile-stat" style={{ flex: 1 }}><h3>{(store.reports || []).length}</h3><p>Reports</p></div>
            </div>
            <div className="divider" />
            <div style={{ textAlign: "left" }}>
              {profileInfo.map(info => (
                <div key={info.label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <Icon name={info.icon} style={{ fontSize: 15, color: "var(--blue-mid)" }} />
                  <div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", fontFamily: "var(--f-body)" }}>{info.label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: info.value === "Not entered" ? "var(--muted)" : "var(--navy)", fontStyle: info.value === "Not entered" ? "italic" : "normal", fontFamily: "var(--f-body)" }}>{info.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div className="section-label" style={{ margin: 0 }}>Personal Information</div>
              <button className="badge badge-blue" style={{ cursor: "pointer" }} onClick={() => editing ? save() : setEditing(true)}>
                <Icon name={editing ? "save" : "edit"} style={{ fontSize: 13 }} />{editing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>
            <div className="form-row">
              {[["firstName", "First Name", "badge"], ["lastName", "Last Name", "badge"]].map(([k, label, icon]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{label}</label>
                  <div className="form-input-wrap">
                    <Icon name={icon} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8" }} />
                    <input className="form-input" value={form[k] || ""} onChange={setF(k)} disabled={!editing} style={{ background: editing ? "white" : "var(--bg)" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="form-input-wrap">
                  <Icon name="alternate_email" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8" }} />
                  <input className="form-input" value={form.email || ""} onChange={setF("email")} disabled={!editing} style={{ background: editing ? "white" : "var(--bg)" }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="form-input-wrap">
                  <Icon name="phone" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8" }} />
                  <input className="form-input" value={form.phone || ""} onChange={setF("phone")} disabled={!editing} style={{ background: editing ? "white" : "var(--bg)" }} />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <div className="form-input-wrap">
                  <Icon name="emergency" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8" }} />
                  <input className="form-input" value={form.emergencyContact || ""} onChange={setF("emergencyContact")} disabled={!editing} placeholder="Name — Phone" style={{ background: editing ? "white" : "var(--bg)" }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-input" value={form.bloodGroup || ""} onChange={setF("bloodGroup")} disabled={!editing} style={{ paddingLeft: 13, background: editing ? "white" : "var(--bg)" }}>
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div className="section-label" style={{ margin: 0 }}>Health Vitals</div>
              {!editing && <button className="badge badge-blue" style={{ cursor: "pointer" }} onClick={() => setEditing(true)}><Icon name="edit" style={{ fontSize: 13 }} />Update Vitals</button>}
            </div>
            <div className="vitals-grid">
              {VITAL_FIELDS.map(([k, label, unit, icon]) => (
                <div key={k} className="health-metric">
                  <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 3 }}>
                    <Icon name={icon} style={{ fontSize: 13, color: "var(--blue-mid)" }} />
                    <div className="hm-label">{label}</div>
                  </div>
                  {editing
                    ? <input className="form-input" value={vitalsForm[k]} onChange={setV(k)} placeholder={`Enter ${unit}`} style={{ paddingLeft: 13, fontSize: 13.5, marginTop: 3 }} />
                    : vitalsForm[k]
                      ? <div className="hm-value">{vitalsForm[k]} <span className="hm-unit">{unit}</span></div>
                      : <div className="hm-empty">Not entered</div>}
                </div>
              ))}
            </div>
            {editing && <button className="btn-submit" style={{ marginTop: 14, width: "auto", padding: "10px 26px" }} onClick={save}>Save All Changes →</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CHAT WIDGET ─────────────────────────────────────────────────────────────
function ChatWidget({ store }) {
  const [msgs, setMsgs] = useState([{ role: "ai", text: "Hi! I'm your Atelier Health AI assistant. How can I help you today?" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef();

  const send = async () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim(); setInput("");
    setMsgs(m => [...m, { role: "user", text: userMsg }]); setTyping(true);
    const user = store.user || {};
    const context = `Patient: ${user.firstName || "Unknown"}, Blood Group: ${user.bloodGroup || "Unknown"}, Appointments: ${(store.appointments || []).length}.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `You are a helpful medical AI assistant for Atelier Health portal. Be concise, warm and helpful. Patient context: ${context}. Keep responses under 150 words. For emergencies, always advise calling emergency services.`, messages: msgs.concat([{ role: "user", content: userMsg }]).filter(m => m.role !== "ai" || msgs.indexOf(m) > 0).map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })) }) });
      const data = await res.json();
      const reply = data.content?.map(c => c.text).join("") || "I'm here to help!";
      setMsgs(m => [...m, { role: "ai", text: reply }]);
    } catch { setMsgs(m => [...m, { role: "ai", text: "I'm having trouble connecting. Please try again." }]); }
    setTyping(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="chat-window">
      <div className="chat-header"><h3>Atelier Health AI</h3><p>● Online — Medical Assistant</p></div>
      <div className="chat-messages">
        {msgs.map((m, i) => <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>)}
        {typing && <div className="chat-msg ai typing">Thinking…</div>}
        <div ref={endRef} />
      </div>
      <div className="chat-input-row">
        <textarea className="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask a health question…" rows={1} style={{ maxHeight: 76 }} />
        <button className="chat-send" onClick={send} disabled={typing}><Icon name="send" style={{ fontSize: 17 }} /></button>
      </div>
    </div>
  );
}