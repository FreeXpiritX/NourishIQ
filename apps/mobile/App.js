import React, { useEffect, useState } from "react";
import { Platform, View, ScrollView, Text, TextInput, Button } from "react-native";

const API = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8083";

export default function App() {
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function getHealth() {
    try {
      const res = await fetch(`${API}/api/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setHealth(json);
    } catch (e) {
      setHealth(null);
    }
  }

  async function loadUsers() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/api/users`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setUsers(json);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function createDemoUser() {
    setLoading(true);
    setErr(null);
    try {
      const ts = Date.now();
      const body = {
        name: name?.trim() || `Demo ${ts}`,
        email: email?.trim() || `demo+${ts}@example.com`,
      };
      const res = await fetch(`${API}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 409) {
        const j = await res.json();
        throw new Error(j?.error || "Email already in use");
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadUsers();
      setName("");
      setEmail("");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function deleteFirstUser() {
    if (!users.length) return;
    const id = users[0].id;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadUsers();
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function resetUsers() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/api/users`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadUsers();
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getHealth();
    loadUsers();
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === "ios" ? 48 : 16, paddingHorizontal: 16 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 6 }}>NourishIQ (Dev)</Text>
        <Text style={{ color: "#666", marginBottom: 10 }}>API: {API}</Text>

        <View style={{ marginBottom: 10 }}>
          <Button title="Reload Health" onPress={getHealth} />
        </View>
        <Text>Health: {health ? JSON.stringify(health) : "unknown"}</Text>

        <View style={{ height: 16 }} />

        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "600" }}>Create user</Text>
          <TextInput
            placeholder="Name (optional — default Demo + timestamp)"
            value={name}
            onChangeText={setName}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
            }}
          />
          <TextInput
            placeholder="Email (optional — default demo+timestamp@example.com)"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
            }}
          />
          <Button title={loading ? "Working…" : "Create Demo User"} onPress={createDemoUser} />
        </View>

        <View style={{ height: 16 }} />
        <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Button title="Reload Users" onPress={loadUsers} />
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Button title="Delete First User" color="#b00020" onPress={deleteFirstUser} />
          </View>
        </View>

        <View style={{ height: 10 }} />
        <Button title="Reset ALL Users (dev)" color="#8a2be2" onPress={resetUsers} />

        <View style={{ height: 20 }} />
        {err ? (
          <>
            <Text style={{ color: "red", fontWeight: "700" }}>Error</Text>
            <Text selectable>{err}</Text>
            <View style={{ height: 10 }} />
          </>
        ) : null}

        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 6 }}>Users</Text>
        {loading && <Text>Loading…</Text>}
        {!loading && users.length === 0 && <Text>No users yet. Create one above.</Text>}
        {users.map((u) => (
          <View key={u.id} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
            <Text style={{ fontWeight: "600" }}>{u.name}</Text>
            <Text style={{ color: "#555" }}>{u.email}</Text>
            <Text style={{ color: "#999", fontSize: 12 }}>id: {u.id}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
