// Simple metrics collection for authorization denials and other events
class Metrics {
  constructor() {
    this.metrics = {
      authorizationDenials: 0,
      authorizationSuccesses: 0,
      authenticationFailures: 0,
      authenticationSuccesses: 0,
      apiRequests: 0,
      errors: 0
    }
    this.startTime = Date.now()
  }

  increment(metric) {
    if (this.metrics[metric] !== undefined) {
      this.metrics[metric]++
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime
    }
  }

  reset() {
    this.metrics = {
      authorizationDenials: 0,
      authorizationSuccesses: 0,
      authenticationFailures: 0,
      authenticationSuccesses: 0,
      apiRequests: 0,
      errors: 0
    }
    this.startTime = Date.now()
  }
}

const metrics = new Metrics()

module.exports = metrics

