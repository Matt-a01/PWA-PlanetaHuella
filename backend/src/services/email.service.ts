import crypto from 'node:crypto';
import net from 'node:net';
import tls from 'node:tls';
import { env } from '../config/env.js';

export const TIEMPO_EXPIRACION_OTP_MS = 15 * 60 * 1000; // 15 minutos
export const MAX_INTENTOS_OTP = 5;

export interface ResultadoEnvioCorreo {
  sent: boolean;
  provider: 'brevo' | 'resend' | 'smtp' | 'simulation';
  subject: string;
  previewHtml?: string;
}

// Genera un código numérico aleatorio de 6 dígitos criptográficamente seguro (CSPRNG)
export const generarCodigoOTP = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Firma el código OTP junto con el correo y el propósito mediante HMAC-SHA256
export const hashearCodigoOTP = (
  codigo: string,
  email: string,
  proposito: 'verify' | 'reset'
): string => {
  const payload = `${proposito}:${email.trim().toLowerCase()}:${codigo.trim()}`;
  return crypto.createHmac('sha256', env.JWT_SECRET).update(payload).digest('hex');
};

// Compara el código ingresado en tiempo constante para mitigar ataques de timing (OWASP ASVS)
export const verificarCodigoOTP = (
  codigoIngresado: string,
  email: string,
  proposito: 'verify' | 'reset',
  hashAlmacenado?: string | null
): boolean => {
  if (!hashAlmacenado) return false;
  const hashCalculado = hashearCodigoOTP(codigoIngresado, email, proposito);
  const bufA = Buffer.from(hashCalculado, 'hex');
  const bufB = Buffer.from(hashAlmacenado, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const escaparHtml = (texto: string): string =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// ==================== PLANTILLAS HTML DE CORREO ====================

interface OpcionesPlantilla {
  tituloCabecera: string;
  subtituloCabecera: string;
  nombreUsuario: string;
  mensajePrincipal: string;
  etiquetaCodigo?: string;
  codigoOtp?: string;
  notaValidez?: string;
  avisoSeguridad: string;
}

export const construirPlantillaCorreoHTML = (opciones: OpcionesPlantilla): string => {
  const nombreSeguro = escaparHtml(opciones.nombreUsuario || 'amante de las mascotas');
  const bloqueCodigo = opciones.codigoOtp
    ? `
      <div style="margin: 28px 0; padding: 24px 18px; background-color: #f0fdf4; border: 2px dashed #15803d; border-radius: 20px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #166534;">
          ${escaparHtml(opciones.etiquetaCodigo || 'Código de verificación')}
        </p>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #14532d; padding: 6px 0;">
          ${escaparHtml(opciones.codigoOtp)}
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #15803d; font-weight: 600;">
          ⏱ ${escaparHtml(opciones.notaValidez || 'Válido durante los próximos 15 minutos')}
        </p>
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escaparHtml(opciones.tituloCabecera)}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);">
    <tr>
      <td style="background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 28px 28px 24px 28px; text-align: center; color: #ffffff;">
        <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.16); padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.4px; margin-bottom: 10px;">
          🐾 PetCare • Planeta Huella
        </div>
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.3;">
          ${escaparHtml(opciones.tituloCabecera)}
        </h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #dcfce7;">
          ${escaparHtml(opciones.subtituloCabecera)}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px;">
        <p style="margin: 0 0 14px 0; font-size: 15px; font-weight: 600; color: #0f172a;">
          Hola, ${nombreSeguro}:
        </p>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
          ${escaparHtml(opciones.mensajePrincipal)}
        </p>

        ${bloqueCodigo}

        <div style="margin-top: 22px; padding: 14px 16px; background-color: #f8fafc; border-left: 4px solid #15803d; border-radius: 10px;">
          <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
            🔒 <strong>Aviso de seguridad:</strong> ${escaparHtml(opciones.avisoSeguridad)}
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 18px 28px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 11px; color: #64748b;">
          © ${new Date().getFullYear()} PetCare • Planeta Huella — Cuidado hoy, vidas más felices.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ==================== CANALES DE TRANSPORTE ====================

const extraerRemitente = (fromRaw: string): { name: string; email: string } => {
  const match = fromRaw.match(/^(.*?)<(.+?)>$/);
  if (match) {
    return {
      name: (match[1] ?? '').trim() || 'Planeta Huella',
      email: (match[2] ?? '').trim(),
    };
  }
  return {
    name: 'Planeta Huella',
    email: fromRaw.trim() || 'no-reply@planetahuella.app',
  };
};

// Canal 1: Envío HTTPS vía API de Brevo (compatible con Render Free Tier)
const enviarPorBrevoAPI = async (
  paraEmail: string,
  asunto: string,
  html: string
): Promise<boolean> => {
  if (!env.BREVO_API_KEY) return false;
  const remitente = extraerRemitente(env.EMAIL_FROM);
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: remitente,
      to: [{ email: paraEmail }],
      subject: asunto,
      htmlContent: html,
    }),
  });
  return res.ok;
};

// Canal 2: Envío HTTPS vía API de Resend (compatible con Render Free Tier)
const enviarPorResendAPI = async (
  paraEmail: string,
  asunto: string,
  html: string
): Promise<boolean> => {
  if (!env.RESEND_API_KEY) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [paraEmail],
      subject: asunto,
      html,
    }),
  });
  return res.ok;
};

// Canal 3: Cliente SMTP nativo sobre TLS directo (puerto 465) o socket estándar
const enviarPorSmtpNativo = async (
  paraEmail: string,
  asunto: string,
  html: string
): Promise<boolean> => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return false;

  const remitente = extraerRemitente(env.EMAIL_FROM);
  const emailOrigen = remitente.email.includes('@') ? remitente.email : env.SMTP_USER;
  const asuntoBase64 = Buffer.from(asunto, 'utf8').toString('base64');
  const cuerpoBase64 = Buffer.from(html, 'utf8')
    .toString('base64')
    .replace(/(.{76})/g, '$1\r\n');

  const mensajeMime = [
    `From: "${remitente.name}" <${emailOrigen}>`,
    `To: <${paraEmail}>`,
    `Subject: =?UTF-8?B?${asuntoBase64}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    cuerpoBase64,
    '.',
    '',
  ].join('\r\n');

  return new Promise<boolean>((resolve) => {
    const usarTlsDirecto = env.SMTP_PORT === 465;
    const socket = usarTlsDirecto
      ? tls.connect({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        servername: env.SMTP_HOST,
      })
      : net.createConnection({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
      });

    socket.setTimeout(10000);

    const pasos: string[] = [
      `EHLO planetahuella.local`,
      `AUTH LOGIN`,
      Buffer.from(env.SMTP_USER, 'utf8').toString('base64'),
      Buffer.from(env.SMTP_PASS, 'utf8').toString('base64'),
      `MAIL FROM:<${emailOrigen}>`,
      `RCPT TO:<${paraEmail}>`,
      `DATA`,
      mensajeMime,
      `QUIT`,
    ];

    let indicePaso = 0;
    let bufferRespuesta = '';
    let finalizado = false;

    const cerrarConResultado = (exito: boolean) => {
      if (finalizado) return;
      finalizado = true;
      try {
        socket.destroy();
      } catch {
        // Ignorar errores al cerrar socket
      }
      resolve(exito);
    };

    socket.on('data', (chunk: Buffer) => {
      bufferRespuesta += chunk.toString('utf8');
      const lineas = bufferRespuesta.split('\r\n');
      // Espera hasta que la respuesta multilínea SMTP termine (código seguido de espacio)
      const ultimaLineaCompleta = lineas[lineas.length - 2] ?? '';
      if (!/^\d{3} /.test(ultimaLineaCompleta)) return;

      const codigoEstado = Number(ultimaLineaCompleta.slice(0, 3));
      bufferRespuesta = '';

      if (codigoEstado >= 400) {
        cerrarConResultado(false);
        return;
      }

      if (indicePaso >= pasos.length) {
        cerrarConResultado(true);
        return;
      }

      const comando = pasos[indicePaso]!;
      indicePaso += 1;
      socket.write(`${comando}\r\n`);
    });

    socket.on('timeout', () => cerrarConResultado(false));
    socket.on('error', () => cerrarConResultado(false));
  });
};

const despacharCorreo = async (
  paraEmail: string,
  asunto: string,
  html: string,
  codigoLog?: string
): Promise<ResultadoEnvioCorreo> => {
  try {
    if (env.BREVO_API_KEY) {
      const enviado = await enviarPorBrevoAPI(paraEmail, asunto, html);
      if (enviado) return { sent: true, provider: 'brevo', subject: asunto };
    }

    if (env.RESEND_API_KEY) {
      const enviado = await enviarPorResendAPI(paraEmail, asunto, html);
      if (enviado) return { sent: true, provider: 'resend', subject: asunto };
    }

    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      const enviado = await enviarPorSmtpNativo(paraEmail, asunto, html);
      if (enviado) return { sent: true, provider: 'smtp', subject: asunto };
    }
  } catch (err) {
    console.warn('⚠️ Error al enviar correo mediante proveedor externo, usando modo simulación:', err);
  }

  console.info(
    `📧 [Modo Simulación de Correo] Para: ${paraEmail} | Asunto: ${asunto}${codigoLog ? ` | Código OTP: ${codigoLog}` : ''
    }`
  );

  return {
    sent: true,
    provider: 'simulation',
    subject: asunto,
    previewHtml: html,
  };
};

// ==================== FUNCIONES PÚBLICAS DE CORREO ====================

export const enviarCorreoVerificacion = async (
  email: string,
  fullName: string,
  codigoOtp: string
): Promise<ResultadoEnvioCorreo> => {
  const asunto = `${codigoOtp} es tu código de verificación en Planeta Huella`;
  const html = construirPlantillaCorreoHTML({
    tituloCabecera: 'Verifica tu correo electrónico',
    subtituloCabecera: 'Activa tu cuenta en PetCare • Planeta Huella',
    nombreUsuario: fullName,
    mensajePrincipal:
      'Gracias por unirte a Planeta Huella. Para confirmar que este correo electrónico te pertenece y activar tu cuenta, ingresa el siguiente código de 6 dígitos en la aplicación:',
    etiquetaCodigo: 'Código de activación de cuenta',
    codigoOtp,
    notaValidez: 'Este código expira en 15 minutos',
    avisoSeguridad:
      'Si no creaste una cuenta en Planeta Huella, puedes ignorar este mensaje de forma segura. Nunca compartas este código con nadie.',
  });

  return despacharCorreo(email, asunto, html, codigoOtp);
};

export const enviarCorreoRecuperacion = async (
  email: string,
  fullName: string,
  codigoOtp: string
): Promise<ResultadoEnvioCorreo> => {
  const asunto = `${codigoOtp} es tu código para restablecer tu contraseña en Planeta Huella`;
  const html = construirPlantillaCorreoHTML({
    tituloCabecera: 'Recuperación de contraseña',
    subtituloCabecera: 'Solicitud de restablecimiento de acceso',
    nombreUsuario: fullName,
    mensajePrincipal:
      'Recibimos una solicitud para restablecer la contraseña de tu cuenta en Planeta Huella. Ingresa este código de verificación de 6 dígitos para crear una nueva contraseña:',
    etiquetaCodigo: 'Código de recuperación',
    codigoOtp,
    notaValidez: 'Este código expira en 15 minutos',
    avisoSeguridad:
      'Si tú no solicitaste restablecer tu contraseña, tu cuenta sigue protegida. No compartas este código con terceros.',
  });

  return despacharCorreo(email, asunto, html, codigoOtp);
};

export const enviarCorreoConfirmacionContrasena = async (
  email: string,
  fullName: string
): Promise<ResultadoEnvioCorreo> => {
  const asunto = 'Tu contraseña de Planeta Huella ha sido actualizada';
  const html = construirPlantillaCorreoHTML({
    tituloCabecera: 'Contraseña actualizada con éxito',
    subtituloCabecera: 'Notificación de seguridad de tu cuenta',
    nombreUsuario: fullName,
    mensajePrincipal:
      'Te confirmamos que la contraseña de tu cuenta en PetCare • Planeta Huella se ha restablecido correctamente. Ya puedes iniciar sesión con tu nueva clave en todos tus dispositivos.',
    avisoSeguridad:
      'Si no reconoces esta actividad, restablece tu contraseña de inmediato desde la pantalla de inicio de sesión.',
  });

  return despacharCorreo(email, asunto, html);
};
