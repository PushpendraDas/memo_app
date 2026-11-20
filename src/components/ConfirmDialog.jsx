import { useEffect, useRef } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useDialog } from '../hooks/useDialog'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  const dialogRef = useDialog(onCancel)
  const cancelRef = useRef(null)

  useEffect(() => {
    // Default focus on the safe choice.
    cancelRef.current?.focus()
  }, [])

  return (
    <div className="overlay overlay--confirm" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        ref={dialogRef}
        className="confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className={`confirm__icon confirm__icon--${tone}`} aria-hidden="true">
          <TriangleAlert size={22} />
        </div>
        <h2 id="confirm-title" className="confirm__title">
          {title}
        </h2>
        <p id="confirm-message" className="confirm__message">
          {message}
        </p>
        <div className="confirm__actions">
          <button ref={cancelRef} type="button" className="btn btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
