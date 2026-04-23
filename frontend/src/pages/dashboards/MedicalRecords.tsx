import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../AppContext';
import { SectionHeader } from '../../components/ui/DashboardUI';
import { FileText, Upload, Shield, ShieldAlert, ShieldCheck, Eye, Trash2, Search, Lock, Unlock, Loader2, X, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MedicalRecord, AccessRequest } from '../../types';

export default function MedicalRecords() {
  const { user, medicalRecords, accessRequests, uploadMedicalRecord, requestRecordAccess, respondToAccessRequest, deleteMedicalRecord, fetchMedicalRecords, fetchPermissions, users, loading } = useApp();
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ reportType: '', category: 'Test' as MedicalRecord['category'], notes: '', patientId: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchMedicalRecords(); fetchPermissions(); }, []);

  const myRecords = medicalRecords.filter(r => r.patientId === user?.id);
  const myIncomingRequests = accessRequests.filter(r => r.patientId === user?.id && r.status === 'Pending');
  const allPatients = users.filter(u => u.role === 'Patient');
  const filteredPatients = allPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getRequestForPatient = (patientId: string) =>
    accessRequests.find(r => r.patientId === patientId && r.doctorId === user?.id);

  const getRecordsForPatient = (patientId: string) =>
    medicalRecords.filter(r => r.patientId === patientId);

  const categoryColors: Record<string, string> = {
    Test: 'bg-blue-50 text-blue-600 border-blue-100',
    Surgery: 'bg-red-50 text-red-600 border-red-100',
    Report: 'bg-green-50 text-green-600 border-green-100',
  };

  const uploaderColors: Record<string, string> = {
    patient: 'bg-blue-50 text-blue-600 border-blue-100',
    lab: 'bg-purple-50 text-purple-600 border-purple-100',
    receptionist: 'bg-amber-50 text-amber-600 border-amber-100',
    doctor: 'bg-green-50 text-green-600 border-green-100',
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    await uploadMedicalRecord({
      file: selectedFile,
      reportType: uploadForm.reportType,
      category: uploadForm.category,
      notes: uploadForm.notes,
      patientId: uploadForm.patientId || undefined,
    });
    setShowUpload(false);
    setSelectedFile(null);
    setUploadForm({ reportType: '', category: 'Test', notes: '', patientId: '' });
  };

  const RecordCard = ({ record }: { record: MedicalRecord }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-slate-900 uppercase tracking-tight truncate">{record.fileName}</h4>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{record.reportType}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border", categoryColors[record.category])}>{record.category}</span>
              <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border", uploaderColors[record.uploadedBy])}>{record.uploadedBy}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(record.uploadDate).toLocaleDateString()}</span>
            </div>
            {record.notes && <p className="text-[11px] text-slate-400 font-medium mt-2 italic">{record.notes}</p>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {record.fileUrl && record.fileUrl !== '#' && (
            <a href={record.fileUrl} target="_blank" rel="noreferrer"
              className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
              <Eye className="w-4 h-4" />
            </a>
          )}
          {(user?.role === 'Patient' || user?.role === 'Admin') && (
            <button onClick={() => deleteMedicalRecord(record.id)}
              className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <SectionHeader
        title={user?.role === 'Patient' ? 'My Health Vault' : user?.role === 'Doctor' ? 'Patient Records Access' : 'Medical Records'}
        description="Secure, permission-based medical record management."
        action={
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Upload className="w-4 h-4" /> Upload Record
          </button>
        }
      />

      {/* Patient: incoming access requests */}
      {user?.role === 'Patient' && myIncomingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" /> Pending Access Requests ({myIncomingRequests.length})
          </h3>
          {myIncomingRequests.map(req => (
            <div key={req.id} className="bg-orange-50 p-6 rounded-[2rem] border border-orange-200 flex items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-200">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-orange-800 uppercase tracking-tight">{req.doctorName}</p>
                  <p className="text-orange-600 text-sm font-medium">Requesting access to your medical records</p>
                  <p className="text-[10px] font-bold text-orange-400 uppercase mt-1">{new Date(req.requestDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => respondToAccessRequest(req.id, 'Rejected')} className="px-4 py-2 bg-white text-slate-500 rounded-xl font-black text-[9px] uppercase border border-slate-200 hover:bg-red-50 hover:text-red-500 transition-all">Deny</button>
                <button onClick={() => respondToAccessRequest(req.id, 'Approved')} className="px-4 py-2 bg-green-600 text-white rounded-xl font-black text-[9px] uppercase hover:bg-green-700 transition-all shadow-lg">Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient: own records */}
      {user?.role === 'Patient' && (
        <div className="space-y-4">
          {loading['records'] && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}
          {['Test', 'Surgery', 'Report'].map(cat => {
            const catRecords = myRecords.filter(r => r.category === cat);
            if (catRecords.length === 0) return null;
            return (
              <div key={cat}>
                <h4 className="font-black text-slate-600 uppercase tracking-widest text-[10px] mb-3">{cat}s ({catRecords.length})</h4>
                <div className="space-y-3">{catRecords.map(r => <RecordCard key={r.id} record={r} />)}</div>
              </div>
            );
          })}
          {!loading['records'] && myRecords.length === 0 && (
            <div className="py-16 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No medical records uploaded yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Doctor: patient list with access control */}
      {user?.role === 'Doctor' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 transition-all shadow-lg" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredPatients.map(patient => {
              const req = getRequestForPatient(patient.id);
              const records = getRecordsForPatient(patient.id);
              return (
                <div key={patient.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-500 border border-slate-100 text-lg">{patient.name[0]}</div>
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-tight">{patient.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{patient.phoneNumber}</p>
                      </div>
                    </div>
                    {req?.status === 'Approved' ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase border border-green-200">
                        <Unlock className="w-3 h-3" /> Access
                      </span>
                    ) : req?.status === 'Pending' ? (
                      <span className="px-3 py-1 bg-orange-50 text-orange-500 rounded-full text-[9px] font-black uppercase border border-orange-200">Pending</span>
                    ) : (
                      <button onClick={() => requestRecordAccess(patient.id, 'Requesting access for consultation review.')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all">
                        <Lock className="w-3 h-3" /> Request
                      </button>
                    )}
                  </div>
                  {req?.status === 'Approved' && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {records.length > 0 ? records.map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{r.fileName}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{r.reportType}</p>
                          </div>
                          {r.fileUrl && r.fileUrl !== '#' && (
                            <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4" /></a>
                          )}
                        </div>
                      )) : <p className="text-sm text-slate-400 font-medium text-center py-3">No records available</p>}
                    </div>
                  )}
                  {(!req || req.status === 'Rejected') && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center justify-center">
                      <Lock className="w-4 h-4 text-slate-300" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request access to view records</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Receptionist / Admin: all records */}
      {['Receptionist', 'Admin'].includes(user?.role || '') && (
        <div className="space-y-4">
          {loading['records'] && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}
          {medicalRecords.map(r => <RecordCard key={r.id} record={r} />)}
          {!loading['records'] && medicalRecords.length === 0 && (
            <div className="py-16 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-medium">No medical records in the system.</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 border border-slate-100 relative">
            <button onClick={() => setShowUpload(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Upload Medical Record</h3>
            <form onSubmit={handleUpload} className="space-y-5">
              {['Receptionist', 'Admin', 'Doctor'].includes(user?.role || '') && (
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Patient</label>
                  <select value={uploadForm.patientId} onChange={e => setUploadForm(p => ({ ...p, patientId: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-600 transition-all">
                    <option value="">Select patient</option>
                    {allPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Report Type *</label>
                <input required placeholder="e.g. Blood Test, MRI, X-Ray" value={uploadForm.reportType} onChange={e => setUploadForm(p => ({ ...p, reportType: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-600 transition-all" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Category</label>
                <select value={uploadForm.category} onChange={e => setUploadForm(p => ({ ...p, category: e.target.value as MedicalRecord['category'] }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-600 transition-all">
                  <option value="Test">Test</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Report">Report</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Notes (optional)</label>
                <textarea value={uploadForm.notes} onChange={e => setUploadForm(p => ({ ...p, notes: e.target.value }))} rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-600 transition-all resize-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">File * (PDF or Image)</label>
                <div onClick={() => fileRef.current?.click()}
                  className={cn("w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all",
                    selectedFile ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
                  )}>
                  <Upload className={cn("w-8 h-8 mx-auto mb-2", selectedFile ? "text-blue-600" : "text-slate-300")} />
                  <p className="text-sm font-bold text-slate-500">{selectedFile ? selectedFile.name : 'Click to select file'}</p>
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <button type="submit" disabled={!selectedFile || loading['uploadRecord']}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading['uploadRecord'] && <Loader2 className="w-4 h-4 animate-spin" />}
                Upload Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
