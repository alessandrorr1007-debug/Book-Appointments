import { Appointment, Business, Service } from '@/types';
import { formatDateLegible, formatTimeLegible } from '@/lib/utils/dates';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class NotificationService {
  private static appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  /**
   * Genera el HTML y asunto para confirmación de reserva
   */
  static generateBookingConfirmationTemplate(params: {
    appointment: Appointment;
    business: Business;
    service: Service;
  }): EmailPayload {
    const { appointment, business, service } = params;
    const dateFormatted = formatDateLegible(appointment.start_at, business.timezone);
    const timeFormatted = formatTimeLegible(appointment.start_at, business.timezone);
    const cancelUrl = `${this.appUrl}/reservar/${business.slug}/cancelar/${appointment.cancellation_token}`;

    const subject = `¡Tu cita en ${business.name} está confirmada! (${dateFormatted} a las ${timeFormatted})`;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #2563eb; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
          .detail-box { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .detail-label { color: #64748b; font-weight: 500; }
          .detail-val { font-weight: 600; color: #0f172a; text-align: right; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          .btn-cancel { display: inline-block; color: #dc2626; font-size: 13px; text-decoration: underline; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>CitaFácil — Confirmación de Reserva</h1>
          </div>
          <div class="content">
            <span class="badge">Confirmada</span>
            <p>Hola <strong>${appointment.customer_name_snapshot}</strong>,</p>
            <p>Tu cita en <strong>${business.name}</strong> ha sido agendada con éxito.</p>
            
            <div class="detail-box">
              <div class="detail-row">
                <span class="detail-label">Servicio:</span>
                <span class="detail-val">${service.name} (${service.duration_minutes} min)</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span class="detail-val">${dateFormatted}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Hora:</span>
                <span class="detail-val">${timeFormatted}</span>
              </div>
              ${service.price_amount ? `
              <div class="detail-row">
                <span class="detail-label">Precio referencial:</span>
                <span class="detail-val">S/ ${service.price_amount.toFixed(2)}</span>
              </div>` : ''}
              ${business.address ? `
              <div class="detail-row">
                <span class="detail-label">Dirección:</span>
                <span class="detail-val">${business.address}</span>
              </div>` : ''}
            </div>

            <p style="font-size: 13px; color: #64748b;">
              ¿Necesitas cancelar o reagendar tu cita? Puedes hacerlo con al menos ${business.cancellation_notice_hours} horas de anticipación desde el siguiente enlace:
            </p>
            <div style="text-align: center;">
              <a href="${cancelUrl}" class="btn-cancel">Gestionar o cancelar mi cita</a>
            </div>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático de ${business.name} gestionado por CitaFácil SaaS.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      to: appointment.customer_email_snapshot || '',
      subject,
      html,
    };
  }

  /**
   * Genera el HTML y asunto para cancelación de cita
   */
  static generateCancellationTemplate(params: {
    appointment: Appointment;
    business: Business;
    reason?: string;
  }): EmailPayload {
    const { appointment, business, reason } = params;
    const dateFormatted = formatDateLegible(appointment.start_at, business.timezone);
    const timeFormatted = formatTimeLegible(appointment.start_at, business.timezone);

    const subject = `Tu cita en ${business.name} ha sido cancelada`;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #dc2626; color: #ffffff; padding: 24px; text-align: center; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; background: #fee2e2; color: #991b1b; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 style="margin:0; font-size:22px;">Cita Cancelada</h1>
          </div>
          <div class="content">
            <span class="badge">Cancelada</span>
            <p>Hola <strong>${appointment.customer_name_snapshot}</strong>,</p>
            <p>Te informamos que tu cita para <strong>${appointment.service_name_snapshot}</strong> del día <strong>${dateFormatted}</strong> a las <strong>${timeFormatted}</strong> ha sido cancelada.</p>
            ${reason ? `<p style="font-size: 14px; background: #fef2f2; padding: 12px; border-radius: 6px; border-left: 3px solid #dc2626;"><strong>Motivo:</strong> ${reason}</p>` : ''}
            <p>Si deseas agendar un nuevo horario, puedes hacerlo en cualquier momento desde <a href="${this.appUrl}/reservar/${business.slug}">nuestra página de reservas</a>.</p>
          </div>
          <div class="footer">
            <p>${business.name} • CitaFácil SaaS</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      to: appointment.customer_email_snapshot || '',
      subject,
      html,
    };
  }

  /**
   * Envía la notificación si hay proveedor configurado, o la registra limpiamente
   */
  static async sendEmail(payload: EmailPayload): Promise<{ success: boolean; provider: string; messageId?: string }> {
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'notificaciones@citafacil.pe';

    if (!payload.to) {
      return { success: false, provider: 'none' };
    }

    if (resendKey && !resendKey.includes('ejemplo')) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          console.error('[NotificationService] Error enviando correo Resend:', errData);
          return { success: false, provider: 'resend' };
        }

        const data = await response.json();
        return { success: true, provider: 'resend', messageId: data.id };
      } catch (err) {
        console.error('[NotificationService] Excepción de red con proveedor:', err);
        return { success: false, provider: 'resend' };
      }
    }

    // Modo desarrollo / sin credenciales activas
    return { success: true, provider: 'mock_local_log' };
  }
}
