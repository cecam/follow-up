import { Edit2, Trash2 } from 'lucide-react';

export const ActionMenu = ({ onEdit, onDelete, style }) => {
  return (
    <div 
      className="bento-card" 
      style={{ 
        position: 'absolute',
        padding: '6px',
        width: '120px',
        zIndex: 50,
        boxShadow: 'var(--shadow-lg)',
        ...style
      }}
    >
      <button 
        className="flex items-center gap-2 w-full text-body"
        style={{ padding: '6px', borderRadius: '6px' }}
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
      >
        <Edit2 size={14} />
        <span>Editar</span>
      </button>
      <button 
        className="flex items-center gap-2 w-full text-body"
        style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-error)' }}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        <Trash2 size={14} />
        <span>Borrar</span>
      </button>
    </div>
  );
};
