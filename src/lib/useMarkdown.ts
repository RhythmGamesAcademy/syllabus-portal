import { useState, useEffect } from 'react';

export function useMarkdown(url: string, fallbackUrl?: string) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMarkdown = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let response = await fetch(url);
        
        if (!response.ok && fallbackUrl && response.status === 404 && url !== fallbackUrl) {
          response = await fetch(fallbackUrl);
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch markdown: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        if (isMounted) {
          setContent(text);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMarkdown();

    return () => {
      isMounted = false;
    };
  }, [url, fallbackUrl]);

  return { content, isLoading, error };
}
