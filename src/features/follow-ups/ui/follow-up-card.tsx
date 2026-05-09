import { useState, type MouseEvent, type ToggleEvent } from 'react';
import { ExternalLink, AlertCircle, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { useDeleteFollowUp } from '../hooks/use-delete-follow-up';
import type { FollowUp } from '../domain/follow-up';
import { formatDate, getRemainingDays, isExpiringWithinDays } from '../../../shared/utils/date';

type FollowUpCardProps = {
  contact: FollowUp;
  onEditFollowUp: (followUp: FollowUp) => void;
  onFollowUpsChange?: (followUps: FollowUp[]) => void;
};

export const FollowUpCard = ({ contact, onEditFollowUp, onFollowUpsChange }: FollowUpCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const {
    deleteFollowUp,
    isLoading: isDeleting,
    errors: deleteError,
  } = useDeleteFollowUp();

  const diffDays = getRemainingDays(contact.expirationDate);
  const isExpiringSoon = isExpiringWithinDays(contact.expirationDate, 7);
  const isExpired = diffDays <= 0;

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onEditFollowUp(contact);
  };

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsExpanded(true);
    setIsConfirmingDelete(true);
  };

  const handleCancelDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsConfirmingDelete(false);
  };

  const handleConfirmDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const response = await deleteFollowUp(contact.id);

    if (response) {
      setIsConfirmingDelete(false);
      onFollowUpsChange?.(response.contacts);
    }
  };

  const handleToggle = (event: ToggleEvent<HTMLDetailsElement>) => {
    setIsExpanded(event.currentTarget.open);
  };

  return (
    <details
      open={isExpanded}
      className="bento-card bento-card--wide w-full"
      style={{ padding: 0, overflow: 'visible', cursor: 'pointer' }}
      onToggle={handleToggle}
    >
      <summary
        className="flex items-center justify-between w-full"
        style={{
          padding: '16px',
          listStyle: 'none',
          outline: 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            size={16}
            style={{
              transition: 'transform 200ms ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'var(--color-text-tertiary)',
            }}
          />
          <div className="flex flex-col">
            <h2 className="text-title">{contact.name}</h2>
            <span className="text-micro" style={{ color: 'var(--color-text-tertiary)' }}>
              Vigencia: {formatDate(contact.expirationDate)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpiringSoon && (
            <AlertCircle size={16} style={{ color: 'var(--color-warning)' }} title={`Caduca en ${diffDays} días`} />
          )}
          {isExpired && (
            <AlertCircle size={16} style={{ color: 'var(--color-error)' }} title="Caducado" />
          )}

          <button
            type="button"
            onClick={handleEdit}
            aria-label={`Editar follow-up de ${contact.name}`}
            title="Editar"
            style={{ color: 'var(--color-text-tertiary)', padding: '4px' }}
          >
            <Edit2 size={16} />
          </button>

          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            aria-label={`Eliminar follow-up de ${contact.name}`}
            title="Eliminar"
            style={{ color: 'var(--color-error)', padding: '4px', opacity: isDeleting ? 0.5 : 1 }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </summary>

      <div style={{ padding: '0 16px 16px 32px' }}>
        <div className="flex flex-col gap-2">
          {isConfirmingDelete && (
            <div
              className="follow-up-alert"
              role="alert"
              style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
              onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
            >
              <div className="flex flex-col gap-1">
                <span>Eliminar follow-up de {contact.name}?</span>
                {deleteError && <small>{deleteError.message}</small>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="follow-up-confirm-button follow-up-confirm-button--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="follow-up-confirm-button follow-up-confirm-button--danger"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <a
              href={contact.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-micro"
              style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: '600' }}
              onClick={(event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation()}
            >
              <ExternalLink size={12} />
              Ver perfil en {contact.platform}
            </a>

            <span className="text-micro" style={{ color: isExpiringSoon ? 'var(--color-warning)' : 'var(--color-text-tertiary)' }}>
              {isExpired ? 'Expirado' : `${diffDays} días restantes para expirar`}
            </span>
          </div>

          {contact.notes && (
            <div style={{
              background: 'var(--color-bg-secondary)',
              padding: '10px',
              borderRadius: '8px',
              borderLeft: '3px solid var(--color-border-hover)',
            }}>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)', fontSize: '12px', lineHeight: '1.4' }}>
                Notas:
              </p>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)', fontSize: '12px', lineHeight: '1.4' }}>
                {contact.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </details>
  );
};
