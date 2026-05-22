import { useState, useEffect, useRef } from 'react';
import { Settings, User, LogOut, Plus } from 'lucide-react';

export const FollowUpDashboardHeader = ({ username, onAddFollowUp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <header className="flex items-center justify-between w-full" style={{ padding: '24px 16px 16px', background: 'var(--color-bg-primary)' }}>
      <div className="flex flex-col">
        <h1 className="text-heading">Bienvenido de nuevo {username}</h1>
        <p className="text-caption" style={{ marginTop: '4px' }}>Aquí tienes un vistazo rápido de tus seguimientos</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          style={{
            color: 'var(--color-accent)',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
          className="hover-bg-subtle"
          aria-label="Agregar nuevo follow-up"
          onClick={onAddFollowUp}
        >
          <Plus size={20} />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              color: 'var(--color-text-tertiary)',
              padding: '8px',
              borderRadius: '8px',
              background: isOpen ? 'var(--color-bg-secondary)' : 'transparent',
            }}
            aria-label="Configuración de la cuenta"
          >
            <Settings size={20} />
          </button>

          {isOpen && (
            <div
              className="bento-card"
              style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                width: '160px',
                padding: '8px',
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <button
                className="flex items-center gap-2 w-full text-body"
                style={{ padding: '8px', borderRadius: '6px' }}
                onClick={() => setIsOpen(false)}
              >
                <User size={16} />
                <span>Editar perfil</span>
              </button>
              <button
                className="flex items-center gap-2 w-full text-body"
                style={{ padding: '8px', borderRadius: '6px', color: 'var(--color-error)' }}
                onClick={() => setIsOpen(false)}
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
