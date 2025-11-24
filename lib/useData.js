'use client';

import useSWR from 'swr';

const fetcher = async (url) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch ${url}`);
  }
  return res.json();
};

export function useProfiles() {
  const { data, error, isLoading } = useSWR('/api/profiles', fetcher);
  return { profiles: data || [], error, isLoading };
}

export function useProducts() {
  const { data, error, isLoading } = useSWR('/api/products', fetcher);
  return { products: data || [], error, isLoading };
}

export function useFeedback() {
  const { data, error, isLoading } = useSWR('/api/feedback', fetcher);
  return { feedback: data || [], error, isLoading };
}
