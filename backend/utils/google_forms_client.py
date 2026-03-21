from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from core.config import get_settings
import json
from typing import Optional

settings = get_settings()


class GoogleFormsClient:
    """Client for Google Forms/Docs API"""
    
    def __init__(self, credentials_path: Optional[str] = None):
        """Initialize Google Forms client"""
        try:
            if credentials_path:
                self.credentials = Credentials.from_service_account_file(
                    credentials_path,
                    scopes=['https://www.googleapis.com/auth/forms']
                )
            else:
                # Use API key if available
                self.api_key = settings.GOOGLE_FORMS_API_KEY
        except Exception as e:
            print(f"Error initializing Google Forms client: {e}")
    
    async def get_form_details(self, form_id: str) -> dict:
        """Get form details from Google Forms"""
        try:
            service = build('forms', 'v1', developerKey=self.api_key)
            form = service.forms().get(formId=form_id).execute()
            return form
        except Exception as e:
            print(f"Error getting form details: {e}")
            return {}
    
    async def get_form_info(self, form_id: str) -> dict:
        """Get form information title and description"""
        try:
            service = build('forms', 'v1', developerKey=self.api_key)
            form = service.forms().get(formId=form_id).execute()
            
            return {
                'title': form.get('info', {}).get('title'),
                'description': form.get('info', {}).get('description'),
                'form_id': form_id,
                'items': form.get('items', [])
            }
        except Exception as e:
            print(f"Error getting form info: {e}")
            return {}


# Utility functions for Google Forms URL parsing
def extract_form_id_from_url(url: str) -> Optional[str]:
    """Extract form ID from Google Forms URL"""
    try:
        # URL formato: https://docs.google.com/forms/d/{FORM_ID}/edit
        if '/forms/d/' in url:
            parts = url.split('/forms/d/')
            if len(parts) > 1:
                return parts[1].split('/')[0]
        return None
    except Exception as e:
        print(f"Error extracting form ID: {e}")
        return None


def extract_sheet_id_from_url(url: str) -> Optional[str]:
    """Extract sheet ID from Google Sheets URL"""
    try:
        # URL formato: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
        if '/spreadsheets/d/' in url:
            parts = url.split('/spreadsheets/d/')
            if len(parts) > 1:
                return parts[1].split('/')[0]
        return None
    except Exception as e:
        print(f"Error extracting sheet ID: {e}")
        return None
