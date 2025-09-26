'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CreditManager } from '@/lib/credits/manager';

export default function TestCreditsPage() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [user, setUser] = useState(null);

  // Fetch current credits
  const fetchCredits = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        // Get credits from users table
        const { data: userData } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();
        
        setCredits(userData?.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // Add test credits
  const addTestCredits = async (amount = 200) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/credits/test-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Added ${amount} credits! New balance: ${data.newBalance}`);
        setCredits(data.newBalance);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test script generation deduction
  const testScriptGeneration = async (model = 'claude-3-5-haiku', duration = 600) => {
    setLoading(true);
    setMessage('Testing script generation credit deduction...');
    
    try {
      const response = await fetch('/api/workflow/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'outline',
          title: 'Test Script Generation',
          topic: 'Testing Credit Deduction System',
          model: model,
          targetDuration: duration,
          contentPoints: {
            points: [
              {
                title: 'Introduction',
                description: 'Opening hook',
                duration: duration / 3,
                keyTakeaway: 'Grab attention'
              },
              {
                title: 'Main Content',
                description: 'Core information',
                duration: duration / 3,
                keyTakeaway: 'Deliver value'
              },
              {
                title: 'Conclusion',
                description: 'Call to action',
                duration: duration / 3,
                keyTakeaway: 'Engage audience'
              }
            ]
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const newResult = {
          feature: 'Script Generation',
          model: model,
          duration: `${Math.ceil(duration / 60)} minutes`,
          creditsUsed: data.creditsUsed,
          success: true,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setTestResults([newResult, ...testResults]);
        setMessage(`✅ Script generated! Used ${data.creditsUsed} credits`);
        await fetchCredits(); // Refresh balance
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to generate script'}`);
        
        if (data.required && data.balance !== undefined) {
          setMessage(`❌ Insufficient credits: Need ${data.required}, have ${data.balance}`);
        }
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test other features
  const testFeature = async (feature, endpoint) => {
    setLoading(true);
    setMessage(`Testing ${feature}...`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Test Topic',
          content: 'Test content for credit deduction'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const newResult = {
          feature: feature,
          creditsUsed: data.creditsUsed || 'Unknown',
          success: true,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setTestResults([newResult, ...testResults]);
        setMessage(`✅ ${feature} completed!`);
        await fetchCredits(); // Refresh balance
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Credit System Testing</h1>
        
        {/* Current Balance */}
        <div className="bg-card rounded-lg p-6 mb-8 border">
          <h2 className="text-xl font-semibold mb-4">Current Balance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {credits !== null ? credits : '...'} credits
              </p>
              {user && (
                <p className="text-sm text-muted-foreground mt-2">
                  User: {user.email}
                </p>
              )}
            </div>
            <button
              onClick={fetchCredits}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Add Credits */}
        <div className="bg-card rounded-lg p-6 mb-8 border">
          <h2 className="text-xl font-semibold mb-4">Add Test Credits</h2>
          <div className="flex gap-4">
            <button
              onClick={() => addTestCredits(50)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              Add 50 Credits
            </button>
            <button
              onClick={() => addTestCredits(200)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              disabled={loading}
            >
              Add 200 Credits
            </button>
            <button
              onClick={() => addTestCredits(500)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              disabled={loading}
            >
              Add 500 Credits
            </button>
          </div>
        </div>

        {/* Test Deductions */}
        <div className="bg-card rounded-lg p-6 mb-8 border">
          <h2 className="text-xl font-semibold mb-4">Test Credit Deductions</h2>
          
          <div className="space-y-4">
            {/* Script Generation Tests */}
            <div>
              <h3 className="font-semibold mb-2">Script Generation</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => testScriptGeneration('claude-3-5-haiku', 300)}
                  className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  disabled={loading}
                >
                  Fast (5 min) ~2 credits
                </button>
                <button
                  onClick={() => testScriptGeneration('claude-3-5-haiku', 600)}
                  className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  disabled={loading}
                >
                  Fast (10 min) ~3 credits
                </button>
                <button
                  onClick={() => testScriptGeneration('claude-3-5-sonnet', 300)}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  disabled={loading}
                >
                  Professional (5 min) ~3 credits
                </button>
                <button
                  onClick={() => testScriptGeneration('claude-3-5-sonnet', 600)}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  disabled={loading}
                >
                  Professional (10 min) ~5 credits
                </button>
                <button
                  onClick={() => testScriptGeneration('claude-opus-4-1', 600)}
                  className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                  disabled={loading}
                >
                  Hollywood (10 min) ~12 credits
                </button>
              </div>
            </div>

            {/* Other Features */}
            <div>
              <h3 className="font-semibold mb-2">Other Features</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => testFeature('Title Generation', '/api/workflow/generate-titles')}
                  className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                  disabled={loading}
                >
                  Generate Titles
                </button>
                <button
                  onClick={() => testFeature('Hook Generation', '/api/workflow/generate-hooks')}
                  className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                  disabled={loading}
                >
                  Generate Hooks
                </button>
                <button
                  onClick={() => testFeature('Thumbnail Ideas', '/api/workflow/generate-thumbnail')}
                  className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                  disabled={loading}
                >
                  Generate Thumbnail
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-8 ${
            message.includes('✅') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            message.includes('❌') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-background rounded">
                  <div>
                    <span className="font-medium">{result.feature}</span>
                    {result.model && (
                      <span className="text-sm text-muted-foreground ml-2">({result.model})</span>
                    )}
                    {result.duration && (
                      <span className="text-sm text-muted-foreground ml-2">{result.duration}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{result.creditsUsed} credits</span>
                    <span className="text-xs text-muted-foreground ml-2">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}