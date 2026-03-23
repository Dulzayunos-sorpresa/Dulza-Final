export class NotificationService {
  private static audio: HTMLAudioElement | null = null;
  private static isEnabled: boolean = true;

  static init() {
    if (!this.audio) {
      // Using a clear, professional notification sound
      this.audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      this.audio.load();
    }
  }

  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('notifications_enabled', String(enabled));
  }

  static getEnabled(): boolean {
    const stored = localStorage.getItem('notifications_enabled');
    return stored === null ? true : stored === 'true';
  }

  static async playNewOrderSound() {
    if (!this.isEnabled || !this.getEnabled()) return;

    try {
      this.init();
      if (this.audio) {
        this.audio.currentTime = 0;
        await this.audio.play();
      }
    } catch (error) {
      console.warn('Could not play notification sound (likely due to browser autoplay restrictions):', error);
    }
  }
}
