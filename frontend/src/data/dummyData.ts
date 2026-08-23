
export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  specialities: string[];
  reviews: number;
  rating: number;
  cost: string;
  distance: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  emergencyBeds: number;
  icuBeds: number;
  generalBeds: number;
  image: string;
  description: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  medicalHistory: MedicalRecord[];
}

export interface MedicalRecord {
  id: string;
  date: string;
  problem: string;
  doctor: string;
  hospital: string;
  tests: string[];
  prescription: string;
  outcome: string;
  documents: string[];
}

export const hospitals: Hospital[] = [
  {
    id: "1",
    name: "Apollo Hospital",
    location: "Sarita Vihar, New Delhi",
    city: "Delhi",
    state: "Delhi",
    coordinates: { lat: 28.5355, lng: 77.2490 },
    specialities: ["Cardiology", "Neurology", "Oncology", "Orthopedics"],
    reviews: 2450,
    rating: 4.5,
    cost: "₹₹₹",
    distance: 5.2,
    totalBeds: 500,
    occupiedBeds: 380,
    availableBeds: 120,
    emergencyBeds: 25,
    icuBeds: 40,
    generalBeds: 55,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    description: "Leading multi-specialty hospital with state-of-the-art facilities"
  },
  {
    id: "2",
    name: "Fortis Hospital",
    location: "Vasant Kunj, New Delhi",
    city: "Delhi",
    state: "Delhi",
    coordinates: { lat: 28.5244, lng: 77.1586 },
    specialities: ["Cardiology", "Gastroenterology", "Nephrology"],
    reviews: 1890,
    rating: 4.3,
    cost: "₹₹₹",
    distance: 8.5,
    totalBeds: 400,
    occupiedBeds: 320,
    availableBeds: 80,
    emergencyBeds: 20,
    icuBeds: 30,
    generalBeds: 30,
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800",
    description: "Comprehensive healthcare with advanced medical technology"
  },
  {
    id: "3",
    name: "Max Super Speciality Hospital",
    location: "Saket, New Delhi",
    city: "Delhi",
    state: "Delhi",
    coordinates: { lat: 28.5244, lng: 77.2066 },
    specialities: ["Cancer Care", "Neurosciences", "Cardiac Sciences"],
    reviews: 3200,
    rating: 4.6,
    cost: "₹₹₹₹",
    distance: 6.8,
    totalBeds: 550,
    occupiedBeds: 430,
    availableBeds: 120,
    emergencyBeds: 30,
    icuBeds: 45,
    generalBeds: 45,
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800",
    description: "Premium healthcare services with international standards"
  },
  {
    id: "4",
    name: "AIIMS Delhi",
    location: "Ansari Nagar, New Delhi",
    city: "Delhi",
    state: "Delhi",
    coordinates: { lat: 28.5672, lng: 77.2100 },
    specialities: ["All Specialities", "Research", "Teaching"],
    reviews: 5600,
    rating: 4.7,
    cost: "₹",
    distance: 4.2,
    totalBeds: 2500,
    occupiedBeds: 2200,
    availableBeds: 300,
    emergencyBeds: 80,
    icuBeds: 120,
    generalBeds: 100,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800",
    description: "Premier government medical institution and research center"
  },
  {
    id: "5",
    name: "Manipal Hospital",
    location: "Dwarka, New Delhi",
    city: "Delhi",
    state: "Delhi",
    coordinates: { lat: 28.5921, lng: 77.0460 },
    specialities: ["Orthopedics", "Urology", "Pulmonology"],
    reviews: 1650,
    rating: 4.4,
    cost: "₹₹",
    distance: 12.3,
    totalBeds: 350,
    occupiedBeds: 260,
    availableBeds: 90,
    emergencyBeds: 18,
    icuBeds: 35,
    generalBeds: 37,
    image: "https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=800",
    description: "Patient-centric care with experienced medical professionals"
  },
  {
    id: "6",
    name: "Lilavati Hospital",
    location: "Bandra West, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    coordinates: { lat: 19.0596, lng: 72.8295 },
    specialities: ["Cardiology", "Oncology", "Orthopedics", "Neurology"],
    reviews: 2800,
    rating: 4.5,
    cost: "₹₹₹₹",
    distance: 7.5,
    totalBeds: 450,
    occupiedBeds: 350,
    availableBeds: 100,
    emergencyBeds: 22,
    icuBeds: 38,
    generalBeds: 40,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    description: "Renowned multi-specialty hospital with advanced care"
  }
];
export interface Doctor {
    id: string;
    name: string;
    photo: string;
    age: number;
    speciality: string;
    experience: number;
    degrees: string[];
    education: string[];
    workingDays: string[];
    workingHours: string;
    available: boolean;
    hospitalId: string;
    // NEW FIELDS ADDED
    rating: number;
    reviews: number;
    totalPatients: number;
    successRate: number;
    consultationFee: string;
    languages: string[];
    queueCount: number;
    specializations: string[];
    about: string;
    educationDetails: Array<{
        year: string;
        degree: string;
        institute: string;
        description: string;
    }>;
}

export const doctors: Doctor[] = [
    {
        id: "d1",
        name: "Rajesh Kumar",
        photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
        age: 45,
        speciality: "Cardiologist",
        experience: 20,
        degrees: ["MBBS", "MD", "DM Cardiology", "FACC"],
        education: ["AIIMS Delhi", "PGI Chandigarh"],
        workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        workingHours: "9:00 AM - 5:00 PM",
        available: true,
        hospitalId: "1",
        // NEW DATA
        rating: 4.8,
        reviews: 1234,
        totalPatients: 15000,
        successRate: 98,
        consultationFee: "₹800",
        languages: ["Hindi", "English", "Punjabi"],
        queueCount: 12,
        specializations: [
            "Coronary Angioplasty",
            "Heart Failure Management",
            "Echocardiography",
            "Cardiac CT/MRI",
            "Preventive Cardiology",
            "Hypertension Management",
        ],
        about: "Dr. Rajesh Kumar is a highly experienced cardiologist with over 20 years of practice at Apollo Hospital. He has successfully treated more than 15,000 patients and maintains an excellent success rate of 98%. His expertise includes advanced cardiac procedures and preventive cardiology.",
        educationDetails: [
            {
                year: "2010-2013",
                degree: "DM Cardiology",
                institute: "PGI Chandigarh",
                description:
                    "Specialized training in interventional cardiology and cardiac electrophysiology",
            },
            {
                year: "2005-2008",
                degree: "MD Medicine",
                institute: "AIIMS Delhi",
                description:
                    "Gold medalist with distinction in internal medicine",
            },
            {
                year: "1999-2005",
                degree: "MBBS",
                institute: "AIIMS Delhi",
                description: "First class with university topper honors",
            },
        ],
    },
    {
        id: "d2",
        name: "Priya Sharma",
        photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
        age: 38,
        speciality: "Neurologist",
        experience: 14,
        degrees: ["MBBS", "MD", "DM Neurology"],
        education: ["Maulana Azad Medical College, Delhi"],
        workingDays: ["Mon", "Wed", "Fri", "Sat"],
        workingHours: "10:00 AM - 6:00 PM",
        available: true,
        hospitalId: "1",
        // NEW DATA
        rating: 4.7,
        reviews: 856,
        totalPatients: 9800,
        successRate: 96,
        consultationFee: "₹700",
        languages: ["Hindi", "English"],
        queueCount: 8,
        specializations: [
            "Stroke Management",
            "Epilepsy Treatment",
            "Migraine Therapy",
            "Parkinson's Disease",
            "Multiple Sclerosis",
            "Neuromuscular Disorders",
        ],
        about: "Dr. Priya Sharma is a renowned neurologist specializing in stroke management and epilepsy treatment. With 14 years of experience, she has treated over 9,800 patients with a 96% success rate.",
        educationDetails: [
            {
                year: "2009-2012",
                degree: "DM Neurology",
                institute: "AIIMS Delhi",
                description:
                    "Advanced training in neurocritical care and stroke intervention",
            },
            {
                year: "2004-2007",
                degree: "MD Medicine",
                institute: "Maulana Azad Medical College",
                description:
                    "Special interest in neurological disorders developed",
            },
            {
                year: "1997-2004",
                degree: "MBBS",
                institute: "Maulana Azad Medical College",
                description:
                    "Consistent academic excellence throughout medical school",
            },
        ],
    },
    {
        id: "d3",
        name: "Amit Patel",
        photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
        age: 52,
        speciality: "Oncologist",
        experience: 25,
        degrees: ["MBBS", "MD", "DM Medical Oncology"],
        education: ["King George's Medical University"],
        workingDays: ["Tue", "Thu", "Sat"],
        workingHours: "11:00 AM - 4:00 PM",
        available: false,
        hospitalId: "1",
        // NEW DATA
        rating: 4.9,
        reviews: 2100,
        totalPatients: 25000,
        successRate: 92,
        consultationFee: "₹1200",
        languages: ["Hindi", "English", "Gujarati"],
        queueCount: 15,
        specializations: [
            "Chemotherapy",
            "Immunotherapy",
            "Targeted Therapy",
            "Bone Marrow Transplant",
            "Palliative Care",
            "Breast Cancer",
            "Lung Cancer",
        ],
        about: "Dr. Amit Patel is a veteran oncologist with 25 years of experience treating complex cancer cases. He has successfully managed over 25,000 patients with innovative treatment protocols.",
        educationDetails: [
            {
                year: "1998-2001",
                degree: "DM Medical Oncology",
                institute: "Tata Memorial Hospital, Mumbai",
                description: "Pioneering work in targeted cancer therapies",
            },
            {
                year: "1993-1996",
                degree: "MD Medicine",
                institute: "King George's Medical University",
                description: "Oncology research fellowship completed",
            },
            {
                year: "1985-1991",
                degree: "MBBS",
                institute: "King George's Medical University",
                description: "University gold medalist in final year",
            },
        ],
    },
    {
        id: "d4",
        name: "Sneha Reddy",
        photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
        age: 35,
        speciality: "Orthopedic Surgeon",
        experience: 10,
        degrees: ["MBBS", "MS Orthopedics"],
        education: ["St. John's Medical College, Bangalore"],
        workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        workingHours: "8:00 AM - 2:00 PM",
        available: true,
        hospitalId: "1",
        // NEW DATA
        rating: 4.6,
        reviews: 645,
        totalPatients: 7200,
        successRate: 95,
        consultationFee: "₹600",
        languages: ["English", "Hindi", "Telugu"],
        queueCount: 6,
        specializations: [
            "Joint Replacement",
            "Arthroscopy",
            "Spine Surgery",
            "Sports Medicine",
            "Fracture Management",
            "Pediatric Orthopedics",
        ],
        about: "Dr. Sneha Reddy is an expert orthopedic surgeon specializing in joint replacement and sports injuries. With 10 years of surgical experience, she has successfully operated on over 7,200 patients.",
        educationDetails: [
            {
                year: "2012-2015",
                degree: "MS Orthopedics",
                institute: "St. John's Medical College",
                description: "Advanced training in arthroscopic surgery",
            },
            {
                year: "2005-2011",
                degree: "MBBS",
                institute: "St. John's Medical College",
                description: "Surgical excellence award recipient",
            },
        ],
    },
    {
        id: "d5",
        name: "Vikram Singh",
        photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400",
        age: 48,
        speciality: "Cardiologist",
        experience: 22,
        degrees: ["MBBS", "MD", "DM Cardiology", "FACC"],
        education: ["CMC Vellore"],
        workingDays: ["Mon", "Wed", "Fri"],
        workingHours: "2:00 PM - 8:00 PM",
        available: true,
        hospitalId: "2",
        // NEW DATA
        rating: 4.7,
        reviews: 987,
        totalPatients: 12000,
        successRate: 97,
        consultationFee: "₹900",
        languages: ["Hindi", "English"],
        queueCount: 10,
        specializations: [
            "Angiography",
            "Pacemaker Implantation",
            "Valve Replacement",
            "Congenital Heart Disease",
            "Pediatric Cardiology",
        ],
        about: "Dr. Vikram Singh specializes in complex cardiac interventions including pacemaker implantation and valve surgeries. With 22 years experience at Fortis Hospital.",
        educationDetails: [
            {
                year: "2001-2004",
                degree: "DM Cardiology",
                institute: "CMC Vellore",
                description: "Fellowship in interventional cardiology",
            },
            {
                year: "1996-1999",
                degree: "MD Medicine",
                institute: "CMC Vellore",
                description: "Cardiology research published internationally",
            },
            {
                year: "1989-1995",
                degree: "MBBS",
                institute: "CMC Vellore",
                description: "Outstanding student in clinical rotations",
            },
        ],
    },
    // ... (keeping other doctors with similar expanded data structure)
    {
        id: "d6",
        name: "Meera Iyer",
        photo: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400",
        age: 41,
        speciality: "Gastroenterologist",
        experience: 16,
        degrees: ["MBBS", "MD", "DM Gastroenterology"],
        education: ["Kasturba Medical College, Manipal"],
        workingDays: ["Tue", "Thu", "Sat"],
        workingHours: "10:00 AM - 5:00 PM",
        available: false,
        hospitalId: "2",
        rating: 4.5,
        reviews: 723,
        totalPatients: 8500,
        successRate: 94,
        consultationFee: "₹750",
        languages: ["English", "Hindi", "Malayalam"],
        queueCount: 9,
        specializations: [
            "Endoscopy",
            "Colonoscopy",
            "Liver Diseases",
            "IBD Management",
            "Hepatitis Treatment",
        ],
        about: "Dr. Meera Iyer is a leading gastroenterologist specializing in advanced endoscopic procedures and liver disease management at Fortis Hospital.",
        educationDetails: [
            {
                year: "2007-2010",
                degree: "DM Gastroenterology",
                institute: "Kasturba Medical College",
                description: "Advanced endoscopy fellowship completed",
            },
        ],
    },
    {
        id: "d7",
        name: "Arjun Mehta",
        photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
        age: 39,
        speciality: "Nephrologist",
        experience: 13,
        degrees: ["MBBS", "MD", "DM Nephrology"],
        education: ["Seth GS Medical College, Mumbai"],
        workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        workingHours: "9:00 AM - 3:00 PM",
        available: true,
        hospitalId: "2",
        rating: 4.6,
        reviews: 543,
        totalPatients: 6800,
        successRate: 95,
        consultationFee: "₹650",
        languages: ["Hindi", "English", "Marathi"],
        queueCount: 7,
        specializations: [
            "Dialysis Management",
            "Kidney Transplant",
            "Chronic Kidney Disease",
            "Glomerular Diseases",
        ],
        about: "Dr. Arjun Mehta specializes in kidney transplantation and dialysis management with 13 years of nephrology experience.",
        educationDetails: [
            {
                year: "2010-2013",
                degree: "DM Nephrology",
                institute: "Seth GS Medical College",
                description: "Transplant nephrology certification",
            },
        ],
    },
    {
        id: "d8",
        name: "Kavita Nair",
        photo: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400",
        age: 44,
        speciality: "Oncologist",
        experience: 18,
        degrees: ["MBBS", "MD", "DM Medical Oncology", "ESMO"],
        education: ["Tata Memorial Hospital, Mumbai"],
        workingDays: ["Mon", "Wed", "Fri", "Sat"],
        workingHours: "11:00 AM - 6:00 PM",
        available: true,
        hospitalId: "3",
        rating: 4.8,
        reviews: 1456,
        totalPatients: 18000,
        successRate: 93,
        consultationFee: "₹1100",
        languages: ["Hindi", "English", "Malayalam"],
        queueCount: 14,
        specializations: [
            "Breast Cancer",
            "Lung Cancer",
            "Lymphoma",
            "Leukemia",
            "Immunotherapy",
        ],
        about: "Dr. Kavita Nair is a senior oncologist at Max Hospital specializing in breast and lung cancer treatment with 18 years of experience.",
        educationDetails: [
            {
                year: "2005-2008",
                degree: "DM Medical Oncology",
                institute: "Tata Memorial Hospital",
                description: "ESMO certified oncologist",
            },
        ],
    },
];


export interface Bed {
  id: string;
  number: string;
  type: 'emergency' | 'icu' | 'general';
  status: 'available' | 'booked' | 'occupied';
  floor: number;
  ward: string;
  price: number;
}

export interface AccessRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  status: 'pending' | 'approved' | 'denied';
  requestDate: string;
  purpose: string;
}

export interface QueueItem {
  id: string;
  patientName: string;
  tokenNumber: number;
  arrivalTime: string;
  status: 'waiting' | 'in-consultation' | 'completed';
}

export const samplePatient: Patient = {
  id: "PAT001",
  name: "Rahul Verma",
  age: 32,
  gender: "Male",
  bloodGroup: "O+",
  medicalHistory: [
    {
      id: "m1",
      date: "2024-01-15",
      problem: "Chest pain and discomfort",
      doctor: "Dr. Rajesh Kumar",
      hospital: "Apollo Hospital",
      tests: ["ECG", "Chest X-Ray", "Blood Test"],
      prescription: "Aspirin 75mg, Atorvastatin 10mg",
      outcome: "Stable, advised lifestyle changes",
      documents: ["ecg-report.pdf", "blood-test.pdf"]
    },
    {
      id: "m2",
      date: "2023-09-22",
      problem: "Fever and body ache",
      doctor: "Dr. Priya Sharma",
      hospital: "Fortis Hospital",
      tests: ["Complete Blood Count", "Dengue Test"],
      prescription: "Paracetamol 650mg, Rest",
      outcome: "Recovered in 5 days",
      documents: ["cbc-report.pdf"]
    },
    {
      id: "m3",
      date: "2023-03-10",
      problem: "Knee pain after sports injury",
      doctor: "Dr. Sneha Reddy",
      hospital: "Apollo Hospital",
      tests: ["X-Ray Knee", "MRI"],
      prescription: "Ibuprofen, Physiotherapy sessions",
      outcome: "Full recovery after 3 months",
      documents: ["xray-knee.pdf", "mri-report.pdf"]
    }
  ]
};

// Sample beds for bed booking system
export const generateHospitalBeds = (hospitalId: string): Bed[] => {
  const beds: Bed[] = [];
  let bedCounter = 1;
  
  // Emergency beds (Floor 1)
  for (let i = 0; i < 25; i++) {
    beds.push({
      id: `${hospitalId}-e${i + 1}`,
      number: `E-${String(bedCounter++).padStart(3, '0')}`,
      type: 'emergency',
      status: i % 3 === 0 ? 'occupied' : i % 5 === 0 ? 'booked' : 'available',
      floor: 1,
      ward: 'Emergency Ward',
      price: 2500
    });
  }
  
  // ICU beds (Floor 2)
  for (let i = 0; i < 40; i++) {
    beds.push({
      id: `${hospitalId}-i${i + 1}`,
      number: `I-${String(bedCounter++).padStart(3, '0')}`,
      type: 'icu',
      status: i % 2 === 0 ? 'occupied' : i % 4 === 0 ? 'booked' : 'available',
      floor: 2,
      ward: 'Intensive Care Unit',
      price: 5000
    });
  }
  
  // General beds (Floors 3-5)
  for (let i = 0; i < 55; i++) {
    beds.push({
      id: `${hospitalId}-g${i + 1}`,
      number: `G-${String(bedCounter++).padStart(3, '0')}`,
      type: 'general',
      status: i % 4 === 0 ? 'occupied' : i % 7 === 0 ? 'booked' : 'available',
      floor: Math.floor(i / 20) + 3,
      ward: `General Ward ${String.fromCharCode(65 + Math.floor(i / 20))}`,
      price: 1500
    });
  }
  
  return beds;
};

// Sample access requests
export const sampleAccessRequests: AccessRequest[] = [
  {
    id: "ar1",
    doctorId: "d1",
    doctorName: "Dr. Rajesh Kumar",
    patientId: "PAT001",
    patientName: "Rahul Verma",
    status: "approved",
    requestDate: "2024-01-14",
    purpose: "Follow-up cardiac consultation"
  },
  {
    id: "ar2",
    doctorId: "d2",
    doctorName: "Dr. Priya Sharma",
    patientId: "PAT002",
    patientName: "Anita Singh",
    status: "pending",
    requestDate: "2024-01-20",
    purpose: "Neurological assessment"
  },
  {
    id: "ar3",
    doctorId: "d1",
    doctorName: "Dr. Rajesh Kumar",
    patientId: "PAT003",
    patientName: "Suresh Patel",
    status: "pending",
    requestDate: "2024-01-21",
    purpose: "Pre-surgery evaluation"
  }
];

// Sample queue data
export const sampleQueue: QueueItem[] = [
  {
    id: "q1",
    patientName: "Rajesh Kumar",
    tokenNumber: 1,
    arrivalTime: "09:00 AM",
    status: "in-consultation"
  },
  {
    id: "q2",
    patientName: "Priya Sharma",
    tokenNumber: 2,
    arrivalTime: "09:15 AM",
    status: "waiting"
  },
  {
    id: "q3",
    patientName: "Amit Verma",
    tokenNumber: 3,
    arrivalTime: "09:30 AM",
    status: "waiting"
  },
  {
    id: "q4",
    patientName: "Sneha Reddy",
    tokenNumber: 4,
    arrivalTime: "09:45 AM",
    status: "waiting"
  },
  {
    id: "q5",
    patientName: "Vikram Singh",
    tokenNumber: 5,
    arrivalTime: "10:00 AM",
    status: "waiting"
  }
];
