import { useEffect, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type UserDetail = {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string;
};

// Fetch current user using stored token
export async function getCurrentUser(): Promise<UserDetail | null> {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const url = `${apiBaseUrl}/users/user-details-by-token`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (data && typeof data === 'object') {
      if (data.user) return data.user as UserDetail;
      if (data.data) return data.data as UserDetail;
      return data as UserDetail;
    }
  } catch (err) {
    return null;
  }

  return null;
}


// (removed) getCurrentUserId - not used in this project

export function useCurrentUser() {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const u = await getCurrentUser();
      if (mounted) setUser(u);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { user, loading };
}
