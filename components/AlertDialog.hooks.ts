interface AlertButton {
  text?: string;
}

export interface AlertConfig {
  title: string;
  description?: string;
  confirmButton?: AlertButton;
  cancelButton?: AlertButton;
}

export type AlertDecisionCallback = (decision: boolean) => void;

export interface QueuedAlert {
  id: string;
  config: AlertConfig;
  decisionCallback: AlertDecisionCallback;
  timestamp: number;
}

type AlertSubscriber = (alert: QueuedAlert | null) => void;


class AlertManager {
  private alerts: QueuedAlert[] = [];
  private subscribers: AlertSubscriber[] = [];
  private currentAlert: QueuedAlert | null = null;
  private pendingAlerts: Map<string, Promise<boolean>> = new Map(); // hash -> promise

  private createAlertHash(config: AlertConfig): string {
    // Create a simple hash based on alert content to detect duplicates
    return JSON.stringify({
      title: config.title,
      description: config.description,
      confirmText: config.confirmButton?.text,
      cancelText: config.cancelButton?.text,
    });
  }

  addAlert(config: AlertConfig): Promise<boolean> {
    const hash = this.createAlertHash(config);

    // If this exact alert is already pending, throw an error
    const existingPromise = this.pendingAlerts.get(hash);
    if (existingPromise) {
      throw new Error(`This alert is already pending.`);
    }

    // Create a new promise for this alert
    const promise = new Promise<boolean>((resolve) => {
      const alert: QueuedAlert = {
        id: crypto.randomUUID(),
        config,
        decisionCallback: (decision) => {
          // Remove from pending alerts when resolved
          this.pendingAlerts.delete(hash);
          resolve(decision);
        },
        timestamp: Date.now(),
      };

      this.alerts.push(alert);
      this.processQueue();
    });

    // Store the promise so duplicates can use it
    this.pendingAlerts.set(hash, promise);

    return promise;
  }

  private processQueue(): void {
    if (this.currentAlert || this.alerts.length === 0) {
      return;
    }

    this.currentAlert = this.alerts.shift()!;
    this.notifySubscribers(this.currentAlert);
  }

  private handleDecision(alertId: string, decision: boolean): void {
    if (this.currentAlert?.id === alertId) {
      this.currentAlert.decisionCallback(decision);
      this.currentAlert = null;

      // Immediately notify subscribers that the alert is cleared
      this.notifySubscribers(null);

      // Process next alert after a short delay to allow UI transitions
      setTimeout(() => {
        this.processQueue();
      }, 100);
    }
  }

  private notifySubscribers(alert: QueuedAlert | null): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(alert);
      } catch (error) {
        console.error('Error in alert subscriber:', error);
      }
    });
  }

  subscribe(callback: AlertSubscriber): () => void {
    this.subscribers.push(callback);

    // Immediately notify about current alert
    if (this.currentAlert) {
      callback(this.currentAlert);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  getCurrentAlert(): QueuedAlert | null {
    return this.currentAlert;
  }

  resolveCurrentAlert(decision: boolean): void {
    if (this.currentAlert) {
      this.handleDecision(this.currentAlert.id, decision);
    }
  }

  clearAll(): void {
    this.alerts = [];
    this.pendingAlerts.clear();
    if (this.currentAlert) {
      this.currentAlert.decisionCallback(false);
      this.currentAlert = null;
      this.notifySubscribers(null);
    }
  }

  getQueueLength(): number {
    return this.alerts.length + (this.currentAlert ? 1 : 0);
  }
}

// Singleton instance
export const alertManager = new AlertManager();

// Convenience function for showing alerts
export const showAlert = (config: AlertConfig): Promise<boolean> => {
  return alertManager.addAlert(config);
};

// Hook for using alerts in components
export const useAlertManager = () => {
  return {
    showAlert,
    getCurrentAlert: () => alertManager.getCurrentAlert(),
    resolveCurrentAlert: (decision: boolean) => alertManager.resolveCurrentAlert(decision),
    subscribe: (callback: AlertSubscriber) => alertManager.subscribe(callback),
    clearAll: () => alertManager.clearAll(),
    getQueueLength: () => alertManager.getQueueLength(),
  };
};
