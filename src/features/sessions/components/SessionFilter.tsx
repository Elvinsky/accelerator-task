import { useId } from 'react'
import { FILTER_ALL, LABELS, SESSION_STATUSES, STATUS_LABELS } from '../model/constants.ts'
import type { StatusFilter } from '../model/types.ts'

interface SessionFilterProps {
  value: StatusFilter
  onChange: (value: StatusFilter) => void
}

export default function SessionFilter({ value, onChange }: SessionFilterProps) {
  const id = useId()
  return (
    <div className="field-inline">
      <label htmlFor={id}>{LABELS.statusFilter}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as StatusFilter)}
      >
        <option value={FILTER_ALL}>{LABELS.filterAll}</option>
        {SESSION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  )
}
