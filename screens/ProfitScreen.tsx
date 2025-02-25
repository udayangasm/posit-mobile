import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, Button, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useGlobalValue } from './GlobalContext';

const ProfitScreen = ({ navigation }: any) => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [salesValue, setSalesValue] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [profit, setProfit] = useState('');
  const [showFromDatePicker, setFromDateShowPicker] = useState(false);
  const [showToDatePicker, setToDateShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { token, verifiedUserName } = useGlobalValue();

  const onChangeFromDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setFromDate(selectedDate);
    }
    setFromDateShowPicker(false);
  };

  const onChangeToDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setToDate(selectedDate);
    }
    setToDateShowPicker(false);
  };

  const showFromDateTimePicker = () => {
    setFromDateShowPicker(true);
  };

  const showToDateTimePicker = () => {
    setToDateShowPicker(true);
  };

  const handleProfitRequest = async () => {
    setLoading(true);
    setErrorMessage(''); // Reset error message on new request

    try {
      const response = await fetch('https://positnow.com:8010/profit/getAllProfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fromDate: fromDate,
          toDate: toDate,
          salesRefId: 0 // Adjust based on your API requirements
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSalesValue(parseFloat(data.salesValue).toFixed(2)); // Round to 2 decimal places
        setUnitCost(parseFloat(data.unitCost).toFixed(2)); // Round to 2 decimal places

        const sales = parseFloat(data.salesValue);
        const cost = parseFloat(data.unitCost);
        const calculatedProfit = sales - cost;

        setProfit(calculatedProfit.toFixed(2)); // Show profit with two decimals
      } else {
        setErrorMessage('Failed to fetch profit data.');
      }
    } catch (error) {
      setErrorMessage('Error occurred while fetching the data.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    header: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: '#333',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 15,
      marginBottom: 15,
      borderRadius: 12,
      backgroundColor: '#fff',
      fontSize: 16,
    },
    button: {
      backgroundColor: '#4CAF50',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      elevation: 3,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    resultContainer: {
      marginTop: 30,
      padding: 20,
      backgroundColor: '#fff',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
    resultText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    valueText: {
      fontSize: 16,
      color: '#555',
      textAlign: 'right',  // Align value to the right
      width: 100,  // Ensure values are aligned in a column
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      marginTop: 20,
      textAlign: 'center',
    },
    dateInput: {
      padding: 15,
      marginBottom: 20,
      borderRadius: 12,
      backgroundColor: '#fff',
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    dateLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    backButton: {
      backgroundColor: '#ff6600',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 30,
      elevation: 3,
    },
    backButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">


        {/* From Date Picker */}
        <Text style={styles.dateLabel}>From Date</Text>
        <TouchableOpacity onPress={showFromDateTimePicker}>
          <TextInput pointerEvents="none" value={fromDate.toDateString()} editable={false} style={styles.dateInput} />
        </TouchableOpacity>
        {showFromDatePicker && (
          <DateTimePicker value={fromDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeFromDate} />
        )}

        {/* To Date Picker */}
        <Text style={styles.dateLabel}>To Date</Text>
        <TouchableOpacity onPress={showToDateTimePicker}>
          <TextInput pointerEvents="none" value={toDate.toDateString()} editable={false} style={styles.dateInput} />
        </TouchableOpacity>
        {showToDatePicker && (
          <DateTimePicker value={toDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeToDate} />
        )}

        {/* Button to fetch profit data */}
        <TouchableOpacity onPress={handleProfitRequest} disabled={loading} style={styles.button}>
          <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Find Profit'}</Text>
        </TouchableOpacity>

        {/* Display Results */}
        {loading ? (
          <ActivityIndicator size="large" color="#ff6600" />
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.resultText}>
              <Text style={{ flex: 1 }}>Sales Value:</Text>
              <Text style={styles.valueText}>{salesValue}</Text>
            </View>
            <View style={styles.resultText}>
              <Text style={{ flex: 1 }}>Unit Cost:</Text>
              <Text style={styles.valueText}>{unitCost}</Text>
            </View>
            <View style={styles.resultText}>
              <Text style={{ flex: 1 }}>Profit:</Text>
              <Text style={styles.valueText}>{profit}</Text>
            </View>
          </View>
        )}

        {/* Show error message */}
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfitScreen;
