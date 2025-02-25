import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';

//import RNPrint from 'react-native-print';


// Custom hook for global state
import { useGlobalValue } from './GlobalContext';

const CreditBillScreen = () => {
  const { token } = useGlobalValue();
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discountValue, setDiscountValue] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [customers, setCustomers] = useState([
    { name: 'John Doe', address: '123 Elm St' },
    { name: 'Jane Smith', address: '456 Oak St' },
    { name: 'John Doe', address: '789 Pine St' },
    { name: 'Alice Johnson', address: '321 Maple St' },
    { name: 'Bob Brown', address: '654 Birch St' },
  ]);
const [filteredCustomers, setFilteredCustomers] = useState([]);
const [showSearch, setShowSearch] = useState(true);

  // Fetch items from API
  const fetchItems = async () => {
    try {
      const response = await fetch('https://positnow.com:8010/item/getAllItems', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }

      const data = await response.json();
      setAllItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Search function for items
  const handleSearch = useCallback(
    (text) => {
      setQuery(text);
      if (!text) {
        setFilteredItems(allItems);
      } else {
        setFilteredItems(
          allItems.filter(
            (item) =>
              item.code.toLowerCase().includes(text.toLowerCase()) ||
              item.name.toLowerCase().includes(text.toLowerCase())
          )
        );
      }
    },
    [allItems]
  );

  // Search function for customers
  const handleCustomerSearch = (text) => {
    setCustomerQuery(text);
    if (!text) {
      setFilteredCustomers(customers);
    } else {
      setFilteredCustomers(
        customers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(text.toLowerCase()) ||
            customer.address.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.code === item.code);
    if (!existingItem) {
      setCartItems([...cartItems, { ...item, qty: 1, totalPrice: item.sellingPrice }]);
    }
  };

  // Calculate the gross total
  const calculateGrossTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  // Calculate the net total after applying discount
  const calculateNetTotal = () => {
    const grossTotal = calculateGrossTotal();
    if (discountPercentage) {
      const discount = (grossTotal * parseFloat(discountPercentage)) / 100;
      return grossTotal - discount;
    }
    if (discountValue) {
      return grossTotal - parseFloat(discountValue);
    }
    return grossTotal;
  };

  const getTotalItems = () => cartItems.length;
  const getTotalPieces = () => cartItems.reduce((total, item) => total + item.qty, 0);

  const handlePrint = async () => {
    const htmlContent = `
      <h2>Invoice</h2>
      <p><strong>Customer:</strong> ${selectedCustomer ? selectedCustomer.name : 'N/A'}</p>
      <p><strong>Address:</strong> ${selectedCustomer ? selectedCustomer.address : 'N/A'}</p>
      <table border="1" cellspacing="0" cellpadding="5">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${cartItems
            .map(
              (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.totalPrice.toFixed(2)}</td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <p><strong>Gross Total:</strong> $${calculateGrossTotal().toFixed(2)}</p>
      <p><strong>Discount:</strong> ${discountValue ? `$${discountValue}` : `${discountPercentage}%`}</p>
      <p><strong>Net Total:</strong> $${calculateNetTotal().toFixed(2)}</p>
    `;

    try {
   //   await RNPrint.print({ html: htmlContent });
    } catch (error) {
      console.error('Error printing invoice:', error);
      Alert.alert('Error', 'Failed to print the invoice.');
    }
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Search Input */}
        <TextInput
          style={styles.input}
          placeholder="Search by item code or name..."
          value={query}
          onChangeText={handleSearch}
        />

        {/* Shopping List Table */}
        <Text style={styles.tableTitle}>Shopping List</Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.cell, styles.headerText]}>Item Code</Text>
            <Text style={[styles.cell, styles.headerText]}>Item Name</Text>
            <Text style={[styles.cell, styles.headerText]}>Price</Text>
            <Text style={[styles.cell, styles.headerText]}>Add</Text>
          </View>

          <ScrollView style={styles.tableBody} nestedScrollEnabled={true}>
            {filteredItems.map((item) => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={styles.cell}>{item.code}</Text>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.sellingPrice.toFixed(2)}</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Cart Table */}
        <Text style={styles.tableTitle}>Cart</Text>
        <View style={[styles.table, styles.cartTable]}>
          <View style={styles.cartTableHeader}>
            <Text style={[styles.cell, styles.headerText]}>Item Name</Text>
            <Text style={[styles.cell, styles.headerText]}>Qty</Text>
            <Text style={[styles.cell, styles.headerText]}>Price</Text>
          </View>

          <ScrollView style={styles.fixedCartHeight} nestedScrollEnabled={true}>
            {cartItems.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.qty}</Text>
                <Text style={styles.cell}>{item.totalPrice.toFixed(2)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Discount Fields */}
        <View style={styles.discountSection}>
          <TextInput
            style={styles.discountInput}
            placeholder="Discount Value"
            value={discountValue}
            onChangeText={(text) => setDiscountValue(text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.discountInput}
            placeholder="Discount Percentage"
            value={discountPercentage}
            onChangeText={(text) => setDiscountPercentage(text)}
            keyboardType="numeric"
          />
        </View>

        {/* Gross and Net */}
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>Gross Total: ${calculateGrossTotal().toFixed(2)}</Text>
          <Text style={styles.totalText}>Net Total: ${calculateNetTotal().toFixed(2)}</Text>
        </View>

        {/* Line */}
        <View style={styles.line} />

        {/* Number of Items and Pieces */}
        <View style={styles.itemSummary}>
          <Text style={styles.summaryText}>No. of Items: {getTotalItems()}</Text>
          <Text style={styles.summaryText}>No. of Pieces: {getTotalPieces()}</Text>
        </View>

        <View style={styles.customerSection}>
  {/* Show search input only if no customer is selected or when user clicks to edit */}
  {showSearch && (
    <TextInput
      style={styles.input}
      placeholder="Search Customer Name or Address"
      value={customerQuery}
      onChangeText={handleCustomerSearch}
      onFocus={() => setFilteredCustomers(customers)} // Show full list when focused
    />
  )}

  {/* Show customer list only while searching */}
  {customerQuery ? (
    <ScrollView style={styles.tableBody} nestedScrollEnabled={true}>
      {filteredCustomers.map((customer, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setSelectedCustomer(customer); // Set new customer
            setCustomerQuery(''); // Clear search input
            setFilteredCustomers([]); // Hide list
            setShowSearch(false); // Hide search box
          }}
        >
          <View style={styles.customerItem}>
            <Text>{customer.name} - {customer.address}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ) : null}

  {/* Show selected customer and allow re-selection when clicked */}
  {selectedCustomer && !showSearch && (
    <>
      <TouchableOpacity
        onPress={() => {
          setSelectedCustomer(null); // Remove current customer
          setShowSearch(true); // Show search box again
        }}
      >
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>{selectedCustomer.name}</Text>
            <Text style={styles.cell}>{selectedCustomer.address}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Line after customer */}
      <View style={styles.line} />
    </>
  )}
</View>

{/* Print Button at the Bottom */}
<TouchableOpacity style={styles.purchaseButton} onPress={() => console.log('Print Invoice')}>
  <Text style={styles.purchaseButtonText}>Purchase & print</Text>
</TouchableOpacity>


      </ScrollView>
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
    flexGrow: 1,
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
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cartTable: {
    backgroundColor: '#f1f1f1',
  },
  cartTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#AC2801',
    paddingVertical: 10,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#003366',
    paddingVertical: 10,
  },
  tableBody: {
    maxHeight: 200,
  },
  fixedCartHeight: {
    height: 400,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    alignItems: 'center',
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
  addButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 5,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  discountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  discountInput: {
    height: 45,
    width: '45%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
    flexDirection: 'column',
    marginBottom: 20,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  line: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  itemSummary: {
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  customerSection: {
    marginTop: 20,
  },
  customerItem: {
    padding: 10,
    backgroundColor: '#e9e9e9',
    marginVertical: 5,
    borderRadius: 5,
  },
  selectedCustomer: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchaseButton: {
    backgroundColor: '#28a745', // Same as Purchase button
    paddingVertical: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreditBillScreen;
