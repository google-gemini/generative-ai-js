/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Health monitoring utility for tracking API request health and performance.
 * @public
 */

export interface HealthMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastRequestTimestamp: number | null;
  errors: ErrorSummary[];
}

export interface ErrorSummary {
  type: string;
  count: number;
  lastOccurrence: number;
  message?: string;
}

/**
 * Monitor API health and track request metrics.
 * Useful for debugging, monitoring, and performance analysis.
 *
 * @example
 * ```typescript
 * const monitor = new HealthMonitor();
 *
 * try {
 *   const startTime = Date.now();
 *   const result = await model.generateContent("Hello");
 *   monitor.recordSuccess(Date.now() - startTime);
 * } catch (error) {
 *   monitor.recordFailure(error);
 * }
 *
 * const health = monitor.getHealthMetrics();
 * console.log(`Success rate: ${health.successRate}%`);
 * ```
 *
 * @public
 */
export class HealthMonitor {
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private responseTimes: number[] = [];
  private lastRequestTimestamp: number | null = null;
  private errorMap = new Map<string, ErrorSummary>();
  private readonly maxResponseTimesSaved = 100;

  /**
   * Record a successful API request.
   * @param responseTime - Response time in milliseconds
   */
  recordSuccess(responseTime: number): void {
    this.totalRequests++;
    this.successfulRequests++;
    this.lastRequestTimestamp = Date.now();

    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimesSaved) {
      this.responseTimes.shift();
    }
  }

  /**
   * Record a failed API request.
   * @param error - The error that occurred
   */
  recordFailure(error: Error): void {
    this.totalRequests++;
    this.failedRequests++;
    this.lastRequestTimestamp = Date.now();

    const errorType = error.constructor.name;
    const existing = this.errorMap.get(errorType);

    if (existing) {
      existing.count++;
      existing.lastOccurrence = Date.now();
    } else {
      this.errorMap.set(errorType, {
        type: errorType,
        count: 1,
        lastOccurrence: Date.now(),
        message: error.message,
      });
    }
  }

  /**
   * Get current health metrics.
   * @returns Current health and performance metrics
   */
  getHealthMetrics(): HealthMetrics {
    const successRate =
      this.totalRequests > 0
        ? (this.successfulRequests / this.totalRequests) * 100
        : 0;

    const averageResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((sum, time) => sum + time, 0) /
          this.responseTimes.length
        : 0;

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      lastRequestTimestamp: this.lastRequestTimestamp,
      errors: Array.from(this.errorMap.values()),
    };
  }

  /**
   * Check if the service is healthy based on success rate threshold.
   * @param threshold - Minimum success rate percentage (default: 95)
   * @returns true if success rate is above threshold
   */
  isHealthy(threshold: number = 95): boolean {
    if (this.totalRequests === 0) {
      return true; // No requests yet, consider healthy
    }
    const metrics = this.getHealthMetrics();
    return metrics.successRate >= threshold;
  }

  /**
   * Reset all metrics to initial state.
   */
  reset(): void {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.responseTimes = [];
    this.lastRequestTimestamp = null;
    this.errorMap.clear();
  }

  /**
   * Get a human-readable health status report.
   * @returns Formatted health status string
   */
  getHealthReport(): string {
    const metrics = this.getHealthMetrics();
    const status = this.isHealthy() ? "HEALTHY" : "DEGRADED";

    let report = `Health Status: ${status}\n`;
    report += `Total Requests: ${metrics.totalRequests}\n`;
    report += `Success Rate: ${metrics.successRate}%\n`;
    report += `Average Response Time: ${metrics.averageResponseTime}ms\n`;

    if (metrics.errors.length > 0) {
      report += `\nErrors:\n`;
      metrics.errors.forEach((error) => {
        report += `  - ${error.type}: ${error.count} occurrence(s)\n`;
      });
    }

    return report;
  }
}
