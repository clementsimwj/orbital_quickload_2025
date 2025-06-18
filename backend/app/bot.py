from telegram import Update
from telegram.ext import ApplicationBuilder, Updater, CommandHandler, MessageHandler, filters, CallbackContext, ContextTypes
from configurations import users_collection
import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_URL = os.getenv("API_URL")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Welcome to QuickLoad! \nUse /register <password> to sign up. " \
    "\nUse /changepassword <newpassword> to change your password for existing users. " \
    "\nUse /update if you have changed your telegram handle recently")


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
        res = requests.post(f"{API_URL}/auth/register", json={"user_id" : user_id, "handle" : handle, "password" : password})
        detail = res.json().get("detail")
        if res.status_code in (200,201):
            await update.message.reply_text("✅ Successfully registered! Now you can login in the app to get Started")
        else:
            print(res.status_code)
            await update.message.reply_text(f"❌ Registration failed: {res.json().get('detail')}")
    except Exception as e:
        await update.message.reply_text("❌ Failed to contact registration server.{detail}")
        print(e)

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
        res = requests.post(f"{API_URL}/auth/change-password", json={
            "user_id": user_id,
            "handle": handle,
            "new_password": new_password
        })

        if res.status_code in (200,201):
            await update.message.reply_text("✅ Password changed successfully.")
        else:
            await update.message.reply_text(f"❌ Error: {res.json().get('detail', 'Unknown error')}")
    except Exception as e:
        await update.message.reply_text("❌ Server error.")
        print(e)


async def update_handle(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    handle = user.username
    user_id = user.id
    try:
        res = requests.post(f"{API_URL}/auth/update", json={"user_id" : user_id, "new_handle": handle})
        if res.status_code in (200,201):
            await update.message.reply_text("✅ Updated credentials successfully.")
        else:
            await update.message.reply_text(f"❌ Error: {res.json().get('detail', 'Unknown error')}")    
    except Exception as e:
        await update.message.reply_text("❌ Server error.")
        print(e)



#run the telegram bot
app = ApplicationBuilder().token(os.getenv("BOT_TOKEN")).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("register", register))
app.add_handler(CommandHandler("changepassword", change_password))
app.add_handler(CommandHandler("update", update_handle))
app.run_polling()