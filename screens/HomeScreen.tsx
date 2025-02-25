import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Animated  
} from 'react-native';
import { useGlobalValue } from './GlobalContext';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }: any) => {
  const { token, verifiedUserName } = useGlobalValue();
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchPermissions();
    if (verifiedUserName) {
      fetchCompanyName(verifiedUserName); // Fetch the company name
    }
  }, [verifiedUserName]);

  // Fetch user permissions
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://positnow.com:8040/admin/getUserPermissionsByToken', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setPermissions(data || {}); // Store permissions in state
    } catch (error) {
      console.error('Error:', error);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch company name
  const fetchCompanyName = async (user: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://positnow.com:8040/company/getCompanyByUser?userName=${user}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add token to the request
        },
      });

      if (!response.ok) throw new Error('Failed to fetch company name');
      const data = await response.json();
      setCompanyName(data.companyName); // Assuming the response contains companyName
      triggerFadeIn();
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to load company name. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFadeIn = () => {
    // Animate the opacity to 1 (fully visible)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000, // 1 second fade-in duration
      useNativeDriver: true,
    }).start();
  };

  // Define screens with required permission keys
  const allScreens = [
    { title: "All Items", screen: "AllItems", icon: "list", permission: "viewAllItems" },
    { title: "Profit", screen: "Profit", icon: "trending-up", permission: "profit" },
    { title: "Customer Outstanding", screen: "CustomerOutstanding", icon: "people", permission: "viewIndividualCustomerOutStanding" },
    { title: "Stock", screen: "Stock", icon: "cube", permission: "viewStock" },
    { title: "Credit Bill", screen: "CreditBill", icon: "receipt", permission: "viewCreditBill" },
    { title: "Order Form", screen: "OrderForm", icon: "document-text", permission: "viewOrderForm" },
  ];

  // Filter screens based on permissions
  const allowedScreens = allScreens.filter(
    (item) => item.permission && permissions[item.permission] === "Y"
  );

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        {loading ? 'Loading...' : companyName || 'Dashboard'}
      </Animated.Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ff6600" />
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {allowedScreens.length > 0 ? (
            allowedScreens.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.card} 
                onPress={() => navigation.navigate(item.screen)}
              >
                <Ionicons name={item.icon as any} size={30} color="#ff6600" />
                <Text style={styles.cardText}>{item.title}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noAccessText}>No Access to Any Views</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '90%',
  },
  card: {
    backgroundColor: '#fff',
    width: '45%',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    margin: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  noAccessText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;
