import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ContactModel } from '@/lib/models/ContactModel'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Get the portfolio owner's email from DB
    const contact = await ContactModel.get()
    const toEmail = contact?.email ?? process.env.CONTACT_EMAIL ?? 'francauvere1@gmail.com'

    await resend.emails.send({
      from:    'Portfolio Contact <onboarding@resend.dev>',
      to:      toEmail,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: `
        <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;background:#060608;color:#e8e6f0;padding:32px;border-radius:8px;">
          <div style="border-bottom:1px solid rgba(62,207,207,.3);padding-bottom:16px;margin-bottom:24px;">
            <p style="font-family:monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#3ECFCF;margin:0 0 8px;">New Message — Portfolio Contact Form</p>
            <h2 style="margin:0;font-size:22px;color:#d4dde8;">${subject}</h2>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:8px 0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6b7c8f;width:80px;">From</td>
              <td style="padding:8px 0;color:#e8e6f0;">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6b7c8f;">Email</td>
              <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#3ECFCF;">${email}</a></td>
            </tr>
          </table>
          <div style="background:rgba(255,255,255,.04);border-left:2px solid #3ECFCF;padding:16px 20px;border-radius:0 4px 4px 0;">
            <p style="margin:0;line-height:1.7;color:#d4dde8;white-space:pre-wrap;">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
          </div>
          <p style="margin:24px 0 0;font-size:11px;color:#3a4a5a;font-family:monospace;">Sent from francauvere.com</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Contact email failed:', e)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
