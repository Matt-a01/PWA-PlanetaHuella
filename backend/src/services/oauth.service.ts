import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface PerfilOAuthVerificado {
  provider: 'google' | 'apple';
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

type ClaveJwkApple = crypto.JsonWebKeyInput['key'] & {
  kid?: string;
  alg?: string;
};

interface AppleJwksResponse {
  keys?: ClaveJwkApple[];
}

// Verifica un idToken o accessToken emitido por Google Identity Services
export const verificarTokenGoogle = async (opciones: {
  idToken?: string | undefined;
  accessToken?: string | undefined;
  emailFallback?: string | undefined;
  fullNameFallback?: string | undefined;
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

    if (env.GOOGLE_CLIENT_ID && info.aud !== env.GOOGLE_CLIENT_ID) {
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

  // Si GOOGLE_CLIENT_ID está forzado en el servidor, exige token real de Google
  if (env.GOOGLE_CLIENT_ID) {
    throw new Error('Se requiere el token oficial de Google Identity Services.');
  }

  if (!opciones.emailFallback) {
    throw new Error('Ingresa el correo de tu cuenta de Google para continuar.');
  }

  const emailLimpio = opciones.emailFallback.trim().toLowerCase();
  const idDeterminista = crypto
    .createHash('sha256')
    .update(`google:${emailLimpio}`)
    .digest('hex')
    .slice(0, 24);

  return {
    provider: 'google',
    providerUserId: `google_${idDeterminista}`,
    email: emailLimpio,
    fullName: (opciones.fullNameFallback || emailLimpio.split('@')[0] || 'Usuario Google').trim(),
  };
};

// Verifica un idToken firmado por Apple (https://appleid.apple.com/auth/keys)
export const verificarTokenApple = async (opciones: {
  idToken?: string | undefined;
  emailFallback?: string | undefined;
  fullNameFallback?: string | undefined;
}): Promise<PerfilOAuthVerificado> => {
  if (opciones.idToken) {
    const decodificadoCompleto = jwt.decode(opciones.idToken, { complete: true });
    if (
      !decodificadoCompleto ||
      typeof decodificadoCompleto !== 'object' ||
      !decodificadoCompleto.header?.kid
    ) {
      throw new Error('El token de Apple ID no tiene un formato JWT válido.');
    }

    const resJwks = await fetch('https://appleid.apple.com/auth/keys');
    if (!resJwks.ok) {
      throw new Error('No se pudieron obtener las llaves públicas de Apple ID.');
    }

    const jwks = (await resJwks.json()) as AppleJwksResponse;
    const llaveApple = jwks.keys?.find((k) => k.kid === decodificadoCompleto.header.kid);

    if (!llaveApple) {
      throw new Error('No se encontró la clave pública de Apple correspondiente al token.');
    }

    const publicKey = crypto.createPublicKey({
      key: llaveApple,
      format: 'jwk',
    });

    const payloadVerificado = jwt.verify(opciones.idToken, publicKey, {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
      ...(env.APPLE_CLIENT_ID ? { audience: env.APPLE_CLIENT_ID } : {}),
    }) as jwt.JwtPayload;

    const emailApple =
      (typeof payloadVerificado.email === 'string' && payloadVerificado.email) ||
      opciones.emailFallback;

    if (!emailApple || !payloadVerificado.sub) {
      throw new Error('Apple ID no proporcionó un correo electrónico válido.');
    }

    return {
      provider: 'apple',
      providerUserId: String(payloadVerificado.sub),
      email: emailApple.trim().toLowerCase(),
      fullName: (
        opciones.fullNameFallback ||
        emailApple.split('@')[0] ||
        'Usuario de Apple'
      ).trim(),
    };
  }

  if (env.APPLE_CLIENT_ID) {
    throw new Error('Se requiere el token oficial de Sign in with Apple.');
  }

  if (!opciones.emailFallback) {
    throw new Error('Ingresa el correo de tu Apple ID para continuar.');
  }

  const emailLimpio = opciones.emailFallback.trim().toLowerCase();
  const idDeterminista = crypto
    .createHash('sha256')
    .update(`apple:${emailLimpio}`)
    .digest('hex')
    .slice(0, 24);

  return {
    provider: 'apple',
    providerUserId: `apple_${idDeterminista}`,
    email: emailLimpio,
    fullName: (opciones.fullNameFallback || emailLimpio.split('@')[0] || 'Usuario Apple').trim(),
  };
};
