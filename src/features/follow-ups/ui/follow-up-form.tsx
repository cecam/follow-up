import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, AlertCircle, Save } from 'lucide-react';
import { useCreateFollowUp } from '../hooks/use-create-follow-up';
import { useUpdateFollowUp } from '../hooks/use-update-follow-up';
import type { FollowUp, FollowUpInput, FollowUpValidationErrors } from '../domain/follow-up';
import {
  FOLLOW_UP_ACTIVE_LIMIT_MESSAGE,
  FOLLOW_UP_NOTE_MAX_LENGTH,
  FOLLOW_UP_PLATFORMS,
  FOLLOW_UP_STATUSES,
} from '../domain/follow-up.constants';
import { hasReachedActiveFollowUpLimit, validateFollowUpInput } from '../domain/follow-up.validators';
import { fromDateInputValue, getExpirationDate, toDateInputValue } from '../../../shared/utils/date';
import { createId } from '../../../shared/utils/id';
import './styles/follow-up-form.css';

type FollowUpFormValues = {
  name: string;
  profileUrl: string;
  notes: string;
  status: FollowUp['status'];
  createdAt: string;
};

export type FollowUpFormProps = {
  followUp?: FollowUp | null;
  followUps?: FollowUp[] | null;
  onBack: () => void;
  onSaveSuccess: (followUps: FollowUp[]) => void;
};

const createInitialValues = (followUp?: FollowUp | null): FollowUpFormValues => {
  const now = new Date();
  const createdAt = followUp?.createdAt ?? now.toISOString();

  return {
    name: followUp?.name ?? '',
    profileUrl: followUp?.profileUrl ?? '',
    notes: followUp?.notes ?? '',
    status: followUp?.status ?? FOLLOW_UP_STATUSES.PENDING,
    createdAt,
  };
};

export const FollowUpForm = ({ followUp, followUps, onBack, onSaveSuccess }: FollowUpFormProps) => {
  const [values, setValues] = useState<FollowUpFormValues>(() => createInitialValues(followUp));
  const [errors, setErrors] = useState<FollowUpValidationErrors>({});
  const {
    createFollowUp,
    isLoading: isSaving,
    errors: createFollowUpError,
  } = useCreateFollowUp();
  const {
    updateFollowUp,
    isLoading: isUpdating,
    errors: updateFollowUpError,
  } = useUpdateFollowUp();

  const isEditMode = Boolean(followUp?.id);
  const submitError = isEditMode ? updateFollowUpError?.message : createFollowUpError?.message;
  const isSubmitting = isSaving || isUpdating;
  const activeLimitReached = !isEditMode && hasReachedActiveFollowUpLimit(followUps ?? []);
  const createButtonDisabled = isSubmitting || activeLimitReached;

  useEffect(() => {
    setValues(createInitialValues(followUp));
    setErrors({});
  }, [followUp]);

  const automaticExpirationDate = useMemo(() => {
    return toDateInputValue(getExpirationDate(values.createdAt));
  }, [values.createdAt]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: name === 'notes' ? value.slice(0, FOLLOW_UP_NOTE_MAX_LENGTH) : value,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
  };

  const validate = (): boolean => {
    const validation = validateFollowUpInput({
      ...values,
      platform: FOLLOW_UP_PLATFORMS.LINKEDIN,
    });

    setErrors(validation.errors);
    return validation.valid;
  };

  const buildPayload = (): FollowUpInput => {
    const now = new Date().toISOString();

    return {
      id: followUp?.id ?? createId(),
      name: values.name.trim(),
      profileUrl: values.profileUrl.trim(),
      platform: FOLLOW_UP_PLATFORMS.LINKEDIN,
      notes: values.notes.trim(),
      status: values.status,
      createdAt: followUp?.createdAt ?? values.createdAt,
      updatedAt: now,
      expirationDate: fromDateInputValue(automaticExpirationDate),
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeLimitReached) {
      return;
    }

    if (!validate()) {
      return;
    }

    const payload = buildPayload();
    const response = isEditMode ? await updateFollowUp(payload) : await createFollowUp(payload);

    if (response) {
      onSaveSuccess(response.contacts);
    }
  };

  return (
    <div className="follow-up-form-container">
      <header className="follow-up-form-header">
        <button
          type="button"
          className="follow-up-icon-button hover-bg-subtle"
          onClick={onBack}
          aria-label="Regresar al dashboard"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-heading">{isEditMode ? 'Editar follow-up' : 'Nuevo follow-up'}</h1>
          <p className="text-caption" style={{ marginTop: '4px' }}>
            Guarda los detalles para tu próximo seguimiento
          </p>
        </div>
      </header>

      <form className="follow-up-form" onSubmit={handleSubmit}>
        {submitError && (
          <div className="follow-up-alert" role="alert">
            <AlertCircle size={16} />
            <span>{submitError}</span>
          </div>
        )}

        {activeLimitReached && (
          <div className="follow-up-alert" role="alert">
            <AlertCircle size={16} />
            <span>{FOLLOW_UP_ACTIVE_LIMIT_MESSAGE}</span>
          </div>
        )}

        <label className="follow-up-field">
          <span>Nombre</span>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="María López"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <small>{errors.name}</small>}
        </label>

        <label className="follow-up-field">
          <span>Perfil</span>
          <input
            name="profileUrl"
            type="url"
            value={values.profileUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/..."
            aria-invalid={Boolean(errors.profileUrl)}
          />
          {errors.profileUrl && <small>{errors.profileUrl}</small>}
        </label>

        <label className="follow-up-field">
          <span>Notas</span>
          <textarea
            name="notes"
            value={values.notes}
            maxLength={FOLLOW_UP_NOTE_MAX_LENGTH}
            onChange={handleChange}
            placeholder="Contexto, objetivo o siguiente paso"
            rows={4}
            aria-invalid={Boolean(errors.notes)}
          />
          <span className="follow-up-count">{values.notes.length}/{FOLLOW_UP_NOTE_MAX_LENGTH}</span>
          {errors.notes && <small>{errors.notes}</small>}
        </label>

        <p className="follow-up-expiration-note">
          Tienes hasta {automaticExpirationDate} para que expire tu follow-up
        </p>

        <button className="follow-up-save-button" type="submit" disabled={createButtonDisabled}>
          <Save size={16} />
          <span>{isSubmitting ? 'Guardando...' : isEditMode ? 'Guardar' : 'Crear'}</span>
        </button>
      </form>
    </div>
  );
};
