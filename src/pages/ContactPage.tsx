import React from 'react';
import { Mail, Phone, MapPin, Building } from 'lucide-react';
import { components } from '@/utils/theme';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { 
  getBusinessName,
  getBusinessAddress,
  getBusinessPhone,
  getBusinessEmail,
  getBusinessHours
} from '@/utils/businessInfo';

const ContactPage: React.FC = () => {
  const { data: businessDetails } = useBusinessDetailsSingle();

  const name = getBusinessName(businessDetails || undefined);
  const address = getBusinessAddress(businessDetails || undefined);
  const phone = getBusinessPhone(businessDetails || undefined);
  const email = getBusinessEmail(businessDetails || undefined);
  const hours = getBusinessHours(businessDetails || undefined);

  return (
    <div className={components.page.containerLarge}>
      <div className="max-w-3xl mx-auto px-4">
        <div className={components.card.header + ' p-6 mb-6'}>
          <h1 className="text-2xl font-bold text-gray-900">Contact</h1>
        </div>

        <div className={components.card.main + ' p-6 space-y-6'}>
          <div className="space-y-2">
            <div className="flex items-center text-gray-800">
              <Building className="h-5 w-5 mr-2 text-amber-600" />
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <MapPin className="h-5 w-5 mr-2 text-amber-600" />
              <span>{address}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Phone className="h-5 w-5 mr-2 text-amber-600" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Mail className="h-5 w-5 mr-2 text-amber-600" />
              <span>{email}</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Program</h2>
            <div className="text-gray-700">
              <p>{hours.weekdays}</p>
              <p>{hours.saturday}</p>
              <p>{hours.sunday}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
