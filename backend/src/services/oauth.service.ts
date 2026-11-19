import { env } from '../config/env.js';

export interface PerfilOAuthVerificado {
  provider: 'google';
  providerUserId: string;
  email: string;
  fullName: string;
}

interface GoogleTokenInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  given_name?: string;
  aud?: string;
}

interface GoogleUserInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
}

// Verifica un idToken o accessToken oficial emitido por Google Identity Services
export const verificarTokenGoogle = async (opciones: {
  idToken?: string | undefined;
  accessToken?: string | undefined;
}): Promise<PerfilOAuthVerificado> => {
  if (opciones.idToken) {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
      opciones.idToken
    )}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('El token de Google proporcionado no es válido o ha expirado.');
    }
    const info = (await res.json()) as GoogleTokenInfoResponse;

    if (
      env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com') &&
      info.aud !== env.GOOGLE_CLIENT_ID
    ) {
      throw new Error('El token de Google no corresponde a este Client ID.');
    }

    if (!info.email || !info.sub) {
      throw new Error('Google no devolvió un correo electrónico válido.');
    }

    return {
      provider: 'google',
      providerUserId: info.sub,
      email: info.email.trim().toLowerCase(),
      fullName: (info.name || info.given_name || info.email.split('@')[0] || 'Usuario Google').trim(),
    };
  }

  if (opciones.accessToken) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${opciones.accessToken}`,
      },
    });
    if (!res.ok) {
      throw new Error('No se pudo verificar la sesión con Google OAuth.');
    }
    const info = (await res.json()) as GoogleUserInfoResponse;

    if (!info.email || !info.sub) {
      throw new Error('Tu cuenta de Google no proporcionó un correo electrónico válido.');
    }

    return {
      provider: 'google',
      providerUserId: info.sub,
      email: info.email.trim().toLowerCase(),
      fullName: (info.name || info.given_name || info.email.split('@')[0] || 'Usuario Google').trim(),
    };
  }

  throw new Error('Se requiere autenticar con tu cuenta oficial de Google.');
};
