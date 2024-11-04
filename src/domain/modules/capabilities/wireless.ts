export interface IsWireless {
  batteryPercent: number;
  lastSeen: Date;
  /** value between 0 (bad) and 30 (good) */
  rfStatus: number;
  batteryVp: number;
}
