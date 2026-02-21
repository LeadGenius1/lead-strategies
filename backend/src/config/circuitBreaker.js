// Circuit Breaker Pattern for External Services
// Prevents cascading failures when external APIs (Stripe, Anthropic, Mailgun) are down

const STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker {
  /**
   * @param {string} name - Service name (e.g., 'anthropic', 'stripe')
   * @param {object} options
   * @param {number} options.failureThreshold - Failures before opening (default: 5)
   * @param {number} options.resetTimeout - Ms before trying again (default: 30000)
   * @param {number} options.requestTimeout - Ms before timing out a request (default: 10000)
   */
  constructor(name, options = {}) {
    this.name = name;
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.requestTimeout = options.requestTimeout || 10000;
    this.lastFailureTime = null;
  }

  /**
   * Execute a function through the circuit breaker
   * @param {Function} fn - Async function to execute
   * @returns {Promise} Result of fn
   * @throws {Error} If circuit is open
   */
  async execute(fn) {
    if (this.state === STATES.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = STATES.HALF_OPEN;
      } else {
        throw new Error(`Circuit breaker OPEN for ${this.name}. Service temporarily unavailable.`);
      }
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${this.name} request timed out`)), this.requestTimeout)
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === STATES.HALF_OPEN) {
      this.state = STATES.CLOSED;
      console.log(JSON.stringify({ level: 'info', msg: `Circuit breaker ${this.name}: CLOSED (recovered)`, timestamp: new Date().toISOString() }));
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN;
      console.log(JSON.stringify({ level: 'warn', msg: `Circuit breaker ${this.name}: OPEN (${this.failureCount} failures)`, timestamp: new Date().toISOString() }));
    }
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailure: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
    };
  }
}

// Pre-configured breakers for each external service
const breakers = {
  anthropic: new CircuitBreaker('anthropic', { failureThreshold: 3, resetTimeout: 60000, requestTimeout: 30000 }),
  stripe: new CircuitBreaker('stripe', { failureThreshold: 5, resetTimeout: 30000, requestTimeout: 15000 }),
  mailgun: new CircuitBreaker('mailgun', { failureThreshold: 5, resetTimeout: 30000, requestTimeout: 10000 }),
  apollo: new CircuitBreaker('apollo', { failureThreshold: 3, resetTimeout: 60000, requestTimeout: 15000 }),
  r2: new CircuitBreaker('r2', { failureThreshold: 5, resetTimeout: 30000, requestTimeout: 10000 }),
};

/**
 * Get all circuit breaker statuses (for health endpoint)
 */
function getAllBreakerStatus() {
  const result = {};
  for (const [name, breaker] of Object.entries(breakers)) {
    result[name] = breaker.getStatus();
  }
  return result;
}

module.exports = { CircuitBreaker, breakers, getAllBreakerStatus };
