// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import ProfitScreen from './screens/ProfitScreen';
import HomeScreen from './screens/HomeScreen';
import AllItemScreen from './screens/AllItemScreen';
import StockScreen from './screens/StockScreen';
import CustomerOutstandingScreen from './screens/CustomerOutstandingScreen';
import CreditBillScreen from './screens/CreditBillScreen';
import OrderFormScreen from './screens/OrderFormScreen';
import  { GlobalProvider } from './screens/GlobalContext';
import { RootStackParamList } from './types';

// Create the stack navigator
const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <GlobalProvider> 
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profit" component={ProfitScreen} />
        <Stack.Screen name="AllItems" component={AllItemScreen} />
        <Stack.Screen name="Stock" component={StockScreen} />
        <Stack.Screen name="CustomerOutstanding" component={CustomerOutstandingScreen} />
        <Stack.Screen name="CreditBill" component={CreditBillScreen} />
        <Stack.Screen name="OrderForm" component={OrderFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </GlobalProvider> 
  );
};

export default App;
