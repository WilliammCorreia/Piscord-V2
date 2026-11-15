import { HttpErrorResponse } from '@angular/common/http';

/** Réponse de l'API en cas de succès */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
}

/** Corps de réponse de l'API en cas d'erreur (statut HTTP 4xx ou 5xx) */
export interface ApiError {
  success: false;
  /** Code stable, à utiliser dans les conditions plutôt que le message */
  code: string;
  message: string;
  errors?: { field?: string; message: string }[];
}

function apiErrorBody(err: unknown): Partial<ApiError> | null {
  return err instanceof HttpErrorResponse ? (err.error as Partial<ApiError> | null) : null;
}

/**
 * Extrait le code d'erreur renvoyé par l'API
 * @param err Erreur reçue dans le callback `error` d'un appel HttpClient
 * @returns Le code de l'API (ex: "EMAIL_TAKEN"), ou undefined si la réponse n'en contient pas
 */
export function apiErrorCode(err: unknown): string | undefined {
  return apiErrorBody(err)?.code;
}

/**
 * Extrait le message d'erreur renvoyé par l'API
 * @param err Erreur reçue dans le callback `error` d'un appel HttpClient
 * @param fallback Message à afficher si l'API n'en fournit pas (erreur réseau, 500...)
 */
export function apiErrorMessage(err: unknown, fallback = 'Une erreur est survenue, veuillez ressayer plus tard.'): string {
  const status = err instanceof HttpErrorResponse ? err.status : 0;
  const message = apiErrorBody(err)?.message;

  // Les erreurs 5xx ne sont pas destinées à l'utilisateur
  return message && status >= 400 && status < 500 ? message : fallback;
}
