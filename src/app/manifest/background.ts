// src/background.ts
import { createFollowUp } from '../../features/follow-ups/application/follow-up.service';
import {
  OPEN_FOLLOW_UP_FORM_FROM_LINKEDIN_PROFILE,
  parseLinkedInProfileDraftInput,
  removeLinkedInProfileDraft,
  writeLinkedInProfileDraft,
} from '../../shared/chrome/linkedin-profile-draft';
import { fail, getErrorMessage, ok } from '../../shared/types/runtime';

chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "¡Hola Mundo! El Service Worker de la extensión se ha instalado.",
  );
});

// Ejemplo: Escuchar cuando se hace clic en el icono de la extensión
chrome.action.onClicked.addListener((tab) => {
  console.log(
    "Se hizo clic en el icono de la extensión en la pestaña:",
    tab?.id,
  );
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === OPEN_FOLLOW_UP_FORM_FROM_LINKEDIN_PROFILE) {
    const input = parseLinkedInProfileDraftInput(message.payload);

    if (!input) {
      sendResponse(fail('INVALID_LINKEDIN_PROFILE_DRAFT'));
      return false;
    }

    writeLinkedInProfileDraft(input)
      .then(() => chrome.action.openPopup())
      .then(() => sendResponse(ok()))
      .catch(async (error: unknown) => {
        try {
          await removeLinkedInProfileDraft();
        } catch (cleanupError) {
          console.error('[follow-up] Failed to clean up LinkedIn profile draft:', cleanupError);
        }

        sendResponse(fail(getErrorMessage(error, 'OPEN_FOLLOW_UP_FORM_FAILED')));
      });

    return true;
  }

  if (message.action === 'CREATE_FOLLOW_UP_FROM_LINKEDIN') {
    const payload = message.payload;

    // Convert to FollowUpInput
    const input = {
      name: payload.name,
      profileUrl: payload.profileUrl,
      platform: 'linkedin' as const,
      notes: payload.notes,
    };
    console.log("input", input)

    createFollowUp(input)
      .then((result) => {
        if ('error' in result) {
          const response = { ok: false, error: result.error, errors: (result as any).errors ?? null };
          console.error('[follow-up] createFollowUp failed:', response);
          sendResponse(response);
        } else {
          sendResponse({ ok: true });
        }
      })
      .catch((err) => {
        console.error('[follow-up] Unexpected error:', err);
        sendResponse({ ok: false, error: err.message });
      });

    // Return true to indicate we will send a response asynchronously
    return true;
  }

  return false;
});
