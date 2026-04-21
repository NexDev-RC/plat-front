import apiClient from '@/lib/api-client'
import type { Certificate, ApiResponse, PaginatedResponse } from '@/types'

/** GET /api/certificates/me */
export async function getMyCertificates(): Promise<Certificate[]> {
  const { data } = await apiClient.get<ApiResponse<Certificate[]>>('/certificates/me')
  return data.data
}

/** GET /api/certificates/:id */
export async function getCertificate(id: string): Promise<Certificate> {
  const { data } = await apiClient.get<ApiResponse<Certificate>>(`/certificates/${id}`)
  return data.data
}

/** GET /api/certificates/:id/download */
export async function downloadCertificate(id: string): Promise<Blob> {
  const response = await apiClient.get(`/certificates/${id}/download`, {
    responseType: 'blob'
  })
  return response.data
}

/** POST /api/certificates/verify */
export async function verifyCertificate(code: string): Promise<Certificate> {
  const { data } = await apiClient.post<ApiResponse<Certificate>>('/certificates/verify', { code })
  return data.data
}

/** GET /api/certificates - solo admin */
export async function getAllCertificates(page = 1, limit = 20): Promise<PaginatedResponse<Certificate>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Certificate>>>('/certificates', {
    params: { page, limit }
  })
  return data.data
}
