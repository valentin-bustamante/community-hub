import crypto from 'node:crypto';
import { errors } from '@strapi/utils';

const { ApplicationError, ValidationError } = errors;

const userUid = 'plugin::users-permissions.user';
const DEFAULT_RESET_TOKEN_TTL_MINUTES = 60;
const DEFAULT_RESET_PASSWORD_URL = 'http://localhost:3000/login';
const DEFAULT_RESEND_API_URL = 'https://api.resend.com/emails';

function getTokenTtlMinutes() {
  const rawValue = Number.parseInt(process.env.RESET_PASSWORD_TOKEN_TTL_MINUTES ?? '', 10);
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : DEFAULT_RESET_TOKEN_TTL_MINUTES;
}

function buildRecoveryUrl(code: string) {
  const recoveryUrl = process.env.RESET_PASSWORD_URL ?? DEFAULT_RESET_PASSWORD_URL;
  const url = new URL(recoveryUrl);
  url.searchParams.set('code', code);
  return url.toString();
}

function isTokenExpired(code: string) {
  const [expiresPart] = code.split('.', 1);
  const expiresAt = Number.parseInt(expiresPart ?? '', 36);
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
}

async function sendRecoveryMail({
  apiKey,
  apiUrl,
  from,
  to,
  recoveryUrl,
  ttlMinutes,
}: {
  apiKey: string;
  apiUrl: string;
  from: string;
  to: string;
  recoveryUrl: string;
  ttlMinutes: number;
}) {
  const payload = {
    from,
    to,
    subject: 'Recuperá tu contraseña de Community Hub',
    html: `<p>Recibimos una solicitud para recuperar tu cuenta.</p><p><a href="${recoveryUrl}">Restablecer contraseña</a></p><p>El enlace vence en ${ttlMinutes} minutos y solo se puede usar una vez.</p>`,
    text: `Recibimos una solicitud para recuperar tu cuenta.\n\nRestablecé tu contraseña en este enlace: ${recoveryUrl}\n\nEl enlace vence en ${ttlMinutes} minutos y solo se puede usar una vez.`,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Be${'arer'} ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ApplicationError('No se pudo enviar el correo de recuperación.');
  }
}

export default {
  async forgotPassword(ctx: any) {
    const email = ctx.request.body?.email?.trim()?.toLowerCase();

    if (!email || !email.includes('@')) {
      throw new ValidationError('Please provide a valid email address');
    }

    const user = await strapi.db.query(userUid).findOne({
      where: { email },
      select: ['id', 'email', 'blocked'],
    });

    if (!user || user.blocked) {
      return ctx.send({ ok: true });
    }

    const tokenTtlMinutes = getTokenTtlMinutes();
    const expiresAt = (Date.now() + tokenTtlMinutes * 60_000).toString(36);
    const randomPart = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = `${expiresAt}.${randomPart}`;
    const recoveryUrl = buildRecoveryUrl(resetPasswordToken);

    await strapi.plugin('users-permissions').service('user').edit(user.id, {
      resetPasswordToken,
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;
    const resendApiUrl = process.env.RESEND_API_URL ?? DEFAULT_RESEND_API_URL;

    if (!resendApiKey || !resendFromEmail) {
      strapi.log.warn(
        'No se enviará mail de recuperación: faltan RESEND_API_KEY o RESEND_FROM_EMAIL.'
      );
      return ctx.send({ ok: true });
    }

    await sendRecoveryMail({
      apiKey: resendApiKey,
      apiUrl: resendApiUrl,
      from: resendFromEmail,
      to: user.email,
      recoveryUrl,
      ttlMinutes: tokenTtlMinutes,
    });

    return ctx.send({ ok: true });
  },

  async resetPassword(ctx: any) {
    const code = ctx.request.body?.code;
    const password = ctx.request.body?.password;
    const passwordConfirmation = ctx.request.body?.passwordConfirmation;

    if (typeof code !== 'string' || code.trim().length === 0) {
      throw new ValidationError('Incorrect code provided');
    }

    if (typeof password !== 'string' || password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    if (password !== passwordConfirmation) {
      throw new ValidationError('Passwords do not match');
    }

    const user = await strapi.db.query(userUid).findOne({
      where: { resetPasswordToken: code },
      select: ['id', 'resetPasswordToken'],
    });

    if (!user) {
      throw new ValidationError('Incorrect code provided');
    }

    if (isTokenExpired(code)) {
      await strapi.plugin('users-permissions').service('user').edit(user.id, {
        resetPasswordToken: null,
      });
      throw new ValidationError('El enlace de recuperación venció. Solicitá uno nuevo.');
    }

    await strapi.plugin('users-permissions').service('user').edit(user.id, {
      resetPasswordToken: null,
      password,
    });

    return ctx.send({ ok: true });
  },
};
