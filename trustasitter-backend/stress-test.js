// Stress Test Module for TrustaSitter Backend
// This module provides CPU-intensive operations to test VMSS auto-scaling

const crypto = require('crypto');
const { performance } = require('perf_hooks');

class StressTest {
           constructor() {
           this.isRunning = false;
           this.startTime = null;
           this.testDuration = 6 * 60 * 1000; // 6 minutes in milliseconds
         }

  // CPU-intensive prime number calculation
  calculatePrimes(max) {
    const primes = [];
    for (let i = 2; i <= max; i++) {
      let isPrime = true;
      for (let j = 2; j <= Math.sqrt(i); j++) {
        if (i % j === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) {
        primes.push(i);
      }
    }
    return primes;
  }

  // Memory-intensive operation
  generateLargeData(size) {
    const data = [];
    for (let i = 0; i < size; i++) {
      data.push({
        id: i,
        hash: crypto.randomBytes(32).toString('hex'),
        timestamp: Date.now(),
        data: crypto.randomBytes(1024).toString('base64')
      });
    }
    return data;
  }

  // CPU and memory intensive operation
  async intensiveOperation() {
    const start = performance.now();
    
    // Calculate large prime numbers
    const primes = this.calculatePrimes(100000);
    
    // Generate large data structures
    const largeData = this.generateLargeData(10000);
    
    // Perform complex calculations
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
    }
    
    // Hash operations
    const hashes = [];
    for (let i = 0; i < 1000; i++) {
      hashes.push(crypto.createHash('sha256').update(`stress-test-${i}-${Date.now()}`).digest('hex'));
    }
    
    const end = performance.now();
    return {
      duration: end - start,
      primesCount: primes.length,
      dataSize: largeData.length,
      result: result,
      hashesCount: hashes.length
    };
  }

  // Start stress test
  async startStressTest(duration = 5) {
    if (this.isRunning) {
      throw new Error('Stress test is already running');
    }

    this.isRunning = true;
    this.startTime = Date.now();
    this.testDuration = duration * 60 * 1000; // Convert minutes to milliseconds

    console.log(`🚀 Starting stress test for ${duration} minutes...`);
    console.log(`⏰ Start time: ${new Date().toISOString()}`);
    console.log(`🎯 Target duration: ${duration} minutes`);

    const results = [];
    let iteration = 0;

    while (this.isRunning && (Date.now() - this.startTime) < this.testDuration) {
      try {
        iteration++;
        const result = await this.intensiveOperation();
        results.push({
          iteration,
          timestamp: Date.now(),
          ...result
        });

        // Log progress every 10 iterations
        if (iteration % 10 === 0) {
          const elapsed = (Date.now() - this.startTime) / 1000;
          const remaining = (this.testDuration - (Date.now() - this.startTime)) / 1000;
          console.log(`📊 Iteration ${iteration} - Elapsed: ${elapsed.toFixed(1)}s, Remaining: ${remaining.toFixed(1)}s`);
        }

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error in iteration ${iteration}:`, error.message);
      }
    }

    this.isRunning = false;
    const totalDuration = (Date.now() - this.startTime) / 1000;
    
    const summary = {
      totalIterations: iteration,
      totalDuration: totalDuration,
      averageIterationTime: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      totalPrimesCalculated: results.reduce((sum, r) => sum + r.primesCount, 0),
      totalDataGenerated: results.reduce((sum, r) => sum + r.dataSize, 0),
      totalHashesGenerated: results.reduce((sum, r) => sum + r.hashesCount, 0),
      results: results
    };

    console.log(`✅ Stress test completed!`);
    console.log(`📈 Summary:`, summary);
    
    return summary;
  }

  // Stop stress test
  stopStressTest() {
    if (!this.isRunning) {
      throw new Error('No stress test is currently running');
    }

    this.isRunning = false;
    const duration = (Date.now() - this.startTime) / 1000;
    console.log(`⏹️ Stress test stopped after ${duration.toFixed(1)} seconds`);
    
    return {
      stopped: true,
      duration: duration
    };
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      startTime: this.startTime,
      elapsed: this.isRunning ? (Date.now() - this.startTime) / 1000 : 0,
      testDuration: this.testDuration / 1000
    };
  }

  // Full CPU test (6 minutes)
  async fullTest() {
    console.log('🚀 Starting full CPU stress test (6 minutes)...');
    return await this.startStressTest(6);
  }
}

module.exports = StressTest; 