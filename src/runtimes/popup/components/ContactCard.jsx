import { useState, useRef, useEffect } from 'react';
import { MoreVertical, ExternalLink, AlertCircle, ChevronDown } from 'lucide-react';
import { ActionMenu } from './ActionMenu';

export const ContactCard = ({ contact }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef(null);

  const expirationDate = new Date(contact.expirationDate);
  const now = new Date();
  const diffDays = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

  const isExpiringSoon = diffDays > 0 && diffDays <= 7;
  const isExpired = diffDays <= 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <details
      className="bento-card bento-card--wide w-full"
      style={{ padding: 0, overflow: 'visible', cursor: 'pointer' }}
      onToggle={(e) => setIsExpanded(e.target.open)}
    >
      <summary
        className="flex items-center justify-between w-full"
        style={{
          padding: '16px',
          listStyle: 'none',
          outline: 'none'
        }}
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            size={16}
            style={{
              transition: 'transform 200ms ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'var(--color-text-tertiary)'
            }}
          />
          <div className="flex flex-col">
            <h2 className="text-title">{contact.name}</h2>
            <span className="text-micro" style={{ color: 'var(--color-text-tertiary)' }}>
              Vigencia: {formatDate(contact.expirationDate)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2" ref={menuRef}>
          {isExpiringSoon && (
            <AlertCircle size={16} style={{ color: 'var(--color-warning)' }} title={`Caduca en ${diffDays} días`} />
          )}
          {isExpired && (
            <AlertCircle size={16} style={{ color: 'var(--color-error)' }} title="Caducado" />
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            style={{ color: 'var(--color-text-tertiary)', padding: '4px' }}
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <ActionMenu
              onEdit={() => console.log('Edit', contact.id)}
              onDelete={() => console.log('Delete', contact.id)}
              style={{ right: '16px', top: '40px' }}
            />
          )}
        </div>
      </summary>

      <div style={{ padding: '0 16px 16px 32px' }}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <a
              href={contact.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-micro"
              style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: '600' }}
              onClick={(e) => e.stopPropagation()}
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
              borderLeft: '3px solid var(--color-border-hover)'
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
