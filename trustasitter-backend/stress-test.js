// Stress Test Module for TrustaSitter Backend
// This module provides CPU-intensive operations to test VMSS auto-scaling

const crypto = require('crypto');
const { performance } = require('perf_hooks');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');

class StressTest {
  constructor() {
    this.isRunning = false;
    this.startTime = null;
    this.testDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.workers = [];
    this.cpuCount = os.cpus().length;
  }

  // CPU-intensive prime number calculation with larger range
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

  // Enhanced CPU-intensive mathematical operations
  intensiveMathOperations() {
    let result = 0;
    // Increase iterations significantly
    for (let i = 0; i < 5000000; i++) {
      result += Math.sqrt(i) * Math.sin(i) * Math.cos(i) * Math.tan(i);
      result += Math.pow(i, 0.5) * Math.log(i + 1);
      result += Math.exp(i / 1000000) * Math.PI;
    }
    return result;
  }

  // Memory-intensive operation with larger data
  generateLargeData(size) {
    const data = [];
    for (let i = 0; i < size; i++) {
      data.push({
        id: i,
        hash: crypto.randomBytes(64).toString('hex'),
        timestamp: Date.now(),
        data: crypto.randomBytes(2048).toString('base64'),
        complex: {
          nested: crypto.randomBytes(512).toString('hex'),
          array: Array.from({length: 100}, () => Math.random()),
          object: {
            deep: crypto.randomBytes(256).toString('hex')
          }
        }
      });
    }
    return data;
  }

  // Enhanced hash operations
  intensiveHashOperations() {
    const hashes = [];
    // Increase hash operations significantly
    for (let i = 0; i < 5000; i++) {
      const data = crypto.randomBytes(1024);
      hashes.push(crypto.createHash('sha512').update(data).digest('hex'));
      hashes.push(crypto.createHash('sha256').update(data).digest('hex'));
      hashes.push(crypto.createHash('md5').update(data).digest('hex'));
    }
    return hashes;
  }

  // CPU and memory intensive operation - enhanced
  async intensiveOperation() {
    const start = performance.now();
    
    // Calculate larger prime numbers
    const primes = this.calculatePrimes(200000);
    
    // Generate larger data structures
    const largeData = this.generateLargeData(20000);
    
    // Perform more intensive calculations
    const mathResult = this.intensiveMathOperations();
    
    // Enhanced hash operations
    const hashes = this.intensiveHashOperations();
    
    // Additional CPU-intensive operations
    let matrixResult = 0;
    for (let i = 0; i < 1000; i++) {
      for (let j = 0; j < 1000; j++) {
        matrixResult += Math.pow(i, j % 10) * Math.sin(i + j);
      }
    }
    
    const end = performance.now();
    return {
      duration: end - start,
      primesCount: primes.length,
      dataSize: largeData.length,
      mathResult: mathResult,
      hashesCount: hashes.length,
      matrixResult: matrixResult
    };
  }

  // Worker thread function for parallel processing
  createWorker() {
    return new Promise((resolve, reject) => {
      const worker = new Worker(`
        const { parentPort, workerData } = require('worker_threads');
        const crypto = require('crypto');
        
        function workerIntensiveOperation() {
          const start = Date.now();
          
          // CPU-intensive operations in worker thread
          let result = 0;
          for (let i = 0; i < 3000000; i++) {
            result += Math.sqrt(i) * Math.sin(i) * Math.cos(i) * Math.tan(i);
            result += Math.pow(i, 0.5) * Math.log(i + 1);
          }
          
          // Hash operations in worker
          const hashes = [];
          for (let i = 0; i < 3000; i++) {
            const data = crypto.randomBytes(1024);
            hashes.push(crypto.createHash('sha512').update(data).digest('hex'));
          }
          
          const end = Date.now();
          return { duration: end - start, result, hashesCount: hashes.length };
        }
        
        parentPort.on('message', (message) => {
          if (message === 'start') {
            const result = workerIntensiveOperation();
            parentPort.postMessage(result);
          }
        });
      `, { eval: true });
      
      worker.on('message', (result) => {
        resolve(result);
      });
      
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
      
      resolve(worker);
    });
  }

  // Start stress test with multiple workers
  async startStressTest(duration = 5) {
    if (this.isRunning) {
      throw new Error('Stress test is already running');
    }

    this.isRunning = true;
    this.startTime = Date.now();
    this.testDuration = duration * 60 * 1000; // Convert minutes to milliseconds

    console.log(`🚀 Starting enhanced stress test for ${duration} minutes...`);
    console.log(`⏰ Start time: ${new Date().toISOString()}`);
    console.log(`🎯 Target duration: ${duration} minutes`);
    console.log(`🖥️ CPU cores available: ${this.cpuCount}`);
    console.log(`🧵 Using ${Math.min(this.cpuCount, 4)} worker threads for maximum CPU usage`);

    const results = [];
    let iteration = 0;
    const workerCount = Math.min(this.cpuCount, 4); // Use up to 4 workers

    // Create worker threads
    for (let i = 0; i < workerCount; i++) {
      const worker = await this.createWorker();
      this.workers.push(worker);
    }

    while (this.isRunning && (Date.now() - this.startTime) < this.testDuration) {
      try {
        iteration++;
        
        // Main thread intensive operation
        const mainResult = await this.intensiveOperation();
        
        // Worker threads parallel operations
        const workerPromises = this.workers.map(worker => {
          return new Promise((resolve) => {
            worker.postMessage('start');
            worker.once('message', resolve);
          });
        });
        
        const workerResults = await Promise.all(workerPromises);
        
        results.push({
          iteration,
          timestamp: Date.now(),
          mainThread: mainResult,
          workerResults: workerResults
        });

        // Log progress every 5 iterations (more frequent due to increased intensity)
        if (iteration % 5 === 0) {
          const elapsed = (Date.now() - this.startTime) / 1000;
          const remaining = (this.testDuration - (Date.now() - this.startTime)) / 1000;
          console.log(`📊 Iteration ${iteration} - Elapsed: ${elapsed.toFixed(1)}s, Remaining: ${remaining.toFixed(1)}s`);
          console.log(`🔥 CPU Usage: Main thread + ${workerCount} workers active`);
        }

        // Reduced delay for more intensive testing
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`❌ Error in iteration ${iteration}:`, error.message);
      }
    }

    // Clean up workers
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];

    this.isRunning = false;
    const totalDuration = (Date.now() - this.startTime) / 1000;
    
    const summary = {
      totalIterations: iteration,
      totalDuration: totalDuration,
      workerCount: workerCount,
      averageIterationTime: results.reduce((sum, r) => sum + r.mainThread.duration, 0) / results.length,
      totalPrimesCalculated: results.reduce((sum, r) => sum + r.mainThread.primesCount, 0),
      totalDataGenerated: results.reduce((sum, r) => sum + r.mainThread.dataSize, 0),
      totalHashesGenerated: results.reduce((sum, r) => sum + r.mainThread.hashesCount, 0),
      workerOperations: results.reduce((sum, r) => sum + r.workerResults.length, 0),
      results: results
    };

    console.log(`✅ Enhanced stress test completed!`);
    console.log(`📈 Summary:`, summary);
    console.log(`🔥 Expected CPU usage: 50-80% across ${workerCount + 1} threads`);
    
    return summary;
  }

  // Stop stress test
  stopStressTest() {
    if (!this.isRunning) {
      throw new Error('No stress test is currently running');
    }

    this.isRunning = false;
    
    // Clean up workers
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    
    const duration = (Date.now() - this.startTime) / 1000;
    console.log(`⏹️ Enhanced stress test stopped after ${duration.toFixed(1)} seconds`);
    
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
      workerCount: this.workers.length,
      cpuCores: this.cpuCount
    };
  }

  // Full CPU test (10 minutes) - enhanced
  async fullTest() {
    console.log('🚀 Starting enhanced full CPU stress test (10 minutes)...');
    console.log('🔥 This will use multiple worker threads for maximum CPU usage');
    return await this.startStressTest(10);
  }
}

module.exports = StressTest; 