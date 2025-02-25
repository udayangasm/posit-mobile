import React from 'react';
import { SafeAreaView, Text, StyleSheet, View } from 'react-native';

const OrderFormScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Centered message for development */}
      <View style={styles.messageContainer}>
        <Text style={styles.developmentMessage}>Still in Development</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
    backgroundColor: '#f5f5f5', // Background color of the screen
  },
  messageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  developmentMessage: {
    fontSize: 40, // Big text size
    fontWeight: 'bold',
    color: 'orange', // Make it noticeable
    textAlign: 'center', // Center align the text
  },
});

export default OrderFormScreen;
