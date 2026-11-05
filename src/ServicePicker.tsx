import { Check, Clock3 } from 'lucide-react';
import { services, totalDuration } from './data';

export function ServicePicker({
  selectedIds,
  onChange,
  compact = false,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  compact?: boolean;
}) {
  return (
    <div className={`service-picker${compact ? ' compact' : ''}`}>
      <div className="service-selection-summary" role="status">
        <span>
          {selectedIds.length
            ? `${selectedIds.length} ${selectedIds.length === 1 ? 'service' : 'services'} selected`
            : 'Select at least one service'}
        </span>
        <strong>
          <Clock3 size={14} /> {totalDuration(selectedIds)} min total
        </strong>
      </div>
      <div className="service-options" role="group" aria-label="Choose services">
        {services.map((service) => {
          const selected = selectedIds.includes(service.id);
          return (
            <button
              type="button"
              key={service.id}
              className={`selection-card${selected ? ' selected' : ''}`}
              aria-pressed={selected}
              onClick={() =>
                onChange(
                  selected
                    ? selectedIds.filter((id) => id !== service.id)
                    : [...selectedIds, service.id],
                )
              }
            >
              <span>
                <small>{service.category}</small>
                <strong>{service.name}</strong>
                <span>
                  <Clock3 size={12} />
                  {service.duration} min
                </span>
              </span>
              <span className="selection-check service-checkbox" aria-hidden="true">
                {selected && <Check size={14} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
