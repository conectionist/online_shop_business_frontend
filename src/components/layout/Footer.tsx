import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail, Phone, MapPin, Building, Shield, FileText, Cookie, RotateCcw, Info } from 'lucide-react';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import {
  getBusinessName,
  getBusinessAddress,
  getBusinessPhone,
  getBusinessEmail,
  getBusinessCUI,
  getBusinessRegistrationNumber,
  getBusinessRepresentative,
  getBusinessHours,
  getBusinessDescription,
  getLegalReturnPolicy,
  getANPCLink,
  getSOLLink,
  getSALLink,
  getLegalPageRoutes
} from '@/utils/businessInfo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { data: businessDetails } = useBusinessDetailsSingle();
  
  // Get business information using utility functions
  const businessName = getBusinessName(businessDetails || undefined);
  const businessAddress = getBusinessAddress(businessDetails || undefined);
  const businessPhone = getBusinessPhone(businessDetails || undefined);
  const businessEmail = getBusinessEmail(businessDetails || undefined);
  const businessCUI = getBusinessCUI(businessDetails || undefined);
  const businessRegistrationNumber = getBusinessRegistrationNumber(businessDetails || undefined);
  const businessRepresentative = getBusinessRepresentative(businessDetails || undefined);
  const businessHours = getBusinessHours(businessDetails || undefined);
  const businessDescription = getBusinessDescription(businessDetails || undefined);
  const returnPolicy = getLegalReturnPolicy();
  const anpcLink = getANPCLink();
  const solLink = getSOLLink();
  const salLink = getSALLink();
  const legalRoutes = getLegalPageRoutes();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Informații Firma
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-white">{businessName}</p>
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-amber-400" />
                {businessAddress}
              </p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-amber-400" />
                {businessPhone}
              </p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-amber-400" />
                {businessEmail}
              </p>
              <p className="text-xs text-gray-400">
                CUI: {businessCUI}
              </p>
              <p className="text-xs text-gray-400">
                {businessRegistrationNumber}
              </p>
              {businessRepresentative && businessRepresentative !== 'Reprezentantul va fi configurat în setările firmei' && (
                <p className="text-xs text-gray-400">
                  Reprezentant: {businessRepresentative}
                </p>
              )}
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Informații Legale
            </h3>
            <div className="space-y-2 text-sm">
              <Link 
                to={legalRoutes.terms} 
                className="flex items-center hover:text-amber-400 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Termeni și condiții
              </Link>
              <Link 
                to={legalRoutes.privacy} 
                className="flex items-center hover:text-amber-400 transition-colors"
              >
                <Shield className="h-4 w-4 mr-2" />
                Politica de confidențialitate
              </Link>
              <Link 
                to={legalRoutes.cookies} 
                className="flex items-center hover:text-amber-400 transition-colors"
              >
                <Cookie className="h-4 w-4 mr-2" />
                Politica de cookie-uri
              </Link>
              <Link 
                to={legalRoutes.returns} 
                className="flex items-center hover:text-amber-400 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Politica de retur
              </Link>
              <Link 
                to={legalRoutes.contact} 
                className="flex items-center hover:text-amber-400 transition-colors"
              >
                <Info className="h-4 w-4 mr-2" />
                Contact
              </Link>
            </div>
          </div>

          {/* Consumer Rights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Drepturile Consumatorilor
            </h3>
            <div className="space-y-2 text-sm">
              <a 
                href={anpcLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-amber-400 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                ANPC - Protecția Consumatorilor
              </a>
              <a 
                href={solLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center hover:opacity-90 transition"
              >
                <img
                  decoding="async"
                  style={{ width: '250px', height: '50px' }}
                  src="/anpc-sol.png"
                  alt="Soluționarea Online a Litigiilor"
                  title="Soluționarea Online a Litigiilor"
                  className="rounded shadow-sm"
                />
              </a>
              <a 
                href={salLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center hover:opacity-90 transition"
              >
                <img
                  decoding="async"
                  style={{ width: '250px', height: '50px' }}
                  src="/anpc-sal.png"
                  alt="Soluționarea Alternativă a Litigiilor"
                  title="Soluționarea Alternativă a Litigiilor"
                  className="rounded shadow-sm"
                />
              </a>
              <div className="text-xs text-gray-400 mt-4 p-3 bg-gray-800 rounded">
                <p className="font-medium mb-2">Dreptul de retur:</p>
                <p>{returnPolicy}</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Link-uri Rapide
            </h3>
            <div className="space-y-2 text-sm">
              <Link 
                to="/" 
                className="flex items-center hover:text-amber-400 transition-colors"
              >
                Pagina principală
              </Link>
              <Link 
                to="/cart" 
                className="flex items-center hover:text-amber-400 transition-colors"
              >
                Coșul de cumpărături
              </Link>
              <div className="text-xs text-gray-400 mt-4 p-3 bg-gray-800 rounded">
                <p className="font-medium mb-2">Program:</p>
                <p>{businessHours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              <p>&copy; {currentYear} {businessName}. Toate drepturile rezervate.</p>
              <p className="mt-1">{businessDescription}</p>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <Link 
                to={legalRoutes.terms} 
                className="hover:text-amber-400 transition-colors"
              >
                Termeni
              </Link>
              <Link 
                to={legalRoutes.privacy} 
                className="hover:text-amber-400 transition-colors"
              >
                Confidențialitate
              </Link>
              <Link 
                to={legalRoutes.cookies} 
                className="hover:text-amber-400 transition-colors"
              >
                Cookie-uri
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
