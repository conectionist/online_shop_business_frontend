import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  src: '/fonts/Roboto-Regular.ttf',
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Roboto',
  },
  qty: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 16,
    fontFamily: 'Roboto',
  },
});

export interface ProductTotalItem {
  name: string;
  quantity: number;
}

interface ProductsTotalsPDFProps {
  items: ProductTotalItem[];
}

const ProductsTotalsPDF: React.FC<ProductsTotalsPDFProps> = ({ items }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Total Comenzi per Produs</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString('ro-RO')}</Text>

        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <View key={`${item.name}-${idx}`} style={styles.row} wrap={false}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.qty}>{item.quantity}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>Nu există produse în totaluri.</Text>
        )}
      </Page>
    </Document>
  );
};

export default ProductsTotalsPDF;


