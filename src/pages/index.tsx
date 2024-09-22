import React, { useState } from 'react';
import axiosInstance from './api/axiosInstance';
import Image from 'next/image';



interface RiskInfo {
  is_address_valid: boolean,
  risk_level: string,
  risk_score: string,
  verdict_time: string,
  categories: string[]
  details: string[]
}

export default function Home() {
  const [address, setAddress] = useState<string>('');
  const [riskInfo, setRiskInfo] = useState<RiskInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<String | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  }

  const getRiskScore = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/risk-score', { address });
      setRiskInfo(response.data.risk_info);
    } catch (err) {
      setError('Error fetching risk score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-main-image bg-cover bg-center flex items-center justify-center p-4">
      {/* Increase the size of the logo */}
      <div className="absolute top-4 left-4 w-40 h-40">
        <Image 
          src="/images/coreum-logo.png" // Path to the logo
          alt="Coreum Logo"
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span className="text-gray-300">Risk Score Checker on</span>{' '}
          <span className="text-green-500">Coreum</span>
        </h1>
        
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <p className="text-gray-300 text-sm mb-4">
            Check the risk score of a Coreum address to determine its security status and potential risks.
          </p>
          
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium mb-1 text-gray-400">Address</label>
            <input
              id="address"
              type="text"
              placeholder="Enter Coreum Address"
              value={address}
              onChange={handleInputChange}
              className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-200 placeholder-gray-500"
            />
          </div>
          
          <button 
            onClick={getRiskScore}
            className={`w-full px-4 py-2 rounded font-semibold transition-colors ${
              loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Risk Score'}
          </button>
          
          {error && <p className="text-red-500 mt-4">{error}</p>}
          
          {riskInfo && (
            <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-200">Risk Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium text-gray-400">Is Address Valid:</span> {riskInfo.is_address_valid ? 'Yes' : 'No'}</p>
                <p><span className="font-medium text-gray-400">Risk Level:</span> {riskInfo.risk_level}</p>
                <p><span className="font-medium text-gray-400">Risk Score:</span> {riskInfo.risk_score}</p>
                <p><span className="font-medium text-gray-400">Verdict Time:</span> {riskInfo.verdict_time}</p>
                <p><span className="font-medium text-gray-400">Categories:</span> {riskInfo.categories.join(', ')}</p>
                <p><span className="font-medium text-gray-400">Details:</span> {riskInfo.details.join(', ') || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
