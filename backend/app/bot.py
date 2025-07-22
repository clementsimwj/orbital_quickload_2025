from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
import os
import httpx
from dotenv import load_dotenv
import logging

load_dotenv()
API_URL = os.getenv("API_URL")
BOT_TOKEN = os.getenv("BOT_TOKEN")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 Welcome to QuickLoad!\n"
        "Use /register <password> to sign up.\n"
        "Use /changepassword <newpassword> to change your password.\n"
        "Use /update if you changed your Telegram handle recently."
    )


async def register(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("❌ Please provide a password.\nUsage: /register <your_password>")
        return

    password = context.args[0]
    user = update.effective_user
    handle = user.username
    user_id = user.id

    if not handle:
        await update.message.reply_text("❌ You need a Telegram username set in your profile to register.")
        return

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{API_URL}/auth/register",
                json={"user_id": user_id, "handle": handle, "password": password}
            )
            data = res.json()
            if res.status_code in (200, 201):
                await update.message.reply_text("✅ Successfully registered! You can now log in to the app.")
            else:
                await update.message.reply_text(f"❌ Registration failed: {data.get('detail')}")
    except Exception as e:
        logger.error(e)
        await update.message.reply_text(f"❌ Failed to contact registration server: {e}")


async def change_password(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("❌ Please provide a new password.\nUsage: /changepassword <new_password>")
        return

    new_password = context.args[0]
    user = update.effective_user
    handle = user.username
    user_id = user.id

    if not handle:
        await update.message.reply_text("❌ You need a Telegram username set in your profile to change your password.")
        return

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{API_URL}/auth/change-password",
                json={"user_id": user_id, "handle": handle, "new_password": new_password}
            )
            data = res.json()
            if res.status_code in (200, 201):
                await update.message.reply_text("✅ Password changed successfully.")
            else:
                await update.message.reply_text(f"❌ Error: {data.get('detail', 'Unknown error')}")
    except Exception as e:
        logger.error(e)
        await update.message.reply_text(f"❌ Server error: {e}")


async def update_handle(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    handle = user.username
    user_id = user.id

    if not handle:
        await update.message.reply_text("❌ You need a Telegram username set in your profile to update your handle.")
        return

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{API_URL}/auth/update",
                json={"user_id": user_id, "new_handle": handle}
            )
            data = res.json()
            if res.status_code in (200, 201):
                await update.message.reply_text("✅ Updated handle successfully.")
            else:
                await update.message.reply_text(f"❌ Error: {data.get('detail', 'Unknown error')}")
    except Exception as e:
        logger.error(e)
        await update.message.reply_text(f"❌ Server error: {e}")


if __name__ == "__main__":
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("register", register))
    app.add_handler(CommandHandler("changepassword", change_password))
    app.add_handler(CommandHandler("update", update_handle))

    logger.info("Bot is running...")
    app.run_polling()
