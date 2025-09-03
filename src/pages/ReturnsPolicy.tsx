import React from 'react';
import { RotateCcw } from 'lucide-react';
import { components } from '@/utils/theme';

const ReturnsPolicy: React.FC = () => {
  return (
    <div className={components.page.containerLarge}>
      <div className="max-w-3xl mx-auto px-4">
        <div className={components.card.header + ' p-6 mb-6 flex items-center space-x-3'}>
          <RotateCcw className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Politica de retur</h1>
        </div>

        <div className={components.card.main + ' p-6 space-y-6'}>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Dreptul de retragere</h2>
            <p className="text-gray-700">
              Conform OUG 34/2014, aveți dreptul de a vă retrage din contract în termen de 14 zile calendaristice de la
              primirea produselor, fără a preciza motivele, cu excepțiile prevăzute de lege (de exemplu, produse
              perisabile sau sigilate care nu pot fi returnate din motive de protecție a sănătății sau igienă, dacă au fost
              desigilate).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Condiții de retur</h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Produsele trebuie returnate în aceeași stare în care au fost primite</li>
              <li>Returnarea trebuie făcută în termenul legal de 14 zile</li>
              <li>Costurile de transport pentru retur pot fi suportate de client (dacă este cazul)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Procedura de retur</h2>
            <ol className="list-decimal ml-6 text-gray-700 space-y-1">
              <li>Trimiteți o solicitare de retur prin e-mail sau formularul de contact</li>
              <li>Ambalați produsele corespunzător pentru a preveni deteriorarea la transport</li>
              <li>Expediați produsele la adresa comunicată</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Rambursarea contravalorii</h2>
            <p className="text-gray-700">
              Rambursarea se va efectua în cel mult 14 zile calendaristice de la recepția produselor returnate sau de la
              primirea dovezii de expediere a acestora, utilizând aceeași metodă de plată folosită la comandă, cu excepția
              cazului în care se convine altfel.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicy;
