import React from 'react';
import { Cookie } from 'lucide-react';
import { components } from '@/utils/theme';

const CookiesPolicy: React.FC = () => {
  return (
    <div className={components.page.containerLarge}>
      <div className="max-w-3xl mx-auto px-4">
        <div className={components.card.header + ' p-6 mb-6 flex items-center space-x-3'}>
          <Cookie className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Politica de cookie-uri</h1>
        </div>

        <div className={components.card.main + ' p-6 space-y-6'}>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ce sunt cookie-urile?</h2>
            <p className="text-gray-700">
              Cookie-urile sunt fișiere text mici stocate pe dispozitivul dumneavoastră pentru a asigura funcționarea
              corectă a site-ului și pentru a îmbunătăți experiența de utilizare.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Cum folosim cookie-urile</h2>
            <p className="text-gray-700">
              În prezent, acest site nu utilizează cookie-uri. Nu folosim cookie-uri de marketing, profilare sau
              funcționale. Dacă în viitor vom introduce cookie-uri, această politică va fi actualizată în mod corespunzător.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Controlul cookie-urilor</h2>
            <p className="text-gray-700">
              Puteți controla sau șterge cookie-urile din setările browserului. Rețineți că blocarea cookie-urilor strict
              necesare poate afecta funcționarea site-ului.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Analitice (fără cookie-uri)</h2>
            <p className="text-gray-700">
              Utilizăm Plausible Analytics, o soluție de analiză care nu folosește cookie-uri și nu creează profiluri
              individuale. Colectarea datelor se face într-o manieră agregată și pseudonimizată, exclusiv pentru măsurarea
              audienței.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
