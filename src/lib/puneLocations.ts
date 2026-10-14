export interface PuneLocality {
  name: string;
  lat: number;
  lng: number;
  pincode: string;
  landmark: string;
}

export const PUNE_CENTER: [number, number] = [18.5204, 73.8567];

export const PUNE_LOCALITIES: PuneLocality[] = [
  { name: 'Koregaon Park', lat: 18.5362, lng: 73.8940, pincode: '411001', landmark: 'North Main Road' },
  { name: 'Shivajinagar', lat: 18.5284, lng: 73.8427, pincode: '411005', landmark: 'FC Road / JM Road' },
  { name: 'Viman Nagar', lat: 18.5679, lng: 73.9143, pincode: '411014', landmark: 'Near Symbiosis / Phoenix Mall' },
  { name: 'Kalyani Nagar', lat: 18.5482, lng: 73.9034, pincode: '411006', landmark: 'Central Avenue' },
  { name: 'Hinjewadi IT Park', lat: 18.5913, lng: 73.7389, pincode: '411057', landmark: 'Phase 1 Rajiv Gandhi InfoTech' },
  { name: 'Kothrud', lat: 18.5074, lng: 73.8077, pincode: '411038', landmark: 'Paud Road / Karve Statue' },
  { name: 'Baner', lat: 18.5590, lng: 73.7868, pincode: '411045', landmark: 'Baner High Street' },
  { name: 'Wakad', lat: 18.5987, lng: 73.7680, pincode: '411057', landmark: 'Datta Mandir Chowk' },
  { name: 'Hadapsar & Magarpatta', lat: 18.5158, lng: 73.9272, pincode: '411028', landmark: 'Magarpatta Cybercity' },
  { name: 'Pune Camp', lat: 18.5167, lng: 73.8767, pincode: '411001', landmark: 'MG Road / Aurora Towers' },
  { name: 'Deccan Gymkhana', lat: 18.5165, lng: 73.8415, pincode: '411004', landmark: 'Goodluck Cafe' },
  { name: 'Aundh', lat: 18.5580, lng: 73.8075, pincode: '411007', landmark: 'Bremen Chowk / Parihar' },
  { name: 'Senapati Bapat Road', lat: 18.5314, lng: 73.8340, pincode: '411016', landmark: 'ICC Towers / Pavillion' },
  { name: 'Kharadi', lat: 18.5528, lng: 73.9398, pincode: '411014', landmark: 'EON IT Park' },
  { name: 'Swargate', lat: 18.5018, lng: 73.8586, pincode: '411042', landmark: 'Swargate Junction' },
];

export function findClosestPuneLocality(addressQuery: string): PuneLocality | undefined {
  const query = addressQuery.toLowerCase();
  return PUNE_LOCALITIES.find(
    (loc) => query.includes(loc.name.toLowerCase()) || query.includes(loc.landmark.toLowerCase())
  );
}
