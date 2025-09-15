import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { OrderRead } from '@/types/api';
import { formatOrderText } from '@/utils/orderFormatter';

// Register Roboto font for proper diacritic support
Font.register({
  family: 'Roboto',
  src: '/fonts/Roboto-Regular.ttf',
});

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  header: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  order: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  orderText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 1.4,
    whiteSpace: 'pre-line',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    marginVertical: 10,
  },
  noOrders: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Roboto',
  },
  deliveryHeader: {
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
  },
  deliveryTitle: {
    fontSize: 18,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  deliveryCount: {
    fontSize: 14,
    fontFamily: 'Roboto',
    color: '#666666',
  },
  groupSeparator: {
    height: 15,
  },
});

interface OrdersPDFProps {
  orders: OrderRead[];
  deliveryTypes: any[];
  getProductName: (productId: number) => string;
  getPaymentMethodName: (paymentMethodId: number) => string;
  businessDetails: any;
}

const OrdersPDF: React.FC<OrdersPDFProps> = ({
  orders,
  deliveryTypes,
  getProductName,
  getPaymentMethodName,
  businessDetails,
}) => {
  const formatOrderTextForPDF = (order: OrderRead) => {
    return formatOrderText(order, {
      getProductName,
      getPaymentMethodName,
      deliveryTypes,
      businessDetails
    });
  };

  // Group orders by delivery type ID for stable ordering independent of names
  const ordersByDeliveryTypeId = orders.reduce((groups, order) => {
    const key = order.delivery_type_id;
    if (!groups[key]) {
      groups[key] = [] as OrderRead[];
    }
    groups[key].push(order);
    return groups;
  }, {} as Record<number, OrderRead[]>);

  // Sort delivery types by order_index and render only those that have orders
  const sortedDeliveryTypes = (deliveryTypes || []).slice().sort((a: any, b: any) => a.order_index - b.order_index);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          Lista Comenzi {new Date().toLocaleDateString('ro-RO')}
        </Text>
        
        {orders && orders.length > 0 ? (
          sortedDeliveryTypes
            .filter((dt: any) => ordersByDeliveryTypeId[dt.id] && ordersByDeliveryTypeId[dt.id].length > 0)
            .map((dt: any, index: number) => {
              const deliveryOrders = ordersByDeliveryTypeId[dt.id];
              return (
            <View key={dt.id} break={index > 0}>
              {/* Delivery Type Header */}
              <View style={styles.deliveryHeader}>
                <Text style={styles.deliveryTitle}>
                  {dt.denumire}
                </Text>
                <Text style={styles.deliveryCount}>
                  {deliveryOrders.length} {deliveryOrders.length === 1 ? 'comandă' : 'comenzi'}
                </Text>
              </View>
              
              {/* Orders for this delivery type */}
              {deliveryOrders.map((order, index) => (
                <View key={order.id} wrap={false}>
                  <View style={styles.order} wrap={false}>
                    <Text style={styles.orderText} wrap>
                      {formatOrderTextForPDF(order)}
                    </Text>
                  </View>
                  {index < deliveryOrders.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
              
              {/* Add space between delivery groups */}
              <View style={styles.groupSeparator} />
            </View>
              );
            })
        ) : (
          <Text style={styles.noOrders}>
            Nu există comenzi pentru această listă.
          </Text>
        )}
      </Page>
    </Document>
  );
};

export default OrdersPDF;
