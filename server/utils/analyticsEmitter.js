import { EventEmitter } from "events";

class AnalyticsEmitter extends EventEmitter {}

export const analyticsEmitter = new AnalyticsEmitter();
