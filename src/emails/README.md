# Email Implementation with Resend and React Email

This implementation provides email sending functionality using Resend and React Email for the NextCelerator application.

## Features

✅ **Email Templates**

- Email verification template
- Password reset template
- Email change verification template
- Account deletion confirmation template

✅ **Shared Components**

- `EmailLayout` - Consistent layout and branding
- `EmailButton` - Styled buttons for CTAs

✅ **Email Service**

- Resend integration with proper error handling
- Type-safe email functions
- Consistent logging and error handling

## Templates

### 1. Email Verification (`verify-email.tsx`)

- Sent when users sign up
- Includes verification link with 24-hour expiry
- Professional and welcoming design

### 2. Password Reset (`reset-password.tsx`)

- Sent when users request password reset
- Includes security notice for unauthorized requests
- 1-hour expiry for security

### 3. Email Change Verification (`change-email-verification.tsx`)

- Sent to new email address when changing email
- Clear warning about consequences
- 24-hour expiry

### 4. Account Deletion Confirmation (`delete-account-confirmation.tsx`)

- Strong warning about permanent action
- Multiple security notices
- Option to cancel deletion
- 24-hour expiry

## Configuration

### Environment Variables

Make sure you have the following environment variable set:

```env
RESEND_API_KEY=re_xxxxxxxxx
```

### Email Domains

The current implementation uses Resend's sandbox domain for testing:

- `onboarding@resend.dev` - For all email types during development

**For Production:**

1. Add your custom domain in the Resend dashboard
2. Verify DNS records for your domain
3. Update the `from` addresses in `src/lib/email.ts` to use your domain
4. Example: `from: "NextCelerator <noreply@yourdomain.com>"`

## Styling

The email templates follow the site's design system:

- **Primary Color**: `#6b46c1` (matches CSS custom property `--primary`)
- **Background**: `#fafbfe` (matches CSS custom property `--background`)
- **Typography**: Inter font family with system fallbacks
- **Consistent spacing**: 8px grid system
- **Responsive design**: Works on all email clients

## Usage

The email functions are automatically integrated with Better Auth in `src/lib/auth.ts`:

```typescript
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendChangeEmailVerification,
  sendDeleteAccountConfirmation,
} from "@/lib/email";
```

## Error Handling

All email functions include proper error handling:

- Errors are logged to console
- Non-blocking: auth flow continues even if email fails
- Detailed error messages for debugging

## Development

To test email templates locally:

1. Use the `renderEmailToHtml` helper function
2. Preview templates in development mode
3. Check console for detailed logging

## Production Considerations

Before deploying to production:

1. **Update Email Domains**: Replace placeholder domains with your actual domain
2. **Configure Resend**: Set up proper DNS records for your domain
3. **Error Handling**: Consider implementing email queue for failed sends
4. **Monitoring**: Add monitoring for email delivery rates
5. **Templates**: Review all copy and branding
6. **Testing**: Test all email flows end-to-end

## File Structure

```
src/emails/
├── components/
│   ├── email-layout.tsx     # Shared layout component
│   └── email-button.tsx     # Reusable button component
├── verify-email.tsx         # Email verification template
├── reset-password.tsx       # Password reset template
├── change-email-verification.tsx  # Email change template
├── delete-account-confirmation.tsx # Account deletion template
├── index.ts                 # Export all templates
└── README.md               # This file

src/lib/
└── email.ts                # Email service functions
```

## Best Practices

1. **Accessibility**: All templates include proper semantic HTML
2. **Mobile-First**: Templates are responsive and mobile-friendly
3. **Security**: Clear security notices for sensitive actions
4. **User Experience**: Clear CTAs and fallback text links
5. **Branding**: Consistent with site design and messaging
