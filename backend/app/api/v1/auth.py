from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, UserUpdate, Token
from app.services.audit_service import AuditService

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    # Restrict admin assignment during public registration unless no admin exists
    role = "user"
    if user_in.role in ["pharmacist", "user"]:
        role = user_in.role

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    AuditService.log(
        db,
        action="user_registered",
        resource_type="user",
        resource_id=user.id,
        user_id=user.id,
        details=f"User account registered for {user.email}"
    )

    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    AuditService.log(
        db,
        action="user_logged_in",
        resource_type="user",
        resource_id=user.id,
        user_id=user.id,
        details=f"Successful login for {user.email}"
    )

    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    AuditService.log(
        db,
        action="user_logged_out",
        resource_type="user",
        resource_id=current_user.id,
        user_id=current_user.id
    )
    return {"message": "Successfully logged out of current session"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user.to_dict()

@router.patch("/me", response_model=UserResponse)
def update_profile(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_in.full_name:
        current_user.full_name = update_in.full_name
    if update_in.email:
        exist = db.query(User).filter(User.email == update_in.email.lower(), User.id != current_user.id).first()
        if exist:
            raise HTTPException(status_code=400, detail="Email is already used by another account")
        current_user.email = update_in.email.lower()
    if update_in.new_password:
        if not update_in.current_password or not verify_password(update_in.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        if len(update_in.new_password) < 8:
            raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
        current_user.hashed_password = get_password_hash(update_in.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user.to_dict()
