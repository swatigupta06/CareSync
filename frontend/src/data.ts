import { Doctor, User, Bed, Appointment, LabReport, MedicalRecord } from './types';

// ... (DOCTORS remains same) ...

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec_initial_1',
    patientId: 'p1',
    fileName: 'Blood_Report_May_2024.pdf',
    fileType: 'application/pdf',
    reportType: 'Blood Test',
    category: 'Test',
    uploadedBy: 'lab',
    uploadDate: '2024-05-15T10:00:00Z',
    fileUrl: '#',
    notes: 'Standard metabolic panel results indicate normal electrolytes.'
  },
  {
    id: 'rec_initial_2',
    patientId: 'p1',
    fileName: 'XRay_Chest_Frontal.jpg',
    fileType: 'image/jpeg',
    reportType: 'X-Ray',
    category: 'Test',
    uploadedBy: 'patient',
    uploadDate: '2024-05-10T14:30:00Z',
    fileUrl: '#',
    notes: 'Previous scans from city clinic.'
  },
  {
    id: 'rec_initial_3',
    patientId: 'p1',
    fileName: 'Prescription_Rajesh_Cardio.pdf',
    fileType: 'application/pdf',
    reportType: 'Prescription',
    category: 'Report',
    uploadedBy: 'receptionist',
    uploadDate: '2024-05-20T09:00:00Z',
    fileUrl: '#',
    notes: 'Prescription issued after the morning consultation.'
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@caresync.com',
    phoneNumber: '9123456781',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Cardiologist',
    experience: '12 years',
    availability: ['Mon', 'Tue', 'Wed', 'Thu'],
    bio: 'Specialist in cardiovascular diseases and interventional cardiology with over a decade of experience.',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300'
  },
  {
    id: 'doc2',
    name: 'Dr. Priya Mehta',
    email: 'priya.mehta@caresync.com',
    phoneNumber: '9123456782',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Dermatologist',
    experience: '8 years',
    availability: ['Mon', 'Wed', 'Fri'],
    bio: 'Expert in clinical and cosmetic dermatology, focusing on skin rejuvenation and health.',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300&h=300'
  },
  {
    id: 'doc3',
    name: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@caresync.com',
    phoneNumber: '9123456783',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Pediatrician',
    experience: '9 years',
    availability: ['Tue', 'Thu', 'Sat'],
    bio: 'Dedicated to providing comprehensive care for children from birth through adolescence.',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300'
  },
  {
    id: 'doc4',
    name: 'Dr. Vikram Malhotra',
    email: 'vikram.malhotra@caresync.com',
    phoneNumber: '9123456784',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Orthopedic Surgeon',
    experience: '20 years',
    availability: ['Mon', 'Wed', 'Fri'],
    bio: 'Specializing in bone and joint surgeries with a focus on sports medicine and recovery.',
    rating: 4.7,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300'
  },
  {
    id: 'doc5',
    name: 'Dr. Sneha Reddy',
    email: 'sneha.reddy@caresync.com',
    phoneNumber: '9123456785',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Neurologist',
    experience: '15 years',
    availability: ['Mon', 'Tue', 'Thu', 'Fri'],
    bio: 'Expert in treating complex neurological disorders and neurodegenerative conditions.',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300'
  },
  {
    id: 'doc6',
    name: 'Dr. Amit Patel',
    email: 'amit.patel@caresync.com',
    phoneNumber: '9123456786',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Oncologist',
    experience: '18 years',
    availability: ['Tue', 'Wed', 'Thu'],
    bio: 'Focusing on personalized cancer treatment paths and advanced immunotherapy.',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b1f8?auto=format&fit=crop&q=80&w=300&h=300'
  },
  {
    id: 'doc7',
    name: 'Dr. Kavita Singh',
    email: 'kavita.singh@caresync.com',
    phoneNumber: '9123456787',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Psychiatrist',
    experience: '14 years',
    availability: ['Mon', 'Wed', 'Fri'],
    bio: 'Specialist in mental health, focusing on anxiety, depression, and holistic wellness.',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=300&h=300'
  },
  {
    id: 'doc8',
    name: 'Dr. Rohan Gupta',
    email: 'rohan.gupta@caresync.com',
    phoneNumber: '9123456788',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Endocrinologist',
    experience: '11 years',
    availability: ['Tue', 'Thu', 'Sat'],
    bio: 'Expert in managing hormonal imbalances, thyroid disorders, and metabolic health.',
    rating: 4.7,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300&h=300'
  },
  {
    id: 'doc9',
    name: 'Dr. Sunita Deshmukh',
    email: 'sunita.deshmukh@caresync.com',
    phoneNumber: '9123456789',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Gastroenterologist',
    experience: '13 years',
    availability: ['Mon', 'Tue', 'Wed'],
    bio: 'Renowned expert in digestive health and hepatology, emphasizing preventive care.',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300'
  },
  {
    id: 'doc10',
    name: 'Dr. Arjun Kapoor',
    email: 'arjun.kapoor@caresync.com',
    phoneNumber: '9123456790',
    isAadhaarVerified: true,
    role: 'Doctor',
    specialization: 'Urologist',
    experience: '16 years',
    availability: ['Wed', 'Thu', 'Fri'],
    bio: 'Specializing in advanced urological procedures and robotic-assisted surgeries.',
    rating: 4.6,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300'
  }
];

export const INITIAL_BEDS: Bed[] = Array.from({ length: 20 }, (_, i) => ({
  id: `bed${i + 1}`,
  number: `${100 + i + 1}`,
  type: i < 5 ? 'ICU' : i < 10 ? 'Private' : i < 15 ? 'Semi-Private' : 'General',
  status: i % 4 === 0 ? 'Occupied' : 'Available',
  patientName: i % 4 === 0 ? 'John Patient' : undefined,
  patientId: i % 4 === 0 ? 'p1' : undefined,
}));

export const INITIAL_USERS: User[] = [
  { id: 'admin1', name: 'System Admin', email: 'admin@caresync.com', phoneNumber: '9123456780', isAadhaarVerified: true, role: 'Admin' },
  { id: 'rec1', name: 'Jane Reception', email: 'reception@caresync.com', phoneNumber: '9123456781', isAadhaarVerified: true, role: 'Receptionist' },
  { id: 'p1', name: 'John Patient', email: 'john@gmail.com', phoneNumber: '9123456782', isAadhaarVerified: false, role: 'Patient' },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt1',
    patientId: 'p1',
    patientName: 'John Patient',
    doctorId: 'doc1',
    doctorName: 'Dr. Rajesh Sharma',
    doctorSpecialization: 'Cardiologist',
    date: '2024-05-20',
    time: '10:00 AM',
    symptoms: 'Chest pain and shortness of breath',
    status: 'Confirmed'
  }
];

export const INITIAL_LAB_REPORTS: LabReport[] = [
  {
    id: 'lab1',
    patientId: 'p1',
    patientName: 'John Patient',
    testName: 'Blood Culture',
    date: '2024-05-15',
    result: 'Normal hemoglobin levels. No signs of infection.',
    status: 'Final'
  }
];
