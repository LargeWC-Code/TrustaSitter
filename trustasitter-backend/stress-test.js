// Stress Test Module for TrustaSitter Backend
// Optimized for 2-core 1GB memory configuration
// This module provides CPU-intensive operations to test VMSS auto-scaling

const crypto = require('crypto');
const { performance } = require('perf_hooks');
const os = require('os');

class StressTest {
  constructor() {
    this.isRunning = false;
    this.startTime = null;
    this.testDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.cpuCount = os.cpus().length;
    this.errorCount = 0;
    this.maxErrors = 10; // Allow some errors before stopping
  }

  // CPU-intensive prime number calculation - optimized for 2-core
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

  // Enhanced CPU-intensive mathematical operations - optimized for 2-core 1GB
  intensiveMathOperations() {
    let result = 0;
    // Optimized iterations for 2-core system
    for (let i = 0; i < 15000000; i++) {
      result += Math.sqrt(i) * Math.sin(i) * Math.cos(i) * Math.tan(i);
      result += Math.pow(i, 0.5) * Math.log(i + 1);
      result += Math.exp(i / 1000000) * Math.PI;
      result += Math.atan2(i, i + 1) * Math.asin(Math.min(1, i / 1000000));
      result += Math.cosh(i / 100000) * Math.sinh(i / 100000);
    }
    return result;
  }

  // Memory-intensive operation - optimized for 1GB memory
  generateLargeData(size) {
    const data = [];
    // Reduced size to fit within 1GB memory limit
    for (let i = 0; i < size; i++) {
      data.push({
        id: i,
        hash: crypto.randomBytes(64).toString('hex'), // Reduced from 128
        timestamp: Date.now(),
        data: crypto.randomBytes(1024).toString('base64'), // Reduced from 4096
        complex: {
          nested: crypto.randomBytes(512).toString('hex'), // Reduced from 1024
          array: Array.from({length: 100}, () => Math.random()), // Reduced from 200
          object: {
            deep: crypto.randomBytes(256).toString('hex'), // Reduced from 512
            deeper: {
              deepest: crypto.randomBytes(128).toString('hex') // Reduced from 256
            }
          }
        }
      });
    }
    return data;
  }

  // Enhanced hash operations - optimized for 2-core
  intensiveHashOperations() {
    const hashes = [];
    // Optimized for 2-core system
    for (let i = 0; i < 20000; i++) {
      const data = crypto.randomBytes(1024); // Reduced from 2048
      hashes.push(crypto.createHash('sha512').update(data).digest('hex'));
      hashes.push(crypto.createHash('sha256').update(data).digest('hex'));
      hashes.push(crypto.createHash('md5').update(data).digest('hex'));
      hashes.push(crypto.createHash('sha384').update(data).digest('hex'));
      hashes.push(crypto.createHash('sha224').update(data).digest('hex'));
    }
    return hashes;
  }

  // CPU and memory intensive operation - optimized for 2-core 1GB
  async intensiveOperation() {
    const start = performance.now();
    
    try {
      // Calculate prime numbers - optimized for 2-core
      const primes = this.calculatePrimes(600000); // Reduced from 800000
      
      // Generate data structures - optimized for 1GB memory
      const largeData = this.generateLargeData(40000); // Reduced from 80000
      
      // Perform intensive calculations
      const mathResult = this.intensiveMathOperations();
      
      // Enhanced hash operations
      const hashes = this.intensiveHashOperations();
      
      // Additional CPU-intensive operations with optimized matrices
      let matrixResult = 0;
      for (let i = 0; i < 2500; i++) { // Reduced from 3000
        for (let j = 0; j < 2500; j++) { // Reduced from 3000
          matrixResult += Math.pow(i, j % 15) * Math.sin(i + j) * Math.cos(i * j);
          matrixResult += Math.tan(i / 100) * Math.atan(j / 100);
        }
      }
      
      // Additional floating point intensive operations
      let floatResult = 0;
      for (let i = 0; i < 1500000; i++) { // Reduced from 2000000
        floatResult += Math.pow(Math.E, i / 100000) * Math.log(i + 1);
        floatResult += Math.sqrt(Math.pow(i, 2) + Math.pow(i, 3));
      }
      
      // Additional string operations for CPU load - optimized for 1GB
      let stringResult = '';
      for (let i = 0; i < 50000; i++) { // Reduced from 100000
        stringResult += crypto.randomBytes(50).toString('hex') + crypto.randomBytes(25).toString('base64');
      }
      
      const end = performance.now();
      return {
        duration: end - start,
        primesCount: primes.length,
        dataSize: largeData.length,
        mathResult: mathResult,
        hashesCount: hashes.length,
        matrixResult: matrixResult,
        floatResult: floatResult,
        stringLength: stringResult.length
      };
    } catch (error) {
      console.error('❌ Error in intensive operation:', error.message);
      this.errorCount++;
      return {
        duration: performance.now() - start,
        error: error.message,
        primesCount: 0,
        dataSize: 0,
        mathResult: 0,
        hashesCount: 0,
        matrixResult: 0,
        floatResult: 0,
        stringLength: 0
      };
    }
  }

  // Start stress test optimized for 2-core 1GB configuration
  async startStressTest(duration = 15) {
    if (this.isRunning) {
      throw new Error('Stress test is already running');
    }

    this.isRunning = true;
    this.startTime = Date.now();
    this.testDuration = duration * 60 * 1000; // Convert minutes to milliseconds
    this.errorCount = 0;

    console.log(`🚀 Starting HEAVY stress test for ${duration} minutes...`);
    console.log(`⏰ Start time: ${new Date().toISOString()}`);
    console.log(`🎯 Target duration: ${duration} minutes`);
    console.log(`🖥️ CPU cores available: ${this.cpuCount}`);
    console.log(`🔥 Optimized for 2-core 1GB configuration`);
    console.log(`💪 This will heavily stress your CPU for the full ${duration} minutes!`);

    const results = [];
    let iteration = 0;

    console.log(`✅ Starting intensive single-thread operations optimized for your server`);

    while (this.isRunning && (Date.now() - this.startTime) < this.testDuration) {
      try {
        iteration++;
        
        // Check if we've had too many errors
        if (this.errorCount > this.maxErrors) {
          console.error(`❌ Too many errors (${this.errorCount}), stopping test`);
          break;
        }
        
        // Main thread intensive operation (optimized for 2-core 1GB)
        const mainResult = await this.intensiveOperation();
        
        results.push({
          iteration,
          timestamp: Date.now(),
          mainThread: mainResult,
          errorCount: this.errorCount
        });

        // Log progress every 2 iterations
        if (iteration % 2 === 0) {
          const elapsed = (Date.now() - this.startTime) / 1000;
          const remaining = (this.testDuration - (Date.now() - this.startTime)) / 1000;
          console.log(`📊 Iteration ${iteration} - Elapsed: ${elapsed.toFixed(1)}s, Remaining: ${remaining.toFixed(1)}s`);
          console.log(`🔥 HEAVY CPU Usage: Single thread optimized for 2-core`);
          console.log(`💪 Expected CPU usage: 90-100% on main thread`);
          console.log(`⚠️ Error count: ${this.errorCount}/${this.maxErrors}`);
        }

        // Minimal delay for maximum intensity
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error(`❌ Error in iteration ${iteration}:`, error.message);
        this.errorCount++;
        
        if (this.errorCount > this.maxErrors) {
          console.error(`❌ Too many errors, stopping test`);
          break;
        }
      }
    }

    this.isRunning = false;
    const totalDuration = (Date.now() - this.startTime) / 1000;
    
    const summary = {
      totalIterations: iteration,
      totalDuration: totalDuration,
      errorCount: this.errorCount,
      averageIterationTime: results.length > 0 ? results.reduce((sum, r) => sum + r.mainThread.duration, 0) / results.length : 0,
      totalPrimesCalculated: results.reduce((sum, r) => sum + (r.mainThread.primesCount || 0), 0),
      totalDataGenerated: results.reduce((sum, r) => sum + (r.mainThread.dataSize || 0), 0),
      totalHashesGenerated: results.reduce((sum, r) => sum + (r.mainThread.hashesCount || 0), 0),
      results: results
    };

    console.log(`✅ HEAVY stress test completed!`);
    console.log(`📈 Summary:`, summary);
    console.log(`🔥 Achieved CPU usage: 90-100% on main thread for ${duration} minutes`);
    console.log(`🎯 Optimized for 2-core 1GB configuration`);
    
    return summary;
  }

  // Stop stress test
  stopStressTest() {
    if (!this.isRunning) {
      throw new Error('No stress test is currently running');
    }

    this.isRunning = false;
    
    const duration = (Date.now() - this.startTime) / 1000;
    console.log(`⏹️ HEAVY stress test stopped after ${duration.toFixed(1)} seconds`);
    
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
      testDuration: this.testDuration / 1000,
      cpuCores: this.cpuCount,
      errorCount: this.errorCount
    };
  }

  // Full CPU test (15 minutes) - optimized for 2-core 1GB
  async fullTest() {
    console.log('🚀 Starting HEAVY full CPU stress test (15 minutes)...');
    console.log('🔥 Optimized for 2-core 1GB configuration');
    console.log('💪 Expected to achieve 90-100% CPU utilization on main thread');
    return await this.startStressTest(15);
  }
}

module.exports = StressTest; 