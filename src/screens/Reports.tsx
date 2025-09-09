import * as React from 'react';
import { View, Text, Button, Linking } from 'react-native';
import { authedFetch } from '../utils/auth';

export default function Reports(){
  const [url, setUrl] = React.useState<string| null>(null);
  const [loading, setLoading] = React.useState(false);

  const generate = async ()=>{
    setLoading(true);
    try{
      const r = await authedFetch('/api/reports/generate?type=weekly');
      const j = await r.json();
      setUrl(j?.url || null);
    }finally{
      setLoading(false);
    }
  };

  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontSize:18, fontWeight:'700', marginBottom:8}}>Reports</Text>
      <Button title={loading ? 'Generating…' : 'Generate Weekly Report'} onPress={generate} />
      {url && (
        <View style={{marginTop:12}}>
          <Button title="Open Report" onPress={()=>Linking.openURL(url)} />
        </View>
      )}
    </View>
  );
}
