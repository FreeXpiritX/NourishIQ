import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Image, Text } from 'react-native';
import Reports from './screens/Reports';
import Predict from './screens/Predict';
import Devices from './screens/Devices';
import Login from './screens/Login';
import ClientSwitcher from './screens/ClientSwitcher';
import { tokenStore } from './utils/auth';

const Tab = createBottomTabNavigator();

function BrandHeader(){
  return (
    <View style={{flexDirection:'row', alignItems:'center', gap:8, padding:12}}>
      <Image source={require('../assets/logomark.png')} style={{width:20, height:20}} />
      <Text style={{fontWeight:'700'}}>NourishIQ</Text>
    </View>
  );
}

export default function App(){
  const [ready, setReady] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);

  React.useEffect(()=>{
    (async ()=>{
      const t = await tokenStore.get();
      setAuthed(!!t);
      setReady(true);
    })();
  }, []);

  if(!ready){
    return <View style={{flex:1, alignItems:'center', justifyContent:'center'}}><Text>Loading…</Text></View>
  }

  return (
    <NavigationContainer theme={{...DefaultTheme}}>
      {!authed ? (
        <Login onSuccess={()=>setAuthed(true)} />
      ) : (
        <Tab.Navigator screenOptions={{ headerTitle: ()=><BrandHeader/> }}>
          <Tab.Screen name="Reports" component={Reports} />
          <Tab.Screen name="Predict" component={Predict} />
          <Tab.Screen name="Devices" component={Devices} />
          <Tab.Screen name="Clients" component={ClientSwitcher} />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}
