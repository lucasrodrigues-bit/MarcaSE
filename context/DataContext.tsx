'use client';

import React, { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { Doctor, Patient, DoctorAction, PatientAction } from '@/types';

// Doctor Reducer
function doctorReducer(state: Doctor[], action: DoctorAction): Doctor[] {
  switch (action.type) {
    case 'ADD_DOCTOR':
      return [...state, action.payload];
    case 'UPDATE_DOCTOR':
      return state.map((d) => (d.id === action.payload.id ? action.payload : d));
    case 'DELETE_DOCTOR':
      return state.filter((d) => d.id !== action.payload);
    case 'SET_DOCTORS':
      return action.payload;
    default:
      return state;
  }
}

// Patient Reducer
function patientReducer(state: Patient[], action: PatientAction): Patient[] {
  switch (action.type) {
    case 'ADD_PATIENT':
      return [...state, action.payload];
    case 'UPDATE_PATIENT':
      return state.map((p) => (p.id === action.payload.id ? action.payload : p));
    case 'DELETE_PATIENT':
      return state.filter((p) => p.id !== action.payload);
    case 'SET_PATIENTS':
      return action.payload;
    default:
      return state;
  }
}

interface DataContextType {
  doctors: Doctor[];
  patients: Patient[];
  isLoaded: boolean;
  dispatchDoctors: React.Dispatch<DoctorAction>;
  dispatchPatients: React.Dispatch<PatientAction>;
  addDoctor: (doctor: Omit<Doctor, 'id' | 'createdAt'>) => void;
  updateDoctor: (doctor: Doctor) => void;
  deleteDoctor: (id: string) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;
  checkDuplicateCPF: (cpf: string, excludeId?: string) => boolean;
  checkDuplicateCRM: (crm: string, excludeId?: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DOCTORS_KEY = 'marcaSE_doctors';
const PATIENTS_KEY = 'marcaSE_patients';

export function DataProvider({ children }: { children: ReactNode }) {
  const [doctors, dispatchDoctors] = useReducer(doctorReducer, []);
  const [patients, dispatchPatients] = useReducer(patientReducer, []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount - start with empty arrays if nothing saved
  useEffect(() => {
    const storedDoctors = localStorage.getItem(DOCTORS_KEY);
    const storedPatients = localStorage.getItem(PATIENTS_KEY);

    if (storedDoctors) {
      try {
        dispatchDoctors({ type: 'SET_DOCTORS', payload: JSON.parse(storedDoctors) });
      } catch {
        dispatchDoctors({ type: 'SET_DOCTORS', payload: [] });
      }
    } else {
      localStorage.setItem(DOCTORS_KEY, JSON.stringify([]));
    }

    if (storedPatients) {
      try {
        dispatchPatients({ type: 'SET_PATIENTS', payload: JSON.parse(storedPatients) });
      } catch {
        dispatchPatients({ type: 'SET_PATIENTS', payload: [] });
      }
    } else {
      localStorage.setItem(PATIENTS_KEY, JSON.stringify([]));
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes (including empty arrays)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
    }
  }, [doctors, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
    }
  }, [patients, isLoaded]);

  const addDoctor = (doctor: Omit<Doctor, 'id' | 'createdAt'>) => {
    const newDoctor: Doctor = {
      ...doctor,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatchDoctors({ type: 'ADD_DOCTOR', payload: newDoctor });
  };

  const updateDoctor = (doctor: Doctor) => {
    const updatedDoctor = { ...doctor, updatedAt: new Date().toISOString() };
    dispatchDoctors({ type: 'UPDATE_DOCTOR', payload: updatedDoctor });
  };

  const deleteDoctor = (id: string) => {
    dispatchDoctors({ type: 'DELETE_DOCTOR', payload: id });
  };

  const addPatient = (patient: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patient,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatchPatients({ type: 'ADD_PATIENT', payload: newPatient });
  };

  const updatePatient = (patient: Patient) => {
    const updatedPatient = { ...patient, updatedAt: new Date().toISOString() };
    dispatchPatients({ type: 'UPDATE_PATIENT', payload: updatedPatient });
  };

  const deletePatient = (id: string) => {
    dispatchPatients({ type: 'DELETE_PATIENT', payload: id });
  };

  const checkDuplicateCPF = (cpf: string, excludeId?: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    return patients.some((p) => {
      if (excludeId && p.id === excludeId) return false;
      return p.cpf.replace(/\D/g, '') === cleanCPF;
    });
  };

  const checkDuplicateCRM = (crm: string, excludeId?: string): boolean => {
    return doctors.some((d) => {
      if (excludeId && d.id === excludeId) return false;
      return d.crm.toLowerCase() === crm.toLowerCase();
    });
  };

  return (
    <DataContext.Provider
      value={{
        doctors,
        patients,
        isLoaded,
        dispatchDoctors,
        dispatchPatients,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addPatient,
        updatePatient,
        deletePatient,
        checkDuplicateCPF,
        checkDuplicateCRM,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
