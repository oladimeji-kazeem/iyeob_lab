from typing import List, Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.schemas.auth import SessionPrincipal
from app.schemas.membership import MembershipRole
from app.services.store import DatabaseRepository, get_repository

security_bearer = HTTPBearer(auto_error=False)


def get_current_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
) -> str:
    """Extracts and verifies Bearer token from the Authorization header."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


def get_current_user(
    token: str = Depends(get_current_token),
    repo: DatabaseRepository = Depends(get_repository),
) -> SessionPrincipal:
    """Derives verified principal and active institutional roles from session token."""
    return repo.get_current_user_from_token(token)


class RoleChecker:
    """Permission guard for institutional roles (student, lecturer, admin)."""

    def __init__(self, allowed_roles: List[MembershipRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, principal: SessionPrincipal = Depends(get_current_user)) -> SessionPrincipal:
        user_roles = [m.role for m in principal.memberships if m.status == "active"]
        # If user has any matching active role or is an admin
        if any(role in self.allowed_roles for role in user_roles) or MembershipRole.ADMIN in user_roles:
            return principal
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Operation requires one of the following roles: {[r.value for r in self.allowed_roles]}",
        )
