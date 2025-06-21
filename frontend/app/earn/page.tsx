"use client";

import { useState } from "react";

export default function Earn() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiList, setApiList] = useState<any[]>([]);
  const [selectedApi, setSelectedApi] = useState<any | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [apiId, setApiId] = useState<string | null>(null);
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }
    setLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = accounts[0];
      setAddress(userAddress);
      // Call your backend API with the address
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/earnings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: userAddress }),
      });
      const data = await resp.json();
      // If apiIds array present, fetch metadata for each
      if (data.apiIds && Array.isArray(data.apiIds)) {
        const apisWithMeta = await Promise.all(
          data.apiIds.map(async (api: any) => {
            try {
              // Fetch metadata from IPFS using cid
              const resp = await fetch(`https://gateway.pinata.cloud/ipfs/${api.cid}`);
              const meta = await resp.json();
              // Attach _id as apiId for clarity
              return { ...api, ...meta, apiId: api._id || api.apiId,cid: api.cid };
            } catch (e) {
              return { ...api, name: api.cid, error: 'Failed to fetch metadata', apiId: api._id || api.apiId };
            }
          })
        );
        setApiList(apisWithMeta);
        setApiResponse(null);
        // Always select first API after refresh, or null if none
        if (apisWithMeta.length > 0) setSelectedApi(apisWithMeta[0]);
        else setSelectedApi(null);
      } else {
        setApiList([]);
        setSelectedApi(null);
        setApiResponse("No APIs found");
      }
    } catch (err) {
      setApiResponse("Failed to connect or call API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="brutalist-container flex flex-col" style={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: 32, background: '#fff', border: '3px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 12 }}>
        <h2 style={{ fontWeight: 900, fontSize: 28, marginBottom: 24 }}>Earn</h2>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Connect your wallet to start earning with AiPI.</p>
        <button
          onClick={connectWallet}
          disabled={loading}
          style={{
            padding: '16px 32px',
            fontWeight: 900,
            fontSize: 18,
            border: '3px solid #000',
            background: '#f0f0f0',
            boxShadow: '4px 4px 0 #000',
            borderRadius: 8,
            marginBottom: 20,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Connecting...' : address ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
        {address && (
          <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 700 }}>
            Connected Address: <span style={{ fontFamily: 'monospace' }}>{address}</span>
          </div>
        )}
        {apiList.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <label htmlFor="api-dropdown" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>Select an API to claim earnings:</label>
            <select
              id="api-dropdown"
              value={selectedApi ? selectedApi.apiId : ''}
              onChange={e => {
                const found = apiList.find(api => String(api.apiId) === String(e.target.value));
                setSelectedApi(found || null);
              }}
              style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '2px solid #000', width: '100%', marginBottom: 16 }}
            >
              <option value="" disabled>Select API</option>
              {apiList.map(api => (
                <option key={api.apiId} value={api.apiId}>
                  {api.name || api.cid} (Earnings: {api.earning ?? 0})
                </option>
              ))}
            </select>
            <button
              disabled={!selectedApi || claiming}
              style={{
                padding: '12px 24px',
                fontWeight: 800,
                fontSize: 16,
                border: '2px solid #000',
                background: '#e0ffe0',
                borderRadius: 6,
                cursor: !selectedApi || claiming ? 'not-allowed' : 'pointer',
                marginBottom: 12,
              }}
              onClick={async () => {
                if (!selectedApi) return;
                setClaiming(true);
                try {
                  console.log(selectedApi);
                  const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/claim`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiId: selectedApi.cid }),
                  });
                  const result = await resp.json();
                  setApiResponse(JSON.stringify(result, null, 2));
                } catch (err) {
                  setApiResponse('Failed to claim earnings');
                } finally {
                  setClaiming(false);
                }
              }}
            >
              {claiming ? 'Claiming...' : 'Claim Earnings'}
            </button>
          </div>
        )}
        {apiResponse && (
          <pre style={{ background: '#f8f8f8', padding: 16, border: '2px solid #000', borderRadius: 8, fontSize: 13, marginTop: 16 }}>{apiResponse}</pre>
        )}
      </div>
    </div>
  );
}