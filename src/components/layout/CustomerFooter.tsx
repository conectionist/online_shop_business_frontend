import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useBusinessDetails } from '@/hooks/useBusinessDetails';

const CustomerFooter: React.FC = () => {
  const { data: businessDetailsArray } = useBusinessDetails();
  
  // Get the first business details (assuming there's only one or we want the first one)
  const businessDetails = businessDetailsArray && businessDetailsArray.length > 0 ? businessDetailsArray[0] : null;

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Business Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {businessDetails?.logo && (
                <img 
                  src={businessDetails.logo} 
                  alt="Logo" 
                  className="h-8 w-8 object-contain"
                />
              )}
              <h3 className="text-lg font-semibold">
                {businessDetails?.nume || 'Magazin Online'}
              </h3>
            </div>
            <p className="text-gray-300 text-sm">
              {businessDetails?.description || 'Produse proaspete și de calitate'}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="space-y-2 text-sm text-gray-300">
              {businessDetails?.telefon && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{businessDetails.telefon}</span>
                </div>
              )}
              {businessDetails?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{businessDetails.email}</span>
                </div>
              )}
              {businessDetails?.adresa && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{businessDetails.adresa}</span>
                </div>
              )}
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Program</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="whitespace-pre-line">Program nedefinit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {businessDetails?.nume || 'Magazin Online'}. 
              Toate drepturile rezervate.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Termeni și condiții
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Politica de confidențialitate
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter; 