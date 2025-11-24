'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useSessionVendor() {
  const [sessionUserId, setSessionUserId] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchSessionVendor = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data?.session?.user?.id || null;
        if (!active) return;
        setSessionUserId(userId);
        if (!userId) {
          setVendor(null);
          setLoading(false);
          return;
        }
        const res = await fetch('/api/profiles', { cache: 'no-store' });
        const profiles = res.ok ? await res.json() : [];
        const found = profiles.find((p) => p.userId === userId) || null;
        if (!active) return;
        setVendor(found || null);
      } catch (e) {
        if (!active) return;
        setVendor(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSessionVendor();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        if (!active) return;
        setSessionUserId(null);
        setVendor(null);
        setLoading(false);
        return;
      }
      fetchSessionVendor();
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return { sessionUserId, vendor, loading };
}
