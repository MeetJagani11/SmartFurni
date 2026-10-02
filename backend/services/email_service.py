import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

async def send_reset_password_email(email: str, token: str):
    """
    Sends a password reset email using SMTP.
    In a real-world scenario, you'd use a more robust service like SendGrid or AWS SES.
    """
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    reset_link = f"{frontend_url}/reset-password?token={token}"
    
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = email
    msg['Subject'] = "Reset Your SmartFurni Password"
    
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
            <h2 style="color: #ea580c;">SmartFurni Password Reset</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to set a new one:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 0.8em; color: #718096;">SmartFurni Team</p>
        </div>
    </body>
    </html>
    """
    
    msg.attach(MIMEText(body, 'html'))
    
    try:
        # Note: This is a synchronous operation. 
        # In production, use background tasks or Celery to avoid blocking.
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        logger.info(f"Reset email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send reset email: {str(e)}")
        # For development, we'll log the link CLEARLY so the user can use it manually
        print("\n" + "!" * 50)
        print(f"DEV LOG: EMAIL COULD NOT BE SENT ({str(e)})")
        print(f"EMAILING TO: {email}")
        print(f"RESET LINK: {reset_link}")
        print("!" * 50 + "\n")
        
        # Return False so the system knows it failed, 
        # but in dev the link is still printed to terminal.
        return False
