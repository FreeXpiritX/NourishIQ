import * as React from 'react';
import { View, Text, Button, Alert } from 'react-native';

export default function ClientSwitcher(){
  const [client, setClient] = React.useState('Default');
  const next = ()=>{
    const names = ['Default','Alpha','Beta','Gamma'];
    const i = (names.indexOf(client)+1) % names.length;
    setClient(names[i]);
  };
  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontSize:18, fontWeight:'700', marginBottom:8}}>Client Switcher</Text>
      <Text>Current client: {client}</Text>
      <View style={{height:12}}/>
      <Button title="Switch client" onPress={()=>{ next(); Alert.alert('Switched', `Active client: ${client}`) }} />
      <Text style={{marginTop:16, fontSize:12, color:'#555'}}>This is a placeholder for multi-client context. Wire to API later.</Text>
    </View>
  );
}
