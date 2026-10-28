
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";

export interface CsrfToken {
  headerName: string;
  token: string;
}

export async function getCsrfToken(): Promise<CsrfToken> {
  const response = await fetch(`${API_URL}/api/auth/csrf`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to retrieve CSRF token");
  }

  return response.json();
}

export async function register(
  email: string,
  password: string
): Promise<{ id: number }> {
  const csrf = await getCsrfToken();

  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`);
  }

  return response.json();
}


export async function login(
  email: string,
  password: string
): Promise<void> {
  const csrf = await getCsrfToken();

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      [csrf.headerName]: csrf.token,
    },
    body: new URLSearchParams({
      email,
      password,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid email or password");
    }

    throw new Error(`Login failed (${response.status})`);
  }
}

export async function getCurrentUser(): Promise<{
  email: string;
} | null> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Session check failed (${response.status})`);
  }

  return response.json();
}


export async function logout(): Promise<void> {
  // Get a fresh CSRF token for the current session.
  const csrf = await getCsrfToken();

  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      [csrf.headerName]: csrf.token,
    },
  });

  if (!response.ok) {
    throw new Error(`Logout failed (${response.status})`);
  }
}
