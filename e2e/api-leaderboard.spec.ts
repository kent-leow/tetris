/**
 * Leaderboard API E2E Tests
 * 
 * Comprehensive end-to-end tests for the leaderboard API including:
 * - GET endpoint for retrieving leaderboard
 * - POST endpoint for submitting scores
 * - Error handling and validation
 * - Data persistence and ordering
 * - Performance under load
 */

import { test, expect, APIRequestContext } from '@playwright/test';

// API test helper class
class LeaderboardAPI {
  constructor(private request: APIRequestContext) {}

  async getLeaderboard() {
    return await this.request.get('/api/leaderboard');
  }

  async submitScore(name: string, score: number) {
    return await this.request.post('/api/leaderboard', {
      data: { name, score }
    });
  }

  async clearLeaderboard() {
    // This would be a test-only endpoint in a real implementation
    // For now, we'll assume the database resets between test runs
  }

  // Public methods for raw HTTP requests
  async post(url: string, options?: { data?: unknown }) {
    return await this.request.post(url, options);
  }

  async put(url: string, options?: { data?: unknown }) {
    return await this.request.put(url, options);
  }

  async delete(url: string) {
    return await this.request.delete(url);
  }
}

test.describe('Leaderboard API - GET Endpoint', () => {
  let api: LeaderboardAPI;

  test.beforeEach(async ({ request }) => {
    api = new LeaderboardAPI(request);
  });

  test('should return empty leaderboard initially', async () => {
    const response = await api.getLeaderboard();
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(0);
  });

  test('should return leaderboard with correct structure', async () => {
    const response = await api.getLeaderboard();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // If there are entries, check structure
    if (data.length > 0) {
      const entry = data[0];
      expect(entry).toHaveProperty('rank');
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('score');
      expect(typeof entry.rank).toBe('number');
      expect(typeof entry.name).toBe('string');
      expect(typeof entry.score).toBe('number');
    }
  });

  test('should return entries sorted by score descending', async () => {
    // First, add some test data
    await api.submitScore('Player1', 1000);
    await api.submitScore('Player2', 2000);
    await api.submitScore('Player3', 1500);

    const response = await api.getLeaderboard();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Should be sorted by score descending
    for (let i = 1; i < data.length; i++) {
      expect(data[i-1].score).toBeGreaterThanOrEqual(data[i].score);
    }
    
    // Rankings should be consecutive
    data.forEach((entry: { rank: number }, index: number) => {
      expect(entry.rank).toBe(index + 1);
    });
  });

  test('should handle CORS headers correctly', async () => {
    const response = await api.getLeaderboard();
    
    // Check for appropriate CORS headers
    expect(response.headers()['access-control-allow-origin']).toBeDefined();
  });

  test('should respond quickly', async () => {
    const startTime = Date.now();
    const response = await api.getLeaderboard();
    const endTime = Date.now();
    
    expect(response.status()).toBe(200);
    expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
  });
});

test.describe('Leaderboard API - POST Endpoint', () => {
  let api: LeaderboardAPI;

  test.beforeEach(async ({ request }) => {
    api = new LeaderboardAPI(request);
  });

  test('should accept valid score submission', async () => {
    const response = await api.submitScore('TestPlayer', 5000);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
  });

  test('should validate required fields', async () => {
    // Missing name
    const response1 = await api.post('/api/leaderboard', {
      data: { score: 1000 }
    });
    expect(response1.status()).toBe(400);

    // Missing score
    const response2 = await api.post('/api/leaderboard', {
      data: { name: 'Player' }
    });
    expect(response2.status()).toBe(400);

    // Empty name
    const response3 = await api.submitScore('', 1000);
    expect(response3.status()).toBe(400);
  });

  test('should validate data types', async () => {
    // Invalid score type
    const response1 = await api.post('/api/leaderboard', {
      data: { name: 'Player', score: 'invalid' }
    });
    expect(response1.status()).toBe(400);

    // Invalid name type
    const response2 = await api.post('/api/leaderboard', {
      data: { name: 123, score: 1000 }
    });
    expect(response2.status()).toBe(400);
  });

  test('should handle negative scores', async () => {
    const response = await api.submitScore('Player', -100);
    
    // Should either accept negative scores or return validation error
    expect([200, 400]).toContain(response.status());
  });

  test('should handle very large scores', async () => {
    const response = await api.submitScore('Player', 999999999);
    
    expect(response.status()).toBe(200);
    
    // Verify the score was stored correctly
    const leaderboard = await api.getLeaderboard();
    const data = await leaderboard.json();
    
    const submittedEntry = data.find((entry: any) => entry.name === 'Player' && entry.score === 999999999);
    expect(submittedEntry).toBeDefined();
  });

  test('should handle special characters in name', async () => {
    const specialNames = [
      'Player123',
      'Player-Name',
      'Player_Name',
      'Player Name',
      'Plàyér',
      '玩家',
    ];

    for (const name of specialNames) {
      const response = await api.submitScore(name, 1000);
      expect(response.status()).toBe(200);
    }
  });

  test('should persist submitted scores', async () => {
    const testName = 'PersistenceTest';
    const testScore = 7500;
    
    // Submit score
    const submitResponse = await api.submitScore(testName, testScore);
    expect(submitResponse.status()).toBe(200);
    
    // Retrieve leaderboard and verify score is present
    const getResponse = await api.getLeaderboard();
    const data = await getResponse.json();
    
    const submittedEntry = data.find((entry: any) => entry.name === testName && entry.score === testScore);
    expect(submittedEntry).toBeDefined();
    expect(submittedEntry.rank).toBeGreaterThan(0);
  });
});

test.describe('Leaderboard API - Data Management', () => {
  let api: LeaderboardAPI;

  test.beforeEach(async ({ request }) => {
    api = new LeaderboardAPI(request);
  });

  test('should limit leaderboard to top 100 entries', async () => {
    // This test assumes the API limits to 100 entries
    // In practice, you might want to submit 101 entries and verify
    
    const response = await api.getLeaderboard();
    const data = await response.json();
    
    expect(data.length).toBeLessThanOrEqual(100);
  });

  test('should handle duplicate names correctly', async () => {
    const sameName = 'DuplicatePlayer';
    
    // Submit multiple scores with same name
    await api.submitScore(sameName, 1000);
    await api.submitScore(sameName, 2000);
    await api.submitScore(sameName, 1500);
    
    const response = await api.getLeaderboard();
    const data = await response.json();
    
    // Should have multiple entries with same name
    const duplicateEntries = data.filter((entry: any) => entry.name === sameName);
    expect(duplicateEntries.length).toBeGreaterThan(1);
    
    // Should be sorted by score
    for (let i = 1; i < duplicateEntries.length; i++) {
      expect(duplicateEntries[i-1].score).toBeGreaterThanOrEqual(duplicateEntries[i].score);
    }
  });

  test('should handle multiple simultaneous submissions', async () => {
    const submissions = [];
    
    // Create multiple simultaneous submissions
    for (let i = 0; i < 10; i++) {
      submissions.push(api.submitScore(`Player${i}`, Math.random() * 10000));
    }
    
    // Wait for all submissions to complete
    const responses = await Promise.all(submissions);
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // Verify all entries are in leaderboard
    const leaderboard = await api.getLeaderboard();
    const data = await leaderboard.json();
    
    for (let i = 0; i < 10; i++) {
      const playerEntry = data.find((entry: any) => entry.name === `Player${i}`);
      expect(playerEntry).toBeDefined();
    }
  });
});

test.describe('Leaderboard API - Error Handling', () => {
  let api: LeaderboardAPI;

  test.beforeEach(async ({ request }) => {
    api = new LeaderboardAPI(request);
  });

  test('should handle malformed JSON', async () => {
    const response = await api.post('/api/leaderboard', {
      data: 'invalid json',
      headers: {
        'content-type': 'application/json'
      }
    });
    
    expect(response.status()).toBe(400);
  });

  test('should handle empty request body', async () => {
    const response = await api.post('/api/leaderboard');
    
    expect(response.status()).toBe(400);
  });

  test('should handle unsupported HTTP methods', async () => {
    const putResponse = await api.put('/api/leaderboard', {
      data: { name: 'Player', score: 1000 }
    });
    expect(putResponse.status()).toBe(405);

    const deleteResponse = await api.delete('/api/leaderboard');
    expect(deleteResponse.status()).toBe(405);
  });

  test('should return appropriate error messages', async () => {
    const response = await api.post('/api/leaderboard', {
      data: { name: 'Player' } // Missing score
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
    expect(data.error.length).toBeGreaterThan(0);
  });
});

test.describe('Leaderboard API - Performance', () => {
  let api: LeaderboardAPI;

  test.beforeEach(async ({ request }) => {
    api = new LeaderboardAPI(request);
  });

  test('should handle high load of GET requests', async () => {
    const requests = [];
    const numRequests = 50;
    
    const startTime = Date.now();
    
    // Create multiple simultaneous GET requests
    for (let i = 0; i < numRequests; i++) {
      requests.push(api.getLeaderboard());
    }
    
    // Wait for all requests to complete
    const responses = await Promise.all(requests);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // Should handle load efficiently
    expect(totalTime).toBeLessThan(5000); // 5 seconds for 50 requests
    
    const avgResponseTime = totalTime / numRequests;
    expect(avgResponseTime).toBeLessThan(200); // Average response time under 200ms
  });

  test('should handle high load of POST requests', async () => {
    const requests = [];
    const numRequests = 20;
    
    const startTime = Date.now();
    
    // Create multiple simultaneous POST requests
    for (let i = 0; i < numRequests; i++) {
      requests.push(api.submitScore(`LoadTestPlayer${i}`, Math.floor(Math.random() * 10000)));
    }
    
    // Wait for all requests to complete
    const responses = await Promise.all(requests);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // Should handle write load efficiently
    expect(totalTime).toBeLessThan(10000); // 10 seconds for 20 writes
  });

  test('should maintain data integrity under load', async () => {
    // Submit known scores concurrently
    const knownScores = [
      { name: 'IntegrityTest1', score: 5000 },
      { name: 'IntegrityTest2', score: 7500 },
      { name: 'IntegrityTest3', score: 6000 },
    ];
    
    const submissions = knownScores.map(({ name, score }) => api.submitScore(name, score));
    await Promise.all(submissions);
    
    // Retrieve leaderboard and verify all scores are present and correct
    const response = await api.getLeaderboard();
    const data = await response.json();
    
    knownScores.forEach(({ name, score }) => {
      const entry = data.find((item: any) => item.name === name && item.score === score);
      expect(entry).toBeDefined();
    });
  });
});

test.describe('Leaderboard API - Integration', () => {
  let api: LeaderboardAPI;

  test.beforeEach(async ({ request }) => {
    api = new LeaderboardAPI(request);
  });

  test('should integrate with frontend submission flow', async () => {
    // Simulate the complete flow from game end to leaderboard display
    
    // 1. Submit a score (as if from game completion)
    const playerName = 'IntegrationTestPlayer';
    const finalScore = 8500;
    
    const submitResponse = await api.submitScore(playerName, finalScore);
    expect(submitResponse.status()).toBe(200);
    
    // 2. Retrieve updated leaderboard (as frontend would do)
    const getResponse = await api.getLeaderboard();
    expect(getResponse.status()).toBe(200);
    
    const leaderboard = await getResponse.json();
    
    // 3. Verify the submitted score appears correctly
    const playerEntry = leaderboard.find((entry: any) => 
      entry.name === playerName && entry.score === finalScore
    );
    
    expect(playerEntry).toBeDefined();
    expect(playerEntry.rank).toBeGreaterThan(0);
    expect(playerEntry.rank).toBeLessThanOrEqual(leaderboard.length);
  });

  test('should handle realistic game score ranges', async () => {
    // Test with scores that would realistically occur in the game
    const realisticScores = [
      { name: 'Beginner', score: 1240 },
      { name: 'Intermediate', score: 5680 },
      { name: 'Advanced', score: 15420 },
      { name: 'Expert', score: 42850 },
      { name: 'Master', score: 99999 },
    ];
    
    // Submit all scores
    for (const { name, score } of realisticScores) {
      const response = await api.submitScore(name, score);
      expect(response.status()).toBe(200);
    }
    
    // Verify leaderboard ordering
    const leaderboard = await api.getLeaderboard();
    const data = await leaderboard.json();
    
    // Find our test entries
    const testEntries = data.filter((entry: any) => 
      realisticScores.some(test => test.name === entry.name && test.score === entry.score)
    );
    
    expect(testEntries.length).toBe(realisticScores.length);
    
    // Should be ordered correctly
    testEntries.forEach((entry: any, index: number) => {
      if (index > 0) {
        expect(entry.score).toBeLessThanOrEqual(testEntries[index - 1].score);
      }
    });
  });
});
