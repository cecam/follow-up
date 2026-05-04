import { useState, useEffect, useMemo } from 'react';

/**
 * Hook para gestionar los datos del dashboard.
 * Inicialmente retorna datos mock según el modelo definido en project.md.
 */
export const useDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username] = useState('David');

  useEffect(() => {
    // Simulamos carga de datos desde chrome.storage.local
    const timer = setTimeout(() => {
      const mockContacts = [
        {
          id: '1',
          name: 'María López',
          profileUrl: 'https://linkedin.com/in/maria-lopez',
          platform: 'linkedin',
          notes: 'Recruiter en Google, contactar sobre posición frontend.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 días atrás
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // Caduca en 3 días (Warning!)
        },
        {
          id: '2',
          name: 'Carlos Ruiz',
          profileUrl: 'https://instagram.com/cruiz_design',
          platform: 'instagram',
          notes: 'Diseñador UI/UX. Interesado en colaboración.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 150).toISOString(), // 5 meses después
        },
        {
          id: '3',
          name: 'Ana García',
          profileUrl: 'https://linkedin.com/in/anagarcia',
          platform: 'linkedin',
          notes: 'Ventas en SaaS. Seguimiento para demo.',
          createdAt: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // Caduca en 5 días (Warning!)
        },
        {
          id: '4',
          name: 'Pedro Picapiedra',
          profileUrl: 'https://linkedin.com/in/pedro',
          platform: 'linkedin',
          notes: 'Gerente de cantera.',
          createdAt: new Date().toISOString(),
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
        }
      ];
      setContacts(mockContacts);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const threshold = 1000 * 60 * 60 * 24 * 7; // 7 días

    const expiringSoon = contacts.filter(contact => {
      const expiration = new Date(contact.expirationDate).getTime();
      const diff = expiration - now;
      return diff > 0 && diff <= threshold;
    }).length;

    return {
      total: contacts.length,
      expiringSoon
    };
  }, [contacts]);

  return {
    username,
    contacts,
    stats,
    loading,
    error
  };
};
