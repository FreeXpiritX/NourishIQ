import * as React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { authedFetch } from '../utils/auth';

export default function Devices(){
  const connectApple = async ()=>{
    await authedFetch('/api/wearables/connect', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider:'apple', scopes:['activity','sleep','nutrition'] }) });
    Alert.alert('Connected', 'Apple Health (mock) connected');
  };
  const ingestDemo = async ()=>{
    const now = new Date().toISOString();
    const samples = [
      { provider:'apple', type:'sleep', value: 7.2, ts: now },
      { provider:'apple', type:'steps', value: 8500, ts: now },
      { provider:'apple', type:'hydration', value: 1.0, ts: now }
    ];
    await authedFetch('/api/wearables/ingest', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ samples }) });
    await authedFetch('/api/wearables/summarize', { method:'POST' });
    Alert.alert('Ingested', 'Sample data added & summarised');
  };
  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontSize:18, fontWeight:'700', marginBottom:8}}>Devices & Wearables</Text>
      <Button title="Connect Apple Health (mock)" onPress={connectApple} />
      <View style={{height:12}}/>
      <Button title="Ingest Demo Samples" onPress={ingestDemo} />
    </View>
  );
}
