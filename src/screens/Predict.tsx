import * as React from 'react';
import { View, Text, Button } from 'react-native';
import { authedFetch } from '../utils/auth';

export default function Predict(){
  const [risks, setRisks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = async ()=>{
    setLoading(true);
    try{
      const r = await authedFetch('/api/predict/risks');
      const j = await r.json();
      setRisks(j?.risks||[]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(()=>{ load(); }, []);

  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontSize:18, fontWeight:'700', marginBottom:8}}>Wellness Radar</Text>
      {loading && <Text>Loading…</Text>}
      {!loading && risks.length===0 && <Text>No current risks detected.</Text>}
      {risks.map((r, idx)=>(
        <View key={idx} style={{marginVertical:6}}>
          <Text style={{fontWeight:'600'}}>{r.type.toUpperCase()}</Text>
          <View style={{height:10, backgroundColor:'#eee', borderRadius:6, overflow:'hidden'}}>
            <View style={{height:10, width:`${Math.min(100, Math.round((r.probability||0)*100))}%`, backgroundColor: (r.probability||0)>0.7?'#E53E3E':(r.probability||0)>0.4?'#D69E2E':'#38A169'}} />
          </View>
          <Text style={{fontSize:12, color:'#555', marginTop:4}}>{r.explanation}</Text>
        </View>
      ))}
      <Button title="Refresh" onPress={load} />
    </View>
  );
}
