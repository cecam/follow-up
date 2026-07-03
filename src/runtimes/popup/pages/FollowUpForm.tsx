import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FollowUpForm as FeatureFollowUpForm } from '../../../features/follow-ups/ui/follow-up-form';
import { useFollowUp } from '../../../features/follow-ups/hooks/use-follow-up';
import { parseLinkedInProfileDraftInput } from '../../../shared/chrome/linkedin-profile-draft';

export const FollowUpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { followUpId } = useParams();
  const { data: followUps, isLoading, errors } = useFollowUp();

  const followUp = useMemo(() => {
    if (!followUpId) return null;
    return followUps.find((item) => item.id === followUpId) ?? null;
  }, [followUpId, followUps]);

  const initialValues = useMemo(() => {
    if (followUpId || typeof location.state !== 'object' || location.state === null) {
      return undefined;
    }

    return parseLinkedInProfileDraftInput(
      (location.state as Record<string, unknown>).initialValues,
    ) ?? undefined;
  }, [followUpId, location.state]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-body">Cargando formulario...</p>
      </div>
    );
  }

  if (errors) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-body" style={{ color: 'var(--color-error)' }}>Error al cargar el follow-up</p>
        <button onClick={() => navigate('/')} className="bento-card" style={{ padding: '8px 16px' }}>
          Volver al dashboard
        </button>
      </div>
    );
  }

  if (followUpId && !followUp) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-body">No se encontró el follow-up solicitado.</p>
        <button onClick={() => navigate('/')} className="bento-card" style={{ padding: '8px 16px' }}>
          Volver al dashboard
        </button>
      </div>
    );
  }

  return (
    <FeatureFollowUpForm
      followUp={followUp}
      followUps={followUps}
      initialValues={initialValues}
      onBack={() => navigate('/')}
      onSaveSuccess={() => navigate('/')}
    />
  );
};
