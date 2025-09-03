import React from 'react';
import { FileText } from 'lucide-react';
import { components } from '@/utils/theme';

const TermsAndConditions: React.FC = () => {
  return (
    <div className={components.page.containerLarge}>
      <div className="max-w-3xl mx-auto px-4">
        <div className={components.card.header + ' p-6 mb-6 flex items-center space-x-3'}>
          <FileText className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Termeni și Condiții</h1>
        </div>

        <div className={components.card.main + ' p-6 space-y-6'}>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Definiții</h2>
            <p className="text-gray-700">
              Acest document stabilește termenii și condițiile de utilizare a site-ului și de plasare a comenzilor.
              "Vânzător" reprezintă operatorul site-ului, "Client"/"Cumpărător" persoana care plasează o comandă.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Serviciile oferite</h2>
            <p className="text-gray-700">
              Site-ul permite consultarea produselor, configurarea coșului și transmiterea comenzii. Confirmarea comenzii
              se face prin mesajul afișat la finalizare și/sau prin mijloacele de contact ale vânzătorului.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Prețuri și plăți</h2>
            <p className="text-gray-700">
              Prețurile afișate includ TVA. Metodele de plată disponibile sunt prezentate pe paginile de comandă. Orice taxe
              de livrare sunt comunicate înainte de finalizarea comenzii.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Livrare</h2>
            <p className="text-gray-700">
              Metodele și zonele de livrare sunt detaliate pe site. Termenele de livrare sunt estimative și pot varia în
              funcție de disponibilitate și volum.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Dreptul de retragere</h2>
            <p className="text-gray-700">
              Conform OUG 34/2014, consumatorul are dreptul de a se retrage din contract în termen de 14 zile calendaristice
              de la primirea produselor, cu excepțiile prevăzute de lege (ex. produse perisabile). Procedura de retur este
              descrisă în Politica de retur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Răspundere</h2>
            <p className="text-gray-700">
              Nu garantăm funcționarea neîntreruptă a site-ului. Nu suntem răspunzători pentru întârzieri cauzate de
              furnizori terți (ex. curieri) sau pentru utilizarea necorespunzătoare a produselor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Soluționarea litigiilor</h2>
            <p className="text-gray-700">
              Litigiile pot fi soluționate pe cale amiabilă, prin ANPC sau prin platforma SOL. În lipsa unei soluții amiabile,
              litigiile vor fi soluționate de instanțele competente din România.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Legea aplicabilă</h2>
            <p className="text-gray-700">
              Prezentul document este guvernat de legislația română.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
