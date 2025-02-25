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

const StockScreen = () => {
  const { token, verifiedUserName } = useGlobalValue(); // Assuming you have a global context
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({}); // Track expanded state of each item
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch stock items from the API
  const fetchStockItems = async () => {
    try {
      const response = await fetch('https://positnow.com:8010/stock/getAllNestedStockItems', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch stock items');
      }
  
      const data = await response.json();
  
      if (Array.isArray(data.stockItemList)) {
        // Sort the stock items by itemName alphabetically
        const sortedItems = data.stockItemList.sort((a, b) => {
          if (a.itemName.toLowerCase() < b.itemName.toLowerCase()) {
            return -1;
          }
          if (a.itemName.toLowerCase() > b.itemName.toLowerCase()) {
            return 1;
          }
          return 0;
        });
  
        // Set the sorted items into the state
        setAllItems(sortedItems);
        setFilteredItems(sortedItems); // Initially show all items
      } else {
        console.error('Expected an array of items inside stockItemList');
        setFilteredItems([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      setLoading(false);
    }
  };  

  // Fetch items when the component mounts
  useEffect(() => {
    if (token) {
      fetchStockItems();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text === '') {
      setFilteredItems(allItems);
    } else {
      const filtered = allItems.filter(
        (item) =>
          item.itemCode.toLowerCase().includes(text.toLowerCase()) ||
          item.itemName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredItems(filtered);
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

  // Toggle the expanded state of a stock item
  const toggleChildRecords = (itemId: string) => {
    setExpandedItems((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId], // Toggle the visibility
    }));
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
        {/* Search input */}
        <TextInput
          style={styles.input}
          placeholder="Search by item or supplier..."
          value={query}
          onChangeText={handleSearch}
        />

        {/* Stock Table */}
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.cell, styles.headerText]}>Item Code</Text>
            <Text style={[styles.cell, styles.headerText]}>Item Name</Text>
            <Text style={[styles.cell, styles.headerText]}>Supplier Name</Text>
            <Text style={[styles.cell, styles.headerText]}>Selling Price</Text>
            <Text style={[styles.cell, styles.headerText]}>Qty</Text>
          </View>

          {filteredItems.map((item) => (
            <View key={item.itemId + item.supplier }>
              {/* Stock Item Row */}
              <TouchableOpacity onPress={() => toggleChildRecords(item.itemId + item.supplier)} style={styles.tableRow}>
                <Text style={styles.cell}>{item.itemCode}</Text>
                <Text style={styles.cell}>{item.itemName}</Text>
                <Text style={styles.cell}>{item.supplier}</Text>
                <Text style={styles.cell}>{item.sellingPrice.toFixed(2)}</Text>
                <Text style={styles.cell}> {item.totalQty % 1 === 0 ? item.totalQty : item.totalQty.toFixed(3)}</Text>
                
              </TouchableOpacity>

              {/* Show child records if expanded */}
              {expandedItems[item.itemId+ item.supplier] && (
                <View style={styles.childTable}>
                  <View style={styles.childTableHeader}>
                    <Text style={styles.childCell}>Invoice Name</Text>
                    <Text style={styles.childCell}>Unit Cost</Text>
                    <Text style={styles.childCell}>Selling Price</Text>
                    <Text style={styles.childCell}>Qty</Text>
                    <Text style={styles.childCell}>Already Billed Qty</Text>
                    <Text style={styles.childCell}>Return Qty</Text>
                    <Text style={styles.childCell}>Reserved Qty</Text>
                  </View>

                  {item.stockInvoiceItems.map((invoiceItem, idx) => (
                    <View key={idx} style={styles.childTableRow}>
                      <Text style={styles.childCell}>{invoiceItem.invoiceName}</Text>
                      <Text style={styles.childCell}>{invoiceItem.unitCost.toFixed(2)}</Text>
                      <Text style={styles.childCell}>{invoiceItem.sellingPrice.toFixed(2)}</Text>
                      <Text style={styles.childCell}>
                        {invoiceItem.qty % 1 === 0 ? invoiceItem.qty : invoiceItem.qty.toFixed(3)}
                        </Text>
                      <Text style={styles.childCell}>{invoiceItem.alreadyBilledQty}</Text>
                      <Text style={styles.childCell}>{invoiceItem.returnQty}</Text>
                      <Text style={styles.childCell}>{invoiceItem.reservedQty}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </ScrollView>

      {/* Scroll Arrows */}
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
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
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
    padding: 5,
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

export default StockScreen;
