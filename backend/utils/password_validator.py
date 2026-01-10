import re
from fastapi import HTTPException, status

def validate_password(password: str) -> None:
    """
    Validates password strength and raises HTTPException if invalid.
    
    Requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required"
        )
    
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    if len(password) > 128:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must not exceed 128 characters"
        )
    
    if not re.search(r'[A-Z]', password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    
    if not re.search(r'[a-z]', password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    
    if not re.search(r'\d', password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number"
        )
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;]', password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character (!@#$%^&*...)"
        )
    
    # Check for common weak passwords
    common_passwords = [
        'password', '12345678', 'qwerty123', 'abc123456', 
        'password1', 'password123', 'welcome123', 'admin123'
    ]
    
    if password.lower() in common_passwords:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password is too common. Please choose a stronger password"
        )
