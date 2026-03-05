export interface ChatMessage {
  id?: number;
  appointmentId: number;
  content: string;
  type: string;
  senderId?: string;
  senderName?: string; 
  timestamp?: string;
}

export type CallState = "idle" | "joining" | "calling" | "connected" | "ended" | "busy";
export type SignalType = "JOIN" | "OFFER" | "ANSWER" | "ICE" | "LEAVE" | "BUSY";

export interface SignalMessage {
  type: SignalType;
  appointmentId: number;
  senderId?: string;
  targetId?: string;
  sdp?: string;
  candidate?: RTCIceCandidateInit;
}

export interface VitalSigns {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  spO2: string;
}


export interface Prescription {
  id: number;
  medicine: string;
  dosage: string;
  frequency: string;
}

export interface MedicalReport {
  symptoms: string;
  diagnosis: string;
  notes: string;
  followUpDate: string;
  prescriptions: Prescription[];
}