export type WorkArea = 'plomeria' | 'electricidad' | 'carpinteria' | 'pintura' | 'limpieza'

export interface TechnicalFormData {
  // Personal Information
  nombre: string
  apellido: string
  correoElectronico: string
  telefono: string
  direccion: string
  fotoPerfil?: File

  // Documents
  carnetIdentidad?: File
  facturaLuz?: File
  certificaciones?: File[]

  // Work Information
  areaTrabajo: WorkArea
  anosExperiencia: number
  nombreBanco: string
  numeroCuenta: string
  tipoCuenta: string
}

