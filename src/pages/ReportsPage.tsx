import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import {
  fetchLatestReportDetail,
  fetchUserReports,
  type UserPredictionDetail,
  type UserPredictionSummary,
} from '../api/diagnostics'

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatLabel(label: string): string {
  return label === 'gmo' ? 'GMO' : 'Non-GMO'
}

function formatDate(value: string): string {
  const date = new Date(value)
  return date.toLocaleString()
}

export function ReportsPage() {
  const [items, setItems] = useState<UserPredictionSummary[]>([])
  const [selectedSequenceId, setSelectedSequenceId] = useState<number | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<UserPredictionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadReports(): Promise<void> {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const response = await fetchUserReports()
        if (ignore) return
        setItems(response)

        if (response.length > 0) {
          const firstSequenceId = response[0].sequence.sequence_id
          setSelectedSequenceId(firstSequenceId)
        }
      } catch (error) {
        if (ignore) return
        const message =
          error instanceof ApiError
            ? `${error.message} (HTTP ${error.status})`
            : 'Chargement impossible des rapports.'
        setErrorMessage(message)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    void loadReports()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (selectedSequenceId == null) {
      setSelectedDetail(null)
      return
    }

    const seqId = selectedSequenceId

    let ignore = false
    async function loadDetail(): Promise<void> {
      setIsLoadingDetail(true)
      setErrorMessage('')
      try {
        const detail = await fetchLatestReportDetail(seqId)
        if (ignore) return
        setSelectedDetail(detail)
      } catch (error) {
        if (ignore) return
        const message =
          error instanceof ApiError
            ? `${error.message} (HTTP ${error.status})`
            : 'Chargement impossible du diagnostic selectionne.'
        setErrorMessage(message)
      } finally {
        if (!ignore) setIsLoadingDetail(false)
      }
    }

    void loadDetail()
    return () => {
      ignore = true
    }
  }, [selectedSequenceId])

  const selectedHeader = useMemo(() => {
    if (!selectedDetail) return 'Selectionnez un diagnostic'
    return `${selectedDetail.sequence.seq_nom_courant || selectedDetail.sequence.seq_nom} · ${formatLabel(selectedDetail.predicted_label)}`
  }, [selectedDetail])

  return (
    <section>
      <div className="page-intro">
        <span className="badge">LIST DES DIAGNOSTIQUES</span>
        <h2>Rapports d'analyse</h2>
        
      </div>

      {errorMessage ? <p className="form-feedback form-feedback--error">{errorMessage}</p> : null}

      <div className="reports-layout">
        <article className="panel-card reports-list-card">
          <h3>Mes predictions</h3>
          {isLoading ? <p>Chargement...</p> : null}
          {!isLoading && items.length === 0 ? <p>Aucun diagnostic disponible.</p> : null}

          <div className="reports-list" role="listbox" aria-label="Liste des predictions">
            {items.map((item) => {
              const active = item.sequence.sequence_id === selectedSequenceId
              return (
                <button
                  key={item.prediction.prediction_id}
                  type="button"
                  className={active ? 'report-row report-row--active' : 'report-row'}
                  onClick={() => setSelectedSequenceId(item.sequence.sequence_id)}
                >
                  <div>
                    <strong>{item.sequence.seq_nom_courant || item.sequence.seq_nom}</strong>
                    <span>{formatDate(item.prediction.pred_date)}</span>
                  </div>
                  <span className={item.report.predicted_label === 'gmo' ? 'prediction-pill prediction-pill--gmo' : 'prediction-pill prediction-pill--no-gmo'}>
                    {formatLabel(item.report.predicted_label)}
                  </span>
                </button>
              )
            })}
          </div>
        </article>

        <article className="panel-card reports-detail-card">
          <h3>{selectedHeader}</h3>

          {isLoadingDetail ? <p>Chargement du diagnostic...</p> : null}

          {selectedDetail ? (
            <div className="reports-detail-grid">
              <div className="result-metric-card">
                <span>Probabilite GMO</span>
                <strong>{formatPercent(selectedDetail.probabilities.gmo)}</strong>
              </div>
              <div className="result-metric-card">
                <span>Probabilite Non-GMO</span>
                <strong>{formatPercent(selectedDetail.probabilities.no_gmo)}</strong>
              </div>
              <div className="result-metric-card">
                <span>Confiance</span>
                <strong>{formatPercent(selectedDetail.prediction.pred_confiance)}</strong>
              </div>
              <div className="result-metric-card">
                <span>Fenêtres analysées</span>
                <strong>{selectedDetail.chunks_processed}</strong>
              </div>
            </div>
          ) : null}

          {selectedDetail?.attention?.length ? (
            <div className="reports-attention-list">
              <h4>Derniers segments d'attention</h4>
              {selectedDetail.attention.map((segment, index) => (
                <div key={`${segment.start}-${segment.end}-${index}`} className="attention-item">
                  <div className="attention-item__meta">
                    <span>Segment {index + 1}</span>
                    <strong>{formatPercent(segment.score)}</strong>
                  </div>
                  <p>Positions {segment.start} - {segment.end}</p>
                  <code>{segment.sequence}</code>
                </div>
              ))}
            </div>
          ) : null}

          {selectedDetail ? (
            <div className="reports-actions">
              <a className="submit-button" href={selectedDetail.report.pdf_path} target="_blank" rel="noreferrer">
                Ouvrir le rapport PDF
              </a>
              <a className="submit-button reports-actions__secondary" href={selectedDetail.report.pdf_path} download>
                Télécharger le PDF
              </a>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  )
}
