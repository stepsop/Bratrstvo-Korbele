/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="w-full h-screen bg-[#0e0a07] flex flex-col items-center justify-center overflow-hidden">
      <iframe
        src="/game.html"
        title="Bratrstvo Korbele: Богемия"
        className="w-full h-full border-0"
        allow="autoplay"
      />
    </div>
  );
}
