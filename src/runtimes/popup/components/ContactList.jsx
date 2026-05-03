import { ContactCard } from './ContactCard';

export const ContactList = ({ contacts, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4" style={{ padding: '0 16px 16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="bento-card bento-card--wide w-full" style={{ height: '60px', opacity: 0.5, background: 'var(--color-bg-secondary)' }} />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p className="text-body" style={{ color: 'var(--color-text-tertiary)' }}>No tienes contactos guardados aún.</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{
        padding: '0 16px 24px',
        gap: '6px',
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollBehavior: 'smooth'
      }}
    >
      <h2 className="text-caption" style={{ paddingLeft: '4px', marginBottom: '4px' }}>Tus contactos</h2>
      {contacts.map(contact => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
};
