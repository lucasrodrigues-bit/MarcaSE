'use client';

import React, { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { Doctor, Patient, DoctorAction, PatientAction } from '@/types';
import { doctorsService } from '@/services/doctorsApi.mjs';
import { patientsService } from '@/services/patientsApi.mjs';

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
  addDoctor: (doctor: Omit<Doctor, 'id' | 'createdAt'>) => Promise<void>;
  updateDoctor: (doctor: Doctor) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Promise<void>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  checkDuplicateCPF: (cpf: string, excludeId?: string) => boolean;
  checkDuplicateCRM: (crm: string, excludeId?: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [doctors, dispatchDoctors] = useReducer(doctorReducer, []);
  const [patients, dispatchPatients] = useReducer(patientReducer, []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega médicos e pacientes da API ao iniciar
  useEffect(() => {
    async function loadData() {
      try {
        const [doctorsData, patientsData] = await Promise.all([
          doctorsService.list(),
          patientsService.list(),
        ]);
        dispatchDoctors({ type: 'SET_DOCTORS', payload: doctorsData ?? [] });
        dispatchPatients({ type: 'SET_PATIENTS', payload: patientsData ?? [] });
      } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // ── MÉDICOS ──────────────────────────────────────────────
  const addDoctor = async (doctor: Omit<Doctor, 'id' | 'createdAt'>) => {
    const newDoctor = await doctorsService.create(doctor);
    dispatchDoctors({ type: 'ADD_DOCTOR', payload: newDoctor });
  };

  const updateDoctor = async (doctor: Doctor) => {
    const updated = await doctorsService.update(doctor.id, {
      ...doctor,
      updatedAt: new Date().toISOString(),
    });
    dispatchDoctors({ type: 'UPDATE_DOCTOR', payload: updated ?? doctor });
  };

  const deleteDoctor = async (id: string) => {
    await doctorsService.delete(id);
    dispatchDoctors({ type: 'DELETE_DOCTOR', payload: id });
  };

  // ── PACIENTES ─────────────────────────────────────────────
  const addPatient = async (patient: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient = await patientsService.create(patient);
    dispatchPatients({ type: 'ADD_PATIENT', payload: newPatient });
  };

  const updatePatient = async (patient: Patient) => {
    const updated = await patientsService.update(patient.id, {
      ...patient,
      updatedAt: new Date().toISOString(),
    });
    dispatchPatients({ type: 'UPDATE_PATIENT', payload: updated ?? patient });
  };

  const deletePatient = async (id: string) => {
    await patientsService.delete(id);
    dispatchPatients({ type: 'DELETE_PATIENT', payload: id });
  };

  // ── VALIDAÇÕES ────────────────────────────────────────────
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