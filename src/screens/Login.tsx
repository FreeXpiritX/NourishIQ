import * as React from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { tokenStore } from '../utils/auth';

export default function Login({ onSuccess }: { onSuccess: ()=>void }){
  const [email, setEmail] = React.useState('demo@nourishiq.org');
  const [password, setPassword] = React.useState('password');

  const doLogin = async ()=>{
    try{
      // For MVP, accept demo credentials and set a placeholder token.
      if(email && password){
        await tokenStore.set('DEV_TOKEN_PLACEHOLDER');
        onSuccess();
      } else {
        Alert.alert('Error', 'Enter email and password');
      }
    }catch(e:any){
      Alert.alert('Login failed', e?.message||'Unknown error');
    }
  };

  return (
    <View style={{flex:1, alignItems:'center', justifyContent:'center', padding:24}}>
      <Text style={{fontSize:20, fontWeight:'700', marginBottom:12}}>Welcome to NourishIQ</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{width:'100%', borderWidth:1, borderColor:'#ddd', padding:10, borderRadius:10, marginBottom:8}} />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} style={{width:'100%', borderWidth:1, borderColor:'#ddd', padding:10, borderRadius:10, marginBottom:12}} />
      <Button title="Log in" onPress={doLogin} />
      <Text style={{marginTop:16, fontSize:12, color:'#555'}}>This is a demo login for local builds. Replace with Auth0/Cognito later.</Text>
    </View>
  );
}
