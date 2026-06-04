import { Injectable } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordEmail(
    email: string,

    firstName: string,

    resetLink: string,
  ) {
    await this.mailerService.sendMail({
      to: email,

      subject: 'Reset Your Password',

      html: `
<div style="font-family: Arial, sans-serif; background:#111827; color:#ffffff; padding:30px; border-radius:12px;">

  <h2 style="color:#ffffff;">
    Password Reset Request
  </h2>

  <p>
    Hello ${firstName},
  </p>

  <p>
    We received a request to reset your password.
  </p>

  <p>
    Click the button below to reset your password:
  </p>

  <table
    role="presentation"
    cellspacing="0"
    cellpadding="0"
  >
    <tr>
      <td
        style="
          border-radius:8px;
          background:#2563eb;
        "
      >
        <a
          href="${resetLink}"
          target="_blank"
          style="
            display:inline-block;
            padding:14px 28px;
            font-size:16px;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
          "
        >
          Reset Password
        </a>
      </td>
    </tr>
  </table>

  <p style="margin-top:20px;">
    Or copy this link:
  </p>

  <p
    style="
      word-break: break-all;
      color:#93c5fd;
    "
  >
    ${resetLink}
  </p>

  <p>
    This link will expire in 15 minutes.
  </p>

  <p>
    If you did not request this,
    please ignore this email.
  </p>

  <br />

  <p>
    HRMS Team
  </p>
</div>
`,
    });
  }
}
