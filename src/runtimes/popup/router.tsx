import { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { consumeLinkedInProfileDraft } from '../../shared/chrome/linkedin-profile-draft';
import App from './App';
import { Dashboard } from './pages/Dashboard';
import { FollowUpForm } from './pages/FollowUpForm';

type PopupInitialEntry =
  | '/'
  | {
      pathname: '/follow-ups/new';
      state: {
        initialValues: {
          name: string;
          profileUrl: string;
        };
      };
    };

const loadPopupInitialEntry = async (): Promise<PopupInitialEntry> => {
  try {
    const draft = await consumeLinkedInProfileDraft();

    if (!draft) {
      return '/';
    }

    return {
      pathname: '/follow-ups/new',
      state: {
        initialValues: {
          name: draft.name,
          profileUrl: draft.profileUrl,
        },
      },
    };
  } catch (error) {
    console.error('[follow-up] Failed to bootstrap popup from LinkedIn draft:', error);
    return '/';
  }
};

// The module-level promise prevents React StrictMode from consuming the one-time
// draft twice while mounting the router in development.
const popupInitialEntryPromise = loadPopupInitialEntry();

export const PopupRouter = () => {
  const [initialEntry, setInitialEntry] = useState<PopupInitialEntry | null>(null);

  useEffect(() => {
    let isMounted = true;

    popupInitialEntryPromise.then((entry) => {
      if (isMounted) {
        setInitialEntry(entry);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!initialEntry) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-body">Cargando extensión...</p>
      </div>
    );
  }

  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="follow-ups">
            <Route path="new" element={<FollowUpForm />} />
            <Route path=":followUpId/edit" element={<FollowUpForm />} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>
  );
};
