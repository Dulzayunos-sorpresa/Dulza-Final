export const NOTIFICATION_SOUNDS = [
  { id: 'default', name: 'Clásico', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'bell', name: 'Campana', url: 'https://assets.mixkit.co/active_storage/sfx/221/221-preview.mp3' },
  { id: 'digital', name: 'Digital', url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
  { id: 'success', name: 'Éxito', url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
  { id: 'chime', name: 'Timbre', url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' }
];

export class NotificationService {
  private static audio: HTMLAudioElement | null = null;
  private static isEnabled: boolean = true;
  private static currentTab: string = 'dashboard';

  static init() {
    const selectedSoundId = localStorage.getItem('notification_sound_id') || 'default';
    const sound = NOTIFICATION_SOUNDS.find(s => s.id === selectedSoundId) || NOTIFICATION_SOUNDS[0];
    
    if (!this.audio || this.audio.src !== sound.url) {
      this.audio = new Audio(sound.url);
      this.audio.load();
    }
  }

  static setCurrentTab(tab: string) {
    this.currentTab = tab;
  }

  static setSound(soundId: string) {
    localStorage.setItem('notification_sound_id', soundId);
    const sound = NOTIFICATION_SOUNDS.find(s => s.id === soundId);
    if (sound) {
      this.audio = new Audio(sound.url);
      this.audio.load();
      this.audio.play().catch(() => {}); // Play preview
    }
  }

  static getSelectedSoundId(): string {
    return localStorage.getItem('notification_sound_id') || 'default';
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
    // Only play if enabled AND we are on the orders tab
    if (!this.isEnabled || !this.getEnabled() || this.currentTab !== 'orders') return;

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
