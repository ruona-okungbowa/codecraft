/**
 * Request queue to manage OpenAI API rate limits
 * Free tier: 3 requests per minute
 */

interface QueuedRequest {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private requestsThisMinute = 0;
  private readonly maxRequestsPerMinute = 3; // Free tier limit
  private readonly requestInterval = 60000 / this.maxRequestsPerMinute; // 20 seconds between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        execute: request,
        resolve,
        reject,
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      // Check if we've hit the rate limit
      if (this.requestsThisMinute >= this.maxRequestsPerMinute) {
        console.log(
          `Rate limit reached (${this.requestsThisMinute}/${this.maxRequestsPerMinute}), waiting...`
        );
        await this.waitForNextSlot();
      }

      const item = this.queue.shift();
      if (!item) continue;

      try {
        this.requestsThisMinute++;
        const result = await item.execute();
        item.resolve(result);

        // Reset counter after 1 minute
        setTimeout(() => {
          this.requestsThisMinute = Math.max(0, this.requestsThisMinute - 1);
        }, 60000);

        // Wait between requests to avoid bursting
        if (this.queue.length > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.requestInterval)
          );
        }
      } catch (error) {
        item.reject(error);
      }
    }

    this.processing = false;
  }

  private async waitForNextSlot(): Promise<void> {
    // Wait for the request interval before trying again
    await new Promise((resolve) => setTimeout(resolve, this.requestInterval));
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getRequestsThisMinute(): number {
    return this.requestsThisMinute;
  }
}

// Singleton instance
export const openaiQueue = new RequestQueue();
