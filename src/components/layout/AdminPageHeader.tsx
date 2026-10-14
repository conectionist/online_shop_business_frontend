import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  searchBox?: React.ReactNode;
  filters?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ 
  title, 
  subtitle, 
  children,
  searchBox,
  filters
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back Button Row */}
      <div className="print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin')}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Panou
        </Button>
      </div>
      
      {/* Title and Subtitle Row */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{title}</h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">{subtitle}</p>
        )}
      </div>
      
      {/* Search and Actions Row - Stack on mobile, side by side on larger screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Box */}
        {searchBox && (
          <div className="w-full sm:max-w-md">
            {searchBox}
          </div>
        )}
        
        {/* Action Buttons */}
        {children && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {children}
          </div>
        )}
      </div>
      
      {/* Complex Filters Row */}
      {filters && (
        <div className="w-full">
          {filters}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader; 