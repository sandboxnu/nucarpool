import boto3
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
# Initialize the SES client with explicit credentials

# Get AWS credentials from environment variables
aws_access_key_id = os.environ.get('ACCESS_KEY_ID_AWS')
aws_secret_access_key = os.environ.get('SECRET_ACCESS_KEY_AWS')
aws_region = os.environ.get('REGION_AWS')


ses_client = boto3.client('ses',
aws_access_key_id=aws_access_key_id,
aws_secret_access_key=aws_secret_access_key,
region_name=aws_region
)

# Define the templates
templates = [
    {
        "TemplateName": "DriverRequestTemplate",
        "SubjectPart": "New Carpool Request",
        "HtmlPart": """
        <p>Hello {{preferredName}},</p>
        <p>{{OtherUser}} has sent a request to join your Carpool group. Here's a preview of their message:</p>
        <p><strong>{{message}}</strong></p>
        <p><a href="https://carpoolnu.com">Click here to accept or reject the request</a></p>
        """,
        "TextPart": """
        Hello {{preferredName}},

        {{OtherUser}} has sent a request to join your Carpool group. Here's a preview of their message:

        {{message}}

        To accept or reject the request, visit: https://carpoolnu.com
        """
    },
    {
        "TemplateName": "RiderRequestTemplate",
        "SubjectPart": "New Carpool Invitation",
        "HtmlPart": """
        <p>Hello {{preferredName}},</p>
        <p>{{OtherUser}} sent a request for you to join their Carpool group. Here's a preview of their message:</p>
        <p><strong>{{message}}</strong></p>
        <p><a href="https://carpoolnu.com">Click here to see accept or reject the request</a></p>
        """,
        "TextPart": """
        Hello {{preferredName}},

        {{OtherUser}} sent a request for you to join their Carpool group. Here's a preview of their message:

        {{message}}

        To accept or reject the request, visit: https://carpoolnu.com
        """
    },
    {
        "TemplateName": "MessageNotificationTemplate",
        "SubjectPart": "New Message in Carpool NU",
        "HtmlPart": """
        <p>Hello {{preferredName}},</p>
        <p>{{OtherUser}} sent you a message in Carpool NU:</p>
        <p><strong>{{message}}</strong></p>
        <p><a href="https://carpoolnu.com">Click here to open Carpool NU</a></p>
        """,
        "TextPart": """
        Hello {{preferredName}},

        {{OtherUser}} sent you a message in Carpool NU:

        {{message}}

        To view the message, visit: https://carpoolnu.com
        """
    },
    {
        "TemplateName": "DriverAcceptanceTemplate",
        "SubjectPart": "Request Accepted",
        "HtmlPart": """
        <p>Hello {{preferredName}},</p>
        <p>{{OtherUser}} has accepted your request for them to join your group.</p>
        <p><a href="https://carpoolnu.com">Click here to open Carpool NU</a></p>
        """,
        "TextPart": """
        Hello {{preferredName}},

        {{OtherUser}} has accepted your request for them to join your group.

        To view your group, visit: https://carpoolnu.com
        """
    },
    {
        "TemplateName": "RiderAcceptanceTemplate",
        "SubjectPart": "Request Accepted",
        "HtmlPart": """
        <p>Hello {{preferredName}},</p>
        <p>{{OtherUser}} has accepted your request to join their Carpool group.</p>
        <p><a href="https://carpoolnu.com">Click here to open Carpool NU</a></p>
        """,
        "TextPart": """
        Hello {{preferredName}},

        {{OtherUser}} has accepted your request to join their Carpool group.

        To view your group, visit: https://carpoolnu.com
        """
    }
]

def create_template(template):
    try:
        response = ses_client.create_template(
            Template={
                'TemplateName': template['TemplateName'],
                'SubjectPart': template['SubjectPart'],
                'TextPart': template['TextPart'],
                'HtmlPart': template['HtmlPart']
            }
        )
        print(f"Template '{template['TemplateName']}' created successfully.")
    except ses_client.exceptions.AlreadyExistsException:
        print(f"Template '{template['TemplateName']}' already exists. Updating...")
        try:
            response = ses_client.update_template(
                Template={
                    'TemplateName': template['TemplateName'],
                    'SubjectPart': template['SubjectPart'],
                    'TextPart': template['TextPart'],
                    'HtmlPart': template['HtmlPart']
                }
            )
            print(f"Template '{template['TemplateName']}' updated successfully.")
        except Exception as e:
            print(f"Error updating template '{template['TemplateName']}': {str(e)}")
    except Exception as e:
        print(f"Error creating template '{template['TemplateName']}': {str(e)}")

def main():
    for template in templates:
        create_template(template)

if __name__ == "__main__":
    main()