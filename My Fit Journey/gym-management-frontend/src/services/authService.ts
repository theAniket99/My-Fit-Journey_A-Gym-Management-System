// src/services/authService.ts

export function getUserRoleFromToken(): string | null {
  const token = sessionStorage.getItem('jwtToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Role is typically in payload.role, with 'ROLE_' prefix
    return payload.role ? payload.role.replace('ROLE_', '') : null;
  } catch {
    return null;
  }
}

export function logout() {
  sessionStorage.removeItem('jwtToken');
}
