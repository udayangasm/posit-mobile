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

// Assuming `useGlobalValue` is a custom hook that provides global state (token and user information)
import { useGlobalValue } from './GlobalContext';

const AllItemScreen = () => {
  const { token, verifiedUserName } = useGlobalValue(); // Get the token and user name from global state
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ScrollView ref for scrolling programmatically
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch items from the API using the token for Authorization
  const fetchItems = async () => {
    try {
      const response = await fetch('https://positnow.com:8010/item/getAllItems', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pass token in Authorization header
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setAllItems(data); // Assuming response is an array of items
      setFilteredItems(data); // Initially, show all items
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  // Fetch items when the component mounts
  useEffect(() => {
    if (token) {
      fetchItems(); // Fetch items only if the token is available
    } else {
      setLoading(false); // If there's no token, stop loading (or show an error message)
    }
  }, [token]);

  // Handle text input change and filter items (case-insensitive and matches anywhere in the id or name)
  const handleSearch = (text: string) => {
    setQuery(text);
    // If the input is empty, show all items, otherwise filter items by id or name
    if (text === '') {
      setFilteredItems(allItems); // Show all items if input is cleared
    } else {
      const filtered = allItems.filter(
        (item) =>
          item.code.toLowerCase().includes(text.toLowerCase()) || // Match item code (id)
          item.name.toLowerCase().includes(text.toLowerCase()) // Match item name
      );
      setFilteredItems(filtered); // Show only matching items
    }
  };

  // Scroll to the top of the ScrollView
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Scroll to the bottom of the ScrollView
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
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
      <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef}>
        {/* Text Input for filtering items */}
        <TextInput
          style={styles.input}
          placeholder="Search by item code or name..."
          value={query}
          onChangeText={handleSearch}
        />

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.cell, styles.headerText]}>Item Code</Text>
            <Text style={[styles.cell, styles.headerText]}>Item Name</Text>
            <Text style={[styles.cell, styles.headerText]}>Price</Text>
          </View>

          {/* Display filtered items */}
          {filteredItems.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={styles.cell}>{item.code}</Text>
              <Text style={styles.cell}>{item.name}</Text>
              {/* Format price to two decimal places */}
              <Text style={styles.cell}>{item.sellingPrice.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Display the number of items */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </ScrollView>

      {/* Top and Bottom Arrows */}
      <View style={styles.arrowContainer}>
        {/* Scroll to Top Button */}
        <TouchableOpacity onPress={scrollToTop} style={styles.arrowButton}>
          <Text style={styles.arrowText}>↑</Text>
        </TouchableOpacity>

        {/* Scroll to Bottom Button */}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  scrollContainer: {
    paddingBottom: 20, // Ensure there's some space at the bottom of the scroll
  },
  input: {
    height: 45, // Increased height for better visibility
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15, // Increased padding for wider text input
    marginBottom: 20, // Add some space between input and table
    width: '100%', // Ensure the text input takes up the full width
    maxWidth: 600, // Add a max-width to ensure it doesn't get too wide on larger screens
    alignSelf: 'center', // Center the input horizontally
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
    right: 20, // Place the arrows on the right side
    top: '50%', // Center vertically
    transform: [{ translateY: -30 }], // Adjust to properly center the arrows
    zIndex: 1000, // Make sure the arrows are on top
    flexDirection: 'column',
  },
  arrowButton: {
    paddingVertical: 20, // Keeping the button size regular
    paddingHorizontal: 20, // Keep the padding consistent
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#007bff', // Blue arrow
    fontSize: 40, // Larger size for the arrow (visually thicker)
    fontWeight: 'bold', // Thicker arrow using bold weight
    transform: [{ scaleX: 2 }, { scaleY: 2 }], // Scaling to make the arrows thicker and wider
    textAlign: 'center', // Ensure the text is centered within the area
  },
});

export default AllItemScreen;
