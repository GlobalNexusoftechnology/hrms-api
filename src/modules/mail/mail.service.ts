import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../organization/entities/organization.entity';
import { Branch } from '../organization/entities/branch.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async sendResetPasswordEmail(
    email: string,
    firstName: string,
    resetLink: string,
    tenantId?: string,
    branchId?: string,
  ) {
    let headerText = 'Password Reset Request';
    let footerText = 'HRMS Team';

    if (tenantId) {
      const org = await this.organizationRepo.findOne({ where: { tenantId } });
      if (org) {
        headerText = `${org.name} - Password Reset Request`;
        footerText = `${org.name} Team`;
      }
    }

    if (branchId) {
      const branch = await this.branchRepo.findOne({ where: { id: branchId } });
      if (branch) {
        footerText = `${branch.name} Team`;
      }
    }

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `
<div style="font-family: Arial, sans-serif; background:#111827; color:#ffffff; padding:30px; border-radius:12px;">

  <h2 style="color:#ffffff;">
    ${headerText}
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
    ${footerText}
  </p>
</div>
`,
    });
  }
}
