import React from 'react';
import ReactMarkdown from 'react-markdown';
import { components as themeComponents } from '@/utils/theme';

type MarkdownPageProps = {
  title?: string;
  icon?: React.ReactNode;
  src: string; // path under public, e.g., /legal/terms.md
};

export const MarkdownPage: React.FC<MarkdownPageProps> = ({ title, icon, src }) => {
  const [content, setContent] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    fetch(src, { cache: 'no-cache' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Nu s-a putut încărca documentul: ${res.status}`);
        }
        const text = await res.text();
        if (isMounted) setContent(text);
      })
      .catch((e) => {
        if (isMounted) setError(e.message ?? 'Eroare la încărcarea documentului');
      });
    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div className={themeComponents.page.containerLarge}>
      <div className="max-w-3xl mx-auto px-4">
        {title && (
          <div className={themeComponents.card.header + ' p-6 mb-6 flex items-center space-x-3'}>
            {icon}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        <div className={themeComponents.card.main + ' p-6'}>
          {error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <ReactMarkdown
              components={{
                h1: (props: any) => (
                  <h1 className="text-2xl font-bold text-gray-900 mb-4" {...props} />
                ),
                h2: (props: any) => (
                  <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2" {...props} />
                ),
                h3: (props: any) => (
                  <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2" {...props} />
                ),
                p: (props: any) => (
                  <p className="text-gray-700 leading-relaxed mb-3" {...props} />
                ),
                ul: (props: any) => (
                  <ul className="list-disc ml-6 text-gray-700 space-y-1 mb-3" {...props} />
                ),
                ol: (props: any) => (
                  <ol className="list-decimal ml-6 text-gray-700 space-y-1 mb-3" {...props} />
                ),
                li: (props: any) => <li className="text-gray-700" {...props} />,
                a: (props: any) => (
                  <a className="text-amber-600 underline hover:text-amber-700" {...props} />
                ),
                strong: (props: any) => <strong className="font-semibold" {...props} />,
                em: (props: any) => <em className="italic" {...props} />,
                hr: (props: any) => <hr className="my-6 border-amber-200" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownPage;


