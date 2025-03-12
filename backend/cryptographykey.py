from cryptography.fernet import Fernet

# Generate the key
key = Fernet.generate_key()

# Path to the settings.py file
settings_path = '/Users/mahaanbhat/Desktop/biometric-banking-auth/backend/django_api/settings.py'  # Replace with the actual path to your settings.py

# Read the current contents of settings.py
with open(settings_path, 'r') as f:
    settings_content = f.readlines()

# Find the location where you want to insert the key (for example, before the last line)
insert_line = "FERNET_KEY = b'{}'\n".format(key.decode())

# Insert the key at the appropriate position
settings_content.insert(-1, insert_line)

# Write the updated content back to settings.py
with open(settings_path, 'w') as f:
    f.writelines(settings_content)

print(f"Fernet key added to {settings_path}")
