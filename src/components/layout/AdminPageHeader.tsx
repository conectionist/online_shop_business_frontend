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
    <div className="space-y-4">
      {/* Back Button Row */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Panou
        </Button>
      </div>
      
      {/* Title and Subtitle Row */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600">{subtitle}</p>
        )}
      </div>
      
      {/* Search Row */}
      {searchBox && (
        <div className="max-w-md">
          {searchBox}
        </div>
      )}
      
      {/* Complex Filters Row */}
      {filters && (
        <div>
          {filters}
        </div>
      )}
      
      {/* Action Button Row */}
      <div className="flex justify-start">
        {children}
      </div>
    </div>
  );
};

export default AdminPageHeader; 