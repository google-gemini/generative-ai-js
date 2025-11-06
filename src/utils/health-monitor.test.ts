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

import { HealthMonitor } from "./health-monitor";

describe("HealthMonitor", () => {
  let monitor: HealthMonitor;

  beforeEach(() => {
    monitor = new HealthMonitor();
  });

  describe("recordSuccess", () => {
    it("should increment successful requests", () => {
      monitor.recordSuccess(100);
      const metrics = monitor.getHealthMetrics();

      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
    });

    it("should calculate average response time", () => {
      monitor.recordSuccess(100);
      monitor.recordSuccess(200);
      monitor.recordSuccess(300);

      const metrics = monitor.getHealthMetrics();
      expect(metrics.averageResponseTime).toBe(200);
    });

    it("should update last request timestamp", () => {
      const before = Date.now();
      monitor.recordSuccess(50);
      const after = Date.now();

      const metrics = monitor.getHealthMetrics();
      expect(metrics.lastRequestTimestamp).toBeGreaterThanOrEqual(before);
      expect(metrics.lastRequestTimestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("recordFailure", () => {
    it("should increment failed requests", () => {
      monitor.recordFailure(new Error("Test error"));
      const metrics = monitor.getHealthMetrics();

      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(1);
    });

    it("should track error types", () => {
      monitor.recordFailure(new Error("First error"));
      monitor.recordFailure(new Error("Second error"));

      const metrics = monitor.getHealthMetrics();
      expect(metrics.errors).toHaveLength(1);
      expect(metrics.errors[0].type).toBe("Error");
      expect(metrics.errors[0].count).toBe(2);
    });

    it("should track different error types separately", () => {
      monitor.recordFailure(new Error("Error 1"));
      monitor.recordFailure(new TypeError("TypeError 1"));

      const metrics = monitor.getHealthMetrics();
      expect(metrics.errors).toHaveLength(2);

      const errorTypes = metrics.errors.map((e) => e.type);
      expect(errorTypes).toContain("Error");
      expect(errorTypes).toContain("TypeError");
    });
  });

  describe("getHealthMetrics", () => {
    it("should return correct success rate", () => {
      monitor.recordSuccess(100);
      monitor.recordSuccess(100);
      monitor.recordFailure(new Error("Test"));

      const metrics = monitor.getHealthMetrics();
      expect(metrics.successRate).toBeCloseTo(66.67, 1);
    });

    it("should return 0 success rate when no requests", () => {
      const metrics = monitor.getHealthMetrics();
      expect(metrics.successRate).toBe(0);
    });

    it("should return 100 success rate when all succeed", () => {
      monitor.recordSuccess(100);
      monitor.recordSuccess(100);

      const metrics = monitor.getHealthMetrics();
      expect(metrics.successRate).toBe(100);
    });
  });

  describe("isHealthy", () => {
    it("should return true when success rate is above threshold", () => {
      monitor.recordSuccess(100);
      monitor.recordSuccess(100);

      expect(monitor.isHealthy(95)).toBe(true);
    });

    it("should return false when success rate is below threshold", () => {
      monitor.recordSuccess(100);
      monitor.recordFailure(new Error("Test"));
      monitor.recordFailure(new Error("Test"));

      expect(monitor.isHealthy(95)).toBe(false);
    });

    it("should return true when no requests have been made", () => {
      expect(monitor.isHealthy()).toBe(true);
    });

    it("should use custom threshold", () => {
      monitor.recordSuccess(100);
      monitor.recordFailure(new Error("Test"));

      expect(monitor.isHealthy(50)).toBe(true);
      expect(monitor.isHealthy(60)).toBe(false);
    });
  });

  describe("reset", () => {
    it("should clear all metrics", () => {
      monitor.recordSuccess(100);
      monitor.recordFailure(new Error("Test"));
      monitor.reset();

      const metrics = monitor.getHealthMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.errors).toHaveLength(0);
      expect(metrics.lastRequestTimestamp).toBeNull();
    });
  });

  describe("getHealthReport", () => {
    it("should return formatted health report", () => {
      monitor.recordSuccess(100);
      monitor.recordSuccess(200);
      monitor.recordFailure(new Error("Test error"));

      const report = monitor.getHealthReport();
      expect(report).toContain("Health Status:");
      expect(report).toContain("Total Requests: 3");
      expect(report).toContain("Success Rate:");
      expect(report).toContain("Average Response Time:");
    });

    it("should show HEALTHY status when success rate is high", () => {
      monitor.recordSuccess(100);
      monitor.recordSuccess(100);

      const report = monitor.getHealthReport();
      expect(report).toContain("HEALTHY");
    });

    it("should show DEGRADED status when success rate is low", () => {
      monitor.recordFailure(new Error("Test"));
      monitor.recordFailure(new Error("Test"));

      const report = monitor.getHealthReport();
      expect(report).toContain("DEGRADED");
    });

    it("should include error details in report", () => {
      monitor.recordFailure(new TypeError("Type error"));

      const report = monitor.getHealthReport();
      expect(report).toContain("Errors:");
      expect(report).toContain("TypeError");
    });
  });
});
