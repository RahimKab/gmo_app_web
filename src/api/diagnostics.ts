import { apiGet, apiPostForm } from './client'

export type AttentionSegment = {
  start: number
  end: number
  sequence: string
  score: number
}

export type SequenceRecord = {
  sequence_id: number
  seq_id: string
  seq_nom: string
  seq_nom_courant: string
  sequence: string
  sequence_cleaned: string
  seq_lien: string
  type_entree: string
  seq_date: string
  user: number
}

export type PredictionRecord = {
  prediction_id: number
  pred_libelle: string
  pred_prob: number
  pred_confiance: number
  pred_date: string
}

export type SequencePredictionResponse = {
  sequence: SequenceRecord
  prediction: PredictionRecord
  predicted_label: 'gmo' | 'no-gmo'
  probabilities: {
    gmo: number
    no_gmo: number
  }
  attention: AttentionSegment[]
  chunks_processed: number
}

export type ReportRecord = {
  report_id: number
  predicted_label: string
  gmo_probability: number
  no_gmo_probability: number
  chunks_processed: number
  pdf_path: string
  created_at: string
}

export type UserPredictionSummary = {
  sequence: SequenceRecord
  prediction: PredictionRecord
  report: ReportRecord
}

export type UserPredictionDetail = {
  sequence: SequenceRecord
  prediction: PredictionRecord
  predicted_label: 'gmo' | 'no-gmo'
  probabilities: {
    gmo: number
    no_gmo: number
  }
  attention: AttentionSegment[]
  chunks_processed: number
  report: ReportRecord
}

function normalizePath(path: string): string {
  if (path.startsWith('/')) {
    return path
  }

  return `/${path}`
}

const DIAGNOSTICS_PATH = normalizePath(import.meta.env.VITE_DIAGNOSTICS_PATH ?? '/diagnostics/')
const REPORTS_PATH = normalizePath(import.meta.env.VITE_REPORTS_PATH ?? '/reports/')

export type DiagnosticFormPayload = {
  seq_nom: string
  seq_nom_courant: string
  sequence: string
  file?: File | null
}

export async function submitDiagnosticForm(
  payload: DiagnosticFormPayload,
): Promise<SequencePredictionResponse> {
  const formData = new FormData()
  formData.append('seq_nom', payload.seq_nom)
  formData.append('seq_nom_courant', payload.seq_nom_courant)
  formData.append('sequence', payload.sequence)

  if (payload.file) {
    formData.append('file', payload.file)
  }

  return apiPostForm<SequencePredictionResponse>(DIAGNOSTICS_PATH, formData)
}

export async function fetchUserReports(): Promise<UserPredictionSummary[]> {
  return apiGet<UserPredictionSummary[]>(REPORTS_PATH)
}

export async function fetchLatestReportDetail(sequenceId: number): Promise<UserPredictionDetail> {
  return apiGet<UserPredictionDetail>(`${REPORTS_PATH}${sequenceId}/latest/`)
}
