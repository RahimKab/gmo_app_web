import { useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { ApiError } from '../api/client'
import type { AttentionSegment, SequencePredictionResponse } from '../api/diagnostics'
import { submitDiagnosticForm } from '../api/diagnostics'

const ACCEPTED_TYPES = ['.fasta', '.fna', '.txt']
const CHUNK_SIZE = 1024   
const CHUNK_STRIDE = CHUNK_SIZE // 2 + CHUNK_SIZE // 4 
type InputMode = 'raw' | 'file'

function countChunks(seqLen: number): number {
  if (seqLen <= CHUNK_SIZE) return 1
  let count = 0
  let start = 0
  while (start < seqLen) {
    const end = Math.min(start + CHUNK_SIZE, seqLen)
    count++
    if (end >= seqLen) break
    start += CHUNK_STRIDE
  }
  return count
}

function isAllowedFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  return ACCEPTED_TYPES.some((extension) => fileName.endsWith(extension))
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatLabel(label: 'gmo' | 'no-gmo'): string {
  return label === 'gmo' ? 'GMO' : 'Non-GMO'
}

export function DiagnostiquePage() {
  const [inputMode, setInputMode] = useState<InputMode>('raw')
  const [seqNom, setSeqNom] = useState('')
  const [seqNomCourant, setSeqNomCourant] = useState('')
  const [sequenceText, setSequenceText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [result, setResult] = useState<SequencePredictionResponse | null>(null)

  const acceptedLabel = useMemo(() => ACCEPTED_TYPES.join(', '), [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const hasSequence = Boolean(sequenceText.trim())
    const hasFile = Boolean(selectedFile)

    if (inputMode === 'raw' && !hasSequence) {
      setErrorMessage('Veuillez saisir la sequence brute.')
      setSuccessMessage('')
      return
    }

    if (inputMode === 'file' && !hasFile) {
      setErrorMessage('Veuillez selectionner un fichier FASTA/FNA/TXT.')
      setSuccessMessage('')
      return
    }

    if (!seqNom.trim() || !seqNomCourant.trim()) {
      setErrorMessage('Les champs seq_nom et seq_nom_courant sont obligatoires.')
      setSuccessMessage('')
      return
    }

    if (selectedFile && !isAllowedFile(selectedFile)) {
      setErrorMessage('Format non supporte. Utilisez uniquement .fasta, .fna ou .txt.')
      setSuccessMessage('')
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await submitDiagnosticForm({
        seq_nom: seqNom.trim(),
        seq_nom_courant: seqNomCourant.trim(),
        sequence: inputMode === 'raw' ? sequenceText.trim() : '',
        file: inputMode === 'file' ? selectedFile : null,
      })

      const sequenceName = response.sequence.seq_nom_courant || response.sequence.seq_nom || selectedFile?.name || seqNomCourant
      setResult(response)
      setSuccessMessage(`Diagnostic traite avec succes: ${sequenceName}.`)
    } catch (error) {
      const message =
        error instanceof ApiError
          ? `${error.message} (HTTP ${error.status})`
          : 'Envoi impossible. Verifiez la connexion.'

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const probabilityCards = result
    ? [
        {
          label: 'GMO',
          value: result.probabilities.gmo,
          className: 'probability-meter__bar probability-meter__bar--gmo',
        },
        {
          label: 'Non-GMO',
          value: result.probabilities.no_gmo,
          className: 'probability-meter__bar probability-meter__bar--non-gmo',
        },
      ]
    : []

  const topAttention: AttentionSegment | null = result?.attention[0] ?? null
  const confidenceValue = result?.prediction.pred_confiance ?? 0
  const predictedLabel = result ? formatLabel(result.predicted_label) : ''
  const gaugeClassName = result?.predicted_label === 'gmo' ? 'result-score-ring result-score-ring--gmo' : 'result-score-ring result-score-ring--no-gmo'

  return (
    <section>
      <div className="page-intro">
        <span className="badge">ADN</span>
        <h2>Importer une sequence</h2>
      </div>

      <article className="upload-card">
        <h3>Formulaire de diagnostique ADN</h3>

        <div className="diagnostic-mode" role="tablist" aria-label="Source de diagnostic">
          <button
            type="button"
            className={inputMode === 'raw' ? 'mode-chip mode-chip--active' : 'mode-chip'}
            onClick={() => {
              setInputMode('raw')
              setSelectedFile(null)
              setErrorMessage('')
              setSuccessMessage('')
            }}
          >
            Sequence
          </button>
          <button
            type="button"
            className={inputMode === 'file' ? 'mode-chip mode-chip--active' : 'mode-chip'}
            onClick={() => {
              setInputMode('file')
              setSequenceText('')
              setErrorMessage('')
              setSuccessMessage('')
            }}
          >
            Charger fichier
          </button>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="field" htmlFor="seq-nom">
            <span>seq_nom</span>
            <input
              id="seq-nom"
              type="text"
              value={seqNom}
              onChange={(event) => setSeqNom(event.target.value)}
              placeholder="Ex: Vigna-unguiculata"
            />
          </label>

          <label className="field" htmlFor="seq-nom-courant">
            <span>seq_nom_courant</span>
            <input
              id="seq-nom-courant"
              type="text"
              value={seqNomCourant}
              onChange={(event) => setSeqNomCourant(event.target.value)}
              placeholder="Ex: Niebe"
            />
          </label>

          {inputMode === 'raw' ? (
            <label className="field" htmlFor="sequence-text">
              <span>sequence</span>
              <textarea
                id="sequence-text"
                className="sequence-textarea"
                value={sequenceText}
                onChange={(event) => setSequenceText(event.target.value)}
                placeholder="Collez une sequence ADN ou un contenu FASTA"
              />
            </label>
          ) : (
            <label className="upload-dropzone" htmlFor="sequence-file">
              <input
                id="sequence-file"
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setSelectedFile(file)
                  setErrorMessage('')
                  setSuccessMessage('')
                }}
              />
              <span className="upload-dropzone__title">Glissez-deposez ou cliquez pour choisir</span>
              <span className="upload-dropzone__meta">Extensions autorisees: {acceptedLabel}</span>
            </label>
          )}

          <div className="upload-meta">
            <p>
              <strong>Fichier:</strong>{' '}
              {selectedFile ? `${selectedFile.name} (${Math.ceil(selectedFile.size / 1024)} KB)` : 'Aucun fichier'}
            </p>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
            </button>
          </div>
        </form>

        {errorMessage ? <p className="form-feedback form-feedback--error">{errorMessage}</p> : null}
        {successMessage ? <p className="form-feedback form-feedback--success">{successMessage}</p> : null}

        {isSubmitting && inputMode === 'raw' && sequenceText.trim().length > CHUNK_SIZE ? (
          <div className="sequence-scanner" aria-live="polite">
            <p className="sequence-scanner__title">
              Découpage en {countChunks(sequenceText.trim().length)} fenêtres chevauchantes
              &nbsp;({CHUNK_SIZE} nt · stride {CHUNK_STRIDE} nt) — analyse en cours…
            </p>
            <div className="sequence-scanner__track">
              <div className="sequence-scanner__beam" />
              <span className="sequence-scanner__text">{sequenceText.trim()}</span>
            </div>
          </div>
        ) : null}
      </article>

      {result ? (
        <section className="result-dashboard" aria-label="Resultat de prediction">
          <article className="result-hero-card">
            <div className="result-hero-copy">
              <span className="badge">PREDICTION RESULT</span>
              <h3>
                Verdict: <span className={`prediction-pill prediction-pill--${result.predicted_label}`}>{predictedLabel}</span>
              </h3>
              <p>
                Sequence <strong>{result.sequence.seq_nom_courant || result.sequence.seq_nom}</strong>
                {' '}analysee avec un niveau de confiance de{' '}
                <strong>{formatPercent(confidenceValue)}</strong>.
              </p>
              <div className="result-hero-meta">
                <div className="result-metric-card">
                  <span>Seuil GMO</span>
                  <strong>50.0%</strong>
                </div>
                <div className="result-metric-card">
                  <span>Probabilite GMO</span>
                  <strong>{formatPercent(result.probabilities.gmo)}</strong>
                </div>
                <div className="result-metric-card">
                  <span>Probabilite Non-GMO</span>
                  <strong>{formatPercent(result.probabilities.no_gmo)}</strong>
                </div>
                {result.chunks_processed > 1 ? (
                  <div className="result-metric-card result-metric-card--chunks">
                    <span>Fenêtres analysées</span>
                    <strong>{result.chunks_processed}</strong>
                  </div>
                ) : null}
              </div>
            </div>
            <div
              className={gaugeClassName}
              aria-hidden="true"
              style={{ '--confidence-value': `${confidenceValue}` } as CSSProperties}
            >
              <div className="result-score-ring__inner">
                <strong>{formatPercent(confidenceValue)}</strong>
                <span>{predictedLabel}</span>
              </div>
            </div>
          </article>

          <div className="result-grid">
            <article className="panel-card probability-panel">
              <h3>Probabilites par label</h3>
              <p className="result-panel-intro">
                Lecture directe des scores renvoyes par le backend pour chaque classe.
              </p>
              <div className="probability-list">
                {probabilityCards.map((item) => (
                  <div key={item.label} className="probability-meter">
                    <div className="probability-meter__header">
                      <span>{item.label}</span>
                      <strong>{formatPercent(item.value)}</strong>
                    </div>
                    <div className="probability-meter__track">
                      <div className="probability-meter__threshold" style={{ left: '80%' }} />
                      <div className={item.className} style={{ width: `${item.value * 100}%` }} />
                    </div>
                    <span className="probability-meter__hint">Seuil GMO: 50%</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card attention-panel">
              <h3>Attention sur la sequence</h3>
              <p>
                Les segments avec le score le plus eleve indiquent les zones qui ont le plus pese
                dans la prediction.
              </p>
              {topAttention ? (
                <div className="attention-hero">
                  <span className="attention-hero__label">Zone principale</span>
                  <strong>
                    {topAttention.start} - {topAttention.end}
                  </strong>
                  <span className="attention-hero__score">Impact {formatPercent(topAttention.score)}</span>
                  <code>{topAttention.sequence}</code>
                </div>
              ) : null}
            </article>
          </div>

          <article className="panel-card attention-table-card">
            <h3>Cartographie des segments</h3>
            <div className="attention-list">
              {result.attention.map((segment, index) => (
                <div key={`${segment.start}-${segment.end}-${index}`} className="attention-item">
                  <div className="attention-item__meta">
                    <span>Segment {index + 1}</span>
                    <strong>{formatPercent(segment.score)}</strong>
                  </div>
                  <div className="attention-item__track">
                    <div className="attention-item__fill" style={{ width: `${segment.score * 100}%` }} />
                  </div>
                  <p>
                    Positions {segment.start} - {segment.end}
                  </p>
                  <code>{segment.sequence}</code>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </section>
  )
}
