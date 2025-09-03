import React from 'react';
import { Shield } from 'lucide-react';
import { components } from '@/utils/theme';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className={components.page.containerLarge}>
      <div className="max-w-3xl mx-auto px-4">
        <div className={components.card.header + ' p-6 mb-6 flex items-center space-x-3'}>
          <Shield className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Politica de confidențialitate</h1>
        </div>

        <div className={components.card.main + ' p-6 space-y-6'}>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Analitice (Plausible)</h2>
            <p className="text-gray-700">
              Folosim Plausible Analytics pentru măsurarea audienței site-ului fără cookie-uri sau identificatori
              persistenți. Plausible colectează doar informații agregate și anonimizate (de ex. URL vizitat, referer,
              tipul de dispozitiv, agentul utilizatorului, adresa IP pseudonimizată) pentru a ne ajuta să înțelegem
              traficul și a îmbunătăți serviciile. Datele sunt găzduite în UE. Nu realizăm profilare și nu urmărim
              utilizatorii între site-uri. Temeiul legal: interes legitim pentru măsurarea audienței.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Datele colectate</h2>
            <p className="text-gray-700">
              Colectăm datele strict necesare pentru procesarea comenzilor și îmbunătățirea serviciilor: nume, prenume,
              adresă de livrare (dacă este cazul), număr de telefon, metode de plată selectate și preferințe de livrare.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Scopul prelucrării</h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Procesarea comenzilor și livrarea produselor</li>
              <li>Comunicarea cu clientul privind statusul comenzii</li>
              <li>Îmbunătățirea experienței de cumpărare</li>
              <li>Respectarea obligațiilor legale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Temeiul legal</h2>
            <p className="text-gray-700">
              Prelucrarea se bazează pe executarea contractului (art. 6(1)(b) GDPR), obligații legale (art. 6(1)(c) GDPR)
              și interes legitim (art. 6(1)(f) GDPR) pentru securitate și îmbunătățirea serviciilor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Perioada de stocare</h2>
            <p className="text-gray-700">
              Datele sunt păstrate pe perioada necesară îndeplinirii scopurilor menționate și conform termenelor legale
              aplicabile (de ex. termene fiscale/contabile).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Destinatari și transferuri</h2>
            <p className="text-gray-700">
              Putem partaja datele cu furnizori implicați în procesarea comenzii (ex. servicii de livrare). Nu transferăm
              date în afara UE/SEE fără garanții adecvate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Drepturile dumneavoastră</h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Dreptul de acces, rectificare, ștergere</li>
              <li>Dreptul la restricționare și opoziție</li>
              <li>Dreptul la portabilitatea datelor</li>
              <li>Dreptul de a depune o plângere la ANSPDCP</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact</h2>
            <div className="text-gray-700">
              <p>Pentru solicitări privind datele personale, ne puteți contacta la adresa de e-mail indicată în footer.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
