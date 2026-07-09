export function useTawk() {
  const maximize = () => window.Tawk_API?.maximize();
  const minimize = () => window.Tawk_API?.minimize();
  const setUser = (name: string, email: string) => {
    window.Tawk_API?.setAttributes({ name, email }, (err) => {
      if (err) console.error("Tawk setAttributes error", err);
    });
  };
  return { maximize, minimize, setUser };
}
