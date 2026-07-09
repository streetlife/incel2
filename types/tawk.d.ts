export {};

declare global {
  interface Window {
    Tawk_API?: {
      maximize: () => void;
      minimize: () => void;
      toggle: () => void;
      hideWidget: () => void;
      showWidget: () => void;
      setAttributes: (
        attributes: Record<string, string | number | boolean>,
        callback?: (error: unknown) => void,
      ) => void;
      addEvent: (
        event: string,
        metadata?: Record<string, unknown>,
        callback?: (error: unknown) => void,
      ) => void;
      onLoad?: () => void;
      onStatusChange?: (status: string) => void;
      onChatMaximized?: () => void;
      onChatMinimized?: () => void;
      onChatHidden?: () => void;
      onChatStarted?: () => void;
      onChatEnded?: () => void;
      onPrechatSubmit?: (data: Record<string, unknown>) => void;
      onOfflineSubmit?: (data: Record<string, unknown>) => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}
