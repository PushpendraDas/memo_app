import { CircleCheck, Info, Trash2, X } from 'lucide-react'

const ICONS = { success: CircleCheck, info: Info, delete: Trash2 }

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toasts" role="region" aria-label="Notifications">
      <div aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] ?? Info
          return (
            <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
              <Icon size={17} className="toast__icon" aria-hidden="true" />
              <span className="toast__message">{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  className="toast__action"
                  onClick={() => {
                    toast.action.onClick()
                    onDismiss(toast.id)
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
