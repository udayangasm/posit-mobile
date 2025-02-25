import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useGlobalValue } from './GlobalContext';

const CustomerOutstandingScreen = () => {
  const { token } = useGlobalValue();
  const [query, setQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCustomers, setExpandedCustomers] = useState({}); // Track expanded customers

  const scrollViewRef = useRef<ScrollView>(null);

  const fetchOutstandingCustomers = async () => {
    try {
      const outstandingResponse = await fetch(
        'https://positnow.com:8010/bill/getAllCustomerOutStanding?salesRefId=0',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!outstandingResponse.ok) {
        throw new Error('Failed to fetch outstanding customer data');
      }

      const outstandingData = await outstandingResponse.json();

      const customerResponse = await fetch(
        'https://positnow.com:8040/customer/getAllCustomers',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!customerResponse.ok) {
        throw new Error('Failed to fetch customer details');
      }

      const customerData = await customerResponse.json();
      const customerList = Array.isArray(customerData) ? customerData : [];

      // Merge outstanding data with customer details
      const mergedData = outstandingData.map((outstanding) => {
        const customer = customerList.find((cust) => cust.id === outstanding.customerId);
        return {
          ...outstanding,
          customerName: customer?.name || 'Unknown',
          address: customer?.address || 'No Address',
          creditBills: outstanding.creditBills || [],
        };
      });

      const sortedMergedData = mergeAndSortData(outstandingData, customerList, 'customerName', 'asc');


      setAllCustomers(sortedMergedData);
      setFilteredCustomers(sortedMergedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOutstandingCustomers();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleSearch = (text) => {
    setQuery(text);
    if (text === '') {
      setFilteredCustomers(allCustomers);
    } else {
      const filtered = allCustomers.filter(
        (customer) =>
          customer.customerName.toLowerCase().includes(text.toLowerCase()) ||
          customer.address.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const toggleBills = (customerId) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  const mergeAndSortData = (outstandingData, customerList, sortCriteria = 'customerName', sortDirection = 'asc') => {
    const direction = sortDirection === 'asc' ? 1 : -1; // Ascending or descending order
    
    const mergedData = outstandingData.map((outstanding) => {
      const customer = customerList.find((cust) => cust.id === outstanding.customerId);
      return {
        ...outstanding,
        customerName: customer?.name || 'Unknown',
        address: customer?.address || 'No Address',
        creditBills: outstanding.creditBills || [],
      };
    });
  
    // Sort mergedData based on selected criteria (customerName or address)
    const sortedData = [...mergedData].sort((a, b) => {
      const aValue = a[sortCriteria].toLowerCase();
      const bValue = b[sortCriteria].toLowerCase();
      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });
  
    return sortedData;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef}>
        <TextInput
          style={styles.input}
          placeholder="Search by customer name or address..."
          value={query}
          onChangeText={handleSearch}
        />

        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.cell, styles.headerText]}>Customer Name</Text>
            <Text style={[styles.cell, styles.headerText]}>Address</Text>
            <Text style={[styles.cell, styles.headerText]}>Total Outstanding</Text>
            <Text style={[styles.cell, styles.headerText]}>No of Invoices</Text>
          </View>

          {filteredCustomers.map((customer, index) => (
            <View key={index}>
              {/* Parent Row (Customer Data) */}
              <TouchableOpacity onPress={() => toggleBills(customer.customerId)} style={styles.tableRow}>
                <Text style={styles.cell}>{customer.customerName}</Text>
                <Text style={styles.cell}>{customer.address}</Text>
                <Text style={styles.cell}>{parseFloat(customer.total).toFixed(2)}</Text>
                <Text style={styles.cell}>{customer.noOfInvoices}</Text>
              </TouchableOpacity>

              {/* Child Table (Bill Details) */}
              {expandedCustomers[customer.customerId] && (
                <View style={styles.childTable}>
                  <View style={styles.childTableHeader}>
                    <Text style={styles.childCell}>Bill No</Text>
                    <Text style={styles.childCell}>Billing Date</Text>
                    <Text style={styles.childCell}>Bill Amount</Text>
                    <Text style={styles.childCell}>Discount</Text>
                    <Text style={styles.childCell}>Return</Text>
                    <Text style={styles.childCell}>Credit Note</Text>
                    <Text style={styles.childCell}>Paid Amount</Text>
                    <Text style={styles.childCell}>Balance</Text>
                    <Text style={styles.childCell}>Age</Text>
                  </View>

                  {customer.creditBills.map((bill, billIndex) => (

                    <View key={billIndex} style={styles.childTableRow}>
                      <Text style={styles.childCell}>{bill.billNo}</Text>
                      <Text style={styles.childCell}>{bill.billingDate}</Text>
                      <Text style={styles.childCell}>{bill.netAmount.toFixed(2)}</Text>
                      <Text style={styles.childCell}>{bill.discount.toFixed(2)}</Text>
                      <Text style={styles.childCell}>{bill.returnAmount.toFixed(2)}</Text>
                      <Text style={styles.childCell}>{bill.creditNote.toFixed(2)}</Text>
                      <Text style={styles.childCell}>{bill.paidAmount.toFixed(2)}</Text>
                      <Text style={styles.childCell}>
                        {(bill.netAmount - bill.paidAmount - bill.creditNote - bill.returnAmount - bill.discount).toFixed(2)}
                      </Text>
                      <Text style={styles.childCell}>{bill.age}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Showing {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
          </Text>
        </View>

      </ScrollView>

      <View style={styles.arrowContainer}>
        <TouchableOpacity onPress={scrollToTop} style={styles.arrowButton}>
          <Text style={styles.arrowText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={scrollToBottom} style={styles.arrowButton}>
          <Text style={styles.arrowText}>↓</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    padding: 5,
  },
  headerText: {
    fontWeight: 'bold',
    color: 'white',
  },
  childTable: {
    marginLeft: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 5,
    padding: 5,
  },
  childTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 5,
  },
  childTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
  },
  childCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    padding: 3,
    color: '#333',
  },
  footer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  arrowContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -30 }],
    zIndex: 1000,
    flexDirection: 'column',
  },
  arrowButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#007bff',
    fontSize: 40,
    fontWeight: 'bold',
    transform: [{ scaleX: 2 }, { scaleY: 2 }],
    textAlign: 'center',
  },
});

export default CustomerOutstandingScreen;
